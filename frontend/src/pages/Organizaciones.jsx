import {
  Add,
  Business,
  Delete,
  Edit,
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
  IconButton,
  InputAdornment,
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
  useState,
} from "react";
import { organizacionesService } from "../api/organizacionesService";
import DeleteOrganizacionDialog from "../components/organizaciones/DeleteOrganizacionDialog";
import OrganizacionFormDialog from "../components/organizaciones/OrganizacionFormDialog";

const Organizaciones = () => {
  const [organizaciones, setOrganizaciones] =
    useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] =
    useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

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
    selectedOrganizacion,
    setSelectedOrganizacion,
  ] = useState(null);

  useEffect(() => {
    document.title =
      "Organizaciones | RiskCyberSystem";
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
      setLoading(true);
      setError("");

      try {
        const response =
          await organizacionesService.getAll({
            page: page + 1,
            pageSize,
            search: debouncedSearch,
          });

        setOrganizaciones(
          response.results
        );

        setTotal(response.count);
      } catch (requestError) {
        setError(
          requestError.message ||
            "No fue posible cargar las organizaciones."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      pageSize,
      debouncedSearch,
    ]
  );

  useEffect(() => {
    loadOrganizaciones();
  }, [loadOrganizaciones]);

  const handleCreate = () => {
    setSelectedOrganizacion(null);
    setSuccess("");
    setFormOpen(true);
  };

  const handleEdit = (organizacion) => {
    setSelectedOrganizacion(
      organizacion
    );
    setSuccess("");
    setFormOpen(true);
  };

  const handleDelete = (
    organizacion
  ) => {
    setSelectedOrganizacion(
      organizacion
    );
    setSuccess("");
    setDeleteOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setSelectedOrganizacion(null);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteOpen(false);
    setSelectedOrganizacion(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);

    try {
      if (selectedOrganizacion?.id) {
        await organizacionesService.update(
          selectedOrganizacion.id,
          payload
        );

        setSuccess(
          "Organización actualizada correctamente."
        );
      } else {
        await organizacionesService.create(
          payload
        );

        setSuccess(
          "Organización creada correctamente."
        );
      }

      setFormOpen(false);
      setSelectedOrganizacion(null);
      await loadOrganizaciones();
    } catch (requestError) {
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedOrganizacion?.id) {
        return;
      }

      setDeleting(true);

      try {
        await organizacionesService.remove(
          selectedOrganizacion.id
        );

        setSuccess(
          "Organización eliminada correctamente."
        );

        setDeleteOpen(false);
        setSelectedOrganizacion(null);

        if (
          organizaciones.length === 1 &&
          page > 0
        ) {
          setPage((current) => current - 1);
        } else {
          await loadOrganizaciones();
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
            Organizaciones
          </Typography>

          <Typography color="text.secondary">
            Administra las organizaciones
            evaluadas en RiskCyberSystem.
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
            onClick={loadOrganizaciones}
            disabled={loading}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Nueva organización
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
              onClick={loadOrganizaciones}
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
          <TextField
            fullWidth
            placeholder="Buscar por nombre, identificación o sector..."
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
            sx={{ mb: 3 }}
          />

          {loading ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Cargando organizaciones...
              </Typography>
            </Box>
          ) : organizaciones.length ===
            0 ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textAlign: "center",
              }}
            >
              <Business
                sx={{
                  fontSize: 64,
                  color: "text.disabled",
                }}
              />

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  No existen organizaciones
                </Typography>

                <Typography color="text.secondary">
                  Crea la primera organización
                  para comenzar la evaluación de
                  riesgos.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
              >
                Nueva organización
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Organización
                      </TableCell>

                      <TableCell>
                        Identificación
                      </TableCell>

                      <TableCell>
                        Sector
                      </TableCell>

                      <TableCell>
                        Contacto
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
                    {organizaciones.map(
                      (organizacion) => (
                        <TableRow
                          key={organizacion.id}
                          hover
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {organizacion.nombre ||
                                organizacion.nombre_organizacion ||
                                "Sin nombre"}
                            </Typography>

                            {organizacion.descripcion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  maxWidth: 260,
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  organizacion.descripcion
                                }
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {organizacion.identificacion ||
                              organizacion.ruc ||
                              "No registrada"}
                          </TableCell>

                          <TableCell>
                            {organizacion.sector ||
                              "No especificado"}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {organizacion.email ||
                                organizacion.correo ||
                                "Sin correo"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {organizacion.telefono ||
                                "Sin teléfono"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                organizacion.estado ===
                                  false ||
                                organizacion.activo ===
                                  false
                                  ? "Inactiva"
                                  : "Activa"
                              }
                              color={
                                organizacion.estado ===
                                  false ||
                                organizacion.activo ===
                                  false
                                  ? "default"
                                  : "success"
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
                                    organizacion
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
                                    organizacion
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

      <OrganizacionFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSave}
        organizacion={
          selectedOrganizacion
        }
        loading={saving}
      />

      <DeleteOrganizacionDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={
          handleConfirmDelete
        }
        organizacion={
          selectedOrganizacion
        }
        loading={deleting}
      />
    </Stack>
  );
};

export default Organizaciones;