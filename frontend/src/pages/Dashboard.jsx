import {
  Assessment,
  Business,
  GppMaybe,
  Inventory2,
  Refresh,
  Security,
  WarningAmber,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dashboardService } from "../api/dashboardService";
import KPICard from "../components/KPICard";
import RiskDistributionChart from "../components/RiskDistributionChart";
import RiskLevelChart from "../components/RiskLevelChart";

const EMPTY_DASHBOARD = {
  kpis: {
    organizaciones: 0,
    activos: 0,
    amenazas: 0,
    vulnerabilidades: 0,
    escenarios: 0,
    analisis: 0,
  },
  riskDistribution: [
    { name: "Crítico", value: 0 },
    { name: "Alto", value: 0 },
    { name: "Medio", value: 0 },
    { name: "Bajo", value: 0 },
  ],
  treatments: {
    pendientes: 0,
    enProceso: 0,
    completados: 0,
  },
  recentRisks: [],
};

const getRiskChipColor = (level = "") => {
  const normalizedLevel = level
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalizedLevel.includes("crít") ||
    normalizedLevel.includes("critic")
  ) {
    return "error";
  }

  if (
    normalizedLevel.includes("alto") ||
    normalizedLevel.includes("high")
  ) {
    return "warning";
  }

  if (
    normalizedLevel.includes("medio") ||
    normalizedLevel.includes("medium")
  ) {
    return "info";
  }

  if (
    normalizedLevel.includes("bajo") ||
    normalizedLevel.includes("low")
  ) {
    return "success";
  }

  return "default";
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
  }).format(date);
};

const Dashboard = () => {
  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await dashboardService.getDashboard();

        setDashboard(data);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar el dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    document.title =
      "Dashboard | RiskCyberSystem";

    loadDashboard();
  }, [loadDashboard]);

  const totalTreatments = useMemo(() => {
    return (
      dashboard.treatments.pendientes +
      dashboard.treatments.enProceso +
      dashboard.treatments.completados
    );
  }, [dashboard.treatments]);

  const completedTreatmentPercentage =
    useMemo(() => {
      if (totalTreatments === 0) {
        return 0;
      }

      return Math.round(
        (dashboard.treatments.completados /
          totalTreatments) *
          100
      );
    }, [
      dashboard.treatments.completados,
      totalTreatments,
    ]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Cargando información del dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Dashboard
          </Typography>

          <Typography color="text.secondary">
            Resumen general de la gestión de
            riesgos cibernéticos.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboard}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadDashboard}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Organizaciones"
            value={
              dashboard.kpis.organizaciones
            }
            subtitle="Registradas"
            icon={<Business />}
            gradient="linear-gradient(135deg, #0b5fa5, #1976d2)"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Activos"
            value={dashboard.kpis.activos}
            subtitle="Identificados"
            icon={<Inventory2 />}
            gradient="linear-gradient(135deg, #008f95, #26a69a)"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Amenazas"
            value={dashboard.kpis.amenazas}
            subtitle="Catalogadas"
            icon={<WarningAmber />}
            gradient="linear-gradient(135deg, #ef6c00, #fb8c00)"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Vulnerabilidades"
            value={
              dashboard.kpis
                .vulnerabilidades
            }
            subtitle="Registradas"
            icon={<GppMaybe />}
            gradient="linear-gradient(135deg, #c62828, #ef5350)"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Escenarios"
            value={dashboard.kpis.escenarios}
            subtitle="Evaluados"
            icon={<Security />}
            gradient="linear-gradient(135deg, #6a1b9a, #8e24aa)"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          xl={2}
        >
          <KPICard
            title="Análisis"
            value={dashboard.kpis.analisis}
            subtitle="FAIR realizados"
            icon={<Assessment />}
            gradient="linear-gradient(135deg, #283593, #5c6bc0)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border:
                "1px solid rgba(15,61,91,0.08)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Distribución de riesgos
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Clasificación de los riesgos por
                nivel.
              </Typography>

              <RiskDistributionChart
                data={
                  dashboard.riskDistribution
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border:
                "1px solid rgba(15,61,91,0.08)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Riesgos por nivel
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Comparación cuantitativa por
                clasificación.
              </Typography>

              <RiskLevelChart
                data={
                  dashboard.riskDistribution
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border:
                "1px solid rgba(15,61,91,0.08)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={800}
                gutterBottom
              >
                Tratamientos de riesgo
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Estado actual de los planes de
                tratamiento.
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      Pendientes
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {
                        dashboard.treatments
                          .pendientes
                      }
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    color="warning"
                    value={
                      totalTreatments === 0
                        ? 0
                        : (dashboard.treatments
                            .pendientes /
                            totalTreatments) *
                          100
                    }
                  />
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      En proceso
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {
                        dashboard.treatments
                          .enProceso
                      }
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    color="info"
                    value={
                      totalTreatments === 0
                        ? 0
                        : (dashboard.treatments
                            .enProceso /
                            totalTreatments) *
                          100
                    }
                  />
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      Completados
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {
                        dashboard.treatments
                          .completados
                      }
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    color="success"
                    value={
                      completedTreatmentPercentage
                    }
                  />
                </Box>

                <Box
                  sx={{
                    pt: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {
                      completedTreatmentPercentage
                    }
                    %
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Tratamientos completados
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border:
                "1px solid rgba(15,61,91,0.08)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Riesgos recientes
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Últimos análisis registrados en el
                sistema.
              </Typography>

              {dashboard.recentRisks.length ===
              0 ? (
                <Box
                  sx={{
                    minHeight: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No existen análisis recientes.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          Escenario
                        </TableCell>

                        <TableCell>
                          Activo
                        </TableCell>

                        <TableCell>
                          Nivel
                        </TableCell>

                        <TableCell align="right">
                          Pérdida esperada
                        </TableCell>

                        <TableCell>
                          Fecha
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {dashboard.recentRisks.map(
                        (risk) => (
                          <TableRow
                            key={risk.id}
                            hover
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {
                                  risk.escenario
                                }
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {risk.activo}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={risk.nivel}
                                color={getRiskChipColor(
                                  risk.nivel
                                )}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell align="right">
                              {formatCurrency(
                                risk.perdidaEsperada
                              )}
                            </TableCell>

                            <TableCell>
                              {formatDate(
                                risk.fecha
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Dashboard;