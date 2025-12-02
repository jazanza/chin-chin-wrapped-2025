import { useState, useCallback, useEffect } from "react";
import { initDb, loadDb, queryData, type Database, type Statement } from "@/lib/db";

const EXCLUDED_CUSTOMERS = ["Maria Fernanda Azanza Arias", "Jose Azanza Arias", "Enrique Cobo", "Juan Francisco Perez", "Islas Boutique"];
const EXCLUDED_PRODUCT_KEYWORDS = [
    "Snacks", "Sandwich", "Halls", "Marlboro", "Vozol", "Funda", "Brocheta", 
    "Hamburguesa", "Pin", "Mallorca", "Trident", "Ruffles", "Kit Kat", "Papas Cholitas", 
    "Letrero", "Gorra", "Tapas Mix", "Nachos", "Lanyard"
];

let dbInstance: Database | null = null; // Global instance for the database, correctly typed

const NON_LIQUID_KEYWORDS = ["snack", "jamon", "sandwich", "pin", "camiseta", "gorra", "vaso", "merchandising", "comida", "accesorio"];

const extractVolumeMl = (name: string, description: string | null): number => {
  const textToSearch = `${name} ${description || ""}`.toLowerCase();

  // Excluir productos no líquidos o por palabras clave
  if (NON_LIQUID_KEYWORDS.some(keyword => textToSearch.includes(keyword))) {
    return 0;
  }
  if (EXCLUDED_PRODUCT_KEYWORDS.some(keyword => textToSearch.includes(keyword.toLowerCase()))) {
    return 0;
  }

  const volumeRegex = /(\d+)\s*ml/i;
  let match = textToSearch.match(volumeRegex);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  // Check for common beer volumes
  if (textToSearch.includes("pinta")) return 473;
  if (textToSearch.includes("caña")) return 200;
  if (textToSearch.includes("botella")) return 330;
  if (textToSearch.includes("lata")) return 330;

  // Fallback for descriptions if name doesn't yield results
  if (description) {
    const descToSearch = description.toLowerCase();
    match = descToSearch.match(volumeRegex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return 0;
};

const categorizeBeer = (itemName: string): string => {
  const lowerItemName = itemName.toLowerCase();
  if (lowerItemName.includes("ipa")) return "IPA";
  if (lowerItemName.includes("lager")) return "Lager";
  if (lowerItemName.includes("stout")) return "Stout";
  if (lowerItemName.includes("porter")) return "Porter";
  if (lowerItemName.includes("pilsner")) return "Pilsner";
  if (lowerItemName.includes("ale")) return "Ale";
  return "Other";
};

const BEER_CATEGORY_COLORS: { [key: string]: string } = {
  IPA: "#FF008A",    // neon-magenta
  Lager: "#00FF66",  // neon-green
  Stout: "#00E6FF",  // neon-cyan
  Porter: "#FF9A00", // neon-orange
  Pilsner: "#FFEB3B", // neon-yellow
  Ale: "#FF008A",    // neon-magenta (reusing for variety)
  Other: "#FFFFFF",
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const BEER_PRODUCT_GROUP_IDS = [34, 36, 40, 52, 53]; // AÑADIDOS: 40, 52, 53


export function useDb() {
  const [dbLoaded, setDbLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      setLoading(true);
      setError(null);
      try {
        await initDb(); // Call the imported initDb
        // Static load from public/data/bbdd.db
        const response = await fetch('/data/bbdd.db');
        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        dbInstance = loadDb(new Uint8Array(buffer)); // Call the imported loadDb
        setDbLoaded(true);
        console.log("Database loaded successfully from static path.");
      } catch (e: any) {
        console.error("Error loading database:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadDatabase();
  }, []);

  const findCustomer = useCallback(async (searchTerm: string) => {
    if (!dbInstance) {
      throw new Error("Database not loaded.");
    }

    // Normalize search term for SQL query
    const normalizedSearchTerm = searchTerm.toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents

    let customerQuery = `
      SELECT Id, Name, PhoneNumber, TaxNumber, Email
      FROM Customer
      WHERE
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(Name), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U') LIKE '%' || ? || '%'
        OR PhoneNumber = ?
        OR TaxNumber = ?
        OR Email = ?
      LIMIT 5;
    `;
    const queryParams: any[] = [normalizedSearchTerm, searchTerm, searchTerm, searchTerm];

    try {
      const results = queryData(dbInstance, customerQuery, queryParams);
      return results; // Return all potential matches
    } catch (e: any) {
      console.error("Error executing findCustomer query:", e);
      throw new Error(`Failed to execute customer search query: ${e.message}. Please check database schema (Customer table, Id, Name, PhoneNumber, TaxNumber, Email columns) or search term.`);
    }
  }, []);

  const getWrappedData = useCallback(async (customerId: number, year: string = '2025') => {
    if (!dbInstance) {
      throw new Error("Database not loaded.");
    }
    setLoading(true);
    setError(null);
    try {
      // Helper to build the exclusion clause
      const buildExclusionClause = (tableAlias: string) => {
        if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) {
          return "";
        }
        const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
        return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
      };

      // Helper to build the beer category filter clause for ProductGroupId
      const buildBeerCategoryFilterClause = (tableAlias: string) => {
        if (BEER_PRODUCT_GROUP_IDS.length === 0) {
          return "";
        }
        const categoryIdsSql = BEER_PRODUCT_GROUP_IDS.join(',');
        return `AND ${tableAlias}.ProductGroupId IN (${categoryIdsSql})`;
      };


      // Metric 5: Customer Name (fetched separately for overlay)
      const customerNameQuery = `SELECT Name FROM Customer WHERE Id = ? LIMIT 1;`;
      const customerNameResult = queryData(dbInstance, customerNameQuery, [customerId]);
      const customerName = customerNameResult.length > 0 ? customerNameResult[0].Name : "Cliente Desconocido";

      // --- Data for current year (2025) ---
      const currentYear = year; // Use the passed year, which is '2025'
      const previousYear = (parseInt(year, 10) - 1).toString();

      // Query for product data (name, description, quantity, ProductGroupId) for a given customer and year
      const productDataQuery = `
        SELECT
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            P.ProductGroupId AS ProductGroupId, -- Include ProductGroupId
            SUM(DI.Quantity) AS TotalQuantity
        FROM
            Document AS D
        INNER JOIN
            DocumentItem AS DI ON D.Id = DI.DocumentId
        INNER JOIN
            Product AS P ON DI.ProductId = P.Id
        WHERE
            D.CustomerId = ?
            AND STRFTIME('%Y', D.Date) = ?
            AND P.IsEnabled = TRUE
            ${buildExclusionClause('P')}
        GROUP BY
            P.Id, P.Name, P.Description, P.ProductGroupId -- Group by ProductGroupId as well
        HAVING
            TotalQuantity > 0;
      `;

      // Fetch product data for current year (includes all products, then filter for dominant category)
      const rawProductDataCurrentYear = queryData(dbInstance, productDataQuery, [customerId, currentYear]);

      let totalLiters = 0;
      const categoryVolumesByGroupId: { [key: number]: number } = {}; // Initialize empty to dynamically add categories
      const productLiters: { name: string; liters: number; color: string }[] = [];
      const uniqueVarietiesSet = new Set<string>(); // To count unique varieties for the customer

      for (const item of rawProductDataCurrentYear) {
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        const liters = (item.TotalQuantity * volumeMl) / 1000;
        
        // Only count liters for the overall total if it's a liquid product
        if (liters > 0) {
          totalLiters += liters;
          
          // Only add to unique varieties set if it's a beer from the specified groups
          if (BEER_PRODUCT_GROUP_IDS.includes(item.ProductGroupId)) {
            uniqueVarietiesSet.add(item.ProductName); 
          }

          // Aggregate liters for dominant category calculation (only for specified beer groups)
          if (BEER_PRODUCT_GROUP_IDS.includes(item.ProductGroupId)) {
            categoryVolumesByGroupId[item.ProductGroupId] = (categoryVolumesByGroupId[item.ProductGroupId] || 0) + liters;
          }

          // For individual product display, use the more granular categorization
          const category = categorizeBeer(item.ProductName);
          productLiters.push({
            name: item.ProductName,
            liters: liters,
            color: BEER_CATEGORY_COLORS[category] || BEER_CATEGORY_COLORS["Other"],
          });
        }
      }

      // Metric 2: Dominant Beer Category for current year (based on all BEER_PRODUCT_GROUP_IDS)
      let dominantBeerCategory = "Ninguna (otras categorías)";
      let maxLiters = 0;
      let dominantGroupId: number | null = null;

      for (const groupId of BEER_PRODUCT_GROUP_IDS) {
        if (categoryVolumesByGroupId[groupId] > maxLiters) {
          maxLiters = categoryVolumesByGroupId[groupId];
          dominantGroupId = groupId;
        }
      }

      if (dominantGroupId !== null) {
        // Map ProductGroupId to a more descriptive name for display
        switch (dominantGroupId) {
          case 34: dominantBeerCategory = "Cervezas Belgas"; break;
          case 36: dominantBeerCategory = "Cervezas Alemanas"; break;
          case 40: dominantBeerCategory = "Cervezas 750ml"; break;
          case 52: dominantBeerCategory = "Cervezas Españolas"; break;
          case 53: dominantBeerCategory = "Cervezas del Mundo"; break;
          default: dominantBeerCategory = "Categoría de Cerveza Dominante";
        }
      }


      // Metric 3: Top 10 Products for current year (from all liquid products)
      const top10Products = productLiters
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 10); // Slice to 10

      // Metric 4: Frequency/Loyalty (Total Visits) for current year - COUNT DISTINCT
      const totalVisitsQuery = `
        SELECT COUNT(DISTINCT T1.Date) AS TotalVisits
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?;
      `;
      const totalVisitsResult = queryData(dbInstance, totalVisitsQuery, [customerId, currentYear]);
      const totalVisits = totalVisitsResult.length > 0 ? totalVisitsResult[0].TotalVisits : 0;

      // --- Data for previous year (2024) for comparison ---
      // Re-run productDataQuery for previous year to get totalLiters2024 based on filtered products
      const rawProductDataPreviousYear = queryData(dbInstance, productDataQuery, [customerId, previousYear]);
      let totalLiters2024 = 0;
      for (const item of rawProductDataPreviousYear) {
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        totalLiters2024 += (item.TotalQuantity * volumeMl) / 1000;
      }

      const totalVisitsPreviousYearResult = queryData(dbInstance, totalVisitsQuery, [customerId, previousYear]); // Use updated totalVisitsQuery
      const totalVisits2024 = totalVisitsPreviousYearResult.length > 0 ? totalVisitsPreviousYearResult[0].TotalVisits : 0;

      // --- New Infographic Metrics for current year (2025) ---

      // Unique Varieties for customer in current year (using filtered data)
      const uniqueVarieties2025 = uniqueVarietiesSet.size; // Use the set collected above

      // Total Unique Varieties in DB (excluding non-liquid/excluded, AND applying beer category filter AND checking if liquid)
      const totalUniqueProductsDbQuery = `
        SELECT P.Name AS ProductName, P.Description AS ProductDescription, P.ProductGroupId AS ProductGroupId
        FROM Product AS P
        WHERE 1=1
        AND P.IsEnabled = TRUE
        ${buildExclusionClause('P')}
        ${buildBeerCategoryFilterClause('P')};
      `;
      const rawTotalVarietiesInDb = queryData(dbInstance, totalUniqueProductsDbQuery);
      const totalVarietiesInDbSet = new Set<string>();
      for (const item of rawTotalVarietiesInDb) {
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        if (volumeMl > 0) { // Only count if it's a liquid product
          totalVarietiesInDbSet.add(item.ProductName);
        }
      }
      const totalVarietiesInDb = totalVarietiesInDbSet.size;

      // Most Active Day 2025 - COUNT DISTINCT
      const mostActiveDayQuery = `
        SELECT STRFTIME('%w', T1.Date) AS DayOfWeek, COUNT(DISTINCT T1.Date) AS DayCount
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?
        GROUP BY DayOfWeek
        ORDER BY DayCount DESC
        LIMIT 1;
      `;
      const mostActiveDayResult = queryData(dbInstance, mostActiveDayQuery, [customerId, currentYear]);
      const mostActiveDay = mostActiveDayResult.length > 0 ? DAY_NAMES[mostActiveDayResult[0].DayOfWeek] : "N/A";

      // All Daily Visits for current year - COUNT DISTINCT
      const allDailyVisitsQuery = `
        SELECT STRFTIME('%w', T1.Date) AS DayOfWeek, COUNT(DISTINCT T1.Date) AS DayCount
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?
        GROUP BY DayOfWeek
        ORDER BY DayOfWeek ASC;
      `;
      const allDailyVisitsResult = queryData(dbInstance, allDailyVisitsQuery, [customerId, currentYear]);
      const dailyVisits = allDailyVisitsResult.map((row: any) => ({
        day: DAY_NAMES[row.DayOfWeek],
        count: row.DayCount,
      }));


      // Most Active Month 2025 - COUNT DISTINCT
      const mostActiveMonthQuery = `
        SELECT STRFTIME('%m', T1.Date) AS MonthOfYear, COUNT(DISTINCT T1.Date) AS MonthCount
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?
        GROUP BY MonthOfYear
        ORDER BY MonthCount DESC
        LIMIT 1;
      `;
      const mostActiveMonthResult = queryData(dbInstance, mostActiveMonthQuery, [customerId, currentYear]);
      const mostActiveMonth = mostActiveMonthResult.length > 0 ? MONTH_NAMES[parseInt(mostActiveMonthResult[0].MonthOfYear, 10) - 1] : "N/A";

      // All Monthly Visits for current year - COUNT DISTINCT
      const allMonthlyVisitsQuery = `
        SELECT STRFTIME('%m', T1.Date) AS MonthOfYear, COUNT(DISTINCT T1.Date) AS MonthCount
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?
        GROUP BY MonthOfYear
        ORDER BY MonthOfYear ASC;
      `;
      const allMonthlyVisitsResult = queryData(dbInstance, allMonthlyVisitsQuery, [customerId, currentYear]);
      const monthlyVisits = allMonthlyVisitsResult.map((row: any) => ({
        month: MONTH_NAMES[parseInt(row.MonthOfYear, 10) - 1],
        count: row.MonthCount,
      }));


      return {
        customerName,
        year,
        totalLiters,
        dominantBeerCategory,
        top10Products,
        totalVisits,
        categoryVolumes: categoryVolumesByGroupId, // Renamed for clarity
        totalVisits2024,
        totalLiters2024,
        uniqueVarieties2025,
        totalVarietiesInDb,
        mostActiveDay,
        mostActiveMonth,
        dailyVisits,
        monthlyVisits,
      };
    } catch (e: any) {
      console.error("Error getting wrapped data:", e);
      setError(e.message);
      throw new Error(`Failed to retrieve wrapped data: ${e.message}. Please check database schema or customer ID.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllBeerVarietiesInDb = useCallback(async () => {
    if (!dbInstance) {
      throw new Error("Database not loaded.");
    }

    const buildExclusionClause = (tableAlias: string) => {
      if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) {
        return "";
      }
      const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
      return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
    };

    const buildBeerCategoryFilterClause = (tableAlias: string) => {
      if (BEER_PRODUCT_GROUP_IDS.length === 0) {
        return "";
      }
      const categoryIdsSql = BEER_PRODUCT_GROUP_IDS.join(',');
      return `AND ${tableAlias}.ProductGroupId IN (${categoryIdsSql})`;
    };

    const totalUniqueProductsDbQuery = `
      SELECT P.Name AS ProductName, P.Description AS ProductDescription, P.ProductGroupId AS ProductGroupId
      FROM Product AS P
      WHERE 1=1
      AND P.IsEnabled = TRUE
      ${buildExclusionClause('P')}
      ${buildBeerCategoryFilterClause('P')};
    `;
    const rawTotalVarietiesInDb = queryData(dbInstance, totalUniqueProductsDbQuery);
    const totalVarietiesInDbSet = new Set<string>();
    for (const item of rawTotalVarietiesInDb) {
      const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
      if (volumeMl > 0) { // Only count if it's a liquid product
        totalVarietiesInDbSet.add(item.ProductName);
      }
    }
    return Array.from(totalVarietiesInDbSet).sort();
  }, []);

  return { dbLoaded, loading, error, findCustomer, getWrappedData, extractVolumeMl, categorizeBeer, getAllBeerVarietiesInDb };
}