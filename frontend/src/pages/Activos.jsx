import {
  Add,
  Delete,
  Edit,
  Inventory2,
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
import { activosService } from "../api/activosService";
import ActivoFormDialog from "../components/activos/ActivoFormDialog";
import DeleteActivoDialog from "../components/activos/DeleteActivoDialog";

const TIPOS_ACTIVO = [
  "Hardware",
  "Software",
  "Información",
  "Base de datos",
  "Red",
  "Servicio",
  "Proceso",
  "Persona",
  "Instalación",
  "Proveedor",
  "Otro",
];

const NIVELES_CRITICIDAD = [
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const getCriticidadColor = (criticidad = "") => {
  const normalized = criticidad
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
    normalized.includes("alta") ||
    normalized.includes("high")
  ) {
    return "warning";
  }

  if (
    normalized.includes("media") ||
    normalized.includes("medium")
  ) {
    return "info";
  }

  if (
    normalized.includes("baja") ||
    normalized.includes("low")
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

const Activos = () => {
  const [activos, setActivos] =
    useState([]);

  const [organizaciones, setOrganizaciones] =
    useState([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] =
    useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [
    organizacionFilter,
    setOrganizacionFilter,
  ] = useState("");

  const [tipoFilter, setTipoFilter] =
    useState("");

  const [
    criticidadFilter,
    setCriticidadFilter,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    loadingOrganizations,
    setLoadingOrganizations,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedActivo, setSelectedActivo] =
    useState(null);

  useEffect(() => {
    document.title =
      "Activos | RiskCyberSystem";
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const loadOrganizaciones = useCallback(
    async () => {
      setLoadingOrganizations(true);

      try {
        const data =
          await activosService.getOrganizaciones();

        setOrganizaciones(data);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar las organizaciones."
        );
      } finally {
        setLoadingOrganizations(false);
      }
    },
    []
  );

  const loadActivos = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await activosService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            tipo: tipoFilter,
            criticidad:
              criticidadFilter,
          });

        setActivos(response.results);
        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los activos."
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
      tipoFilter,
      criticidadFilter,
    ]
  );

  useEffect(() => {
    loadOrganizaciones();
  }, [loadOrganizaciones]);

  useEffect(() => {
    loadActivos();
  }, [loadActivos]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
      organizacionFilter ||
      tipoFilter ||
      criticidadFilter
    );
  }, [
    search,
    organizacionFilter,
    tipoFilter,
    criticidadFilter,
  ]);

  const handleCreate = () => {
    setSelectedActivo(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (activo) => {
    setSelectedActivo(activo);
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (activo) => {
    setSelectedActivo(activo);
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedActivo(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedActivo(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setTipoFilter("");
    setCriticidadFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedActivo?.id) {
        await activosService.update(
          selectedActivo.id,
          payload
        );

        setSuccess(
          "Activo actualizado correctamente."
        );
      } else {
        await activosService.create(payload);

        setSuccess(
          "Activo creado correctamente."
        );
      }

      setFormOpen(false);
      setSelectedActivo(null);

      await loadActivos();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivo?.id) {
      return;
    }

    setDeleting(true);

    try {
      await activosService.remove(
        selectedActivo.id
      );

      setSuccess(
        "Activo eliminado correctamente."
      );

      setDeleteOpen(false);
      setSelectedActivo(null);

      if (
        activos.length === 1 &&
        page > 0
      ) {
        setPage((current) => current - 1);
      } else {
        await loadActivos();
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
          justifyContent: "space-between",
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
            Activos
          </Typography>

          <Typography color="text.secondary">
            Identifica y clasifica los activos de
            información de cada organización.
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
            onClick={loadActivos}
            disabled={loading}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            disabled={loadingOrganizations}
          >
            Nuevo activo
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
              onClick={loadActivos}
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
                placeholder="Buscar activo..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
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

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="filtro-organizacion-label">
                  Organización
                </InputLabel>

                <Select
                  labelId="filtro-organizacion-label"
                  label="Organización"
                  value={organizacionFilter}
                  onChange={(event) => {
                    setOrganizacionFilter(
                      event.target.value
                    );
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

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel id="filtro-tipo-label">
                  Tipo
                </InputLabel>

                <Select
                  labelId="filtro-tipo-label"
                  label="Tipo"
                  value={tipoFilter}
                  onChange={(event) => {
                    setTipoFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {TIPOS_ACTIVO.map((tipo) => (
                    <MenuItem
                      key={tipo}
                      value={tipo}
                    >
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel id="filtro-criticidad-label">
                  Criticidad
                </InputLabel>

                <Select
                  labelId="filtro-criticidad-label"
                  label="Criticidad"
                  value={criticidadFilter}
                  onChange={(event) => {
                    setCriticidadFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {NIVELES_CRITICIDAD.map(
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
                Cargando activos...
              </Typography>
            </Box>
          ) : activos.length === 0 ? (
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
              <Inventory2
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
                  No existen activos
                </Typography>

                <Typography color="text.secondary">
                  Registra el primer activo para
                  iniciar el análisis de riesgos.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingOrganizations}
              >
                Nuevo activo
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Activo
                      </TableCell>

                      <TableCell>
                        Organización
                      </TableCell>

                      <TableCell>
                        Tipo
                      </TableCell>

                      <TableCell>
                        Criticidad
                      </TableCell>

                      <TableCell>
                        CIA
                      </TableCell>

                      <TableCell align="right">
                        Valor
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
                    {activos.map((activo) => {
                      const ciaAverage = (
                        (
                          Number(
                            activo.confidencialidad ||
                              0
                          ) +
                          Number(
                            activo.integridad || 0
                          ) +
                          Number(
                            activo.disponibilidad ||
                              0
                          )
                        ) /
                        3
                      ).toFixed(1);

                      return (
                        <TableRow
                          key={activo.id}
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {activo.nombre}
                            </Typography>

                            {activo.propietario && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Responsable:{" "}
                                {activo.propietario}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {
                              activo.organizacionNombre
                            }
                          </TableCell>

                          <TableCell>
                            {activo.tipo ||
                              "Sin clasificar"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                activo.criticidad ||
                                "Sin definir"
                              }
                              color={getCriticidadColor(
                                activo.criticidad
                              )}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Tooltip
                              title={`Confidencialidad: ${activo.confidencialidad} | Integridad: ${activo.integridad} | Disponibilidad: ${activo.disponibilidad}`}
                            >
                              <Chip
                                size="small"
                                label={`${ciaAverage}/5`}
                                color={
                                  Number(
                                    ciaAverage
                                  ) >= 4
                                    ? "error"
                                    : Number(
                                        ciaAverage
                                      ) >= 3
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </Tooltip>
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              activo.valor
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                activo.estado
                                  ? "Activo"
                                  : "Inactivo"
                              }
                              color={
                                activo.estado
                                  ? "success"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Tooltip title="Editar">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleEdit(
                                    activo
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
                                    activo
                                  )
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      <ActivoFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        activo={selectedActivo}
        organizaciones={organizaciones}
        loading={saving}
      />

      <DeleteActivoDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        activo={selectedActivo}
        loading={deleting}
      />
    </Stack>
  );
};

export default Activos;