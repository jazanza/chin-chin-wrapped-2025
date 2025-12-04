import { useState, useCallback, useEffect } from "react";
import { initDb, loadDb, queryData, type Database, type Statement } from "@/lib/db";
import { createDataUrlFromBinary } from "@/lib/utils"; // NEW: Import createDataUrlFromBinary

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

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// List of beer product group IDs to be considered for unique varieties and dominant category
// Now includes 40 for unique varieties count and dominant category calculation
const BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT = [34, 36, 40, 52, 53];

// IDs de productos que deben ser incluidos forzosamente, independientemente de su estado IsEnabled
const FORCED_INCLUDED_VARIETY_IDS = [
    499, // 5.0 Craft - 500ml
    498, // 5.0 Lager - 500ml
    511, // 5.0 Weiss - 500ml
    111, // Asahi - 330ml
    659, // Bear Bear Wheat - 500ml
    695, // Bear Beer Lager - 500ml
    583, // Bush De Nuits - 750ml
    584, // Bush Prestige - 750ml
    738, // Club Colombia Roja - 330ml
    651, // Cusqueña Doble Malta - 330ml
    652, // Cusqueña Dorada - 330ml
    737, // Cusqueña Trigo - 330ml
    594, // Czechvar - 500ml
    292, // Erdinger OktoberFest - 500ml
    592, // Erdinger Urwisse - 500ml
    665, // Hofbrau 3.3 Session Lager - 500ml
    707, // Ladenburger Hefeweizen - 500ml
    706, // Ladenburger Helles - 500ml
    822, // Modelo Negra - 355ml
    605, // Oettinger Radler - 500ml
    86,  // Peroni - 330ml
    672, // Sapporo - 330ml
    801  // Schofferhofer Grapefruit - 330ml
];

// Helper to extract the base beer name by removing volume suffix (e.g., " - 330ml")
const getBaseBeerName = (productName: string): string => {
  // Expresión Regular robusta para eliminar sufijos de volumen o formato comunes.
  // Busca: - [número]ml, - [número] ml, - [número]ml, - lata, - botella, etc.
  // Se asume que el nombre base siempre viene ANTES del último descriptor de formato/volumen.
  
  const volumeSuffixRegex = /\s?-\s?((\d+\s?m?l)|(\d+m?l)|lata|botella|caña|pinta|litro|x\d+|pack|\d+pk|sin\s?alcohol)$/i;
  
  // Aplicar la expresión regular de forma iterativa si es necesario o simplificarla al patrón de formato:
  let baseName = productName;
  
  // Buscar el último patrón de volumen/formato conocido y recortar. 
  // El patrón ' - ' sigue siendo el más confiable, pero si hay que buscarlo, debemos ser tolerantes:
  const lastDashIndex = productName.lastIndexOf(' - ');
  if (lastDashIndex !== -1) {
      baseName = productName.substring(0, lastDashIndex).trim();
  }
  
  // Si el patrón ' - ' es inconsistente, se usará la expresión regular como fallback para eliminar cualquier volumen al final:
  baseName = baseName.replace(volumeSuffixRegex, '').trim();
  
  return baseName;
};

// Helper para calcular el percentil
const calculatePercentile = (data: number[], value: number): number => {
  if (data.length === 0) return 0;
  const sortedData = [...data].sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i] <= value) {
      count++;
    } else {
      break;
    }
  }
  return (count / sortedData.length) * 100;
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
        await initDb(); // Call the imported initDb
        // Static load from public/data/bbdd.db
        const response = await fetch('/data/bbdd.db');
        if (!response.ok) {
          throw new Error(`Fallo al cargar base de datos: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        dbInstance = loadDb(new Uint8Array(buffer)); // Call the imported loadDb
        setDbLoaded(true);
        console.log("Base de datos cargada correctamente desde ruta estática.");

        // --- TEMPORARY CONSOLE LOGS FOR DEBUGGING ---
        console.log('BEER GROUPS INCLUIDOS:', BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT);
        console.log('PALABRAS CLAVE EXCLUIDAS:', EXCLUDED_PRODUCT_KEYWORDS);
        console.log('PALABRAS CLAVE NO LÍQUIDAS:', NON_LIQUID_KEYWORDS);
        // --- END TEMPORARY CONSOLE LOGS ---

      } catch (e: any) {
        console.error("Error cargando base de datos:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadDatabase();
  }, []);

  const findCustomer = useCallback(async (searchTerm: string) => {
    if (!dbInstance) {
      throw new Error("Base de datos no cargada.");
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
      console.error("Error ejecutando consulta de cliente:", e);
      throw new Error(`Fallo al ejecutar búsqueda de cliente: ${e.message}. Verifica el esquema de la base de datos (tabla Customer, columnas Id, Name, etc.) o el término de búsqueda.`);
    }
  }, []);

  const getAllBeerVarietiesInDb = useCallback(async () => {
    if (!dbInstance) {
      throw new Error("Base de datos no cargada.");
    }

    const buildExclusionClause = (tableAlias: string) => {
      if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) {
        return "";
      }
      const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
      return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
    };

    // Query para obtener todas las variedades de cerveza, incluyendo las forzadas
    const queryForBaseNames = `
      SELECT
          P.Name AS ProductName,
          P.Description AS ProductDescription,
          P.ProductGroupId AS ProductGroupId,
          P.Image AS ProductImage
      FROM
          Product AS P
      WHERE
          (
              (
                  P.IsEnabled = TRUE
                  AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
              )
              OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          )
          ${buildExclusionClause('P')};
    `;

    const rawProducts = queryData(dbInstance, queryForBaseNames);
    const uniqueBaseBeerNamesMap = new Map<string, string>(); // Map base name to image URL

    for (const item of rawProducts) {
      const baseBeerName = getBaseBeerName(item.ProductName);
      if (!uniqueBaseBeerNamesMap.has(baseBeerName)) {
        uniqueBaseBeerNamesMap.set(baseBeerName, createDataUrlFromBinary(item.ProductImage)); // NEW: Use createDataUrlFromBinary
      }
    }
    return Array.from(uniqueBaseBeerNamesMap.entries())
      .map(([name, imageUrl]) => ({ name, imageUrl }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const getGlobalBeerDistribution = useCallback(async (year: string) => {
    if (!dbInstance) {
        throw new Error("Base de datos no cargada.");
    }

    const buildExclusionClause = (tableAlias: string) => {
        if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) {
            return "";
        }
        const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
        return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
    };

    const globalProductDataQuery = `
        SELECT
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            P.ProductGroupId AS ProductGroupId,
            SUM(DI.Quantity) AS TotalQuantity
        FROM
            Document AS D
        INNER JOIN
            DocumentItem AS DI ON D.Id = DI.DocumentId
        INNER JOIN
            Product AS P ON DI.ProductId = P.Id
        WHERE
            STRFTIME('%Y', D.Date) = ?
            ${buildExclusionClause('P')}
            AND (
                (
                    P.IsEnabled = TRUE
                    AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
                )
                OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            )
        GROUP BY
            P.Id, P.Name, P.Description, P.ProductGroupId
        HAVING
            TotalQuantity > 0;
    `;

    const rawGlobalProductData = queryData(dbInstance, globalProductDataQuery, [year]);

    const globalBeerDistribution = new Map<string, number>(); // base beer name -> total liters
    let totalGlobalLiters = 0;

    for (const item of rawGlobalProductData) {
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        const liters = (item.TotalQuantity * volumeMl) / 1000;

        if (liters > 0) {
            totalGlobalLiters += liters;
            const baseBeerName = getBaseBeerName(item.ProductName);
            globalBeerDistribution.set(baseBeerName, (globalBeerDistribution.get(baseBeerName) || 0) + liters);
        }
    }
    return { globalBeerDistribution, totalGlobalLiters };
  }, []);

  const getAllCustomerLiters = useCallback(async (year: string) => {
    if (!dbInstance) throw new Error("Base de datos no cargada.");

    const buildExclusionClause = (tableAlias: string) => {
      if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) return "";
      const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
      return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
    };

    const query = `
      SELECT
          D.CustomerId,
          SUM(DI.Quantity * (
              CASE
                  WHEN P.Name LIKE '%ml' THEN CAST(REPLACE(P.Name, 'ml', '') AS INTEGER)
                  WHEN P.Description LIKE '%ml' THEN CAST(REPLACE(P.Description, 'ml', '') AS INTEGER)
                  WHEN P.Name LIKE '%pinta%' THEN 473
                  WHEN P.Name LIKE '%caña%' THEN 200
                  WHEN P.Name LIKE '%botella%' THEN 330
                  WHEN P.Name LIKE '%lata%' THEN 330
                  ELSE 0
              END
          ) / 1000.0) AS TotalLiters
      FROM
          Document AS D
      INNER JOIN
          DocumentItem AS DI ON D.Id = DI.DocumentId
      INNER JOIN
          Product AS P ON DI.ProductId = P.Id
      WHERE
          STRFTIME('%Y', Date) = ?
          ${buildExclusionClause('P')}
          AND (
              (
                  P.IsEnabled = TRUE
                  AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
              )
              OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          )
      GROUP BY
          D.CustomerId
      HAVING
          TotalLiters > 0;
    `;
    const results = queryData(dbInstance, query, [year]);
    return results.map((row: any) => row.TotalLiters);
  }, []);

  const getAllCustomerVisits = useCallback(async (year: string) => {
    if (!dbInstance) throw new Error("Base de datos no cargada.");

    const query = `
      SELECT
          CustomerId,
          COUNT(DISTINCT Date) AS TotalVisits
      FROM
          Document
      WHERE
          STRFTIME('%Y', Date) = ?
      GROUP BY
          CustomerId
      HAVING
          TotalVisits > 0;
    `;
    const results = queryData(dbInstance, query, [year]);
    return results.map((row: any) => row.TotalVisits);
  }, []);

  const getCommunityDailyVisits = useCallback(async (year: string) => {
    if (!dbInstance) throw new Error("Base de datos no cargada.");

    const query = `
      SELECT STRFTIME('%w', Date) AS DayOfWeek, COUNT(DISTINCT Date) AS DayCount
      FROM Document
      WHERE STRFTIME('%Y', Date) = ?
      GROUP BY DayOfWeek
      ORDER BY DayOfWeek ASC;
    `;
    return queryData(dbInstance, query, [year]);
  }, []);

  const getCommunityMonthlyVisits = useCallback(async (year: string) => {
    if (!dbInstance) throw new Error("Base de datos no cargada.");

    const query = `
      SELECT STRFTIME('%m', Date) AS MonthOfYear, COUNT(DISTINCT Date) AS MonthCount
      FROM Document
      WHERE STRFTIME('%Y', Date) = ?
      GROUP BY MonthOfYear
      ORDER BY MonthOfYear ASC;
    `;
    return queryData(dbInstance, query, [year]);
  }, []);

  const getFirstBeerDetails = useCallback(async (customerId: number, year: string) => {
    if (!dbInstance) throw new Error("Base de datos no cargada.");

    const buildExclusionClause = (tableAlias: string) => {
      if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) return "";
      const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
      return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
    };

    const query = `
      SELECT
          P.Name AS ProductName,
          D.Date AS DocumentDate,
          DI.Quantity AS Quantity,
          P.Image AS ProductImage
      FROM
          Document AS D
      INNER JOIN
          DocumentItem AS DI ON D.Id = DI.DocumentId
      INNER JOIN
          Product AS P ON DI.ProductId = P.Id
      WHERE
          D.CustomerId = ?
          AND STRFTIME('%Y', D.Date) = ?
          ${buildExclusionClause('P')}
          AND (
              (
                  P.IsEnabled = TRUE
                  AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
              )
              OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          )
      ORDER BY
          D.Date ASC
      LIMIT 1;
    `;
    const result = queryData(dbInstance, query, [customerId, year]);
    if (result.length > 0) {
      return {
        name: getBaseBeerName(result[0].ProductName),
        date: result[0].DocumentDate,
        quantity: result[0].Quantity,
        imageUrl: createDataUrlFromBinary(result[0].ProductImage), // NEW: Use createDataUrlFromBinary
      };
    }
    return null;
  }, []);


  const getWrappedData = useCallback(async (customerId: number, year: string = '2025') => {
    if (!dbInstance) {
      throw new Error("Base de datos no cargada.");
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

      // Metric 5: Customer Name (fetched separately for overlay)
      const customerNameQuery = `SELECT Name FROM Customer WHERE Id = ? LIMIT 1;`;
      const customerNameResult = queryData(dbInstance, customerNameQuery, [customerId]);
      const customerName = customerNameResult.length > 0 ? customerNameResult[0].Name : "Cliente Desconocido";

      // --- Data for current year (2025) ---
      const currentYear = year;

      // Query for product data (name, description, quantity, ProductGroupId, Image) for a given customer and year
      const productDataQuery = `
        SELECT
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            P.ProductGroupId AS ProductGroupId,
            SUM(DI.Quantity) AS TotalQuantity,
            P.Id AS ProductId,
            P.Image AS ProductImage
        FROM
            Document AS D
        INNER JOIN
            DocumentItem AS DI ON D.Id = DI.DocumentId
        INNER JOIN
            Product AS P ON DI.ProductId = P.Id
        WHERE
            D.CustomerId = ?
            AND STRFTIME('%Y', D.Date) = ?
            ${buildExclusionClause('P')}
            AND (
                (
                    P.IsEnabled = TRUE
                    AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
                )
                OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            )
        GROUP BY
            P.Id, P.Name, P.Description, P.ProductGroupId, P.Image
        HAVING
            TotalQuantity > 0;
      `;

      // Fetch product data for current year (includes all products, then filter for dominant category)
      const rawProductDataCurrentYear = queryData(dbInstance, productDataQuery, [customerId, currentYear]);

      let totalLiters = 0;
      const categoryVolumesByGroupId: { [key: number]: number } = {};
      const productLiters: { name: string; liters: number; color: string; imageUrl: string }[] = [];
      const customerUniqueBeerNamesMap = new Map<string, string>(); // Map base name to image URL

      // Fetch global beer distribution for rarity calculation
      const { globalBeerDistribution, totalGlobalLiters } = await getGlobalBeerDistribution(currentYear);

      // Calculate customer's beer consumption by base name for palate analysis
      const customerBeerLitersMap = new Map<string, number>();
      let customerTotalBeerLitersForPalate = 0;

      // Also collect top 3 for concentration coefficient
      const customerProductLitersForConcentration: { name: string; liters: number }[] = [];


      for (const item of rawProductDataCurrentYear) {
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        const liters = (item.TotalQuantity * volumeMl) / 1000;
        
        if (liters > 0) {
          totalLiters += liters;

          if (BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.includes(item.ProductGroupId) || FORCED_INCLUDED_VARIETY_IDS.includes(item.ProductId)) {
            const baseBeerName = getBaseBeerName(item.ProductName);
            customerUniqueBeerNamesMap.set(baseBeerName, createDataUrlFromBinary(item.ProductImage)); // NEW: Use createDataUrlFromBinary
            
            // For palate analysis
            customerBeerLitersMap.set(baseBeerName, (customerBeerLitersMap.get(baseBeerName) || 0) + liters);
            customerTotalBeerLitersForPalate += liters;
            customerProductLitersForConcentration.push({ name: baseBeerName, liters: liters });
          }

          if (BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.includes(item.ProductGroupId) || FORCED_INCLUDED_VARIETY_IDS.includes(item.ProductId)) {
            categoryVolumesByGroupId[item.ProductGroupId] = (categoryVolumesByGroupId[item.ProductGroupId] || 0) + liters;
          }

          const category = categorizeBeer(item.ProductName);
          productLiters.push({
            name: getBaseBeerName(item.ProductName),
            liters: liters,
            color: BEER_CATEGORY_COLORS[category] || BEER_CATEGORY_COLORS["Other"],
            imageUrl: createDataUrlFromBinary(item.ProductImage), // NEW: Use createDataUrlFromBinary
          });
        }
      }

      let dominantBeerCategory = "Ninguna (otras categorías)";
      let maxLiters = 0;
      let dominantGroupId: number | null = null;

      for (const groupId of BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT) {
        if (categoryVolumesByGroupId[groupId] > maxLiters) {
          maxLiters = categoryVolumesByGroupId[groupId];
          dominantGroupId = groupId;
        }
      }

      if (dominantGroupId !== null) {
        switch (dominantGroupId) {
          case 34: dominantBeerCategory = "Cervezas Belgas"; break;
          case 36: dominantBeerCategory = "Cervezas Alemanas"; break;
          case 40: dominantBeerCategory = "Cervezas de 750ml"; break;
          case 52: dominantBeerCategory = "Cervezas Españolas"; break;
          case 53: dominantBeerCategory = "Cervezas del Mundo"; break;
          default: dominantBeerCategory = "Categoría de Cerveza Dominante";
        }
      }

      const top5Products = productLiters // Changed to top5Products
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 5); // Changed slice to 5
      
      const mostFrequentBeerName = top5Products.length > 0 ? top5Products[0].name : "tu cerveza favorita"; // Changed to top5Products

      const totalVisitsQuery = `
        SELECT COUNT(DISTINCT T1.Date) AS TotalVisits
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?;
      `;
      const totalVisitsResult = queryData(dbInstance, totalVisitsQuery, [customerId, currentYear]);
      const totalVisits = totalVisitsResult.length > 0 ? totalVisitsResult[0].TotalVisits : 0;

      const uniqueVarieties2025 = customerUniqueBeerNamesMap.size;
      const customerConsumedBeerNames = Array.from(customerUniqueBeerNamesMap.keys());

      const allDbUniqueBeerObjects = await getAllBeerVarietiesInDb();
      const allDbUniqueBeerNames = allDbUniqueBeerObjects.map(item => item.name);

      const totalVarietiesInDb = allDbUniqueBeerNames.length;

      const missingVarieties = allDbUniqueBeerObjects.filter(
        (dbBeer) => !customerConsumedBeerNames.includes(dbBeer.name)
      );

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

      let concentration: 'Fiel' | 'Explorador' = 'Explorador';
      if (customerTotalBeerLitersForPalate > 0) {
          const sortedCustomerBeers = customerProductLitersForConcentration.sort((a, b) => b.liters - a.liters);
          const top3Liters = sortedCustomerBeers.slice(0, 3).reduce((sum, beer) => sum + beer.liters, 0);
          const concentrationCoefficient = top3Liters / customerTotalBeerLitersForPalate;
          if (concentrationCoefficient > 0.60) {
              concentration = 'Fiel';
          }
      }

      let rarity: 'Nicho' | 'Popular' = 'Popular';
      let weightedRarityScore = 0;
      let totalWeightedLiters = 0;

      if (customerTotalBeerLitersForPalate > 0 && totalGlobalLiters > 0) {
          for (const [baseBeerName, customerLiters] of customerBeerLitersMap.entries()) {
              const globalLiters = globalBeerDistribution.get(baseBeerName) || 0;
              if (globalLiters > 0) {
                  const globalPopularity = globalLiters / totalGlobalLiters;
                  const beerRarityFactor = 1 - globalPopularity;

                  weightedRarityScore += customerLiters * beerRarityFactor;
                  totalWeightedLiters += customerLiters;
              }
          }

          if (totalWeightedLiters > 0) {
              const averageRarityScore = weightedRarityScore / totalWeightedLiters;
              const RARITY_THRESHOLD = 0.7;
              if (averageRarityScore > RARITY_THRESHOLD) {
                  rarity = 'Nicho';
              }
          }
      }

      const palateCategory = { concentration, rarity };

      let dynamicTitle = "Tu Título Cervecero";
      if (palateCategory.concentration === 'Fiel' && palateCategory.rarity === 'Nicho') {
        dynamicTitle = "El Monje Cervecero";
      } else if (palateCategory.concentration === 'Explorador' && palateCategory.rarity === 'Nicho') {
        dynamicTitle = "El Catador Global";
      } else if (palateCategory.concentration === 'Fiel' && palateCategory.rarity === 'Popular') {
        dynamicTitle = "El Inquebrantable";
      } else if (palateCategory.concentration === 'Explorador' && palateCategory.rarity === 'Popular') {
        dynamicTitle = "El Explorador Sociable";
      }

      const varietyExplorationRatio = totalVarietiesInDb > 0 ? (uniqueVarieties2025 / totalVarietiesInDb) : 0;
      const LOW_EXPLORATION_THRESHOLD = 0.20;

      if (varietyExplorationRatio < LOW_EXPLORATION_THRESHOLD) {
          dynamicTitle = "Curioso del Lúpulo"; 
      }

      const allCustomerLiters = await getAllCustomerLiters(currentYear);
      const litersPercentile = calculatePercentile(allCustomerLiters, totalLiters);

      const allCustomerVisits = await getAllCustomerVisits(currentYear);
      const visitsPercentile = calculatePercentile(allCustomerVisits, totalVisits);

      const communityDailyVisitsRaw = await getCommunityDailyVisits(currentYear);
      const communityDailyVisits = communityDailyVisitsRaw.map((row: any) => ({
        day: DAY_NAMES[row.DayOfWeek],
        count: row.DayCount,
      }));
      const mostPopularCommunityDay = communityDailyVisits.reduce((prev, current) => (prev.count > current.count ? prev : current), { day: "N/A", count: 0 }).day;

      const communityMonthlyVisitsRaw = await getCommunityMonthlyVisits(currentYear);
      const communityMonthlyVisits = communityMonthlyVisitsRaw.map((row: any) => ({
        month: MONTH_NAMES[parseInt(row.MonthOfYear, 10) - 1],
        count: row.MonthCount,
      }));
      const mostPopularCommunityMonth = communityMonthlyVisits.reduce((prev, current) => (prev.count > current.count ? prev : current), { month: "N/A", count: 0 }).month;

      const firstBeerDetails = await getFirstBeerDetails(customerId, currentYear);

      const totalCustomersQuery = `
        SELECT COUNT(DISTINCT CustomerId) AS TotalCustomers
        FROM Document
        WHERE STRFTIME('%Y', Date) = ?;
      `;
      const totalCustomersResult = queryData(dbInstance, totalCustomersQuery, [currentYear]);
      const totalCustomers = totalCustomersResult.length > 0 ? totalCustomersResult[0].TotalCustomers : 0;

      const allSalesQuery = `
        SELECT
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            DI.Quantity,
            P.Image AS ProductImage
        FROM
            Document AS D
        INNER JOIN
            DocumentItem AS DI ON D.Id = DI.DocumentId
        INNER JOIN
            Product AS P ON DI.ProductId = P.Id
        WHERE
            STRFTIME('%Y', D.Date) = ?
            ${buildExclusionClause('P')}
            AND (
                (
                    P.IsEnabled = TRUE
                    AND P.ProductGroupId IN (${BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.join(',')})
                )
                OR P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            );
      `;
      const allSalesForTotalLitres = queryData(dbInstance, allSalesQuery, [currentYear]);
      let totalLitres = 0;
      for (const sale of allSalesForTotalLitres) {
        const volumeMl = extractVolumeMl(sale.ProductName, sale.ProductDescription);
        if (volumeMl > 0) {
          totalLitres += (sale.Quantity * volumeMl) / 1000;
        }
      }


      return {
        customerName,
        year,
        totalLiters,
        dominantBeerCategory,
        top10Products: top5Products, // Changed to top5Products
        totalVisits,
        categoryVolumes: categoryVolumesByGroupId,
        uniqueVarieties2025,
        totalVarietiesInDb,
        mostActiveDay,
        mostActiveMonth,
        dailyVisits,
        monthlyVisits,
        missingVarieties,
        palateCategory,
        litersPercentile,
        visitsPercentile,
        mostPopularCommunityDay,
        mostPopularCommunityMonth,
        dynamicTitle,
        firstBeerDetails,
        mostFrequentBeerName: top5Products.length > 0 ? top5Products[0].name : "tu cerveza favorita", // Changed to top5Products
        varietyExplorationRatio,
        totalCustomers,
        totalLitres,
      };
    } catch (e: any) {
      console.error("Error obteniendo datos Wrapped:", e);
      setError(e.message);
      throw new Error(`Fallo al obtener datos Wrapped: ${e.message}. Verifica el esquema de la base de datos o el ID del cliente.`);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dbLoaded, loading, error, findCustomer, getWrappedData, extractVolumeMl, categorizeBeer, getAllBeerVarietiesInDb };
}