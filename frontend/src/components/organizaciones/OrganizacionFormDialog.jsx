import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";

const INITIAL_FORM = {
  nombre: "",
  identificacion: "",
  sector: "",
  email: "",
  telefono: "",
  direccion: "",
  descripcion: "",
  estado: true,
};

const SECTORES = [
  { label: "Financiero", value: "FINANCIERO" },
  { label: "Bancario", value: "BANCARIO" },
  { label: "Tecnología", value: "TECNOLOGIA" },
  { label: "Salud", value: "SALUD" },
  { label: "Educación", value: "EDUCACION" },
  { label: "Gobierno", value: "GOBIERNO" },
  { label: "Comercio", value: "COMERCIO" },
  { label: "Industrial", value: "INDUSTRIAL" },
  { label: "Servicios", value: "SERVICIOS" },
  { label: "Otro", value: "OTRO" },
];

const OrganizacionFormDialog = ({
  open,
  onClose,
  onSubmit,
  organizacion,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(organizacion?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (organizacion) {
      setFormData({
        nombre:
          organizacion.nombre ??
          organizacion.nombre_organizacion ??
          "",
        identificacion:
          organizacion.identificacion ??
          organizacion.ruc ??
          "",
        sector:
          organizacion.sector ?? "",
        email:
          organizacion.email ??
          organizacion.correo ??
          "",
        telefono:
          organizacion.telefono ?? "",
        direccion:
          organizacion.direccion ?? "",
        descripcion:
          organizacion.descripcion ?? "",
        estado:
          organizacion.estado ??
          organizacion.activo ??
          true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, organizacion]);

  const handleChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre es obligatorio.";
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Ingresa un correo válido.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validate()) return;

  const payload = {
    nombre: formData.nombre.trim(),
    identificacion: formData.identificacion.trim() || null,
    sector: formData.sector,
    email: formData.email.trim() || null,
    telefono: formData.telefono.trim() || null,
    direccion: formData.direccion.trim() || null,
    descripcion: formData.descripcion.trim() || "",
    estado: formData.estado,
  };

  try {
    await onSubmit(payload, organizacion?.id);
  } catch (error) {
    setSubmitError(
      error.message || "No fue posible guardar la organización."
    );
  }
};

  return (
    <Dialog
      open={open}
      onClose={
        loading ? undefined : onClose
      }
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {isEditing
          ? "Editar organización"
          : "Nueva organización"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {submitError && (
            <Alert severity="error">
              {submitError}
            </Alert>
          )}

          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={Boolean(errors.nombre)}
                  helperText={errors.nombre}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUC o identificación"
                  name="identificacion"
                  value={
                    formData.identificacion
                  }
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="sector-label">
                    Sector
                  </InputLabel>

                  <Select
  labelId="sector-label"
  label="Sector"
  name="sector"
  value={formData.sector}
  onChange={handleChange}
  disabled={loading}
>
  <MenuItem value="">
    <em>Sin especificar</em>
  </MenuItem>

  {SECTORES.map((s) => (
    <MenuItem key={s.value} value={s.value}>
      {s.label}
    </MenuItem>
  ))}
</Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        Boolean(
                          formData.estado
                        )
                      }
                      onChange={handleChange}
                      name="estado"
                      disabled={loading}
                    />
                  }
                  label={
                    formData.estado
                      ? "Organización activa"
                      : "Organización inactiva"
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && (
            <CircularProgress
              size={20}
              color="inherit"
              sx={{ mr: 1 }}
            />
          )}

          {isEditing
            ? "Guardar cambios"
            : "Crear organización"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizacionFormDialog;