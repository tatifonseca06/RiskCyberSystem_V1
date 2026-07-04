import api from "./api";

const MONTE_CARLO_ENDPOINT = "/montecarlo/";
const ANALISIS_ENDPOINT = "/analisis/";
const ORGANIZACIONES_ENDPOINT = "/organizaciones/";

const extractResults = (data) => {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  if (Array.isArray(data?.results)) {
    return {
      results: data.results,
      count: data.count ?? data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  if (Array.isArray(data?.data)) {
    return {
      results: data.data,
      count: data.count ?? data.data.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  return {
    results: [],
    count: 0,
    next: null,
    previous: null,
  };
};

const numericValue = (...values) => {
  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== ""
  );

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const getObjectId = (value) => {
  if (value && typeof value === "object") {
    return value.id ?? value.pk ?? null;
  }

  return value ?? null;
};

const getObjectName = (
  value,
  fields,
  fallback = "Sin información"
) => {
  if (value && typeof value === "object") {
    for (const field of fields) {
      if (value[field]) {
        return value[field];
      }
    }
  }

  return fallback;
};

const normalizeDistribution = (result) => {
  const possibleDistribution =
    result?.distribucion ??
    result?.histograma ??
    result?.distribution ??
    result?.datos_distribucion ??
    [];

  if (Array.isArray(possibleDistribution)) {
    return possibleDistribution
      .map((item, index) => {
        if (typeof item === "number") {
          return {
            rango: `${index + 1}`,
            frecuencia: item,
          };
        }

        return {
          rango:
            item?.rango ??
            item?.range ??
            item?.intervalo ??
            item?.label ??
            `${index + 1}`,

          frecuencia: numericValue(
            item?.frecuencia,
            item?.frequency,
            item?.cantidad,
            item?.count,
            item?.valor
          ),
        };
      })
      .filter((item) => item.frecuencia >= 0);
  }

  if (
    possibleDistribution &&
    typeof possibleDistribution === "object"
  ) {
    return Object.entries(possibleDistribution).map(
      ([range, frequency]) => ({
        rango: range,
        frecuencia: numericValue(frequency),
      })
    );
  }

  return [];
};

const normalizeMonteCarlo = (result) => {
  const analisis = result?.analisis;
  const organizacion =
    result?.organizacion ??
    analisis?.organizacion;

  const p50 = numericValue(
    result?.p50,
    result?.percentil_50,
    result?.percentile_50,
    result?.mediana
  );

  const p90 = numericValue(
    result?.p90,
    result?.percentil_90,
    result?.percentile_90
  );

  const p95 = numericValue(
    result?.p95,
    result?.percentil_95,
    result?.percentile_95,
    result?.var_95
  );

  const p99 = numericValue(
    result?.p99,
    result?.percentil_99,
    result?.percentile_99
  );

  return {
    ...result,

    id:
      result?.id ??
      result?.montecarlo_id ??
      result?.resultado_id ??
      result?.pk ??
      null,

    analisisId:
      getObjectId(analisis) ??
      result?.analisis_id ??
      null,

    analisisNombre:
      getObjectName(
        analisis,
        ["nombre", "nombre_analisis", "titulo"],
        result?.analisis_nombre ??
          result?.nombre_analisis ??
          "Análisis FAIR"
      ),

    organizacionId:
      getObjectId(organizacion) ??
      result?.organizacion_id ??
      analisis?.organizacion_id ??
      null,

    organizacionNombre:
      getObjectName(
        organizacion,
        ["nombre", "nombre_organizacion"],
        result?.organizacion_nombre ??
          result?.nombre_organizacion ??
          "Sin organización"
      ),

    iteraciones: numericValue(
      result?.iteraciones,
      result?.numero_iteraciones,
      result?.iterations
    ),

    nivelConfianza: numericValue(
      result?.nivel_confianza,
      result?.confianza,
      result?.confidence_level,
      95
    ),

    perdidaMedia: numericValue(
      result?.perdida_media,
      result?.media,
      result?.mean_loss,
      result?.promedio
    ),

    mediana: numericValue(
      result?.mediana,
      result?.median,
      p50
    ),

    desviacionEstandar: numericValue(
      result?.desviacion_estandar,
      result?.standard_deviation,
      result?.std_dev
    ),

    perdidaMinima: numericValue(
      result?.perdida_minima,
      result?.minimo,
      result?.minimum_loss
    ),

    perdidaMaxima: numericValue(
      result?.perdida_maxima,
      result?.maximo,
      result?.maximum_loss
    ),

    p50,
    p90,
    p95,
    p99,

    var: numericValue(
      result?.var,
      result?.value_at_risk,
      result?.var_95,
      p95
    ),

    nivelRiesgo:
      result?.nivel_riesgo ??
      result?.clasificacion_riesgo ??
      result?.risk_level ??
      "",

    distribucion: normalizeDistribution(result),

    fechaEjecucion:
      result?.fecha_ejecucion ??
      result?.fecha_creacion ??
      result?.created_at ??
      result?.executed_at ??
      null,
  };
};

const normalizeAnalisis = (analisis) => ({
  id:
    analisis?.id ??
    analisis?.analisis_id ??
    analisis?.pk,

  nombre:
    analisis?.nombre ??
    analisis?.nombre_analisis ??
    "Análisis FAIR",

  organizacionId:
    getObjectId(analisis?.organizacion) ??
    analisis?.organizacion_id ??
    null,
});

const normalizeOrganizacion = (organizacion) => ({
  id:
    organizacion?.id ??
    organizacion?.organizacion_id ??
    organizacion?.pk,

  nombre:
    organizacion?.nombre ??
    organizacion?.nombre_organizacion ??
    "Organización sin nombre",
});

const getErrorMessage = (error) => {
  if (!error.response) {
    return "No se pudo conectar con el servidor.";
  }

  const data = error.response.data;
  const status = error.response.status;

  if (
    typeof data === "string" &&
    !data.trim().toLowerCase().startsWith("<!doctype html")
  ) {
    return data;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (data && typeof data === "object") {
    const firstField = Object.keys(data)[0];
    const firstError = data[firstField];

    if (Array.isArray(firstError) && firstError.length > 0) {
      return `${firstField}: ${firstError[0]}`;
    }

    if (typeof firstError === "string") {
      return `${firstField}: ${firstError}`;
    }
  }

  if (status === 400) {
    return "La solicitud no contiene datos válidos.";
  }

  if (status === 401) {
    return "La sesión expiró. Inicia sesión nuevamente.";
  }

  if (status === 403) {
    return "No tienes permisos para consultar estos resultados.";
  }

  if (status === 404) {
    return "No se encontró el resultado de Monte Carlo.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const monteCarloService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    analisis = "",
    nivelRiesgo = "",
  } = {}) {
    try {
      const response = await api.get(
        MONTE_CARLO_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            organizacion:
              organizacion || undefined,
            analisis: analisis || undefined,
            nivel_riesgo:
              nivelRiesgo || undefined,
          },
        }
      );

      const extracted = extractResults(
        response.data
      );

      return {
        ...extracted,
        results: extracted.results.map(
          normalizeMonteCarlo
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${MONTE_CARLO_ENDPOINT}${id}/`
      );

      return normalizeMonteCarlo(
        response.data
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${MONTE_CARLO_ENDPOINT}${id}/`
      );

      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getCatalogos() {
    try {
      const [
        analisisResponse,
        organizacionesResponse,
      ] = await Promise.all([
        api.get(ANALISIS_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),

        api.get(ORGANIZACIONES_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),
      ]);

      return {
        analisis: extractResults(
          analisisResponse.data
        ).results.map(normalizeAnalisis),

        organizaciones: extractResults(
          organizacionesResponse.data
        ).results.map(normalizeOrganizacion),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};