import api from "./api";

const ANALISIS_ENDPOINT = "/analisis/";
const ORGANIZACIONES_ENDPOINT = "/organizaciones/";
const ESCENARIOS_ENDPOINT = "/escenarios/";

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

const getObjectId = (value) => {
  if (value && typeof value === "object") {
    return value.id ?? value.pk ?? null;
  }

  return value ?? null;
};

const getObjectName = (
  value,
  possibleFields,
  fallback = "Sin información"
) => {
  if (value && typeof value === "object") {
    for (const field of possibleFields) {
      if (value[field]) {
        return value[field];
      }
    }
  }

  return fallback;
};

const numericValue = (...values) => {
  const validValue = values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  const number = Number(validValue);

  return Number.isFinite(number) ? number : 0;
};

const normalizeAnalisis = (analisis) => {
  const organizacion = analisis?.organizacion;
  const escenario = analisis?.escenario;

  const lefMin = numericValue(
    analisis?.lef_min,
    analisis?.frecuencia_min,
    analisis?.frecuencia_minima
  );

  const lefMode = numericValue(
    analisis?.lef_mode,
    analisis?.lef_moda,
    analisis?.frecuencia_probable,
    analisis?.frecuencia_mas_probable
  );

  const lefMax = numericValue(
    analisis?.lef_max,
    analisis?.frecuencia_max,
    analisis?.frecuencia_maxima
  );

  const lmMin = numericValue(
    analisis?.lm_min,
    analisis?.perdida_min,
    analisis?.magnitud_minima
  );

  const lmMode = numericValue(
    analisis?.lm_mode,
    analisis?.lm_moda,
    analisis?.perdida_probable,
    analisis?.magnitud_mas_probable
  );

  const lmMax = numericValue(
    analisis?.lm_max,
    analisis?.perdida_max,
    analisis?.magnitud_maxima
  );

  const lefExpected = numericValue(
    analisis?.lef_esperada,
    analisis?.frecuencia_esperada,
    (lefMin + lefMode + lefMax) / 3
  );

  const lmExpected = numericValue(
    analisis?.lm_esperada,
    analisis?.magnitud_esperada,
    analisis?.perdida_esperada_evento,
    (lmMin + lmMode + lmMax) / 3
  );

  const annualLoss = numericValue(
    analisis?.perdida_anual_esperada,
    analisis?.ale,
    analisis?.riesgo_anual,
    lefExpected * lmExpected
  );

  return {
    ...analisis,

    id:
      analisis?.id ??
      analisis?.analisis_id ??
      analisis?.pk ??
      null,

    nombre:
      analisis?.nombre ??
      analisis?.nombre_analisis ??
      analisis?.titulo ??
      "Análisis FAIR",

    descripcion:
      analisis?.descripcion ??
      analisis?.observaciones ??
      "",

    organizacionId:
      getObjectId(organizacion) ??
      analisis?.organizacion_id ??
      null,

    organizacionNombre:
      getObjectName(
        organizacion,
        ["nombre", "nombre_organizacion"],
        analisis?.organizacion_nombre ??
          analisis?.nombre_organizacion ??
          "Sin organización"
      ),

    escenarioId:
      getObjectId(escenario) ??
      analisis?.escenario_id ??
      null,

    escenarioNombre:
      getObjectName(
        escenario,
        ["nombre", "nombre_escenario"],
        analisis?.escenario_nombre ??
          analisis?.nombre_escenario ??
          "Sin escenario"
      ),

    lefMin,
    lefMode,
    lefMax,
    lefExpected,

    lmMin,
    lmMode,
    lmMax,
    lmExpected,

    perdidaAnualEsperada: annualLoss,

    nivelRiesgo:
      analisis?.nivel_riesgo ??
      analisis?.clasificacion_riesgo ??
      analisis?.risk_level ??
      "",

    estado:
      analisis?.estado ??
      analisis?.status ??
      "Borrador",

    iteraciones: numericValue(
      analisis?.iteraciones,
      analisis?.numero_iteraciones,
      10000
    ),

    confianza: numericValue(
      analisis?.nivel_confianza,
      analisis?.confianza,
      95
    ),

    fechaCreacion:
      analisis?.fecha_creacion ??
      analisis?.created_at ??
      null,

    fechaActualizacion:
      analisis?.fecha_actualizacion ??
      analisis?.updated_at ??
      null,

    monteCarloEjecutado: Boolean(
      analisis?.montecarlo_ejecutado ??
        analisis?.monte_carlo_ejecutado ??
        analisis?.tiene_simulacion ??
        false
    ),
  };
};

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

const normalizeEscenario = (escenario) => ({
  id:
    escenario?.id ??
    escenario?.escenario_id ??
    escenario?.pk,

  nombre:
    escenario?.nombre ??
    escenario?.nombre_escenario ??
    "Escenario sin nombre",

  organizacionId:
    getObjectId(escenario?.organizacion) ??
    escenario?.organizacion_id ??
    null,

  nivelRiesgo:
    escenario?.nivel_riesgo ??
    escenario?.clasificacion_riesgo ??
    "",
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
    return "Los datos enviados no son válidos.";
  }

  if (status === 401) {
    return "La sesión expiró. Inicia sesión nuevamente.";
  }

  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (status === 404) {
    return "No se encontró el análisis solicitado.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const analisisService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    escenario = "",
    nivelRiesgo = "",
    estado = "",
  } = {}) {
    try {
      const response = await api.get(
        ANALISIS_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            organizacion:
              organizacion || undefined,
            escenario: escenario || undefined,
            nivel_riesgo:
              nivelRiesgo || undefined,
            estado: estado || undefined,
          },
        }
      );

      const extracted = extractResults(
        response.data
      );

      return {
        ...extracted,
        results: extracted.results.map(
          normalizeAnalisis
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${ANALISIS_ENDPOINT}${id}/`
      );

      return normalizeAnalisis(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        ANALISIS_ENDPOINT,
        data
      );

      return normalizeAnalisis(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${ANALISIS_ENDPOINT}${id}/`,
        data
      );

      return normalizeAnalisis(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${ANALISIS_ENDPOINT}${id}/`
      );

      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async ejecutarMonteCarlo(
    id,
    {
      iteraciones = 10000,
      nivelConfianza = 95,
    } = {}
  ) {
    try {
      const response = await api.post(
        `${ANALISIS_ENDPOINT}${id}/ejecutar-montecarlo/`,
        {
          iteraciones: Number(iteraciones),
          nivel_confianza: Number(
            nivelConfianza
          ),
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getCatalogos() {
    try {
      const [
        organizacionesResponse,
        escenariosResponse,
      ] = await Promise.all([
        api.get(ORGANIZACIONES_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),

        api.get(ESCENARIOS_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),
      ]);

      return {
        organizaciones: extractResults(
          organizacionesResponse.data
        ).results.map(normalizeOrganizacion),

        escenarios: extractResults(
          escenariosResponse.data
        ).results.map(normalizeEscenario),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};