import api from "./api";

const ENDPOINT = "/organizaciones/";

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

const getErrorMessage = (error) => {
  if (!error.response) {
    return "No se pudo conectar con el servidor.";
  }

  const data = error.response.data;
  const status = error.response.status;

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
    return "No se encontró la organización solicitada.";
  }

  if (status >= 500) {
    return "Ocurrió un error interno en el servidor.";
  }

  return "No fue posible completar la solicitud.";
};

export const organizacionesService = {
  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
  } = {}) {
    try {
      const response = await api.get(ENDPOINT, {
        params: {
          page,
          page_size: pageSize,
          search: search || undefined,
        },
      });

      return extractResults(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(
        `${ENDPOINT}${id}/`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(
        ENDPOINT,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(
        `${ENDPOINT}${id}/`,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id) {
    try {
      await api.delete(`${ENDPOINT}${id}/`);
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};