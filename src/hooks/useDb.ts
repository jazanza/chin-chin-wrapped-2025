import { useState, useCallback, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { initDb, loadDb, queryData } from "@/lib/db";

const EXCLUDED_CUSTOMERS = ["Maria Fernanda Azanza Arias", "Jose Azanza Arias", "Enrique Cobo", "Juan Francisco Perez", "Islas Boutique"];

let dbInstance: any = null; // Global instance for the database

const createQuery = (baseQuery: string, dateRange?: DateRange): string => {
  let whereClause = "WHERE T1.DocumentTypeId = 2"; // Assuming DocumentTypeId 2 is for sales
  if (dateRange?.from) {
    const fromDate = format(dateRange.from, "yyyy-MM-dd 00:00:00");
    const toDate = dateRange.to
      ? format(dateRange.to, "yyyy-MM-dd 23:59:59")
      : format(new Date(), "yyyy-MM-dd 23:59:59");
    whereClause += ` AND T1.DateCreated BETWEEN '${fromDate}' AND '${toDate}'`;
  }

  const excludedCustomersString = EXCLUDED_CUSTOMERS.map(name => `'${name.replace(/'/g, "''")}'`).join(',');

  // Adjusting table aliases for consistency with Aronium schema
  if (baseQuery.includes("LEFT JOIN Customer AS T4")) {
    whereClause += ` AND (T4.Name IS NULL OR T4.Name NOT IN (${excludedCustomersString}))`;
  } else if (baseQuery.includes("INNER JOIN Customer AS T4")) {
    whereClause += ` AND T4.Name NOT IN (${excludedCustomersString})`;
  }

  return baseQuery.replace("{{WHERE_CLAUSE}}", whereClause);
};

// Corrected queries using Aronium table/column names
const VOLUME_QUERY_BASE = `
  SELECT T2.Quantity, T3.Name AS ItemName, T3.Description AS ItemDescription
  FROM Document AS T1
  INNER JOIN DocumentItem AS T2 ON T1.Id = T2.DocumentId
  INNER JOIN Product AS T3 ON T2.ProductId = T3.Id
  LEFT JOIN Customer AS T4 ON T1.CustomerId = T4.Id
  {{WHERE_CLAUSE}};
`;

const SPECTRUM_QUERY_BASE = `
  SELECT T3.Name as ItemName, T3.Description AS ItemDescription, SUM(T2.Quantity) as TotalQuantity
  FROM Document AS T1
  INNER JOIN DocumentItem AS T2 ON T1.Id = T2.DocumentId
  INNER JOIN Product AS T3 ON T2.ProductId = T3.Id
  LEFT JOIN Customer AS T4 ON T1.CustomerId = T4.Id
  {{WHERE_CLAUSE}}
  GROUP BY T3.Name, T3.Description;
`;

const LOYALTY_QUERY_BASE = `
  SELECT
    T4.Name AS CustomerName,
    T3.Name AS ItemName,
    T3.Description AS ItemDescription,
    SUM(T2.Quantity) AS TotalQuantity
  FROM Document AS T1
  INNER JOIN DocumentItem AS T2 ON T1.Id = T2.DocumentId
  INNER JOIN Product AS T3 ON T2.ProductId = T3.Id
  INNER JOIN Customer AS T4 ON T1.CustomerId = T4.Id
  {{WHERE_CLAUSE}} AND T4.Name IS NOT NULL
  GROUP BY T4.Name, T3.Name, T3.Description
  ORDER BY SUM(T2.Quantity) DESC;
`;

const extractVolumeMl = (name: string, description: string | null): number => {
  const textToSearch = `${name} ${description || ""}`.toLowerCase();
  const volumeRegex = /(\d+)\s*ml/i;
  const match = textToSearch.match(volumeRegex);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  if (textToSearch.includes("pinta")) return 473;
  if (textToSearch.includes("caña")) return 200;
  if (textToSearch.includes("botella")) return 330;
  if (textToSearch.includes("lata")) return 330;

  console.warn(`Could not determine volume for item: ${name}. Defaulting to 0.`);
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
  IPA: "#FF6347",
  Lager: "#FFD700",
  Stout: "#4B0082",
  Porter: "#8B4513",
  Pilsner: "#F0E68C",
  Ale: "#D2691E",
  Other: "#A9A9A9",
};

export function useDb() {
  const [dbLoaded, setDbLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      setLoading(true);
      setError(null);
      try {
        await initDb();
        // Static load from public/data/bbdd.db
        const response = await fetch('/data/bbdd.db');
        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        dbInstance = loadDb(new Uint8Array(buffer));
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
    // Simplified query to only search by Name
    const customerQuery = `
      SELECT Id, Name
      FROM Customer
      WHERE Name LIKE '%' || ? || '%'
      LIMIT 1;
    `;

    try {
      const results = queryData(dbInstance, customerQuery, [searchTerm]);
      return results.length > 0 ? results[0] : null;
    } catch (e: any) {
      console.error("Error executing findCustomer query:", e);
      throw new Error(`Failed to execute customer search query: ${e.message}. Please check database schema (Customer table, Id, Name columns) or search term.`);
    }
  }, []);

  const getWrappedData = useCallback(async (customerId: number, year: string = '2025') => {
    if (!dbInstance) {
      throw new Error("Database not loaded.");
    }
    setLoading(true);
    setError(null);
    try {
      // Metric 5: Customer Name (fetched separately for overlay)
      const customerNameQuery = `SELECT Name FROM Customer WHERE Id = ? LIMIT 1;`;
      const customerNameResult = queryData(dbInstance, customerNameQuery, [customerId]);
      const customerName = customerNameResult.length > 0 ? customerNameResult[0].Name : "Cliente Desconocido";

      // Metric 1 & 3: Total Consumed and Top 5 Products
      const totalConsumedAndRankingQuery = `
        SELECT
            T3.Name AS ProductName,
            SUM(T2.Quantity) AS TotalQuantity
        FROM
            Document AS T1
        INNER JOIN
            DocumentItem AS T2 ON T1.Id = T2.DocumentId
        INNER JOIN
            Product AS T3 ON T2.ProductId = T3.Id
        WHERE
            T1.CustomerId = ?
            AND STRFTIME('%Y', T1.Date) = ?
        GROUP BY
            T3.Id, T3.Name
        HAVING
            TotalQuantity > 0
        ORDER BY
            TotalQuantity DESC;
      `;
      const rawProductData = queryData(dbInstance, totalConsumedAndRankingQuery, [customerId, year]);

      let totalLiters = 0;
      const categoryVolumes: { [key: string]: number } = {};
      const productLiters: { name: string; liters: number; color: string }[] = [];

      for (const item of rawProductData) {
        const volumeMl = extractVolumeMl(item.ProductName, null); // Assuming description is not needed here
        const liters = (item.TotalQuantity * volumeMl) / 1000;
        totalLiters += liters;

        const category = categorizeBeer(item.ProductName);
        categoryVolumes[category] = (categoryVolumes[category] || 0) + liters;
        
        productLiters.push({
          name: item.ProductName,
          liters: liters,
          color: BEER_CATEGORY_COLORS[category] || BEER_CATEGORY_COLORS["Other"],
        });
      }

      // Metric 2: Dominant Beer
      let dominantBeerCategory = "N/A";
      let maxCategoryLiters = 0;
      for (const category in categoryVolumes) {
        if (categoryVolumes[category] > maxCategoryLiters) {
          maxCategoryLiters = categoryVolumes[category];
          dominantBeerCategory = category;
        }
      }

      // Metric 3: Top 5 Products
      const top5Products = productLiters
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 5);

      // Metric 4: Frequency/Loyalty (Total Visits)
      const totalVisitsQuery = `
        SELECT
            COUNT(DISTINCT T1.Date) AS TotalVisits
        FROM
            Document AS T1
        WHERE
            T1.CustomerId = ?
            AND STRFTIME('%Y', T1.Date) = ?;
      `;
      const totalVisitsResult = queryData(dbInstance, totalVisitsQuery, [customerId, year]);
      const totalVisits = totalVisitsResult.length > 0 ? totalVisitsResult[0].TotalVisits : 0;

      return {
        customerName,
        year,
        totalLiters,
        dominantBeerCategory,
        top5Products,
        totalVisits,
        categoryVolumes, // Add categoryVolumes to the returned data for WrappedSpectrum
      };
    } catch (e: any) {
      console.error("Error getting wrapped data:", e);
      setError(e.message);
      throw new Error(`Failed to retrieve wrapped data: ${e.message}. Please check database schema or customer ID.`);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dbLoaded, loading, error, findCustomer, getWrappedData, extractVolumeMl, categorizeBeer };
}