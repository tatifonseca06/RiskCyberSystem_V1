import api from "./api";

const ESCENARIOS_ENDPOINT = "/escenarios/";
const ORGANIZACIONES_ENDPOINT = "/organizaciones/";
const ACTIVOS_ENDPOINT = "/activos/";
const AMENAZAS_ENDPOINT = "/amenazas/";
const VULNERABILIDADES_ENDPOINT = "/vulnerabilidades/";

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
  fallbackFields = [],
  defaultValue = "Sin información"
) => {
  if (value && typeof value === "object") {
    for (const field of fallbackFields) {
      if (value[field]) {
        return value[field];
      }
    }
  }

  return defaultValue;
};

const normalizeEscenario = (escenario) => {
  const organizacion = escenario?.organizacion;
  const activo = escenario?.activo;
  const amenaza = escenario?.amenaza;
  const vulnerabilidad = escenario?.vulnerabilidad;

  return {
    ...escenario,

    id:
      escenario?.id ??
      escenario?.escenario_id ??
      escenario?.pk ??
      null,

    nombre:
      escenario?.nombre ??
      escenario?.nombre_escenario ??
      escenario?.titulo ??
      "Escenario sin nombre",

    descripcion:
      escenario?.descripcion ??
      escenario?.detalle ??
      escenario?.evento_riesgo ??
      "",

    organizacionId:
      getObjectId(organizacion) ??
      escenario?.organizacion_id ??
      null,

    organizacionNombre:
      getObjectName(
        organizacion,
        ["nombre", "nombre_organizacion"],
        escenario?.organizacion_nombre ??
          escenario?.nombre_organizacion ??
          "Sin organización"
      ),

    activoId:
      getObjectId(activo) ??
      escenario?.activo_id ??
      null,

    activoNombre:
      getObjectName(
        activo,
        ["nombre", "nombre_activo"],
        escenario?.activo_nombre ??
          escenario?.nombre_activo ??
          "Sin activo"
      ),

    amenazaId:
      getObjectId(amenaza) ??
      escenario?.amenaza_id ??
      null,

    amenazaNombre:
      getObjectName(
        amenaza,
        ["nombre", "nombre_amenaza"],
        escenario?.amenaza_nombre ??
          escenario?.nombre_amenaza ??
          "Sin amenaza"
      ),

    vulnerabilidadId:
      getObjectId(vulnerabilidad) ??
      escenario?.vulnerabilidad_id ??
      null,

    vulnerabilidadNombre:
      getObjectName(
        vulnerabilidad,
        ["nombre", "nombre_vulnerabilidad"],
        escenario?.vulnerabilidad_nombre ??
          escenario?.nombre_vulnerabilidad ??
          "Sin vulnerabilidad"
      ),

    frecuencia: Number(
      escenario?.frecuencia ??
        escenario?.frecuencia_anual ??
        escenario?.lef ??
        escenario?.loss_event_frequency ??
        0
    ),

    impacto: Number(
      escenario?.impacto ??
        escenario?.impacto_estimado ??
        escenario?.magnitud_perdida ??
        escenario?.loss_magnitude ??
        0
    ),

    probabilidad:
      escenario?.probabilidad ??
      escenario?.nivel_probabilidad ??
      escenario?.likelihood ??
      "Media",

    nivelRiesgo:
      escenario?.nivel_riesgo ??
      escenario?.nivelRiesgo ??
      escenario?.risk_level ??
      "",

    estado:
      escenario?.estado ??
      escenario?.status ??
      "Identificado",

    activoEstado:
      escenario?.activo_estado ??
      escenario?.habilitado ??
      true,

    fechaCreacion:
      escenario?.fecha_creacion ??
      escenario?.created_at ??
      escenario?.createdAt ??
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

const normalizeActivo = (activo) => ({
  id:
    activo?.id ??
    activo?.activo_id ??
    activo?.pk,

  nombre:
    activo?.nombre ??
    activo?.nombre_activo ??
    "Activo sin nombre",

  organizacionId:
    getObjectId(activo?.organizacion) ??
    activo?.organizacion_id ??
    null,
});

const normalizeAmenaza = (amenaza) => ({
  id:
    amenaza?.id ??
    amenaza?.amenaza_id ??
    amenaza?.pk,

  nombre:
    amenaza?.nombre ??
    amenaza?.nombre_amenaza ??
    "Amenaza sin nombre",

  organizacionId:
    getObjectId(amenaza?.organizacion) ??
    amenaza?.organizacion_id ??
    null,

  activoId:
    getObjectId(amenaza?.activo) ??
    amenaza?.activo_id ??
    null,
});

const normalizeVulnerabilidad = (vulnerabilidad) => ({
  id:
    vulnerabilidad?.id ??
    vulnerabilidad?.vulnerabilidad_id ??
    vulnerabilidad?.pk,

  nombre:
    vulnerabilidad?.nombre ??
    vulnerabilidad?.nombre_vulnerabilidad ??
    "Vulnerabilidad sin nombre",

  organizacionId:
    getObjectId(vulnerabilidad?.organizacion) ??
    vulnerabilidad?.organizacion_id ??
    null,

  activoId:
    getObjectId(vulnerabilidad?.activo) ??
    vulnerabilidad?.activo_id ??
    null,

  severidad:
    vulnerabilidad?.severidad ??
    vulnerabilidad?.nivel_severidad ??
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
    return "No se encontró el escenario solicitado.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const escenariosService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    activo = "",
    amenaza = "",
    nivelRiesgo = "",
    estado = "",
  } = {}) {
    try {
      const response = await api.get(ESCENARIOS_ENDPOINT, {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
          organizacion: organizacion || undefined,
          activo: activo || undefined,
          amenaza: amenaza || undefined,
          nivel_riesgo: nivelRiesgo || undefined,
          estado: estado || undefined,
        },
      });

      const extracted = extractResults(response.data);

      return {
        ...extracted,
        results: extracted.results.map(normalizeEscenario),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${ESCENARIOS_ENDPOINT}${id}/`
      );

      return normalizeEscenario(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        ESCENARIOS_ENDPOINT,
        data
      );

      return normalizeEscenario(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${ESCENARIOS_ENDPOINT}${id}/`,
        data
      );

      return normalizeEscenario(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${ESCENARIOS_ENDPOINT}${id}/`
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
        activosResponse,
        amenazasResponse,
        vulnerabilidadesResponse,
      ] = await Promise.all([
        api.get(ORGANIZACIONES_ENDPOINT, {
          params: { page_size: 1000 },
        }),
        api.get(ACTIVOS_ENDPOINT, {
          params: { page_size: 1000 },
        }),
        api.get(AMENAZAS_ENDPOINT, {
          params: { page_size: 1000 },
        }),
        api.get(VULNERABILIDADES_ENDPOINT, {
          params: { page_size: 1000 },
        }),
      ]);

      return {
        organizaciones: extractResults(
          organizacionesResponse.data
        ).results.map(normalizeOrganizacion),

        activos: extractResults(
          activosResponse.data
        ).results.map(normalizeActivo),

        amenazas: extractResults(
          amenazasResponse.data
        ).results.map(normalizeAmenaza),

        vulnerabilidades: extractResults(
          vulnerabilidadesResponse.data
        ).results.map(normalizeVulnerabilidad),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};