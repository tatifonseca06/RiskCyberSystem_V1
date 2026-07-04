import {
  Add,
  Delete,
  Edit,
  Refresh,
  Search,
  Security,
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
import { escenariosService } from "../api/escenariosService";
import EscenarioFormDialog from "../components/escenarios/EscenarioFormDialog";
import DeleteEscenarioDialog from "../components/escenarios/DeleteEscenarioDialog";

const NIVELES_RIESGO = [
  "Bajo",
  "Medio",
  "Alto",
  "Crítico",
];

const ESTADOS = [
  "Identificado",
  "En análisis",
  "Evaluado",
  "En tratamiento",
  "Aceptado",
  "Cerrado",
];

const calculateRiskLevel = (
  frequency,
  impact
) => {
  const score =
    Number(frequency || 0) *
    Number(impact || 0);

  if (score >= 20) {
    return "Crítico";
  }

  if (score >= 12) {
    return "Alto";
  }

  if (score >= 6) {
    return "Medio";
  }

  return "Bajo";
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

const getStatusColor = (status = "") => {
  const normalized = status
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalized.includes("cerrado") ||
    normalized.includes("aceptado")
  ) {
    return "success";
  }

  if (
    normalized.includes("tratamiento") ||
    normalized.includes("análisis")
  ) {
    return "info";
  }

  if (normalized.includes("evaluado")) {
    return "primary";
  }

  if (normalized.includes("identificado")) {
    return "warning";
  }

  return "default";
};

const Escenarios = () => {
  const [escenarios, setEscenarios] =
    useState([]);

  const [organizaciones, setOrganizaciones] =
    useState([]);

  const [activos, setActivos] =
    useState([]);

  const [amenazas, setAmenazas] =
    useState([]);

  const [
    vulnerabilidades,
    setVulnerabilidades,
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

  const [activoFilter, setActivoFilter] =
    useState("");

  const [amenazaFilter, setAmenazaFilter] =
    useState("");

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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [
    selectedEscenario,
    setSelectedEscenario,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Escenarios | RiskCyberSystem";
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
          await escenariosService.getCatalogos();

        setOrganizaciones(
          data.organizaciones
        );

        setActivos(data.activos);
        setAmenazas(data.amenazas);

        setVulnerabilidades(
          data.vulnerabilidades
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

  const loadEscenarios = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await escenariosService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            activo: activoFilter,
            amenaza: amenazaFilter,
            nivelRiesgo:
              nivelRiesgoFilter,
            estado: estadoFilter,
          });

        setEscenarios(response.results);
        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar los escenarios."
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
      activoFilter,
      amenazaFilter,
      nivelRiesgoFilter,
      estadoFilter,
    ]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadEscenarios();
  }, [loadEscenarios]);

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

  const filteredThreats = useMemo(() => {
    return amenazas.filter((amenaza) => {
      const organizationMatches =
        !organizacionFilter ||
        !amenaza.organizacionId ||
        String(amenaza.organizacionId) ===
          String(organizacionFilter);

      const assetMatches =
        !activoFilter ||
        !amenaza.activoId ||
        String(amenaza.activoId) ===
          String(activoFilter);

      return organizationMatches && assetMatches;
    });
  }, [
    amenazas,
    organizacionFilter,
    activoFilter,
  ]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
        organizacionFilter ||
        activoFilter ||
        amenazaFilter ||
        nivelRiesgoFilter ||
        estadoFilter
    );
  }, [
    search,
    organizacionFilter,
    activoFilter,
    amenazaFilter,
    nivelRiesgoFilter,
    estadoFilter,
  ]);

  const handleCreate = () => {
    setSelectedEscenario(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (escenario) => {
    setSelectedEscenario(escenario);
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (escenario) => {
    setSelectedEscenario(escenario);
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedEscenario(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedEscenario(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setActivoFilter("");
    setAmenazaFilter("");
    setNivelRiesgoFilter("");
    setEstadoFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedEscenario?.id) {
        await escenariosService.update(
          selectedEscenario.id,
          payload
        );

        setSuccess(
          "Escenario actualizado correctamente."
        );
      } else {
        await escenariosService.create(
          payload
        );

        setSuccess(
          "Escenario creado correctamente."
        );
      }

      setFormOpen(false);
      setSelectedEscenario(null);

      await loadEscenarios();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedEscenario?.id) {
        return;
      }

      setDeleting(true);

      try {
        await escenariosService.remove(
          selectedEscenario.id
        );

        setSuccess(
          "Escenario eliminado correctamente."
        );

        setDeleteOpen(false);
        setSelectedEscenario(null);

        if (
          escenarios.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadEscenarios();
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
            Escenarios de riesgo
          </Typography>

          <Typography color="text.secondary">
            Relaciona activos, amenazas y
            vulnerabilidades para identificar
            eventos de riesgo.
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
            onClick={loadEscenarios}
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
            Nuevo escenario
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
                loadEscenarios();
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
                placeholder="Buscar escenario..."
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
                    setActivoFilter("");
                    setAmenazaFilter("");
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
                <InputLabel>Activo</InputLabel>

                <Select
                  label="Activo"
                  value={activoFilter}
                  onChange={(event) => {
                    setActivoFilter(
                      event.target.value
                    );
                    setAmenazaFilter("");
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
                <InputLabel>Amenaza</InputLabel>

                <Select
                  label="Amenaza"
                  value={amenazaFilter}
                  onChange={(event) => {
                    setAmenazaFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {filteredThreats.map(
                    (amenaza) => (
                      <MenuItem
                        key={amenaza.id}
                        value={amenaza.id}
                      >
                        {amenaza.nombre}
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

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>

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
                Cargando escenarios...
              </Typography>
            </Box>
          ) : escenarios.length === 0 ? (
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
              <Security
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
                  No existen escenarios
                </Typography>

                <Typography color="text.secondary">
                  Registra un escenario para iniciar
                  el análisis de riesgo.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingCatalogs}
              >
                Nuevo escenario
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Escenario
                      </TableCell>

                      <TableCell>
                        Organización
                      </TableCell>

                      <TableCell>
                        Activo
                      </TableCell>

                      <TableCell>
                        Amenaza
                      </TableCell>

                      <TableCell>
                        Vulnerabilidad
                      </TableCell>

                      <TableCell>
                        Frecuencia
                      </TableCell>

                      <TableCell>
                        Impacto
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
                    {escenarios.map(
                      (escenario) => {
                        const riskLevel =
                          escenario.nivelRiesgo ||
                          calculateRiskLevel(
                            escenario.frecuencia,
                            escenario.impacto
                          );

                        return (
                          <TableRow
                            key={escenario.id}
                            hover
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {escenario.nombre}
                              </Typography>

                              {escenario.descripcion && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    maxWidth: 240,
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    escenario.descripcion
                                  }
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              {
                                escenario.organizacionNombre
                              }
                            </TableCell>

                            <TableCell>
                              {
                                escenario.activoNombre
                              }
                            </TableCell>

                            <TableCell>
                              {
                                escenario.amenazaNombre
                              }
                            </TableCell>

                            <TableCell>
                              {
                                escenario.vulnerabilidadNombre
                              }
                            </TableCell>

                            <TableCell>
                              {Number(
                                escenario.frecuencia ||
                                  0
                              ).toLocaleString(
                                "es-EC",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </TableCell>

                            <TableCell>
                              {Number(
                                escenario.impacto ||
                                  0
                              ).toLocaleString(
                                "es-EC",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={riskLevel}
                                color={getRiskColor(
                                  riskLevel
                                )}
                                sx={{
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  escenario.estado ||
                                  "Identificado"
                                }
                                color={getStatusColor(
                                  escenario.estado
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
                                      escenario
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
                                      escenario
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

      <EscenarioFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        escenario={selectedEscenario}
        organizaciones={organizaciones}
        activos={activos}
        amenazas={amenazas}
        vulnerabilidades={
          vulnerabilidades
        }
        loading={saving}
      />

      <DeleteEscenarioDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        escenario={selectedEscenario}
        loading={deleting}
      />
    </Stack>
  );
};

export default Escenarios;