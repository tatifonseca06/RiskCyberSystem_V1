import {
  Delete,
  Refresh,
  Science,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { monteCarloService } from "../api/monteCarloService";
import MonteCarloDetailDialog from "../components/montecarlo/MonteCarloDetailDialog";
import DeleteMonteCarloDialog from "../components/montecarlo/DeleteMonteCarloDialog";

const NIVELES_RIESGO = [
  "Bajo",
  "Medio",
  "Alto",
  "Crítico",
];

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
    .trim()
    .toLowerCase();

  if (
    normalized.includes("crít") ||
    normalized.includes("critic")
  ) {
    return "error";
  }

  if (
    normalized === "alto" ||
    normalized === "high"
  ) {
    return "warning";
  }

  if (
    normalized === "medio" ||
    normalized === "medium"
  ) {
    return "info";
  }

  if (
    normalized === "bajo" ||
    normalized === "low"
  ) {
    return "success";
  }

  return "default";
};

const MonteCarlo = () => {
  const [resultados, setResultados] =
    useState([]);

  const [analisis, setAnalisis] =
    useState([]);

  const [
    organizaciones,
    setOrganizaciones,
  ] = useState([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    organizacionFilter,
    setOrganizacionFilter,
  ] = useState("");

  const [
    analisisFilter,
    setAnalisisFilter,
  ] = useState("");

  const [
    nivelRiesgoFilter,
    setNivelRiesgoFilter,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    loadingCatalogs,
    setLoadingCatalogs,
  ] = useState(true);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [detailError, setDetailError] =
    useState("");

  const [detailOpen, setDetailOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    selectedResultado,
    setSelectedResultado,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Monte Carlo | RiskCyberSystem";
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const loadCatalogs = useCallback(
    async () => {
      setLoadingCatalogs(true);

      try {
        const data =
          await monteCarloService.getCatalogos();

        setAnalisis(data.analisis);
        setOrganizaciones(
          data.organizaciones
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los catálogos."
        );
      } finally {
        setLoadingCatalogs(false);
      }
    },
    []
  );

  const loadResultados = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await monteCarloService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            analisis: analisisFilter,
            nivelRiesgo:
              nivelRiesgoFilter,
          });

        setResultados(response.results);
        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los resultados."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      pageSize,
      debouncedSearch,
      organizacionFilter,
      analisisFilter,
      nivelRiesgoFilter,
    ]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadResultados();
  }, [loadResultados]);

  const filteredAnalysis = useMemo(() => {
    if (!organizacionFilter) {
      return analisis;
    }

    return analisis.filter((item) => {
      if (!item.organizacionId) {
        return true;
      }

      return (
        String(item.organizacionId) ===
        String(organizacionFilter)
      );
    });
  }, [
    analisis,
    organizacionFilter,
  ]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
        organizacionFilter ||
        analisisFilter ||
        nivelRiesgoFilter
    );
  }, [
    search,
    organizacionFilter,
    analisisFilter,
    nivelRiesgoFilter,
  ]);

  const handleOpenDetail = async (
    resultado
  ) => {
    setSelectedResultado(resultado);
    setDetailOpen(true);
    setLoadingDetail(true);
    setDetailError("");

    try {
      const fullResult =
        await monteCarloService.getById(
          resultado.id
        );

      setSelectedResultado(fullResult);
    } catch (requestError) {
      setDetailError(
        requestError.message ||
          "No fue posible cargar el detalle."
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    if (loadingDetail) {
      return;
    }

    setDetailOpen(false);
    setSelectedResultado(null);
    setDetailError("");
  };

  const handleDelete = (resultado) => {
    setSelectedResultado(resultado);
    setDeleteOpen(true);
    setSuccess("");
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedResultado(null);
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedResultado?.id) {
        return;
      }

      setDeleting(true);

      try {
        await monteCarloService.remove(
          selectedResultado.id
        );

        setSuccess(
          "Resultado eliminado correctamente."
        );

        setDeleteOpen(false);
        setSelectedResultado(null);

        if (
          resultados.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadResultados();
        }
      } catch (requestError) {
        throw requestError;
      } finally {
        setDeleting(false);
      }
    };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setAnalisisFilter("");
    setNivelRiesgoFilter("");
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent:
            "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Resultados Monte Carlo
          </Typography>

          <Typography color="text.secondary">
            Consulta las distribuciones de pérdida,
            percentiles y Value at Risk.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadResultados}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                loadCatalogs();
                loadResultados();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid rgba(15,61,91,0.08)",
        }}
      >
        <CardContent>
          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar análisis o organización..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>
                  Organización
                </InputLabel>

                <Select
                  label="Organización"
                  value={organizacionFilter}
                  disabled={loadingCatalogs}
                  onChange={(event) => {
                    setOrganizacionFilter(
                      event.target.value
                    );
                    setAnalisisFilter("");
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {organizaciones.map(
                    (organizacion) => (
                      <MenuItem
                        key={organizacion.id}
                        value={organizacion.id}
                      >
                        {organizacion.nombre}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>
                  Análisis FAIR
                </InputLabel>

                <Select
                  label="Análisis FAIR"
                  value={analisisFilter}
                  disabled={loadingCatalogs}
                  onChange={(event) => {
                    setAnalisisFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {filteredAnalysis.map(
                    (item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                      >
                        {item.nombre}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Riesgo
                </InputLabel>

                <Select
                  label="Riesgo"
                  value={nivelRiesgoFilter}
                  onChange={(event) => {
                    setNivelRiesgoFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {NIVELES_RIESGO.map(
                    (nivel) => (
                      <MenuItem
                        key={nivel}
                        value={nivel}
                      >
                        {nivel}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {hasFilters && (
              <Grid item xs={12}>
                <Button
                  size="small"
                  onClick={handleClearFilters}
                >
                  Limpiar filtros
                </Button>
              </Grid>
            )}
          </Grid>

          {loading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Cargando resultados...
              </Typography>
            </Box>
          ) : resultados.length === 0 ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 2,
              }}
            >
              <Science
                sx={{
                  fontSize: 68,
                  color: "text.disabled",
                }}
              />

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  No existen simulaciones
                </Typography>

                <Typography color="text.secondary">
                  Ejecuta Monte Carlo desde el módulo
                  de Análisis FAIR.
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Análisis
                      </TableCell>

                      <TableCell>
                        Organización
                      </TableCell>

                      <TableCell align="right">
                        Iteraciones
                      </TableCell>

                      <TableCell align="right">
                        Pérdida media
                      </TableCell>

                      <TableCell align="right">
                        P50
                      </TableCell>

                      <TableCell align="right">
                        P95 / VaR
                      </TableCell>

                      <TableCell>
                        Riesgo
                      </TableCell>

                      <TableCell>
                        Ejecución
                      </TableCell>

                      <TableCell align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {resultados.map(
                      (resultado) => (
                        <TableRow
                          key={resultado.id}
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {
                                resultado.analisisNombre
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Confianza:{" "}
                              {formatNumber(
                                resultado.nivelConfianza
                              )}
                              %
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {
                              resultado.organizacionNombre
                            }
                          </TableCell>

                          <TableCell align="right">
                            {Number(
                              resultado.iteraciones ||
                                0
                            ).toLocaleString(
                              "es-EC"
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {formatCurrency(
                                resultado.perdidaMedia
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              resultado.p50
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={800}
                            >
                              {formatCurrency(
                                resultado.p95 ||
                                  resultado.var
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                resultado.nivelRiesgo ||
                                "Sin clasificar"
                              }
                              color={getRiskColor(
                                resultado.nivelRiesgo
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              resultado.fechaEjecucion
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Tooltip title="Ver detalle">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleOpenDetail(
                                    resultado
                                  )
                                }
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleDelete(
                                    resultado
                                  )
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(
                  event,
                  newPage
                ) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(
                  event
                ) => {
                  setPageSize(
                    Number(
                      event.target.value
                    )
                  );
                  setPage(0);
                }}
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  50,
                ]}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({
                  from,
                  to,
                  count,
                }) =>
                  `${from}-${to} de ${
                    count !== -1
                      ? count
                      : `más de ${to}`
                  }`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      <MonteCarloDetailDialog
        open={detailOpen}
        resultado={selectedResultado}
        loading={loadingDetail}
        error={detailError}
        onClose={handleCloseDetail}
      />

      <DeleteMonteCarloDialog
        open={deleteOpen}
        resultado={selectedResultado}
        loading={deleting}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  );
};

export default MonteCarlo;