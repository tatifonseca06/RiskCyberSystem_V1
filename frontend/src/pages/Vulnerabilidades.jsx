import {
  Add,
  Delete,
  Edit,
  GppMaybe,
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
import { vulnerabilidadesService } from "../api/vulnerabilidadesService";
import VulnerabilidadFormDialog from "../components/vulnerabilidades/VulnerabilidadFormDialog";
import DeleteVulnerabilidadDialog from "../components/vulnerabilidades/DeleteVulnerabilidadDialog";

const SEVERIDADES = [
  "Informativa",
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const ESTADOS_REMEDIACION = [
  "Pendiente",
  "En análisis",
  "En remediación",
  "Mitigada",
  "Remediada",
  "Aceptada",
];

const getSeverityColor = (severity = "") => {
  const normalized = severity
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
    normalized === "alta" ||
    normalized === "high"
  ) {
    return "warning";
  }

  if (
    normalized === "media" ||
    normalized === "medium"
  ) {
    return "info";
  }

  if (
    normalized === "baja" ||
    normalized === "low"
  ) {
    return "success";
  }

  return "default";
};

const getRemediationColor = (status = "") => {
  const normalized = status
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalized.includes("remediada") ||
    normalized.includes("mitigada")
  ) {
    return "success";
  }

  if (
    normalized.includes("remediación") ||
    normalized.includes("análisis")
  ) {
    return "info";
  }

  if (normalized.includes("aceptada")) {
    return "warning";
  }

  if (normalized.includes("pendiente")) {
    return "error";
  }

  return "default";
};

const getCvssColor = (score) => {
  const value = Number(score || 0);

  if (value >= 9) {
    return "error";
  }

  if (value >= 7) {
    return "warning";
  }

  if (value >= 4) {
    return "info";
  }

  return "success";
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

const Vulnerabilidades = () => {
  const [
    vulnerabilidades,
    setVulnerabilidades,
  ] = useState([]);

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

  const [activoFilter, setActivoFilter] =
    useState("");

  const [
    severidadFilter,
    setSeveridadFilter,
  ] = useState("");

  const [
    estadoFilter,
    setEstadoFilter,
  ] = useState("");

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

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    selectedVulnerabilidad,
    setSelectedVulnerabilidad,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Vulnerabilidades | RiskCyberSystem";
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
        const organizacionesData = await vulnerabilidadesService.getOrganizaciones();
        setOrganizaciones(organizacionesData);
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

  const loadVulnerabilidades =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await vulnerabilidadesService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            activo: activoFilter,
            severidad: severidadFilter,
            estadoRemediacion:
              estadoFilter,
          });

        setVulnerabilidades(
          response.results
        );

        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar las vulnerabilidades."
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      pageSize,
      debouncedSearch,
      organizacionFilter,
      activoFilter,
      severidadFilter,
      estadoFilter,
    ]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadVulnerabilidades();
  }, [loadVulnerabilidades]);

  const filteredAssets = useMemo(() => {
    if (!organizacionFilter) {
      return activos;
    }

    return activos.filter((activo) => {
      if (!activo.organizacionId) {
        return true;
      }

      return (
        String(activo.organizacionId) ===
        String(organizacionFilter)
      );
    });
  }, [
    activos,
    organizacionFilter,
  ]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
        organizacionFilter ||
        activoFilter ||
        severidadFilter ||
        estadoFilter
    );
  }, [
    search,
    organizacionFilter,
    activoFilter,
    severidadFilter,
    estadoFilter,
  ]);

  const handleCreate = () => {
    setSelectedVulnerabilidad(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (
    vulnerabilidad
  ) => {
    setSelectedVulnerabilidad(
      vulnerabilidad
    );
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (
    vulnerabilidad
  ) => {
    setSelectedVulnerabilidad(
      vulnerabilidad
    );
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedVulnerabilidad(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedVulnerabilidad(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setActivoFilter("");
    setSeveridadFilter("");
    setEstadoFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedVulnerabilidad?.id) {
        await vulnerabilidadesService.update(
          selectedVulnerabilidad.id,
          payload
        );

        setSuccess(
          "Vulnerabilidad actualizada correctamente."
        );
      } else {
        await vulnerabilidadesService.create(
          payload
        );

        setSuccess(
          "Vulnerabilidad creada correctamente."
        );
      }

      setFormOpen(false);
      setSelectedVulnerabilidad(null);

      await loadVulnerabilidades();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedVulnerabilidad?.id) {
        return;
      }

      setDeleting(true);

      try {
        await vulnerabilidadesService.remove(
          selectedVulnerabilidad.id
        );

        setSuccess(
          "Vulnerabilidad eliminada correctamente."
        );

        setDeleteOpen(false);
        setSelectedVulnerabilidad(null);

        if (
          vulnerabilidades.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadVulnerabilidades();
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
            Vulnerabilidades
          </Typography>

          <Typography color="text.secondary">
            Registra, clasifica y controla la
            remediación de vulnerabilidades.
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
            onClick={loadVulnerabilidades}
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
            Nueva vulnerabilidad
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
                loadVulnerabilidades();
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
                placeholder="Buscar vulnerabilidad o CVE..."
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
                <InputLabel id="vuln-org-filter-label">
                  Organización
                </InputLabel>

                <Select
                  labelId="vuln-org-filter-label"
                  label="Organización"
                  value={organizacionFilter}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setOrganizacionFilter(value);
                    setActivoFilter("");
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
                <InputLabel id="vuln-activo-filter-label">
                  Activo
                </InputLabel>

                <Select
                  labelId="vuln-activo-filter-label"
                  label="Activo"
                  value={activoFilter}
                  onChange={(event) => {
                    setActivoFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {filteredAssets.map(
                    (activo) => (
                      <MenuItem
                        key={activo.id}
                        value={activo.id}
                      >
                        {activo.nombre}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="vuln-severidad-filter-label">
                  Severidad
                </InputLabel>

                <Select
                  labelId="vuln-severidad-filter-label"
                  label="Severidad"
                  value={severidadFilter}
                  onChange={(event) => {
                    setSeveridadFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {SEVERIDADES.map(
                    (severidad) => (
                      <MenuItem
                        key={severidad}
                        value={severidad}
                      >
                        {severidad}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="vuln-estado-filter-label">
                  Estado
                </InputLabel>

                <Select
                  labelId="vuln-estado-filter-label"
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

                  {ESTADOS_REMEDIACION.map(
                    (estado) => (
                      <MenuItem
                        key={estado}
                        value={estado}
                      >
                        {estado}
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
                Cargando vulnerabilidades...
              </Typography>
            </Box>
          ) : vulnerabilidades.length ===
            0 ? (
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
              <GppMaybe
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
                  No existen vulnerabilidades
                </Typography>

                <Typography color="text.secondary">
                  Registra una vulnerabilidad para
                  continuar con la evaluación.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingCatalogs}
              >
                Nueva vulnerabilidad
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vulnerabilidad</TableCell>
                      <TableCell>Organización</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {vulnerabilidades.map((vulnerabilidad) => (
                      <TableRow key={vulnerabilidad.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {vulnerabilidad.nombre}
                          </Typography>
                          {vulnerabilidad.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                maxWidth: 280,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                              {vulnerabilidad.descripcion}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {vulnerabilidad.organizacionNombre}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={vulnerabilidad.categoriaLabel || vulnerabilidad.categoria || "Sin categoría"}
                            color={
                              vulnerabilidad.categoria === "TECNOLOGICA"
                                ? "error"
                                : vulnerabilidad.categoria === "ORGANIZACIONAL"
                                ? "warning"
                                : vulnerabilidad.categoria === "TERCEROS"
                                ? "info"
                                : "default"
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={vulnerabilidad.es_generica ? "Genérica" : "Específica"}
                            color={vulnerabilidad.es_generica ? "default" : "primary"}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(vulnerabilidad)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(vulnerabilidad)}>
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

      <VulnerabilidadFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        vulnerabilidad={selectedVulnerabilidad}
        organizaciones={organizaciones}
        loading={saving}
      />

      <DeleteVulnerabilidadDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={
          handleConfirmDelete
        }
        vulnerabilidad={
          selectedVulnerabilidad
        }
        loading={deleting}
      />
    </Stack>
  );
};

export default Vulnerabilidades;