import {
  Add,
  Delete,
  Edit,
  Refresh,
  Search,
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
import { amenazasService } from "../api/amenazasService";
import AmenazaFormDialog from "../components/amenazas/AmenazaFormDialog";
import DeleteAmenazaDialog from "../components/amenazas/DeleteAmenazaDialog";

const CATEGORIAS = [
  "Malware",
  "Ransomware",
  "Phishing",
  "Ingeniería social",
  "Acceso no autorizado",
  "Fuga de información",
  "Denegación de servicio",
  "Amenaza interna",
  "Fraude",
  "Error humano",
  "Falla tecnológica",
  "Desastre natural",
  "Cadena de suministro",
  "Otro",
];

const ORIGENES = [
  "Externo",
  "Interno",
  "Tercero",
  "Ambiental",
  "Tecnológico",
  "Humano",
  "Mixto",
];

const PROBABILIDADES = [
  "Muy baja",
  "Baja",
  "Media",
  "Alta",
  "Muy alta",
];

const getProbabilityColor = (
  probability = ""
) => {
  const normalized = probability
    .toString()
    .trim()
    .toLowerCase();

  if (
    normalized.includes("muy alta") ||
    normalized.includes("very high")
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
    normalized.includes("muy baja") ||
    normalized === "low"
  ) {
    return "success";
  }

  return "default";
};

const getImpactColor = (impact = "") => {
  const normalized = impact
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
    normalized.includes("bajo") ||
    normalized === "low"
  ) {
    return "success";
  }

  return "default";
};

const formatFrequency = (value) => {
  const frequency = Number(value || 0);

  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: 2,
  }).format(frequency);
};

const Amenazas = () => {
  const [amenazas, setAmenazas] =
    useState([]);

  const [organizaciones, setOrganizaciones] =
    useState([]);

  const [activos, setActivos] =
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

  const [
    categoriaFilter,
    setCategoriaFilter,
  ] = useState("");

  const [origenFilter, setOrigenFilter] =
    useState("");

  const [
    probabilidadFilter,
    setProbabilidadFilter,
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
    selectedAmenaza,
    setSelectedAmenaza,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Amenazas | RiskCyberSystem";
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
        const [
          organizacionesData,
          activosData,
        ] = await Promise.all([
          amenazasService.getOrganizaciones(),
          amenazasService.getActivos(),
        ]);

        setOrganizaciones(
          organizacionesData
        );

        setActivos(activosData);
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

  const loadAmenazas = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await amenazasService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
            organizacion:
              organizacionFilter,
            categoria: categoriaFilter,
            origen: origenFilter,
            probabilidad:
              probabilidadFilter,
          });

        setAmenazas(response.results);
        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar las amenazas."
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
      categoriaFilter,
      origenFilter,
      probabilidadFilter,
    ]
  );

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadAmenazas();
  }, [loadAmenazas]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search ||
        organizacionFilter ||
        categoriaFilter ||
        origenFilter ||
        probabilidadFilter
    );
  }, [
    search,
    organizacionFilter,
    categoriaFilter,
    origenFilter,
    probabilidadFilter,
  ]);

  const handleCreate = () => {
    setSelectedAmenaza(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (amenaza) => {
    setSelectedAmenaza(amenaza);
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (amenaza) => {
    setSelectedAmenaza(amenaza);
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedAmenaza(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedAmenaza(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrganizacionFilter("");
    setCategoriaFilter("");
    setOrigenFilter("");
    setProbabilidadFilter("");
    setPage(0);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedAmenaza?.id) {
        await amenazasService.update(
          selectedAmenaza.id,
          payload
        );

        setSuccess(
          "Amenaza actualizada correctamente."
        );
      } else {
        await amenazasService.create(
          payload
        );

        setSuccess(
          "Amenaza creada correctamente."
        );
      }

      setFormOpen(false);
      setSelectedAmenaza(null);

      await loadAmenazas();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedAmenaza?.id) {
        return;
      }

      setDeleting(true);

      try {
        await amenazasService.remove(
          selectedAmenaza.id
        );

        setSuccess(
          "Amenaza eliminada correctamente."
        );

        setDeleteOpen(false);
        setSelectedAmenaza(null);

        if (
          amenazas.length === 1 &&
          page > 0
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1
          );
        } else {
          await loadAmenazas();
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
            Amenazas
          </Typography>

          <Typography color="text.secondary">
            Registra y clasifica los eventos que
            podrían afectar los activos de la
            organización.
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
            onClick={loadAmenazas}
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
            Nueva amenaza
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
                loadAmenazas();
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
                placeholder="Buscar amenaza..."
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
                <InputLabel id="amenazas-organizacion-filter-label">
                  Organización
                </InputLabel>

                <Select
                  labelId="amenazas-organizacion-filter-label"
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="amenazas-categoria-filter-label">
                  Categoría
                </InputLabel>

                <Select
                  labelId="amenazas-categoria-filter-label"
                  label="Categoría"
                  value={categoriaFilter}
                  onChange={(event) => {
                    setCategoriaFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {CATEGORIAS.map(
                    (categoria) => (
                      <MenuItem
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="amenazas-origen-filter-label">
                  Origen
                </InputLabel>

                <Select
                  labelId="amenazas-origen-filter-label"
                  label="Origen"
                  value={origenFilter}
                  onChange={(event) => {
                    setOrigenFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todos
                  </MenuItem>

                  {ORIGENES.map((origen) => (
                    <MenuItem
                      key={origen}
                      value={origen}
                    >
                      {origen}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="amenazas-probabilidad-filter-label">
                  Probabilidad
                </InputLabel>

                <Select
                  labelId="amenazas-probabilidad-filter-label"
                  label="Probabilidad"
                  value={probabilidadFilter}
                  onChange={(event) => {
                    setProbabilidadFilter(
                      event.target.value
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    Todas
                  </MenuItem>

                  {PROBABILIDADES.map(
                    (probabilidad) => (
                      <MenuItem
                        key={probabilidad}
                        value={probabilidad}
                      >
                        {probabilidad}
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
                Cargando amenazas...
              </Typography>
            </Box>
          ) : amenazas.length === 0 ? (
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
              <WarningAmber
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
                  No existen amenazas
                </Typography>

                <Typography color="text.secondary">
                  Registra la primera amenaza para
                  continuar con la evaluación.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                disabled={loadingCatalogs}
              >
                Nueva amenaza
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Amenaza
                      </TableCell>

                      <TableCell>
                        Organización
                      </TableCell>

                      <TableCell>
                        Activo
                      </TableCell>

                      <TableCell>
                        Categoría
                      </TableCell>

                      <TableCell>
                        Origen
                      </TableCell>

                      <TableCell>
                        Probabilidad
                      </TableCell>

                      <TableCell>
                        Impacto
                      </TableCell>

                      <TableCell align="right">
                        Frecuencia anual
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
                    {amenazas.map(
                      (amenaza) => (
                        <TableRow
                          key={amenaza.id}
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {amenaza.nombre}
                            </Typography>

                            {amenaza.descripcion && (
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
                                  amenaza.descripcion
                                }
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {
                              amenaza.organizacionNombre
                            }
                          </TableCell>

                          <TableCell>
                            {amenaza.activoNombre}
                          </TableCell>

                          <TableCell>
                            {amenaza.categoria ||
                              "Sin categoría"}
                          </TableCell>

                          <TableCell>
                            {amenaza.origen ||
                              "Sin origen"}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                amenaza.probabilidad ||
                                "Sin definir"
                              }
                              color={getProbabilityColor(
                                amenaza.probabilidad
                              )}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                amenaza.impacto ||
                                "Sin definir"
                              }
                              color={getImpactColor(
                                amenaza.impacto
                              )}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell align="right">
                            {formatFrequency(
                              amenaza.frecuenciaAnual
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                amenaza.estado
                                  ? "Activa"
                                  : "Inactiva"
                              }
                              color={
                                amenaza.estado
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
                                    amenaza
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
                                    amenaza
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

      <AmenazaFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        amenaza={selectedAmenaza}
        organizaciones={organizaciones}
        activos={activos}
        loading={saving}
      />

      <DeleteAmenazaDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        amenaza={selectedAmenaza}
        loading={deleting}
      />
    </Stack>
  );
};

export default Amenazas;