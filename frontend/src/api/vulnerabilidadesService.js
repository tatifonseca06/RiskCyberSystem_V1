import api from "./api";

const VULNERABILIDADES_ENDPOINT = "/vulnerabilidades/";
const ORGANIZACIONES_ENDPOINT = "/organizaciones/";
const ACTIVOS_ENDPOINT = "/activos/";

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

const normalizeVulnerabilidad = (vulnerabilidad) => {
  const organizacionObject =
    vulnerabilidad?.organizacion &&
    typeof vulnerabilidad.organizacion === "object"
      ? vulnerabilidad.organizacion
      : null;

  const activoObject =
    vulnerabilidad?.activo &&
    typeof vulnerabilidad.activo === "object"
      ? vulnerabilidad.activo
      : null;

  return {
    ...vulnerabilidad,

    id:
      vulnerabilidad?.id ??
      vulnerabilidad?.vulnerabilidad_id ??
      vulnerabilidad?.pk ??
      null,

    nombre:
      vulnerabilidad?.nombre ??
      vulnerabilidad?.nombre_vulnerabilidad ??
      vulnerabilidad?.titulo ??
      "Sin nombre",

    descripcion:
      vulnerabilidad?.descripcion ??
      vulnerabilidad?.detalle ??
      "",

    cve:
      vulnerabilidad?.cve ??
      vulnerabilidad?.codigo_cve ??
      vulnerabilidad?.identificador ??
      "",

    cvss: Number(
      vulnerabilidad?.cvss ??
        vulnerabilidad?.puntaje_cvss ??
        vulnerabilidad?.score_cvss ??
        0
    ),

    severidad:
      vulnerabilidad?.severidad ??
      vulnerabilidad?.nivel_severidad ??
      vulnerabilidad?.severity ??
      "Media",

    estadoRemediacion:
      vulnerabilidad?.estado_remediacion ??
      vulnerabilidad?.estadoRemediacion ??
      vulnerabilidad?.estado ??
      vulnerabilidad?.status ??
      "Pendiente",

    organizacionId:
      organizacionObject?.id ??
      vulnerabilidad?.organizacion_id ??
      (
        typeof vulnerabilidad?.organizacion !== "object"
          ? vulnerabilidad?.organizacion
          : null
      ) ??
      null,

    organizacionNombre:
      organizacionObject?.nombre ??
      vulnerabilidad?.organizacion_nombre ??
      vulnerabilidad?.nombre_organizacion ??
      "Sin organización",

    activoId:
      activoObject?.id ??
      vulnerabilidad?.activo_id ??
      (
        typeof vulnerabilidad?.activo !== "object"
          ? vulnerabilidad?.activo
          : null
      ) ??
      null,

    activoNombre:
      activoObject?.nombre ??
      vulnerabilidad?.activo_nombre ??
      vulnerabilidad?.nombre_activo ??
      "Sin activo",

    responsable:
      vulnerabilidad?.responsable ??
      vulnerabilidad?.propietario ??
      vulnerabilidad?.asignado_a ??
      "",

    fechaDeteccion:
      vulnerabilidad?.fecha_deteccion ??
      vulnerabilidad?.fechaDeteccion ??
      vulnerabilidad?.detected_at ??
      null,

    fechaRemediacion:
      vulnerabilidad?.fecha_remediacion ??
      vulnerabilidad?.fechaRemediacion ??
      vulnerabilidad?.remediated_at ??
      null,

    recomendacion:
      vulnerabilidad?.recomendacion ??
      vulnerabilidad?.solucion ??
      vulnerabilidad?.remediacion ??
      "",

    activa:
      vulnerabilidad?.activa ??
      vulnerabilidad?.habilitado ??
      vulnerabilidad?.activo_estado ??
      true,
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

const normalizeActivo = (activo) => {
  const organizacionObject =
    activo?.organizacion &&
    typeof activo.organizacion === "object"
      ? activo.organizacion
      : null;

  return {
    id:
      activo?.id ??
      activo?.activo_id ??
      activo?.pk,

    nombre:
      activo?.nombre ??
      activo?.nombre_activo ??
      "Activo sin nombre",

    organizacionId:
      organizacionObject?.id ??
      activo?.organizacion_id ??
      (
        typeof activo?.organizacion !== "object"
          ? activo?.organizacion
          : null
      ) ??
      null,
  };
};

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
    return "No se encontró la vulnerabilidad solicitada.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const vulnerabilidadesService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    activo = "",
    severidad = "",
    estadoRemediacion = "",
  } = {}) {
    try {
      const response = await api.get(
        VULNERABILIDADES_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            organizacion: organizacion || undefined,
            activo: activo || undefined,
            severidad: severidad || undefined,
            estado_remediacion:
              estadoRemediacion || undefined,
          },
        }
      );

      const extracted = extractResults(response.data);

      return {
        ...extracted,
        results: extracted.results.map(
          normalizeVulnerabilidad
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${VULNERABILIDADES_ENDPOINT}${id}/`
      );

      return normalizeVulnerabilidad(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        VULNERABILIDADES_ENDPOINT,
        data
      );

      return normalizeVulnerabilidad(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${VULNERABILIDADES_ENDPOINT}${id}/`,
        data
      );

      return normalizeVulnerabilidad(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${VULNERABILIDADES_ENDPOINT}${id}/`
      );

      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getOrganizaciones() {
    try {
      const response = await api.get(
        ORGANIZACIONES_ENDPOINT,
        {
          params: {
            page_size: 1000,
          },
        }
      );

      const extracted = extractResults(response.data);

      return extracted.results.map(
        normalizeOrganizacion
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getActivos() {
    try {
      const response = await api.get(
        ACTIVOS_ENDPOINT,
        {
          params: {
            page_size: 1000,
          },
        }
      );

      const extracted = extractResults(response.data);

      return extracted.results.map(normalizeActivo);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};