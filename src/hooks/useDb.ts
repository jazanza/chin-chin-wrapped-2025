import { useState, useCallback, useEffect } from "react";
import { initDb, loadDb, queryData, type Database } from "@/lib/db";

let dbInstance: Database | null = null;

const EXCLUDED_CUSTOMERS = ["Maria Fernanda Azanza Arias", "Jose Azanza Arias", "Enrique Cobo", "Juan Francisco Perez", "Islas Boutique"];
const EXCLUDED_PRODUCT_KEYWORDS = [
    "Snacks", "Sandwich", "Halls", "Marlboro", "Vozol", "Funda", "Brocheta", 
    "Hamburguesa", "Pin", "Mallorca", "Trident", "Ruffles", "Kit Kat", "Papas Cholitas", 
    "Letrero", "Gorra", "Tapas Mix", "Nachos", "Lanyard"
];

const productExclusionClause = EXCLUDED_PRODUCT_KEYWORDS.map(keyword => `p.Name NOT LIKE '%${keyword}%'`).join(' AND ');

export const useDb = () => {
  const [dbLoaded, setDbLoaded] = useState(!!dbInstance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      if (dbInstance) {
        setDbLoaded(true);
        return;
      }
      try {
        setLoading(true);
        await initDb();
        const response = await fetch('/ChinChin-2025-07-22.db');
        if (!response.ok) throw new Error('Failed to fetch database file.');
        const buffer = await response.arrayBuffer();
        dbInstance = loadDb(new Uint8Array(buffer));
        setDbLoaded(true);
      } catch (err: any) {
        console.error("Database loading error:", err);
        setError(err.message || "Failed to load database.");
      } finally {
        setLoading(false);
      }
    };
    loadDatabase();
  }, []);

  const findCustomer = useCallback(async (searchTerm: string) => {
    if (!dbInstance) throw new Error("Database not loaded.");
    const query = `
      SELECT Id, Name, PhoneNumber, TaxNumber, Email 
      FROM Customers 
      WHERE (Name LIKE ? OR PhoneNumber LIKE ? OR TaxNumber LIKE ?)
      AND Name NOT IN (${EXCLUDED_CUSTOMERS.map(() => '?').join(',')})
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, ...EXCLUDED_CUSTOMERS];
    return queryData(dbInstance, query, params);
  }, []);

  const getAllBeerVarietiesInDb = useCallback(async () => {
    if (!dbInstance) throw new Error("Database not loaded.");
    const query = `SELECT DISTINCT p.Name FROM Products p WHERE ${productExclusionClause} ORDER BY p.Name;`;
    return queryData(dbInstance, query).map((row: any) => row.Name);
  }, []);

  const getTotalCommunityClients = useCallback((year: string) => {
    if (!dbInstance) throw new Error("Database not loaded.");
    const query = `
      SELECT COUNT(DISTINCT c.Id) as totalClients
      FROM Customers c
      JOIN Sales s ON c.Id = s.CustomerId
      WHERE STRFTIME('%Y', s.Date) = ? AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(() => '?').join(',')});
    `;
    return queryData(dbInstance, query, [year, ...EXCLUDED_CUSTOMERS])[0]?.totalClients || 0;
  }, []);

  const getTotalCommunityLiters = useCallback((year: string) => {
    if (!dbInstance) throw new Error("Database not loaded.");
    const query = `
      SELECT SUM(p.Volume) as totalLiters
      FROM Sales s
      JOIN Products p ON s.ProductId = p.Id
      JOIN Customers c ON s.CustomerId = c.Id
      WHERE STRFTIME('%Y', s.Date) = ? AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(() => '?').join(',')}) AND ${productExclusionClause};
    `;
    const result = queryData(dbInstance, query, [year, ...EXCLUDED_CUSTOMERS]);
    return (result[0]?.totalLiters || 0) / 1000;
  }, []);

  const getWrappedData = useCallback(async (customerId: number, year: string) => {
    if (!dbInstance) throw new Error("Database not loaded.");
    setLoading(true);
    setError(null);
    try {
      const customerQuery = "SELECT Name FROM Customers WHERE Id = ?";
      const customerResult = queryData(dbInstance, customerQuery, [customerId]);
      if (customerResult.length === 0) throw new Error("Customer not found.");
      const customerName = customerResult[0].Name;

      const queries = {
        totalLiters: `SELECT SUM(p.Volume) as val FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause}`,
        totalVisits: `SELECT COUNT(DISTINCT DATE(s.Date)) as val FROM Sales s WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ?`,
        dominantCategory: `SELECT p.Category as val FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause} GROUP BY p.Category ORDER BY SUM(p.Volume) DESC LIMIT 1`,
        top10Products: `SELECT p.Name, SUM(p.Volume) as totalVolume FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause} GROUP BY p.Id, p.Name ORDER BY totalVolume DESC LIMIT 10`,
        uniqueVarieties: `SELECT COUNT(DISTINCT s.ProductId) as val FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause}`,
        totalVarietiesInDb: `SELECT COUNT(Id) as val FROM Products WHERE ${productExclusionClause}`,
        mostActiveDay: `SELECT STRFTIME('%w', Date) as val FROM Sales WHERE CustomerId = ? AND STRFTIME('%Y', Date) = ? GROUP BY val ORDER BY COUNT(DISTINCT DATE(Date)) DESC LIMIT 1`,
        mostActiveMonth: `SELECT STRFTIME('%m', Date) as val FROM Sales WHERE CustomerId = ? AND STRFTIME('%Y', Date) = ? GROUP BY val ORDER BY COUNT(DISTINCT DATE(Date)) DESC LIMIT 1`,
        dailyVisits: `SELECT STRFTIME('%w', Date) as dayOfWeek, COUNT(DISTINCT DATE(Date)) as visitCount FROM Sales WHERE CustomerId = ? AND STRFTIME('%Y', Date) = ? GROUP BY dayOfWeek`,
        monthlyVisits: `SELECT STRFTIME('%m', Date) as month, COUNT(DISTINCT DATE(Date)) as visitCount FROM Sales WHERE CustomerId = ? AND STRFTIME('%Y', Date) = ? GROUP BY month`,
        firstBeer: `SELECT p.Name, s.Date, s.Quantity FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause} ORDER BY s.Date ASC LIMIT 1`,
        allCustomersLiters: `SELECT s.CustomerId, SUM(p.Volume) as totalVolume FROM Sales s JOIN Products p ON s.ProductId = p.Id JOIN Customers c ON s.CustomerId = c.Id WHERE STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause} AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(() => '?').join(',')}) GROUP BY s.CustomerId`,
        allCustomersVisits: `SELECT CustomerId, COUNT(DISTINCT DATE(Date)) as visitCount FROM Sales s JOIN Customers c ON s.CustomerId = c.Id WHERE STRFTIME('%Y', s.Date) = ? AND c.Name NOT IN (${EXCLUDED_CUSTOMERS.map(() => '?').join(',')}) GROUP BY CustomerId`,
        communityMostPopularDay: `SELECT STRFTIME('%w', Date) as dayOfWeek FROM Sales WHERE STRFTIME('%Y', Date) = ? GROUP BY dayOfWeek ORDER BY COUNT(DISTINCT CustomerId, DATE(Date)) DESC LIMIT 1`,
        communityMostPopularMonth: `SELECT STRFTIME('%m', Date) as month FROM Sales WHERE STRFTIME('%Y', Date) = ? GROUP BY month ORDER BY COUNT(DISTINCT CustomerId, DATE(Date)) DESC LIMIT 1`,
      };

      const dayMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const monthMap = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

      const totalLiters = (queryData(dbInstance, queries.totalLiters, [customerId, year])[0]?.val || 0) / 1000;
      const totalVisits = queryData(dbInstance, queries.totalVisits, [customerId, year])[0]?.val || 0;
      const top10Products = queryData(dbInstance, queries.top10Products, [customerId, year]).map((p: any) => ({ name: p.Name, liters: p.totalVolume / 1000 }));
      const uniqueVarieties2025 = queryData(dbInstance, queries.uniqueVarieties, [customerId, year])[0]?.val || 0;
      const totalVarietiesInDb = queryData(dbInstance, queries.totalVarietiesInDb)[0]?.val || 0;
      
      const allVarieties = await getAllBeerVarietiesInDb();
      const consumedVarietiesResult = queryData(dbInstance, `SELECT DISTINCT p.Name FROM Sales s JOIN Products p ON s.ProductId = p.Id WHERE s.CustomerId = ? AND STRFTIME('%Y', s.Date) = ? AND ${productExclusionClause}`, [customerId, year]);
      const consumedVarieties = new Set(consumedVarietiesResult.map((p: any) => p.Name));
      const missingVarieties = allVarieties.filter((v: string) => !consumedVarieties.has(v));

      const firstBeerResult = queryData(dbInstance, queries.firstBeer, [customerId, year]);
      const firstBeerDetails = firstBeerResult.length > 0 ? { name: firstBeerResult[0].Name, date: firstBeerResult[0].Date, quantity: firstBeerResult[0].Quantity } : null;

      const allLiters = queryData(dbInstance, queries.allCustomersLiters, [year, ...EXCLUDED_CUSTOMERS]);
      const customersWithLessLiters = allLiters.filter((c: any) => c.totalVolume < totalLiters * 1000).length;
      const litersPercentile = allLiters.length > 0 ? (customersWithLessLiters / allLiters.length) * 100 : 0;

      const allVisits = queryData(dbInstance, queries.allCustomersVisits, [year, ...EXCLUDED_CUSTOMERS]);
      const customersWithLessVisits = allVisits.filter((c: any) => c.visitCount < totalVisits).length;
      const visitsPercentile = allVisits.length > 0 ? (customersWithLessVisits / allVisits.length) * 100 : 0;

      const varietyExplorationRatio = totalVarietiesInDb > 0 ? uniqueVarieties2025 / totalVarietiesInDb : 0;
      let dynamicTitle = "Descubridor";
      if (varietyExplorationRatio < 0.1) dynamicTitle = "Curioso del Lúpulo (Recién Bautizado)";
      else if (varietyExplorationRatio < 0.5) dynamicTitle = "Explorador de Cervezas";
      else dynamicTitle = "Coleccionista de Sabores";

      return {
        customerName, year, totalLiters, totalVisits, top10Products, uniqueVarieties2025, totalVarietiesInDb, missingVarieties, firstBeerDetails, litersPercentile, visitsPercentile, varietyExplorationRatio, dynamicTitle,
        dominantBeerCategory: queryData(dbInstance, queries.dominantCategory, [customerId, year])[0]?.val || "Variado",
        mostActiveDay: dayMap[queryData(dbInstance, queries.mostActiveDay, [customerId, year])[0]?.val] || "N/A",
        mostActiveMonth: monthMap[parseInt(queryData(dbInstance, queries.mostActiveMonth, [customerId, year])[0]?.val, 10)] || "N/A",
        dailyVisits: queryData(dbInstance, queries.dailyVisits, [customerId, year]).map((d: any) => ({ day: dayMap[d.dayOfWeek], count: d.visitCount })),
        monthlyVisits: queryData(dbInstance, queries.monthlyVisits, [customerId, year]).map((m: any) => ({ month: monthMap[parseInt(m.month, 10)], count: m.visitCount })),
        mostPopularCommunityDay: dayMap[queryData(dbInstance, queries.communityMostPopularDay, [year])[0]?.dayOfWeek] || "Sábado",
        mostPopularCommunityMonth: monthMap[parseInt(queryData(dbInstance, queries.communityMostPopularMonth, [year])[0]?.month, 10)] || "Diciembre",
        mostFrequentBeerName: top10Products.length > 0 ? top10Products[0].name : "cerveza",
        totalCommunityClients: getTotalCommunityClients(year),
        totalCommunityLiters: getTotalCommunityLiters(year),
        palateCategory: { concentration: 'Fiel', rarity: 'Popular' }, // Placeholder, logic can be complex
      };
    } catch (err: any) {
      console.error("Error getting wrapped data:", err);
      setError(err.message || "Failed to get wrapped data.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllBeerVarietiesInDb, getTotalCommunityClients, getTotalCommunityLiters]);

  return { dbLoaded, loading, error, findCustomer, getWrappedData, getAllBeerVarietiesInDb };
};