import api from "./api";

const TRATAMIENTOS_ENDPOINT = "/tratamientos/";
const ORGANIZACIONES_ENDPOINT = "/organizaciones/";
const ANALISIS_ENDPOINT = "/analisis/";

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

const normalizeTratamiento = (tratamiento) => {
  const organizacion = tratamiento?.organizacion;
  const analisis = tratamiento?.analisis;

  return {
    ...tratamiento,

    id:
      tratamiento?.id ??
      tratamiento?.tratamiento_id ??
      tratamiento?.pk ??
      null,

    nombre:
      tratamiento?.nombre ??
      tratamiento?.nombre_tratamiento ??
      tratamiento?.titulo ??
      "Tratamiento sin nombre",

    descripcion:
      tratamiento?.descripcion ??
      tratamiento?.detalle ??
      tratamiento?.acciones ??
      "",

    organizacionId:
      getObjectId(organizacion) ??
      tratamiento?.organizacion_id ??
      null,

    organizacionNombre:
      getObjectName(
        organizacion,
        ["nombre", "nombre_organizacion"],
        tratamiento?.organizacion_nombre ??
          tratamiento?.nombre_organizacion ??
          "Sin organización"
      ),

    analisisId:
      getObjectId(analisis) ??
      tratamiento?.analisis_id ??
      null,

    analisisNombre:
      getObjectName(
        analisis,
        ["nombre", "nombre_analisis", "titulo"],
        tratamiento?.analisis_nombre ??
          tratamiento?.nombre_analisis ??
          "Sin análisis"
      ),

    estrategia:
      tratamiento?.estrategia ??
      tratamiento?.tipo_tratamiento ??
      tratamiento?.respuesta_riesgo ??
      "Mitigar",

    responsable:
      tratamiento?.responsable ??
      tratamiento?.asignado_a ??
      tratamiento?.propietario ??
      "",

    prioridad:
      tratamiento?.prioridad ??
      tratamiento?.nivel_prioridad ??
      "Media",

    estado:
      tratamiento?.estado ??
      tratamiento?.status ??
      "Planificado",

    porcentajeAvance: numericValue(
      tratamiento?.porcentaje_avance,
      tratamiento?.avance,
      tratamiento?.progreso,
      0
    ),

    presupuesto: numericValue(
      tratamiento?.presupuesto,
      tratamiento?.costo_estimado,
      tratamiento?.presupuesto_estimado,
      0
    ),

    costoReal: numericValue(
      tratamiento?.costo_real,
      tratamiento?.costo_ejecutado,
      tratamiento?.gasto_real,
      0
    ),

    fechaInicio:
      tratamiento?.fecha_inicio ??
      tratamiento?.start_date ??
      null,

    fechaLimite:
      tratamiento?.fecha_limite ??
      tratamiento?.fecha_fin ??
      tratamiento?.due_date ??
      null,

    fechaFinalizacion:
      tratamiento?.fecha_finalizacion ??
      tratamiento?.fecha_cierre ??
      tratamiento?.completed_at ??
      null,

    riesgoResidual: numericValue(
      tratamiento?.riesgo_residual,
      tratamiento?.perdida_residual,
      tratamiento?.residual_risk,
      0
    ),

    efectividadEsperada: numericValue(
      tratamiento?.efectividad_esperada,
      tratamiento?.reduccion_esperada,
      tratamiento?.expected_effectiveness,
      0
    ),

    observaciones:
      tratamiento?.observaciones ??
      tratamiento?.comentarios ??
      "",

    activo:
      tratamiento?.activo ??
      tratamiento?.habilitado ??
      true,

    fechaCreacion:
      tratamiento?.fecha_creacion ??
      tratamiento?.created_at ??
      null,
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

  perdidaAnualEsperada: numericValue(
    analisis?.perdida_anual_esperada,
    analisis?.ale,
    analisis?.riesgo_anual,
    0
  ),

  nivelRiesgo:
    analisis?.nivel_riesgo ??
    analisis?.clasificacion_riesgo ??
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
    return "No se encontró el tratamiento solicitado.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const tratamientosService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    analisis = "",
    estrategia = "",
    prioridad = "",
    estado = "",
  } = {}) {
    try {
      const response = await api.get(
        TRATAMIENTOS_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            organizacion: organizacion || undefined,
            analisis: analisis || undefined,
            estrategia: estrategia || undefined,
            prioridad: prioridad || undefined,
            estado: estado || undefined,
          },
        }
      );

      const extracted = extractResults(response.data);

      return {
        ...extracted,
        results: extracted.results.map(
          normalizeTratamiento
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${TRATAMIENTOS_ENDPOINT}${id}/`
      );

      return normalizeTratamiento(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        TRATAMIENTOS_ENDPOINT,
        data
      );

      return normalizeTratamiento(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${TRATAMIENTOS_ENDPOINT}${id}/`,
        data
      );

      return normalizeTratamiento(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${TRATAMIENTOS_ENDPOINT}${id}/`
      );

      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getCatalogos() {
    try {
      const [
        organizacionesResponse,
        analisisResponse,
      ] = await Promise.all([
        api.get(ORGANIZACIONES_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),

        api.get(ANALISIS_ENDPOINT, {
          params: {
            page_size: 1000,
          },
        }),
      ]);

      return {
        organizaciones: extractResults(
          organizacionesResponse.data
        ).results.map(normalizeOrganizacion),

        analisis: extractResults(
          analisisResponse.data
        ).results.map(normalizeAnalisis),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};