import api from "./api";

const AMENAZAS_ENDPOINT = "/amenazas/";
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

// Backend model: CatalogoAmenaza
// Fields: id, organizacion (int FK), organizacion_nombre, nombre, origen (EXTERNA|INTERNA|PROCESO), descripcion, es_generica
const ORIGEN_LABELS = {
  EXTERNA: "Amenaza externa",
  INTERNA: "Amenaza interna",
  PROCESO: "Amenaza de proceso y entorno",
};

const normalizeAmenaza = (amenaza) => {
  return {
    ...amenaza,

    id: amenaza?.id ?? amenaza?.pk ?? null,

    nombre: amenaza?.nombre ?? "Sin nombre",

    descripcion: amenaza?.descripcion ?? "",

    origen: amenaza?.origen ?? "",

    origenLabel: ORIGEN_LABELS[amenaza?.origen] ?? amenaza?.origen ?? "Sin origen",

    es_generica: Boolean(amenaza?.es_generica ?? false),

    organizacionId: amenaza?.organizacion ?? amenaza?.organizacion_id ?? null,

    organizacionNombre:
      amenaza?.organizacion_nombre ??
      amenaza?.nombre_organizacion ??
      "Sin organización",
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

    if (
      Array.isArray(firstError) &&
      firstError.length > 0
    ) {
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
    return "No se encontró la amenaza solicitada.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const amenazasService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    organizacion = "",
    categoria = "",
    origen = "",
    probabilidad = "",
  } = {}) {
    try {
      const response = await api.get(
        AMENAZAS_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            organizacion:
              organizacion || undefined,
            categoria:
              categoria || undefined,
            origen: origen || undefined,
            probabilidad:
              probabilidad || undefined,
          },
        }
      );

      const extracted = extractResults(
        response.data
      );

      return {
        ...extracted,
        results: extracted.results.map(
          normalizeAmenaza
        ),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${AMENAZAS_ENDPOINT}${id}/`
      );

      return normalizeAmenaza(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        AMENAZAS_ENDPOINT,
        data
      );

      return normalizeAmenaza(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${AMENAZAS_ENDPOINT}${id}/`,
        data
      );

      return normalizeAmenaza(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(
        `${AMENAZAS_ENDPOINT}${id}/`
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

      const extracted = extractResults(
        response.data
      );

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

      const extracted = extractResults(
        response.data
      );

      return extracted.results.map(
        normalizeActivo
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};