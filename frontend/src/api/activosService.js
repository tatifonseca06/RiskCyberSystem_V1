import api from "./api";

const ACTIVOS_ENDPOINT = "/activos/";
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

const normalizeActivo = (activo) => {
  const organizacionObject =
    activo?.organizacion &&
    typeof activo.organizacion === "object"
      ? activo.organizacion
      : null;

  return {
    ...activo,

    id:
      activo?.id ??
      activo?.activo_id ??
      activo?.pk ??
      null,

    nombre:
      activo?.nombre ??
      activo?.nombre_activo ??
      activo?.titulo ??
      "Sin nombre",

    descripcion:
      activo?.descripcion ??
      activo?.detalle ??
      "",

    tipo:
      activo?.tipo ??
      activo?.tipo_activo ??
      activo?.categoria ??
      "",

    propietario:
      activo?.propietario ??
      activo?.responsable ??
      activo?.custodio ??
      "",

    ubicacion:
      activo?.ubicacion ??
      activo?.localizacion ??
      "",

    organizacionId:
      organizacionObject?.id ??
      activo?.organizacion_id ??
      activo?.organizacion ??
      null,

    organizacionNombre:
      organizacionObject?.nombre ??
      activo?.organizacion_nombre ??
      activo?.nombre_organizacion ??
      "Sin organización",

    criticidad:
      activo?.criticidad ??
      activo?.nivel_criticidad ??
      activo?.criticality ??
      "",

    confidencialidad:
      activo?.confidencialidad ??
      activo?.valor_confidencialidad ??
      activo?.confidentiality ??
      1,

    integridad:
      activo?.integridad ??
      activo?.valor_integridad ??
      activo?.integrity ??
      1,

    disponibilidad:
      activo?.disponibilidad ??
      activo?.valor_disponibilidad ??
      activo?.availability ??
      1,

    valor:
      activo?.valor ??
      activo?.valor_economico ??
      activo?.valor_estimado ??
      0,

    estado:
      activo?.estado ??
      activo?.activo ??
      true,

    fechaCreacion:
      activo?.fecha_creacion ??
      activo?.created_at ??
      activo?.createdAt ??
      null,
  };
};

const getErrorMessage = (error) => {
  if (!error.response) {
    return "No se pudo conectar con el servidor.";
  }

  const data = error.response.data;
  const status = error.response.status;

  if (typeof data === "string") {
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
    return "No se encontró el activo solicitado.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const activosService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    tipo = "",
    criticidad = "",
  } = {}) {
    try {
      const response = await api.get(ACTIVOS_ENDPOINT, {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
          organizacion: organizacion || undefined,
          tipo: tipo || undefined,
          criticidad: criticidad || undefined,
        },
      });

      const extracted = extractResults(response.data);

      return {
        ...extracted,
        results: extracted.results.map(normalizeActivo),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${ACTIVOS_ENDPOINT}${id}/`
      );

      return normalizeActivo(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        ACTIVOS_ENDPOINT,
        data
      );

      return normalizeActivo(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${ACTIVOS_ENDPOINT}${id}/`,
        data
      );

      return normalizeActivo(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${ACTIVOS_ENDPOINT}${id}/`
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

      return extracted.results.map((organizacion) => ({
        id:
          organizacion?.id ??
          organizacion?.organizacion_id ??
          organizacion?.pk,

        nombre:
          organizacion?.nombre ??
          organizacion?.nombre_organizacion ??
          "Organización sin nombre",
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};