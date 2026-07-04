import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  Assessment,
  Insights,
  QueryStats,
  Timeline,
} from "@mui/icons-material";
import LossDistributionChart from "./LossDistributionChart";
import PercentilesChart from "./PercentilesChart";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("es-EC", {
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
    timeStyle: "short",
  }).format(date);
};

const getRiskColor = (level = "") => {
  const normalized = level
    .toString()
    .toLowerCase();

  if (normalized.includes("crít")) {
    return "error";
  }

  if (normalized.includes("alto")) {
    return "warning";
  }

  if (normalized.includes("medio")) {
    return "info";
  }

  if (normalized.includes("bajo")) {
    return "success";
  }

  return "default";
};

const MetricCard = ({
  label,
  value,
  icon,
  subtitle,
}) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      border:
        "1px solid rgba(15,61,91,0.1)",
    }}
  >
    <CardContent>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            backgroundColor:
              "rgba(11,95,165,0.08)",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {label}
          </Typography>

          <Typography
            variant="h6"
            fontWeight={800}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const MonteCarloDetailDialog = ({
  open,
  resultado,
  loading,
  error,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={
        loading ? undefined : onClose
      }
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Resultado de Monte Carlo
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              minHeight: 450,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress />

            <Typography color="text.secondary">
              Cargando resultado...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">
            {error}
          </Alert>
        ) : resultado ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                >
                  {resultado.analisisNombre}
                </Typography>

                <Typography color="text.secondary">
                  {resultado.organizacionNombre}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Ejecutado:{" "}
                  {formatDate(
                    resultado.fechaEjecucion
                  )}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
              >
                <Chip
                  label={`${formatNumber(
                    resultado.iteraciones
                  )} iteraciones`}
                  variant="outlined"
                />

                <Chip
                  label={`Confianza ${formatNumber(
                    resultado.nivelConfianza
                  )}%`}
                  color="primary"
                  variant="outlined"
                />

                {resultado.nivelRiesgo && (
                  <Chip
                    label={`Riesgo ${resultado.nivelRiesgo}`}
                    color={getRiskColor(
                      resultado.nivelRiesgo
                    )}
                  />
                )}
              </Stack>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Pérdida media"
                  value={formatCurrency(
                    resultado.perdidaMedia
                  )}
                  icon={<Assessment />}
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Mediana"
                  value={formatCurrency(
                    resultado.mediana
                  )}
                  icon={<Timeline />}
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="VaR"
                  value={formatCurrency(
                    resultado.var
                  )}
                  subtitle={`Confianza ${resultado.nivelConfianza}%`}
                  icon={<Insights />}
                />
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Desviación estándar"
                  value={formatCurrency(
                    resultado.desviacionEstandar
                  )}
                  icon={<QueryStats />}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="P50"
                  value={formatCurrency(
                    resultado.p50
                  )}
                  icon={<Timeline />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="P90"
                  value={formatCurrency(
                    resultado.p90
                  )}
                  icon={<Timeline />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="P95"
                  value={formatCurrency(
                    resultado.p95
                  )}
                  icon={<Timeline />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="P99"
                  value={formatCurrency(
                    resultado.p99
                  )}
                  icon={<Timeline />}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border:
                      "1px solid rgba(15,61,91,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Distribución de pérdidas
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Frecuencia de los resultados
                      simulados por rango.
                    </Typography>

                    <LossDistributionChart
                      data={
                        resultado.distribucion
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border:
                      "1px solid rgba(15,61,91,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Percentiles
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Comparación de pérdidas por
                      nivel de confianza.
                    </Typography>

                    <PercentilesChart
                      p50={resultado.p50}
                      p90={resultado.p90}
                      p95={resultado.p95}
                      p99={resultado.p99}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MetricCard
                  label="Pérdida mínima simulada"
                  value={formatCurrency(
                    resultado.perdidaMinima
                  )}
                  icon={<Assessment />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MetricCard
                  label="Pérdida máxima simulada"
                  value={formatCurrency(
                    resultado.perdidaMaxima
                  )}
                  icon={<Assessment />}
                />
              </Grid>
            </Grid>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonteCarloDetailDialog;