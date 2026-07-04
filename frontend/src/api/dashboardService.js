import api from "./api";

const numberValue = (...values) => {
  const validValue = values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  const numericValue = Number(validValue);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const arrayValue = (...values) => {
  const validValue = values.find(
    (value) => Array.isArray(value)
  );

  return validValue || [];
};

const objectValue = (...values) => {
  const validValue = values.find(
    (value) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );

  return validValue || {};
};

const normalizeRiskDistribution = (data) => {
  const distribution = objectValue(
    data?.distribucion_riesgos,
    data?.distribucionRiesgos,
    data?.riesgos_por_nivel,
    data?.riesgosPorNivel,
    data?.niveles_riesgo
  );

  const critical = numberValue(
    distribution?.critico,
    distribution?.crítico,
    distribution?.critical,
    data?.riesgos_criticos,
    data?.riesgosCriticos
  );

  const high = numberValue(
    distribution?.alto,
    distribution?.high,
    data?.riesgos_altos,
    data?.riesgosAltos
  );

  const medium = numberValue(
    distribution?.medio,
    distribution?.medium,
    data?.riesgos_medios,
    data?.riesgosMedios
  );

  const low = numberValue(
    distribution?.bajo,
    distribution?.low,
    data?.riesgos_bajos,
    data?.riesgosBajos
  );

  return [
    {
      name: "Crítico",
      value: critical,
    },
    {
      name: "Alto",
      value: high,
    },
    {
      name: "Medio",
      value: medium,
    },
    {
      name: "Bajo",
      value: low,
    },
  ];
};

const normalizeTreatments = (data) => {
  const treatments = objectValue(
    data?.tratamientos,
    data?.resumen_tratamientos,
    data?.resumenTratamientos
  );

  return {
    pendientes: numberValue(
      treatments?.pendientes,
      treatments?.pending,
      data?.tratamientos_pendientes
    ),

    enProceso: numberValue(
      treatments?.en_proceso,
      treatments?.enProceso,
      treatments?.in_progress,
      data?.tratamientos_en_proceso
    ),

    completados: numberValue(
      treatments?.completados,
      treatments?.completed,
      data?.tratamientos_completados
    ),
  };
};

const normalizeRecentRisks = (data) => {
  const risks = arrayValue(
    data?.riesgos_recientes,
    data?.riesgosRecientes,
    data?.analisis_recientes,
    data?.analisisRecientes,
    data?.ultimos_analisis,
    data?.latest_analysis
  );

  return risks.map((risk, index) => ({
    id:
      risk?.id ??
      risk?.analisis_id ??
      risk?.pk ??
      index,

    escenario:
      risk?.escenario ??
      risk?.nombre_escenario ??
      risk?.scenario ??
      risk?.nombre ??
      `Análisis ${index + 1}`,

    activo:
      risk?.activo ??
      risk?.nombre_activo ??
      risk?.asset ??
      "Sin activo",

    nivel:
      risk?.nivel_riesgo ??
      risk?.nivel ??
      risk?.risk_level ??
      "Sin clasificar",

    perdidaEsperada: numberValue(
      risk?.perdida_esperada,
      risk?.perdidaEsperada,
      risk?.ale,
      risk?.expected_loss
    ),

    fecha:
      risk?.fecha ??
      risk?.fecha_creacion ??
      risk?.created_at ??
      risk?.createdAt ??
      null,
  }));
};

const normalizeDashboardData = (responseData) => {
  const data =
    responseData?.data &&
    typeof responseData.data === "object"
      ? responseData.data
      : responseData;

  return {
    kpis: {
      organizaciones: numberValue(
        data?.total_organizaciones,
        data?.organizaciones,
        data?.organizaciones_count,
        data?.totalOrganizaciones
      ),

      activos: numberValue(
        data?.total_activos,
        data?.activos,
        data?.activos_count,
        data?.totalActivos
      ),

      amenazas: numberValue(
        data?.total_amenazas,
        data?.amenazas,
        data?.amenazas_count,
        data?.totalAmenazas
      ),

      vulnerabilidades: numberValue(
        data?.total_vulnerabilidades,
        data?.vulnerabilidades,
        data?.vulnerabilidades_count,
        data?.totalVulnerabilidades
      ),

      escenarios: numberValue(
        data?.total_escenarios,
        data?.escenarios,
        data?.escenarios_count,
        data?.totalEscenarios
      ),

      analisis: numberValue(
        data?.total_analisis,
        data?.analisis,
        data?.analisis_count,
        data?.totalAnalisis
      ),
    },

    riskDistribution:
      normalizeRiskDistribution(data),

    treatments:
      normalizeTreatments(data),

    recentRisks:
      normalizeRecentRisks(data),
  };
};

export const dashboardService = {
  async getDashboard() {
    try {
      const response = await api.get(
        "/dashboard/"
      );

      return normalizeDashboardData(
        response.data
      );
    } catch (error) {
      if (!error.response) {
        throw new Error(
          "No se pudo conectar con el servidor."
        );
      }

      if (error.response.status === 401) {
        throw new Error(
          "Tu sesión expiró. Vuelve a iniciar sesión."
        );
      }

      if (error.response.status === 403) {
        throw new Error(
          "No tienes permisos para consultar el dashboard."
        );
      }

      if (error.response.status === 404) {
        throw new Error(
          "No se encontró el endpoint /api/dashboard/."
        );
      }

      const message =
        error.response.data?.detail ??
        error.response.data?.message ??
        error.response.data?.error;

      throw new Error(
        message ||
          "No fue posible cargar el dashboard."
      );
    }
  },
};