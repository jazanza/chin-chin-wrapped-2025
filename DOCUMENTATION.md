# Documentación Técnica: Chin Chin Wrapped 2025/2026

Este documento proporciona una guía técnica completa para el proyecto "Chin Chin Wrapped", con el objetivo de estandarizar el conocimiento del código base, facilitar la integración de nuevos desarrolladores y, crucialmente, evitar regresiones técnicas durante el próximo ciclo de actualización (Wrapped 2026).

---

## 1. Arquitectura General y Flujo de Datos (Overview)

### Diagrama de Flujo de la Aplicación

La aplicación "Chin Chin Wrapped" sigue un flujo lineal y controlado, diseñado para presentar una narrativa de datos personalizada al usuario.

1.  **`src/pages/ClientLogin.tsx` (Login)**:
    *   Punto de entrada de la aplicación (`/`).
    *   El usuario introduce un término de búsqueda (nombre, apellido, cédula).
    *   `useDb().findCustomer()` busca coincidencias en la base de datos.
    *   Si hay múltiples coincidencias, se presenta una lista para selección.
    *   Una vez seleccionado el cliente (o si hubo una coincidencia exacta), se genera una pregunta de "Conocimiento Basado en Autenticación" (KBA) utilizando datos del cliente (teléfono, email, RUC).
    *   Tras una respuesta KBA correcta, la aplicación navega a la ruta `/wrapped/:customerId`.

2.  **`src/pages/WrappedDashboard.tsx` (Historias del Wrapped)**:
    *   Componente principal que orquesta la presentación de las "historias" del Wrapped.
    *   Recibe el `customerId` de los parámetros de la URL.
    *   `useDb().getWrappedData()` se encarga de cargar y procesar todos los datos relevantes para el cliente y el año especificado.
    *   Un array `STORY_SCENES` define el orden, duración y componente de cada historia.
    *   La navegación entre historias es automática (basada en `storyDuration`) o manual (mediante `StoryInteractionZone`).
    *   Cada historia (`IntroFunStory`, `TotalVisitsStory`, etc.) es un componente React que recibe los datos procesados y los renderiza.
    *   `StoryProgressBar` y `WrappedOverlay` proporcionan elementos de UI persistentes a través de las historias.
    *   `BubbleBackground` proporciona un efecto visual de fondo dinámico.

3.  **`src/components/StoryInteractionZone.tsx` (Interacción)**:
    *   Capa transparente que cubre la pantalla para detectar interacciones del usuario (taps/clics).
    *   Gestiona la pausa/reanudación de la historia y la navegación entre historias (`onNext`, `onPrev`).

4.  **`src/pages/NotFound.tsx`**:
    *   Ruta de fallback (`*`) para URLs no reconocidas.

### Capas de la Aplicación

El proyecto sigue una arquitectura de capas clara para separar responsabilidades:

*   **UI/Presentación (`src/components/`, `src/pages/`)**:
    *   **Componentes de React**: Encargados de la renderización visual y la interacción directa con el usuario. Utilizan `shadcn/ui` y `Tailwind CSS` para el estilo. Ejemplos: `Button`, `Input`, `RadioGroup`, y todos los componentes dentro de `src/components/stories/`.
    *   **Tailwind CSS**: Utilizado para todo el estilado, con una paleta de colores brutalista (blanco y negro) definida en `src/globals.css` y `tailwind.config.ts`.

*   **Lógica de Negocio (`src/hooks/`, `src/lib/utils.ts`, `src/lib/dates.ts`)**:
    *   **Hooks Personalizados (`src/hooks/`)**: Contienen la lógica específica de la aplicación que no es de UI ni de acceso a datos.
        *   `useDb.ts`: Aunque interactúa con la base de datos, también contiene lógica de negocio crucial como `extractVolumeMl`, `categorizeBeer`, `getBaseBeerName`, y `calculatePercentile`.
        *   `useIsMobile.tsx`: Lógica para detectar el tamaño de la pantalla.
    *   **Utilidades (`src/lib/`)**: Funciones auxiliares generales.
        *   `utils.ts`: Contiene `cn` para la fusión de clases de Tailwind.
        *   `dates.ts`: Funciones para el cálculo de rangos de fechas.

*   **Acceso a Datos (`src/lib/db.ts`, `src/hooks/useDb.ts`)**:
    *   **`src/lib/db.ts`**: Abstracción de bajo nivel para la interacción con `sql.js`. Proporciona funciones para inicializar la DB, cargarla desde un buffer y ejecutar consultas (`queryData`).
    *   **`src/hooks/useDb.ts`**: Hook principal para la gestión de la base de datos. Encapsula la inicialización, carga y todas las consultas específicas de la aplicación. También contiene la lógica de pre-procesamiento de datos (ej. exclusión de clientes/productos, cálculo de volúmenes).

### Estado Global

El estado de la aplicación se gestiona principalmente a través de:

*   **Estado Local de React (`useState`)**: Utilizado en componentes para gestionar su propio estado (ej. `searchTerm` en `ClientLogin`, `currentStoryIndex` en `WrappedDashboard`).
*   **React Query (`@tanstack/react-query`)**: Utilizado para la gestión del estado asíncrono de los datos (`wrappedData` en `WrappedDashboard`). Proporciona caching, reintentos y sincronización de datos.
*   **React Router (`react-router-dom`)**: Gestiona el estado de la navegación y los parámetros de la URL (`useParams`).

---

## 2. Documentación del Acceso a Datos (`useDb.ts`)

El hook `useDb.ts` es el corazón de la lógica de datos del Wrapped.

### Función `getWrappedData(customerId: number, year: string)`

Esta función es la más crítica, ya que orquesta la recopilación y procesamiento de todos los datos necesarios para las historias del Wrapped de un cliente específico para un año dado.

*   **Entradas**:
    *   `customerId` (number): El ID único del cliente para el cual se generará el Wrapped.
    *   `year` (string): El año para el cual se deben obtener los datos (ej. '2025').

*   **Salidas Esperadas**: Un objeto `wrappedData` con la siguiente estructura (ejemplo de campos clave):
    ```typescript
    {
      customerName: string;
      year: string;
      totalLiters: number; // Litros totales consumidos por el cliente
      dominantBeerCategory: string; // Categoría de cerveza más consumida
      top10Products: { name: string; liters: number; color: string }[]; // Top 10 productos
      totalVisits: number; // Número total de visitas
      uniqueVarieties2025: number; // Variedades únicas probadas por el cliente
      totalVarietiesInDb: number; // Total de variedades únicas en la DB
      mostActiveDay: string; // Día de la semana con más visitas
      mostActiveMonth: string; // Mes con más visitas
      dailyVisits: { day: string; count: number }[]; // Visitas por día de la semana
      monthlyVisits: { month: string; count: number }[]; // Visitas por mes
      missingVarieties: string[]; // Variedades que el cliente no ha probado
      palateCategory: { concentration: 'Fiel' | 'Explorador'; rarity: 'Nicho' | 'Popular' }; // Categorización del paladar
      dynamicTitle: string; // Título dinámico basado en el paladar
      firstBeerDetails: { name: string; date: string; quantity: number } | null; // Detalles de la primera cerveza del año
      litersPercentile: number; // Percentil de consumo de litros del cliente
      visitsPercentile: number; // Percentil de visitas del cliente
      mostPopularCommunityDay: string; // Día más popular de la comunidad
      mostPopularCommunityMonth: string; // Mes más popular de la comunidad
      mostFrequentBeerName: string; // Nombre de la cerveza más frecuente
      varietyExplorationRatio: number; // Ratio de exploración de variedades
      totalCustomers: number; // Total de clientes en la comunidad (para el año)
      totalLitres: number; // Total de litros consumidos por la comunidad (para el año)
    }
    ```

### Lógica de Agregación: `extractVolumeMl`

La función `extractVolumeMl(name: string, description: string | null)` es fundamental para calcular el volumen de líquido de cada producto.

*   **Responsabilidad**: Extraer el volumen en mililitros de una cadena de texto (nombre o descripción del producto).
*   **Consistencia Crítica**: Es **IMPERATIVO** que esta lógica sea idéntica y centralizada. Cualquier cambio en cómo se extrae el volumen debe aplicarse universalmente. Esto asegura que las métricas de `totalLiters` (cliente) y `totalLitres` (global/comunidad) sean calculadas de la misma manera, evitando inconsistencias y regresiones.
*   **Exclusiones**: Contiene lógica para excluir productos no líquidos o por palabras clave (`NON_LIQUID_KEYWORDS`, `EXCLUDED_PRODUCT_KEYWORDS`).

### Consultas Críticas (SQL/BD)

Las siguientes consultas son ejemplos de las operaciones más importantes y potencialmente complejas dentro de `useDb.ts`:

1.  **`productDataQuery` (para `getWrappedData`)**:
    ```sql
    SELECT P.Name AS ProductName, P.Description AS ProductDescription, P.ProductGroupId AS ProductGroupId, SUM(DI.Quantity) AS TotalQuantity, P.Id AS ProductId
    FROM Document AS D
    INNER JOIN DocumentItem AS DI ON D.Id = DI.DocumentId
    INNER JOIN Product AS P ON DI.ProductId = P.Id
    WHERE D.CustomerId = ? AND STRFTIME('%Y', D.Date) = ?
    AND ( (P.IsEnabled = TRUE AND P.ProductGroupId IN (...)) OR P.Id IN (...) )
    GROUP BY P.Id, P.Name, P.Description, P.ProductGroupId
    HAVING TotalQuantity > 0;
    ```
    *   **Explicación**: Esta consulta es crítica porque une `Documentos`, `Items de Documento` y `Productos` para obtener el consumo detallado de un cliente en un año específico. Incluye filtros complejos para `ProductGroupId` y `ProductId` (forzados) y exclusiones por palabras clave, asegurando que solo se consideren las cervezas relevantes. Es la base para `totalLiters`, `top10Products`, `dominantBeerCategory`, `uniqueVarieties`, etc.

2.  **`getAllCustomerLiters` (para percentiles)**:
    ```sql
    SELECT D.CustomerId, SUM(DI.Quantity * (CASE ... END) / 1000.0) AS TotalLiters
    FROM Document AS D
    INNER JOIN DocumentItem AS DI ON D.Id = DI.DocumentId
    INNER JOIN Product AS P ON DI.ProductId = P.Id
    WHERE STRFTIME('%Y', D.Date) = ?
    AND ( (P.IsEnabled = TRUE AND P.ProductGroupId IN (...)) OR P.Id IN (...) )
    GROUP BY D.CustomerId
    HAVING TotalLiters > 0;
    ```
    *   **Explicación**: Esta consulta agrega el consumo total de litros para *todos* los clientes en un año. Es crucial para calcular los percentiles de consumo del cliente en comparación con la comunidad. La lógica `CASE` para extraer el volumen debe ser consistente con `extractVolumeMl`.

3.  **`getAllBeerVarietiesInDb`**:
    ```sql
    SELECT P.Name AS ProductName, P.Description AS ProductDescription, P.ProductGroupId AS ProductGroupId
    FROM Product AS P
    WHERE ( (P.IsEnabled = TRUE AND P.ProductGroupId IN (...)) OR P.Id IN (...) )
    AND P.Name NOT IN (...);
    ```
    *   **Explicación**: Obtiene todas las variedades de cerveza únicas disponibles en la base de datos, aplicando los mismos filtros de `ProductGroupId`, `ProductId` forzados y exclusiones. Es vital para calcular el `totalVarietiesInDb` y las `missingVarieties`. La función `getBaseBeerName` se aplica a los resultados para normalizar los nombres.

4.  **`getCommunityDailyVisits` / `getCommunityMonthlyVisits`**:
    ```sql
    SELECT STRFTIME('%w', Date) AS DayOfWeek, COUNT(DISTINCT Date) AS DayCount
    FROM Document
    WHERE STRFTIME('%Y', Date) = ?
    GROUP BY DayOfWeek
    ORDER BY DayOfWeek ASC;
    ```
    *   **Explicación**: Estas consultas (una para días, otra para meses) son importantes para entender los patrones de visita de la comunidad. Se utilizan para determinar el `mostPopularCommunityDay` y `mostPopularCommunityMonth`, permitiendo comparaciones con los patrones individuales del cliente.

---

## 3. Guía de Actualización y Mantenimiento (Anti-Regresión)

Esta sección es fundamental para el ciclo de actualización del Wrapped 2026, minimizando el riesgo de regresiones.

### Checklist de Regresión (Sanity Check Rápido)

Antes de desplegar el Wrapped 2026, verifica las siguientes métricas con un cliente de prueba conocido y un cliente nuevo/con pocos datos:

1.  **`totalLiters` (Cliente)**:
    *   **Rango Esperado**: > 0 para clientes activos.
    *   **Anomalía**: 0 para un cliente activo, o valores negativos/excesivamente altos.
    *   **Verificar**: Lógica `extractVolumeMl`, `productDataQuery` en `useDb.ts`.

2.  **`totalVisits` (Cliente)**:
    *   **Rango Esperado**: > 0 para clientes activos.
    *   **Anomalía**: 0 para un cliente activo, o valores negativos.
    *   **Verificar**: `totalVisitsQuery` en `useDb.ts`.

3.  **`uniqueVarieties2025` (Cliente)**:
    *   **Rango Esperado**: Entre 0 y `totalVarietiesInDb`.
    *   **Anomalía**: Mayor que `totalVarietiesInDb`, o valores inesperadamente bajos para un "explorador".
    *   **Verificar**: Lógica de `customerUniqueBeerNamesSet` y `getBaseBeerName` en `getWrappedData`.

4.  **`totalVarietiesInDb` (Global)**:
    *   **Rango Esperado**: > 0 (debe ser un número consistente de variedades de cerveza).
    *   **Anomalía**: 0 o un número muy bajo/alto que no refleje el inventario real.
    *   **Verificar**: `getAllBeerVarietiesInDb` y sus filtros.

5.  **`litersPercentile` y `visitsPercentile`**:
    *   **Rango Esperado**: Entre 0 y 100.
    *   **Anomalía**: Valores fuera de rango, o percentiles muy bajos para clientes con alto consumo/visitas.
    *   **Verificar**: `getAllCustomerLiters`, `getAllCustomerVisits` y la función `calculatePercentile`.

6.  **`dynamicTitle` (Cliente)**:
    *   **Rango Esperado**: Uno de los títulos definidos (ej. "El Monje Cervecero", "El Catador Global", "Curioso del Lúpulo").
    *   **Anomalía**: Título por defecto o un título que no concuerda con el perfil de consumo del cliente.
    *   **Verificar**: Lógica de `palateCategory` y `dynamicTitle` en `getWrappedData`, incluyendo la anulación por `varietyExplorationRatio`.

7.  **`totalLitres` (Global)**:
    *   **Rango Esperado**: > 0 (debe ser un número grande que represente el consumo total de la comunidad).
    *   **Anomalía**: 0 o un valor muy bajo.
    *   **Verificar**: `allSalesQuery` y la agregación de volumen en `getWrappedData`.

### Procedimiento de Pruebas Unitarias

Se recomienda encarecidamente cubrir con pruebas unitarias las siguientes funciones y lógicas, ya que son críticas para la precisión de los datos:

*   **`extractVolumeMl` (en `useDb.ts`)**:
    *   **Casos de Prueba**: Nombres de productos con "ml", "pinta", "caña", "botella", "lata". Nombres sin volumen. Nombres con exclusiones (`NON_LIQUID_KEYWORDS`, `EXCLUDED_PRODUCT_KEYWORDS`).
*   **`getBaseBeerName` (en `useDb.ts`)**:
    *   **Casos de Prueba**: Nombres con sufijos de volumen ("- 330ml"), con sufijos de formato ("- lata"), sin sufijos.
*   **`categorizeBeer` (en `useDb.ts`)**:
    *   **Casos de Prueba**: Nombres de cervezas de diferentes categorías (IPA, Lager, Stout, etc.), nombres "Other".
*   **`calculatePercentile` (en `useDb.ts`)**:
    *   **Casos de Prueba**: Conjuntos de datos vacíos, conjuntos de datos con un solo elemento, conjuntos de datos con valores duplicados, cálculo de percentiles en diferentes posiciones (0, 50, 99, 100).
*   **`getBeerLevel` (en `src/components/stories/SummaryInfographic.tsx`)**:
    *   **Casos de Prueba**: Diferentes conteos de `uniqueVarietiesCount` para verificar los umbrales de "NOVATO", "EXPLORADOR", "MAESTRO", "LEYENDA".
*   **`getVarietyComment` (en `src/components/stories/DominantCategoryAndVarietiesStory.tsx`)**:
    *   **Casos de Prueba**: Diferentes ratios de `uniqueCount` vs `totalCount` para verificar los comentarios dinámicos.
*   **`CommunityVisitsComparisonText` (en `src/components/stories/TotalVisitsStory.tsx`)**:
    *   **Casos de Prueba**: Diferentes valores de `totalVisits` (especialmente en los umbrales definidos: 5, 15, 30, 50, 75, 91, 100+) y `visitsPercentile` para asegurar que los mensajes sean correctos y distintivos.

### Parámetros de Configuración (Actualización 2026)

Para actualizar el Wrapped de 2025 a 2026, se deben modificar los siguientes parámetros:

1.  **Año en `useDb.ts`**:
    *   En la función `getWrappedData`, la llamada a `getWrappedData(Number(customerId), '2025')` en `src/pages/WrappedDashboard.tsx` debe actualizarse a `'2026'`.
    *   Todas las consultas SQL que utilizan `STRFTIME('%Y', D.Date) = ?` y reciben el parámetro `year` ya están parametrizadas. Asegúrate de que el `year` pasado a `getWrappedData` sea el correcto.

2.  **Textos en Componentes de Historia**:
    *   Revisa los componentes de historia en `src/components/stories/` para cualquier referencia literal al año "2025" y actualízala a "2026".
        *   `IntroFunStory.tsx`: `CHIN CHIN WRAPPED 2025` y `2026`.
        *   `OutroStory.tsx`: `2025` y `2026`.
        *   `SummaryInfographic.tsx`: `CHIN CHIN WRAPPED 2025`.
        *   `WrappedOverlay` (inline en `WrappedDashboard.tsx`): `2025 WRAPPED`.

3.  **`STORY_SCENES` en `WrappedDashboard.tsx`**:
    *   Si se añaden, eliminan o reordenan historias, el array `STORY_SCENES` debe ser actualizado.
    *   Asegúrate de que `BACKGROUND_COLORS`, `TEXT_COLORS` y `HIGHLIGHT_COLORS` se correspondan con el nuevo orden y número de historias.

---

## 4. Componentes de Presentación y Estilo

### Convención Tipográfica (Brutalismo Monocromático)

La aplicación utiliza una jerarquía tipográfica clara, definida con clases de Tailwind CSS, para mantener la estética brutalista y monocromática.

*   **H1 (Títulos Principales)**:
    *   **Clase**: `text-5xl md:text-6xl font-black`
    *   **Uso**: Títulos más grandes y prominentes, a menudo para el dato central de una historia (ej. número de visitas, nombre de cerveza favorita).
*   **H2 (Subtítulos / Títulos de Sección)**:
    *   **Clase**: `text-3xl md:text-4xl font-black`
    *   **Uso**: Títulos de sección, preguntas principales o frases impactantes.
*   **H3 (Títulos Secundarios / Destacados)**:
    *   **Clase**: `text-lg md:text-xl font-bold`
    *   **Uso**: Títulos dentro de bloques de información, preguntas KBA, o frases de introducción/cierre.
*   **Cuerpo / Detalles**:
    *   **Clase**: `text-sm md:text-base font-bold` o `text-xs md:text-sm font-bold`
    *   **Uso**: Texto explicativo, listas de ítems, detalles de percentiles, o información secundaria.
*   **Fuente**: `font-sans` (configurada en `tailwind.config.ts` para priorizar "Zalando", "Oswald", "sans-serif").

### Manejo de Toasts (Notificaciones)

*   **Funcionalidad**: Las funciones `showSuccess`, `showError`, `showLoading`, `dismissToast` (definidas en `src/utils/toast.ts` y que utilizan la librería `sonner`) permanecen en el código y pueden ser llamadas desde cualquier parte de la aplicación.
*   **Estado Actual (Producción/Historias)**: El componente `<Toaster />` (de `sonner`) ha sido **eliminado o comentado** en `src/App.tsx`. Esto significa que, aunque las llamadas a `showSuccess`/`showError` se ejecuten, **no se renderizarán visualmente** las notificaciones en la interfaz de usuario durante la experiencia del Wrapped o en producción.
*   **Propósito**: Esta configuración permite mantener la lógica de notificación en el código base para depuración o uso futuro, mientras se asegura que no interrumpan la experiencia inmersiva y visualmente limpia de las historias del Wrapped. Si se desea reactivar las notificaciones visuales, simplemente se debe descomentar o reintroducir el componente `<Toaster />` en `src/App.tsx`.

---