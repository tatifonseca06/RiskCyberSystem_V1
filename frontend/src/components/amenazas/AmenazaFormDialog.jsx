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
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

// Matches backend CatalogoAmenaza.ORIGEN_CHOICES
const ORIGENES = [
  { value: "EXTERNA", label: "Amenaza externa" },
  { value: "INTERNA", label: "Amenaza interna" },
  { value: "PROCESO", label: "Amenaza de proceso y entorno" },
];

const INITIAL_FORM = {
  nombre: "",
  organizacion: "",
  origen: "",
  descripcion: "",
  es_generica: false,
};

const AmenazaFormDialog = ({
  open,
  onClose,
  onSubmit,
  amenaza,
  organizaciones,
  loading,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(amenaza?.id);

  useEffect(() => {
    if (!open) return;

    if (amenaza) {
      setFormData({
        nombre: amenaza.nombre ?? "",
        organizacion: amenaza.organizacionId ?? amenaza.organizacion ?? "",
        origen: amenaza.origen ?? "",
        descripcion: amenaza.descripcion ?? "",
        es_generica: Boolean(amenaza.es_generica ?? false),
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, amenaza]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la amenaza es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion = "Selecciona una organización.";
    }

    if (!formData.origen) {
      newErrors.origen = "Selecciona el origen de la amenaza.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      nombre: formData.nombre.trim(),
      organizacion: Number(formData.organizacion),
      origen: formData.origen,
      descripcion: formData.descripcion.trim(),
      es_generica: Boolean(formData.es_generica),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error.message || "No fue posible guardar la amenaza.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md">
      <DialogTitle>
        {isEditing ? "Editar amenaza" : "Nueva amenaza"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {submitError && (
            <Alert severity="error">{submitError}</Alert>
          )}

          <Box sx={{ pt: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}>
              Las amenazas forman el catálogo de eventos adversos que pueden
              explotar vulnerabilidades y afectar los activos de la organización
              (ISO/IEC 27005, sección 4.2).
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre de la amenaza"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={Boolean(errors.nombre)}
                  helperText={errors.nombre || "Ej: Ataque de ransomware, Phishing dirigido"}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.organizacion)}>
                  <InputLabel>Organización</InputLabel>
                  <Select
                    label="Organización"
                    name="organizacion"
                    value={formData.organizacion}
                    onChange={handleChange}
                    disabled={loading}>
                    <MenuItem value="">
                      <em>Selecciona una organización</em>
                    </MenuItem>
                    {organizaciones.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.organizacion && (
                    <FormHelperText>{errors.organizacion}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.origen)}>
                  <InputLabel>Origen de la amenaza</InputLabel>
                  <Select
                    label="Origen de la amenaza"
                    name="origen"
                    value={formData.origen}
                    onChange={handleChange}
                    disabled={loading}>
                    <MenuItem value="">
                      <em>Selecciona el origen</em>
                    </MenuItem>
                    {ORIGENES.map((origen) => (
                      <MenuItem key={origen.value} value={origen.value}>
                        {origen.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.origen && (
                    <FormHelperText>{errors.origen}</FormHelperText>
                  )}
                  <FormHelperText>
                    EXTERNA: adversarios externos · INTERNA: personal o sistemas internos · PROCESO: fallas de proceso o entorno
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.es_generica)}
                      onChange={handleChange}
                      name="es_generica"
                      disabled={loading}
                    />
                  }
                  label={
                    formData.es_generica
                      ? "Amenaza genérica (catálogo base)"
                      : "Amenaza específica de la organización"
                  }
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
                  placeholder="Describe el mecanismo de la amenaza, sus vectores de ataque y condiciones de activación."
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}>
          {loading && (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          )}
          {isEditing ? "Guardar cambios" : "Crear amenaza"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AmenazaFormDialog;
