import {
  Add,
  Analytics,
  Delete,
  Edit,
  PlayArrow,
  Refresh,
  Search,
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
import { analisisService } from "../api/analisisService";
import AnalisisFormDialog from "../components/analisis/AnalisisFormDialog";
import DeleteAnalisisDialog from "../components/analisis/DeleteAnalisisDialog";
import MonteCarloDialog from "../components/analisis/MonteCarloDialog";

const NIVELES_RIESGO = [
  "Bajo",
  "Medio",
  "Alto",
  "Crítico",
];

const ESTADOS = [
  "Borrador",
  "En análisis",
  "Completado",
  "Aprobado",
  "Archivado",
];

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

const getStatusColor = (status = "") => {
  const normalized = status
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalized.includes("aprobado") ||
    normalized.includes("completado")
  ) {
    return "success";
  }

  if (normalized.includes("análisis")) {
    return "info";
  }

  if (normalized.includes("borrador")) {
    return "warning";
  }

  if (normalized.includes("archivado")) {
    return "default";
  }

  return "primary";
};

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

const Analisis = () => {
  const [analisis, setAnalisis] =
    useState([]);

  const [
    organizaciones,
    setOrganizaciones,
  ] = useState([]);

  const [escenarios, setEscenarios] =
    useState([]);

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
    escenarioFilter,
    setEscenarioFilter,
  ] = useState("");

  const [
    nivelRiesgoFilter,
    setNivelRiesgoFilter,
  ] = useState("");

  const [estadoFilter, setEstadoFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    loadingCatalogs,
    setLoadingCatalogs,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    executingMonteCarlo,
    setExecutingMonteCarlo,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    monteCarloOpen,
    setMonteCarloOpen,
  ] = useState(false);

  const [
    selectedAnalisis,
    setSelectedAnalisis,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Análisis FAIR | RiskCyberSystem";
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
          await analisisService.getCatalogos();

        setOrganizaciones(
          data.organizaciones
        );

        setEscenarios(data.escenarios);
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

  const loadAnalisis = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await analisisService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            escenario: escenarioFilter,
            nivelRiesgo:
              nivelRiesgoFilter,
            estado: estadoFilter,
          });

        setAnalisis(response.results);
        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los análisis."
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
      escenarioFilter,
      nivelRiesgoFilter,
      estadoFilter,
    ]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadAnalisis();
  }, [loadAnalisis]);

  const filteredScenarios = useMemo(() => {
    if (!organizacionFilter) {
      return escenarios;
    }

    return escenarios.filter(
      (escenario) => {
        if (!escenario.organizacionId) {
          return true;
        }

        return (
          String(
            escenario.organizacionId
          ) ===
          String(organizacionFilter)
        );
      }
    );
  }, [
    escenarios,
    organizacionFilter,
  ]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
        organizacionFilter ||
        escenarioFilter ||
        nivelRiesgoFilter ||
        estadoFilter
    );
  }, [
    search,
    organizacionFilter,
    escenarioFilter,
    nivelRiesgoFilter,
    estadoFilter,
  ]);

  const handleCreate = () => {
    setSelectedAnalisis(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedAnalisis(item);
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedAnalisis(item);
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleMonteCarlo = (item) => {
    setSelectedAnalisis(item);
    setSuccess("");
    setMonteCarloOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedAnalisis(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedAnalisis(null);
  };

  const handleCloseMonteCarlo = () => {
    if (executingMonteCarlo) {
      return;
    }

    setMonteCarloOpen(false);
    setSelectedAnalisis(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setEscenarioFilter("");
    setNivelRiesgoFilter("");
    setEstadoFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedAnalisis?.id) {
        await analisisService.update(
          selectedAnalisis.id,
          payload
        );

        setSuccess(
          "Análisis actualizado correctamente."
        );
      } else {
        await analisisService.create(
          payload
        );

        setSuccess(
          "Análisis creado correctamente."
        );
      }

      setFormOpen(false);
      setSelectedAnalisis(null);

      await loadAnalisis();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedAnalisis?.id) {
        return;
      }

      setDeleting(true);

      try {
        await analisisService.remove(
          selectedAnalisis.id
        );

        setSuccess(
          "Análisis eliminado correctamente."
        );

        setDeleteOpen(false);
        setSelectedAnalisis(null);

        if (
          analisis.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadAnalisis();
        }
      } catch (requestError) {
        throw requestError;
      } finally {
        setDeleting(false);
      }
    };

  const handleExecuteMonteCarlo =
    async ({
      iteraciones,
      nivelConfianza,
    }) => {
      if (!selectedAnalisis?.id) {
        return;
      }

      setExecutingMonteCarlo(true);

      try {
        await analisisService.ejecutarMonteCarlo(
          selectedAnalisis.id,
          {
            iteraciones,
            nivelConfianza,
          }
        );

        setSuccess(
          "Simulación Monte Carlo ejecutada correctamente."
        );

        setMonteCarloOpen(false);
        setSelectedAnalisis(null);

        await loadAnalisis();
      } catch (requestError) {
        throw requestError;
      } finally {
        setExecutingMonteCarlo(false);
      }
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
            Análisis FAIR
          </Typography>

          <Typography color="text.secondary">
            Cuantifica la frecuencia y magnitud
            económica de los escenarios de riesgo.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAnalisis}
            disabled={loading}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            disabled={loadingCatalogs}
          >
            Nuevo análisis
          </Button>
        </Stack>
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
                loadAnalisis();
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
                placeholder="Buscar análisis..."
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Organización
                </InputLabel>

                <Select
                  label="Organización"
                  value={organizacionFilter}
                  onChange={(event) => {
                    setOrganizacionFilter(
                      event.target.value
                    );
                    setEscenarioFilter("");
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Escenario
                </InputLabel>

                <Select
                  label="Escenario"
                  value={escenarioFilter}
                  onChange={(event) => {
                    setEscenarioFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {filteredScenarios.map(
                    (escenario) => (
                      <MenuItem
                        key={escenario.id}
                        value={escenario.id}
                      >
                        {escenario.nombre}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Nivel de riesgo
                </InputLabel>

                <Select
                  label="Nivel de riesgo"
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Estado
                </InputLabel>

                <Select
                  label="Estado"
                  value={estadoFilter}
                  onChange={(event) => {
                    setEstadoFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {ESTADOS.map((estado) => (
                    <MenuItem
                      key={estado}
                      value={estado}
                    >
                      {estado}
                    </MenuItem>
                  ))}
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
                Cargando análisis FAIR...
              </Typography>
            </Box>
          ) : analisis.length === 0 ? (
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
              <Analytics
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
                  No existen análisis FAIR
                </Typography>

                <Typography color="text.secondary">
                  Crea un análisis para cuantificar
                  un escenario de riesgo.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingCatalogs}
              >
                Nuevo análisis
              </Button>
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

                      <TableCell>
                        Escenario
                      </TableCell>

                      <TableCell align="right">
                        LEF esperada
                      </TableCell>

                      <TableCell align="right">
                        LM esperada
                      </TableCell>

                      <TableCell align="right">
                        Pérdida anual
                      </TableCell>

                      <TableCell>
                        Riesgo
                      </TableCell>

                      <TableCell>
                        Estado
                      </TableCell>

                      <TableCell align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {analisis.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {item.nombre}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {item.iteraciones.toLocaleString(
                              "es-EC"
                            )}{" "}
                            iteraciones
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {
                            item.organizacionNombre
                          }
                        </TableCell>

                        <TableCell>
                          {
                            item.escenarioNombre
                          }
                        </TableCell>

                        <TableCell align="right">
                          {formatNumber(
                            item.lefExpected
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(
                            item.lmExpected
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={800}
                          >
                            {formatCurrency(
                              item.perdidaAnualEsperada
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              item.nivelRiesgo ||
                              "Sin clasificar"
                            }
                            color={getRiskColor(
                              item.nivelRiesgo
                            )}
                            sx={{
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={item.estado}
                            color={getStatusColor(
                              item.estado
                            )}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Ejecutar Monte Carlo">
                            <IconButton
                              color="secondary"
                              onClick={() =>
                                handleMonteCarlo(
                                  item
                                )
                              }
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleEdit(item)
                              }
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDelete(item)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
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

      <AnalisisFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        analisis={selectedAnalisis}
        organizaciones={organizaciones}
        escenarios={escenarios}
        loading={saving}
      />

      <DeleteAnalisisDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        analisis={selectedAnalisis}
        loading={deleting}
      />

      <MonteCarloDialog
        open={monteCarloOpen}
        onClose={handleCloseMonteCarlo}
        onExecute={
          handleExecuteMonteCarlo
        }
        analisis={selectedAnalisis}
        loading={executingMonteCarlo}
      />
    </Stack>
  );
};

export default Analisis;