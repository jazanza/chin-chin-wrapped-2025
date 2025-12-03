import { useState, useCallback, useEffect } from "react";
import { initDb, loadDb, queryData, type Database, type Statement } from "@/lib/db";

const DB_PATH = "/chinchin.sqlite"; // Assuming the database file is in the public folder

const EXCLUDED_CUSTOMERS = ["Maria Fernanda Azanza Arias", "Jose Azanza Arias", "Enrique Cobo", "Juan Francisco Perez", "Islas Boutique"];
const EXCLUDED_PRODUCT_KEYWORDS = [
    "Snacks", "Sandwich", "Halls", "Marlboro", "Vozol", "Funda", "Brocheta",
    "Hamburguesa", "Pin", "Mallorca", "Trident", "Ruffles", "Kit Kat", "Papas Cholitas",
    "Letrero", "Gorra", "Tapas Mix", "Nachos", "Lanyard"
];

let dbInstance: Database | null = null; // Global instance for the database

export function useDb() {
  const [dbLoaded, setDbLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load the database
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize SQL.js WASM module
        await initDb();

        // Fetch the database file
        console.log(`Attempting to fetch database from: ${DB_PATH}`);
        const response = await fetch(DB_PATH);
        console.log('DB Fetch Response Status:', response.status);
        console.log('DB Fetch Response Content-Type:', response.headers.get('Content-Type'));

        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.statusText} (Status: ${response.status})`);
        }
        const buffer = await response.arrayBuffer();
        console.log('DB Buffer size:', buffer.byteLength, 'bytes'); // Log buffer size

        // Load the database
        dbInstance = loadDb(new Uint8Array(buffer));
        setDbLoaded(true);
        console.log('Database loaded successfully!');
      } catch (err: any) {
        console.error("Error loading database:", err);
        setError(err.message || "Failed to load database.");
      } finally {
        setLoading(false);
      }
    };

    if (!dbInstance) { // Only load if not already loaded
      loadDatabase();
    } else {
      setDbLoaded(true);
      setLoading(false);
    }
  }, []);

  const executeQuery = useCallback((query: string, params: any[] = []) => {
    if (!dbInstance) {
      throw new Error("Database not loaded.");
    }
    return queryData(dbInstance, query, params);
  }, []);

  // --- Customer Search ---
  const findCustomer = useCallback(async (searchTerm: string) => {
    if (!dbLoaded) throw new Error("Database not loaded.");

    const query = `
      SELECT Id, Name, PhoneNumber, TaxNumber, Email
      FROM Customers
      WHERE Name LIKE ? OR PhoneNumber LIKE ? OR TaxNumber LIKE ? OR Email LIKE ?
      LIMIT 10;
    `;
    const likeTerm = `%${searchTerm}%`;
    const results = executeQuery(query, [likeTerm, likeTerm, likeTerm, likeTerm]);
    return results;
  }, [dbLoaded, executeQuery]);

  // --- Get All Beer Varieties in DB (for debugging/validation) ---
  const getAllBeerVarietiesInDb = useCallback(async () => {
    if (!dbLoaded) throw new Error("Database not loaded.");
    const query = `
      SELECT DISTINCT Name FROM Products
      WHERE Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `Name LIKE '%${k}%'`).join(' OR ')})
      ORDER BY Name;
    `;
    const results = executeQuery(query);
    return results.map((row: any) => row.Name);
  }, [dbLoaded, executeQuery]);

  // --- Get Wrapped Data for a Customer ---
  const getWrappedData = useCallback(async (customerId: number, year: string) => {
    if (!dbLoaded) throw new Error("Database not loaded.");

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // 1. Customer Name
    const customerNameResult = executeQuery("SELECT Name FROM Customers WHERE Id = ?", [customerId]);
    const customerName = customerNameResult.length > 0 ? customerNameResult[0].Name : "Cliente Desconocido";

    // 2. Total Liters for the customer
    const totalLitersResult = executeQuery(`
      SELECT SUM(od.Quantity * p.VolumeML / 1000.0) AS TotalLiters
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      AND o.OrderDate BETWEEN '${year}-01-01' AND '${year}-12-31';
    `, [customerId, startDate, endDate]);
    const totalLiters = totalLitersResult[0]?.TotalLiters || 0;

    // 3. Dominant Beer Category for the customer
    const dominantCategoryResult = executeQuery(`
      SELECT p.Category AS DominantCategory, SUM(od.Quantity * p.VolumeML) AS TotalVolume
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      GROUP BY p.Category
      ORDER BY TotalVolume DESC
      LIMIT 1;
    `, [customerId, startDate, endDate]);
    const dominantBeerCategory = dominantCategoryResult[0]?.DominantCategory || "No Definida";

    // 4. Top 10 Products for the customer
    const top10ProductsResult = executeQuery(`
      SELECT p.Name, SUM(od.Quantity * p.VolumeML / 1000.0) AS Liters
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      GROUP BY p.Name
      ORDER BY Liters DESC
      LIMIT 10;
    `, [customerId, startDate, endDate]);
    const top10Products = top10ProductsResult.map((row: any) => ({ name: row.Name, liters: row.Liters }));

    // 5. Total Visits for the customer
    const totalVisitsResult = executeQuery(`
      SELECT COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS TotalVisits
      FROM Orders o
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?;
    `, [customerId, startDate, endDate]);
    const totalVisits = totalVisitsResult[0]?.TotalVisits || 0;

    // 6. Unique Varieties for the customer
    const uniqueVarietiesResult = executeQuery(`
      SELECT COUNT(DISTINCT p.Name) AS UniqueVarieties
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      AND o.OrderDate BETWEEN '${year}-01-01' AND '${year}-12-31';
    `, [customerId, startDate, endDate]);
    const uniqueVarieties2025 = uniqueVarietiesResult[0]?.UniqueVarieties || 0;

    // 7. Total Varieties in DB (excluding non-beer and excluded keywords)
    const totalVarietiesInDbResult = executeQuery(`
      SELECT COUNT(DISTINCT Name) AS TotalVarieties
      FROM Products
      WHERE Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `Name LIKE '%${k}%'`).join(' OR ')})
    `);
    const totalVarietiesInDb = totalVarietiesInDbResult[0]?.TotalVarieties || 0;

    // 8. Most Active Day for the customer
    const mostActiveDayResult = executeQuery(`
      SELECT
        CASE strftime('%w', o.OrderDate)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes'
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END AS DayOfWeek,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS DayVisits
      FROM Orders o
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      GROUP BY DayOfWeek
      ORDER BY DayVisits DESC
      LIMIT 1;
    `, [customerId, startDate, endDate]);
    const mostActiveDay = mostActiveDayResult[0]?.DayOfWeek || "N/A";

    // 9. Daily Visits for the customer (for chart)
    const dailyVisitsRaw = executeQuery(`
      SELECT
        CASE strftime('%w', o.OrderDate)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes'
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END AS DayOfWeek,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS DayVisits
      FROM Orders o
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      GROUP BY DayOfWeek
      ORDER BY DayVisits DESC;
    `, [customerId, startDate, endDate]);

    const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const dailyVisits = dayOrder.map(day => ({
      day,
      count: dailyVisitsRaw.find((d: any) => d.DayOfWeek === day)?.DayVisits || 0
    }));

    // 10. Most Active Month for the customer
    const mostActiveMonthResult = executeQuery(`
      SELECT
        CASE strftime('%m', o.OrderDate)
          WHEN '01' THEN 'Enero'
          WHEN '02' THEN 'Febrero'
          WHEN '03' THEN 'Marzo'
          WHEN '04' THEN 'Abril'
          WHEN '05' THEN 'Mayo'
          WHEN '06' THEN 'Junio'
          WHEN '07' THEN 'Julio'
          WHEN '08' THEN 'Agosto'
          WHEN '09' THEN 'Septiembre'
          WHEN '10' THEN 'Octubre'
          WHEN '11' THEN 'Noviembre'
          WHEN '12' THEN 'Diciembre'
        END AS MonthOfYear,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS MonthVisits
      FROM Orders o
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      GROUP BY MonthOfYear
      ORDER BY MonthVisits DESC
      LIMIT 1;
    `, [customerId, startDate, endDate]);
    const mostActiveMonth = mostActiveMonthResult[0]?.MonthOfYear || "N/A";

    // 11. Monthly Visits for the customer (for chart)
    const monthlyVisitsRaw = executeQuery(`
      SELECT
        CASE strftime('%m', o.OrderDate)
          WHEN '01' THEN 'Enero'
          WHEN '02' THEN 'Febrero'
          WHEN '03' THEN 'Marzo'
          WHEN '04' THEN 'Abril'
          WHEN '05' THEN 'Mayo'
          WHEN '06' THEN 'Junio'
          WHEN '07' THEN 'Julio'
          WHEN '08' THEN 'Agosto'
          WHEN '09' THEN 'Septiembre'
          WHEN '10' THEN 'Octubre'
          WHEN '11' THEN 'Noviembre'
          WHEN '12' THEN 'Diciembre'
        END AS MonthOfYear,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS MonthVisits
      FROM Orders o
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      GROUP BY MonthOfYear
      ORDER BY MonthVisits DESC;
    `, [customerId, startDate, endDate]);

    const monthOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const monthlyVisits = monthOrder.map(month => ({
      month,
      count: monthlyVisitsRaw.find((d: any) => d.MonthOfYear === month)?.MonthVisits || 0
    }));

    // 12. Missing Varieties for the customer
    const allBeerVarieties = await getAllBeerVarietiesInDb();
    const customerBeerVarietiesResult = executeQuery(`
      SELECT DISTINCT p.Name
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      AND o.OrderDate BETWEEN '${year}-01-01' AND '${year}-12-31';
    `, [customerId, startDate, endDate]);
    const customerBeerVarieties = new Set(customerBeerVarietiesResult.map((row: any) => row.Name));
    const missingVarieties = allBeerVarieties.filter(
      (variety) => !customerBeerVarieties.has(variety)
    );

    // 13. Palate Category (Concentration & Rarity)
    let palateCategory = { concentration: 'Fiel', rarity: 'Popular' }; // Default
    const varietyExplorationRatio = totalVarietiesInDb > 0 ? (uniqueVarieties2025 / totalVarietiesInDb) : 0;

    if (varietyExplorationRatio > 0.3) { // More than 30% of varieties explored
      palateCategory.concentration = 'Explorador';
    } else {
      palateCategory.concentration = 'Fiel';
    }

    const overallTopBeers = executeQuery(`
        SELECT p.Name, SUM(od.Quantity) AS TotalQuantity
        FROM OrderDetails od
        JOIN Products p ON od.ProductId = p.Id
        WHERE p.Category = 'Cerveza'
        AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
        AND o.OrderDate BETWEEN '${year}-01-01' AND '${year}-12-31'
        GROUP BY p.Name
        ORDER BY TotalQuantity DESC
        LIMIT 5;
    `);
    const top5OverallBeerNames = new Set(overallTopBeers.map((row: any) => row.Name));
    const customerTopBeerName = top10Products[0]?.name;

    if (customerTopBeerName && !top5OverallBeerNames.has(customerTopBeerName)) {
      palateCategory.rarity = 'Nicho';
    } else {
      palateCategory.rarity = 'Popular';
    }

    // Dynamic Title for Palate Category
    let dynamicTitle = "";
    if (uniqueVarieties2025 < 10) { // If very few varieties, override with "Novato"
        dynamicTitle = "Novato en la Barra";
    } else if (palateCategory.concentration === 'Fiel' && palateCategory.rarity === 'Nicho') {
        dynamicTitle = "El Curador";
    } else if (palateCategory.concentration === 'Explorador' && palateCategory.rarity === 'Nicho') {
        dynamicTitle = "El Aventurero";
    } else if (palateCategory.concentration === 'Fiel' && palateCategory.rarity === 'Popular') {
        dynamicTitle = "El Clásico";
    } else if (palateCategory.concentration === 'Explorador' && palateCategory.rarity === 'Popular') {
        dynamicTitle = "El Sociable";
    }

    // 14. First Beer of the Year
    const firstBeerResult = executeQuery(`
      SELECT p.Name, o.OrderDate, od.Quantity
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      ORDER BY o.OrderDate ASC, o.Id ASC, od.Id ASC
      LIMIT 1;
    `, [customerId, startDate, endDate]);
    const firstBeerDetails = firstBeerResult.length > 0 ? {
      name: firstBeerResult[0].Name,
      date: firstBeerResult[0].OrderDate,
      quantity: firstBeerResult[0].Quantity,
    } : null;

    // --- Community Data for Percentiles ---
    // Total visits for all customers (excluding excluded customers)
    const communityTotalVisitsResult = executeQuery(`
      SELECT COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS TotalVisits, c.Id AS CustomerId
      FROM Orders o
      JOIN Customers c ON o.CustomerId = c.Id
      WHERE o.OrderDate BETWEEN ? AND ?
      AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')})
      GROUP BY c.Id;
    `, [startDate, endDate]);

    const communityVisits = communityTotalVisitsResult.map((row: any) => row.TotalVisits);
    communityVisits.sort((a: number, b: number) => a - b);

    const calculatePercentile = (value: number, data: number[]) => {
      if (data.length === 0) return 0;
      let count = 0;
      for (const item of data) {
        if (item <= value) {
          count++;
        }
      }
      return (count / data.length) * 100;
    };

    const visitsPercentile = calculatePercentile(totalVisits, communityVisits);

    // Total liters for all customers (excluding excluded customers and products)
    const communityTotalLitersResult = executeQuery(`
      SELECT SUM(od.Quantity * p.VolumeML / 1000.0) AS TotalLiters, c.Id AS CustomerId
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      JOIN Customers c ON o.CustomerId = c.Id
      WHERE o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')})
      GROUP BY c.Id;
    `, [startDate, endDate]);

    const communityLiters = communityTotalLitersResult.map((row: any) => row.TotalLiters);
    communityLiters.sort((a: number, b: number) => a - b);

    const litersPercentile = calculatePercentile(totalLiters, communityLiters);

    // Most popular community day
    const mostPopularCommunityDayResult = executeQuery(`
      SELECT
        CASE strftime('%w', o.OrderDate)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes'
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END AS DayOfWeek,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS DayVisits
      FROM Orders o
      JOIN Customers c ON o.CustomerId = c.Id
      WHERE o.OrderDate BETWEEN ? AND ?
      AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')})
      GROUP BY DayOfWeek
      ORDER BY DayVisits DESC
      LIMIT 1;
    `, [startDate, endDate]);
    const mostPopularCommunityDay = mostPopularCommunityDayResult[0]?.DayOfWeek || "N/A";

    // Most popular community month
    const mostPopularCommunityMonthResult = executeQuery(`
      SELECT
        CASE strftime('%m', o.OrderDate)
          WHEN '01' THEN 'Enero'
          WHEN '02' THEN 'Febrero'
          WHEN '03' THEN 'Marzo'
          WHEN '04' THEN 'Abril'
          WHEN '05' THEN 'Mayo'
          WHEN '06' THEN 'Junio'
          WHEN '07' THEN 'Julio'
          WHEN '08' THEN 'Agosto'
          WHEN '09' THEN 'Septiembre'
          WHEN '10' THEN 'Octubre'
          WHEN '11' THEN 'Noviembre'
          WHEN '12' THEN 'Diciembre'
        END AS MonthOfYear,
        COUNT(DISTINCT strftime('%Y-%m-%d', o.OrderDate)) AS MonthVisits
      FROM Orders o
      JOIN Customers c ON o.CustomerId = c.Id
      WHERE o.OrderDate BETWEEN ? AND ?
      AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')})
      GROUP BY MonthOfYear
      ORDER BY MonthVisits DESC
      LIMIT 1;
    `, [startDate, endDate]);
    const mostPopularCommunityMonth = mostPopularCommunityMonthResult[0]?.MonthOfYear || "N/A";

    // Most frequent beer name for the customer
    const mostFrequentBeerNameResult = executeQuery(`
      SELECT p.Name
      FROM Orders o
      JOIN OrderDetails od ON o.Id = od.OrderId
      JOIN Products p ON od.ProductId = p.Id
      WHERE o.CustomerId = ? AND o.OrderDate BETWEEN ? AND ?
      AND p.Category = 'Cerveza'
      AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
      GROUP BY p.Name
      ORDER BY SUM(od.Quantity) DESC
      LIMIT 1;
    `, [customerId, startDate, endDate]);
    const mostFrequentBeerName = mostFrequentBeerNameResult[0]?.Name || "cerveza";

    // Total community clients (excluding excluded customers)
    const totalCommunityClientsResult = executeQuery(`
        SELECT COUNT(DISTINCT Id) AS TotalClients
        FROM Customers
        WHERE Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')});
    `);
    const totalCommunityClients = totalCommunityClientsResult[0]?.TotalClients || 0;

    // Total community liters (excluding excluded customers and products)
    const totalCommunityLitersResult = executeQuery(`
        SELECT SUM(od.Quantity * p.VolumeML / 1000.0) AS TotalLiters
        FROM Orders o
        JOIN OrderDetails od ON o.Id = od.OrderId
        JOIN Products p ON od.ProductId = p.Id
        JOIN Customers c ON o.CustomerId = c.Id
        WHERE o.OrderDate BETWEEN ? AND ?
        AND p.Category = 'Cerveza'
        AND NOT (${EXCLUDED_PRODUCT_KEYWORDS.map(k => `p.Name LIKE '%${k}%'`).join(' OR ')})
        AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(name => `'${name}'`).join(',')});
    `, [startDate, endDate]);
    const totalCommunityLiters = totalCommunityLitersResult[0]?.TotalLiters || 0;

    return {
      customerName,
      year,
      totalLiters,
      dominantBeerCategory,
      top10Products,
      totalVisits,
      uniqueVarieties2025,
      totalVarietiesInDb,
      mostActiveDay,
      dailyVisits,
      mostActiveMonth,
      monthlyVisits,
      missingVarieties,
      palateCategory,
      dynamicTitle,
      firstBeerDetails,
      visitsPercentile,
      litersPercentile,
      mostPopularCommunityDay,
      mostPopularCommunityMonth,
      mostFrequentBeerName,
      totalCommunityClients, // NEW
      totalCommunityLiters,  // NEW
      varietyExplorationRatio,
    };
  }, [dbLoaded, executeQuery, getAllBeerVarietiesInDb]);

  return {
    dbLoaded,
    loading,
    error,
    findCustomer,
    getWrappedData,
    getAllBeerVarietiesInDb,
  };
}