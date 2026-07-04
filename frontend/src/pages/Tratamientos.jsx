import {
  Add,
  Delete,
  Edit,
  Refresh,
  Search,
  Shield,
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
  LinearProgress,
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
import { tratamientosService } from "../api/tratamientosService";
import TratamientoFormDialog from "../components/tratamientos/TratamientoFormDialog";
import DeleteTratamientoDialog from "../components/tratamientos/DeleteTratamientoDialog";

const ESTRATEGIAS = [
  "Mitigar",
  "Aceptar",
  "Transferir",
  "Evitar",
];

const PRIORIDADES = [
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const ESTADOS = [
  "Planificado",
  "En ejecución",
  "Pausado",
  "Completado",
  "Cancelado",
];

const getStrategyColor = (strategy = "") => {
  const normalized = strategy
    .toString()
    .toLowerCase();

  if (normalized.includes("mitigar")) {
    return "primary";
  }

  if (normalized.includes("aceptar")) {
    return "warning";
  }

  if (normalized.includes("transferir")) {
    return "info";
  }

  if (normalized.includes("evitar")) {
    return "error";
  }

  return "default";
};

const getPriorityColor = (priority = "") => {
  const normalized = priority
    .toString()
    .toLowerCase();

  if (
    normalized.includes("crít") ||
    normalized.includes("critic")
  ) {
    return "error";
  }

  if (normalized.includes("alta")) {
    return "warning";
  }

  if (normalized.includes("media")) {
    return "info";
  }

  if (normalized.includes("baja")) {
    return "success";
  }

  return "default";
};

const getStatusColor = (status = "") => {
  const normalized = status
    .toString()
    .toLowerCase();

  if (normalized.includes("completado")) {
    return "success";
  }

  if (normalized.includes("ejecución")) {
    return "primary";
  }

  if (normalized.includes("pausado")) {
    return "warning";
  }

  if (normalized.includes("cancelado")) {
    return "error";
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

  const date = new Date(
    `${value}`.includes("T")
      ? value
      : `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
  }).format(date);
};

const isOverdue = (treatment) => {
  if (
    !treatment.fechaLimite ||
    treatment.estado === "Completado" ||
    treatment.estado === "Cancelado"
  ) {
    return false;
  }

  const dueDate = new Date(
    `${treatment.fechaLimite}T23:59:59`
  );

  return dueDate.getTime() < Date.now();
};

const Tratamientos = () => {
  const [
    tratamientos,
    setTratamientos,
  ] = useState([]);

  const [
    organizaciones,
    setOrganizaciones,
  ] = useState([]);

  const [analisis, setAnalisis] =
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
    analisisFilter,
    setAnalisisFilter,
  ] = useState("");

  const [
    estrategiaFilter,
    setEstrategiaFilter,
  ] = useState("");

  const [
    prioridadFilter,
    setPrioridadFilter,
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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    selectedTratamiento,
    setSelectedTratamiento,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Tratamientos | RiskCyberSystem";
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
          await tratamientosService.getCatalogos();

        setOrganizaciones(
          data.organizaciones
        );

        setAnalisis(data.analisis);
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

  const loadTratamientos = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await tratamientosService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            analisis: analisisFilter,
            estrategia:
              estrategiaFilter,
            prioridad:
              prioridadFilter,
            estado: estadoFilter,
          });

        setTratamientos(
          response.results
        );

        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los tratamientos."
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
      estrategiaFilter,
      prioridadFilter,
      estadoFilter,
    ]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadTratamientos();
  }, [loadTratamientos]);

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
        estrategiaFilter ||
        prioridadFilter ||
        estadoFilter
    );
  }, [
    search,
    organizacionFilter,
    analisisFilter,
    estrategiaFilter,
    prioridadFilter,
    estadoFilter,
  ]);

  const handleCreate = () => {
    setSelectedTratamiento(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (tratamiento) => {
    setSelectedTratamiento(
      tratamiento
    );

    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (tratamiento) => {
    setSelectedTratamiento(
      tratamiento
    );

    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedTratamiento(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedTratamiento(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setAnalisisFilter("");
    setEstrategiaFilter("");
    setPrioridadFilter("");
    setEstadoFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedTratamiento?.id) {
        await tratamientosService.update(
          selectedTratamiento.id,
          payload
        );

        setSuccess(
          "Tratamiento actualizado correctamente."
        );
      } else {
        await tratamientosService.create(
          payload
        );

        setSuccess(
          "Tratamiento creado correctamente."
        );
      }

      setFormOpen(false);
      setSelectedTratamiento(null);

      await loadTratamientos();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedTratamiento?.id) {
        return;
      }

      setDeleting(true);

      try {
        await tratamientosService.remove(
          selectedTratamiento.id
        );

        setSuccess(
          "Tratamiento eliminado correctamente."
        );

        setDeleteOpen(false);
        setSelectedTratamiento(null);

        if (
          tratamientos.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadTratamientos();
        }
      } catch (requestError) {
        throw requestError;
      } finally {
        setDeleting(false);
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
            Tratamientos de riesgo
          </Typography>

          <Typography color="text.secondary">
            Define acciones para mitigar, aceptar,
            transferir o evitar los riesgos
            identificados.
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
            onClick={loadTratamientos}
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
            Nuevo tratamiento
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
                loadTratamientos();
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
                placeholder="Buscar tratamiento o responsable..."
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Análisis
                </InputLabel>

                <Select
                  label="Análisis"
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Estrategia
                </InputLabel>

                <Select
                  label="Estrategia"
                  value={estrategiaFilter}
                  onChange={(event) => {
                    setEstrategiaFilter(
                      event.target.value
                    );

                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {ESTRATEGIAS.map(
                    (estrategia) => (
                      <MenuItem
                        key={estrategia}
                        value={estrategia}
                      >
                        {estrategia}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Prioridad
                </InputLabel>

                <Select
                  label="Prioridad"
                  value={prioridadFilter}
                  onChange={(event) => {
                    setPrioridadFilter(
                      event.target.value
                    );

                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {PRIORIDADES.map(
                    (prioridad) => (
                      <MenuItem
                        key={prioridad}
                        value={prioridad}
                      >
                        {prioridad}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
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
                Cargando tratamientos...
              </Typography>
            </Box>
          ) : tratamientos.length === 0 ? (
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
              <Shield
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
                  No existen tratamientos
                </Typography>

                <Typography color="text.secondary">
                  Crea un plan de respuesta para los
                  riesgos cuantificados.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingCatalogs}
              >
                Nuevo tratamiento
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Tratamiento
                      </TableCell>

                      <TableCell>
                        Análisis
                      </TableCell>

                      <TableCell>
                        Estrategia
                      </TableCell>

                      <TableCell>
                        Responsable
                      </TableCell>

                      <TableCell>
                        Prioridad
                      </TableCell>

                      <TableCell>
                        Avance
                      </TableCell>

                      <TableCell align="right">
                        Presupuesto
                      </TableCell>

                      <TableCell align="right">
                        Riesgo residual
                      </TableCell>

                      <TableCell>
                        Fecha límite
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
                    {tratamientos.map(
                      (tratamiento) => {
                        const overdue =
                          isOverdue(tratamiento);

                        return (
                          <TableRow
                            key={tratamiento.id}
                            hover
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {
                                  tratamiento.nombre
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  tratamiento.organizacionNombre
                                }
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {
                                tratamiento.analisisNombre
                              }
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  tratamiento.estrategia
                                }
                                color={getStrategyColor(
                                  tratamiento.estrategia
                                )}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {tratamiento.responsable ||
                                "Sin asignar"}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  tratamiento.prioridad
                                }
                                color={getPriorityColor(
                                  tratamiento.prioridad
                                )}
                              />
                            </TableCell>

                            <TableCell>
                              <Box
                                sx={{
                                  minWidth: 110,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                >
                                  {
                                    tratamiento.porcentajeAvance
                                  }
                                  %
                                </Typography>

                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        tratamiento.porcentajeAvance
                                      )
                                    )
                                  )}
                                  color={
                                    tratamiento.porcentajeAvance >=
                                    100
                                      ? "success"
                                      : "primary"
                                  }
                                  sx={{
                                    mt: 0.5,
                                    height: 7,
                                    borderRadius: 10,
                                  }}
                                />
                              </Box>
                            </TableCell>

                            <TableCell align="right">
                              {formatCurrency(
                                tratamiento.presupuesto
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={800}
                              >
                                {formatCurrency(
                                  tratamiento.riesgoResidual
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                color={
                                  overdue
                                    ? "error.main"
                                    : "text.primary"
                                }
                                fontWeight={
                                  overdue
                                    ? 800
                                    : 400
                                }
                              >
                                {formatDate(
                                  tratamiento.fechaLimite
                                )}
                              </Typography>

                              {overdue && (
                                <Typography
                                  variant="caption"
                                  color="error.main"
                                >
                                  Vencido
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  tratamiento.estado
                                }
                                color={getStatusColor(
                                  tratamiento.estado
                                )}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell align="right">
                              <Tooltip title="Editar">
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleEdit(
                                      tratamiento
                                    )
                                  }
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleDelete(
                                      tratamiento
                                    )
                                  }
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      }
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

      <TratamientoFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        tratamiento={
          selectedTratamiento
        }
        organizaciones={organizaciones}
        analisis={analisis}
        loading={saving}
      />

      <DeleteTratamientoDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        tratamiento={
          selectedTratamiento
        }
        loading={deleting}
      />
    </Stack>
  );
};

export default Tratamientos;