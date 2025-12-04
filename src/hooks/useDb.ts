import { useState, useCallback, useEffect } from "react";
import { initDb, loadDb, queryData, type Database, type Statement } from "@/lib/db";
import { createDataUrlFromBinary } from "@/lib/utils";

const EXCLUDED_CUSTOMERS = ["Maria Fernanda Azanza Arias", "Jose Azanza Arias", "Enrique Cobo", "Juan Francisco Perez", "Islas Boutique"];
const EXCLUDED_PRODUCT_KEYWORDS = [
    "Snacks", "Sandwich", "Halls", "Marlboro", "Vozol", "Funda", "Brocheta", 
    "Hamburguesa", "Pin", "Mallorca", "Trident", "Ruffles", "Kit Kat", "Papas Cholitas", 
    "Letrero", "Gorra", "Tapas Mix", "Nachos", "Lanyard"
];

let dbInstance: Database | null = null;

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
// ESTA ES LA LISTA DEFINITIVA DE IDS PROPORCIONADA POR EL USUARIO
const FORCED_INCLUDED_VARIETY_IDS = [
    84, 181, 291, 292, 294, 296, 297, 298, 312, 313, 314, 315, 321, 348, 350, 351, 353, 354, 355, 364, 365, 386, 387, 388, 396, 397, 401, 402, 403, 404, 405, 406, 407, 408, 418, 419, 420, 421, 430, 436, 437, 438, 439, 448, 449, 455, 456, 464, 465, 471, 497, 500, 501, 502, 504, 505, 534, 535, 552, 568, 569, 570, 571, 572, 573, 574, 576, 577, 578, 579, 580, 592, 603, 604, 605, 606, 627, 628, 629, 634, 638, 639, 655, 656, 657, 665, 684, 685, 686, 688, 691, 692, 693, 694, 697, 700, 705, 706, 707, 726, 776, 777, 801, 892, 896, 945, 956, 960
];

// Eliminadas RAW_DEFINITIVE_BEER_NAMES y DEFINITIVE_BEER_VARIETIES_NAMES

// Helper to extract the base beer name by removing volume/format suffix
const getBaseBeerName = (productName: string): string => {
  // Regex to match common volume/format suffixes at the end of the string, preceded by " - "
  const suffixRegex = /\s-\s(\d+\s?m?l|\d+m?l|lata|botella|caña|pinta|litro|x\d+|pack|\d+pk|sin\s?alcohol)$/i;
  
  let baseName = productName.replace(suffixRegex, '').trim();

  // Handle cases like "Mc Chouffe -330ml" where there's no space after the dash
  const noSpaceSuffixRegex = /-\d+m?l$/i;
  baseName = baseName.replace(noSpaceSuffixRegex, '').trim();

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
        await initDb();
        const response = await fetch('/data/bbdd.db');
        if (!response.ok) {
          throw new Error(`Fallo al cargar base de datos: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        dbInstance = loadDb(new Uint8Array(buffer));
        setDbLoaded(true);
        console.log("Base de datos cargada correctamente desde ruta estática.");

        // --- TEMPORARY CONSOLE LOGS FOR DEBUGGING ---
        console.log('BEER GROUPS INCLUIDOS (para categorización):', BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT);
        console.log('PALABRAS CLAVE EXCLUIDAS:', EXCLUDED_PRODUCT_KEYWORDS);
        console.log('PALABRAS CLAVE NO LÍQUIDAS:', NON_LIQUID_KEYWORDS);
        console.log('NOMBRES DE CERVEZAS DEFINITIVAS (por ID):', FORCED_INCLUDED_VARIETY_IDS);
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

    const normalizedSearchTerm = searchTerm.toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
      return results;
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

    // Ahora la consulta se basa directamente en FORCED_INCLUDED_VARIETY_IDS
    const queryForBaseNames = `
      SELECT
          P.Id AS ProductId,
          P.Name AS ProductName,
          P.Description AS ProductDescription,
          P.Image AS ProductImage
      FROM
          Product AS P
      WHERE
          P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          ${buildExclusionClause('P')};
    `;

    const rawProducts = queryData(dbInstance, queryForBaseNames);
    const uniqueBeerVarietiesMap = new Map<number, { name: string; imageUrl: string }>(); // Map ProductId to {name, imageUrl}

    for (const item of rawProducts) {
      // Asegurarse de que cada ID de la lista forzada se cuente como una variedad única
      if (!uniqueBeerVarietiesMap.has(item.ProductId)) {
        uniqueBeerVarietiesMap.set(item.ProductId, {
          name: getBaseBeerName(item.ProductName), // Usar getBaseBeerName para el nombre de visualización
          imageUrl: createDataUrlFromBinary(item.ProductImage)
        });
      }
    }
    return Array.from(uniqueBeerVarietiesMap.values())
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

    // La consulta ahora se basa directamente en FORCED_INCLUDED_VARIETY_IDS
    const globalProductDataQuery = `
        SELECT
            P.Id AS ProductId,
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            SUM(DI.Quantity) AS TotalQuantity
        FROM
            Document AS D
        INNER JOIN
            DocumentItem AS DI ON D.Id = DI.DocumentId
        INNER JOIN
            Product AS P ON DI.ProductId = P.Id
        WHERE
            STRFTIME('%Y', D.Date) = ?
            AND P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            ${buildExclusionClause('P')}
        GROUP BY
            P.Id, P.Name, P.Description
        HAVING
            TotalQuantity > 0;
    `;

    const rawGlobalProductData = queryData(dbInstance, globalProductDataQuery, [year]);

    const globalBeerDistribution = new Map<string, number>(); // base beer name -> total liters
    let totalGlobalLiters = 0;

    for (const item of rawGlobalProductData) {
        const baseBeerName = getBaseBeerName(item.ProductName);
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        const liters = (item.TotalQuantity * volumeMl) / 1000;

        if (liters > 0) {
            totalGlobalLiters += liters;
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

    // La consulta ahora se basa directamente en FORCED_INCLUDED_VARIETY_IDS
    const query = `
      SELECT
          D.CustomerId,
          P.Id AS ProductId,
          P.Name AS ProductName,
          P.Description AS ProductDescription,
          DI.Quantity
      FROM
          Document AS D
      INNER JOIN
          DocumentItem AS DI ON D.Id = DI.DocumentId
      INNER JOIN
          Product AS P ON DI.ProductId = P.Id
      WHERE
          STRFTIME('%Y', D.Date) = ?
          AND P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          ${buildExclusionClause('P')};
    `;
    const rawResults = queryData(dbInstance, query, [year]);

    const customerLitersMap = new Map<number, number>();

    for (const row of rawResults) {
        const volumeMl = extractVolumeMl(row.ProductName, row.ProductDescription);
        const liters = (row.Quantity * volumeMl) / 1000;
        if (liters > 0) {
            customerLitersMap.set(row.CustomerId, (customerLitersMap.get(row.CustomerId) || 0) + liters);
        }
    }
    return Array.from(customerLitersMap.values());
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

    // La consulta ahora se basa directamente en FORCED_INCLUDED_VARIETY_IDS
    const query = `
      SELECT
          P.Id AS ProductId,
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
          AND P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
          ${buildExclusionClause('P')}
      ORDER BY
          D.Date ASC
      LIMIT 1;
    `;
    const result = queryData(dbInstance, query, [customerId, year]);

    if (result.length > 0) {
        const item = result[0];
        return {
            name: getBaseBeerName(item.ProductName),
            date: item.DocumentDate,
            quantity: item.Quantity,
            imageUrl: createDataUrlFromBinary(item.ProductImage),
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
      const buildExclusionClause = (tableAlias: string) => {
        if (EXCLUDED_PRODUCT_KEYWORDS.length === 0) {
          return "";
        }
        const keywordsSql = EXCLUDED_PRODUCT_KEYWORDS.map(k => `'${k}'`).join(',');
        return `AND ${tableAlias}.Name NOT IN (${keywordsSql})`;
      };

      const customerNameQuery = `SELECT Name FROM Customer WHERE Id = ? LIMIT 1;`;
      const customerNameResult = queryData(dbInstance, customerNameQuery, [customerId]);
      const customerName = customerNameResult.length > 0 ? customerNameResult[0].Name : "Cliente Desconocido";

      const currentYear = year;

      // La consulta ahora se basa directamente en FORCED_INCLUDED_VARIETY_IDS
      const productDataQuery = `
        SELECT
            P.Id AS ProductId,
            P.Name AS ProductName,
            P.Description AS ProductDescription,
            P.ProductGroupId AS ProductGroupId,
            SUM(DI.Quantity) AS TotalQuantity,
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
            AND P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            ${buildExclusionClause('P')}
        GROUP BY
            P.Id, P.Name, P.Description, P.ProductGroupId, P.Image
        HAVING
            TotalQuantity > 0;
      `;

      const rawProductDataCurrentYear = queryData(dbInstance, productDataQuery, [customerId, currentYear]);

      let totalLiters = 0;
      const categoryVolumesByGroupId: { [key: number]: number } = {};
      const productLiters: { name: string; liters: number; color: string; imageUrl: string }[] = [];
      const customerUniqueBeerIds = new Set<number>(); // Usar Set de IDs para variedades únicas

      const { globalBeerDistribution, totalGlobalLiters } = await getGlobalBeerDistribution(currentYear);

      const customerBeerLitersMap = new Map<string, number>();
      let customerTotalBeerLitersForPalate = 0;

      const customerProductLitersForConcentration: { name: string; liters: number }[] = [];


      for (const item of rawProductDataCurrentYear) {
        const baseBeerName = getBaseBeerName(item.ProductName);
        const volumeMl = extractVolumeMl(item.ProductName, item.ProductDescription);
        const liters = (item.TotalQuantity * volumeMl) / 1000;
        
        if (liters > 0) {
          totalLiters += liters;

          if (BEER_PRODUCT_GROUP_IDS_FOR_VARIETIES_AND_DOMINANT.includes(item.ProductGroupId) || FORCED_INCLUDED_VARIETY_IDS.includes(item.ProductId)) {
            categoryVolumesByGroupId[item.ProductGroupId] = (categoryVolumesByGroupId[item.ProductGroupId] || 0) + liters;
          }

          customerUniqueBeerIds.add(item.ProductId); // Añadir el ID del producto
          
          customerBeerLitersMap.set(baseBeerName, (customerBeerLitersMap.get(baseBeerName) || 0) + liters);
          customerTotalBeerLitersForPalate += liters;
          customerProductLitersForConcentration.push({ name: baseBeerName, liters: liters });
          
          const category = categorizeBeer(item.ProductName);
          productLiters.push({
            name: baseBeerName,
            liters: liters,
            color: BEER_CATEGORY_COLORS[category] || BEER_CATEGORY_COLORS["Other"],
            imageUrl: createDataUrlFromBinary(item.ProductImage),
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

      const top5Products = productLiters
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 5);
      
      const mostFrequentBeerName = top5Products.length > 0 ? top5Products[0].name : "tu cerveza favorita";

      const totalVisitsQuery = `
        SELECT COUNT(DISTINCT T1.Date) AS TotalVisits
        FROM Document AS T1
        WHERE T1.CustomerId = ? AND STRFTIME('%Y', T1.Date) = ?;
      `;
      const totalVisitsResult = queryData(dbInstance, totalVisitsQuery, [customerId, currentYear]);
      const totalVisits = totalVisitsResult.length > 0 ? totalVisitsResult[0].TotalVisits : 0;

      const uniqueVarieties2025 = customerUniqueBeerIds.size; // Usar el tamaño del Set de IDs
      
      const allDbUniqueBeerObjects = await getAllBeerVarietiesInDb();
      const totalVarietiesInDb = allDbUniqueBeerObjects.length; // Esto debería ser 108 ahora

      const missingVarieties = allDbUniqueBeerObjects.filter(
        (dbBeer) => !Array.from(customerUniqueBeerIds).includes(dbBeer.id) // Filtrar por ID
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
            P.Id AS ProductId,
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
            AND P.Id IN (${FORCED_INCLUDED_VARIETY_IDS.join(',')})
            ${buildExclusionClause('P')};
      `;
      const allSalesForTotalLitresRaw = queryData(dbInstance, allSalesQuery, [currentYear]);
      let totalLitres = 0;
      for (const sale of allSalesForTotalLitresRaw) {
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
        top10Products: top5Products,
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
        mostFrequentBeerName: top5Products.length > 0 ? top5Products[0].name : "tu cerveza favorita",
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