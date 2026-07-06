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

// Backend model: AnalisisRiesgo
// Fields: id, escenario (int OneToOne FK), escenario_codigo (read_only),
//         probabilidad (int 1-5), impacto (int 1-5),
//         lef_min, lef_probable, lef_max (decimal),
//         plm_min, plm_probable, plm_max (decimal),
//         slm_min, slm_probable, slm_max (decimal),
//         notas, fecha_analisis, fecha_actualizacion
const normalizeAnalisis = (analisis) => {
  const escenario = analisis?.escenario;

  const probabilidad = numericValue(analisis?.probabilidad);
  const impacto = numericValue(analisis?.impacto);
  const riesgoSimple = probabilidad * impacto;

  const lefMin = numericValue(analisis?.lef_min);
  const lefProbable = numericValue(analisis?.lef_probable);
  const lefMax = numericValue(analisis?.lef_max);

  const plmMin = numericValue(analisis?.plm_min);
  const plmProbable = numericValue(analisis?.plm_probable);
  const plmMax = numericValue(analisis?.plm_max);

  const slmMin = numericValue(analisis?.slm_min);
  const slmProbable = numericValue(analisis?.slm_probable);
  const slmMax = numericValue(analisis?.slm_max);

  // ALE = LEF_probable × (PLM_probable + SLM_probable)
  const aleEstimado = lefProbable * (plmProbable + slmProbable);

  const niveles = ["MUY_BAJO", "BAJO", "MEDIO", "ALTO", "MUY_ALTO"];
  const getNivelSimple = (r) => {
    if (r >= 20) return "MUY_ALTO";
    if (r >= 12) return "ALTO";
    if (r >= 6) return "MEDIO";
    if (r >= 3) return "BAJO";
    return "MUY_BAJO";
  };

  return {
    ...analisis,

    id: analisis?.id ?? analisis?.pk ?? null,

    escenarioId:
      typeof escenario === "object"
        ? escenario?.id ?? null
        : escenario ?? null,

    escenarioCodigo: analisis?.escenario_codigo ?? "Sin código",

    // alias for table display
    nombre: analisis?.escenario_codigo ?? `Análisis #${analisis?.id ?? ""}`,
    escenarioNombre: analisis?.escenario_codigo ?? "Sin escenario",
    organizacionNombre: "—",

    probabilidad,
    impacto,
    riesgoSimple,
    nivelRiesgoSimple: getNivelSimple(riesgoSimple),

    lef_min: lefMin,
    lef_probable: lefProbable,
    lef_max: lefMax,

    plm_min: plmMin,
    plm_probable: plmProbable,
    plm_max: plmMax,

    slm_min: slmMin,
    slm_probable: slmProbable,
    slm_max: slmMax,

    aleEstimado,

    // aliases for table display compatibility
    lefExpected: lefProbable,
    lmExpected: plmProbable,
    perdidaAnualEsperada: aleEstimado,
    nivelRiesgo: getNivelSimple(riesgoSimple),
    iteraciones: 10000,
    estado: "—",

    notas: analisis?.notas ?? "",

    fechaAnalisis: analisis?.fecha_analisis ?? null,
    fechaActualizacion: analisis?.fecha_actualizacion ?? null,
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