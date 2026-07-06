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

// Matches backend CatalogoVulnerabilidad.CATEGORIA_CHOICES
const CATEGORIAS = [
  { value: "TECNOLOGICA", label: "Tecnológica" },
  { value: "ORGANIZACIONAL", label: "Organizacional" },
  { value: "PROCESOS", label: "De procesos" },
  { value: "TERCEROS", label: "De terceros" },
];

const INITIAL_FORM = {
  nombre: "",
  organizacion: "",
  categoria: "",
  descripcion: "",
  es_generica: false,
};

const VulnerabilidadFormDialog = ({
  open,
  onClose,
  onSubmit,
  vulnerabilidad,
  organizaciones,
  loading,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(vulnerabilidad?.id);

  useEffect(() => {
    if (!open) return;

    if (vulnerabilidad) {
      setFormData({
        nombre: vulnerabilidad.nombre ?? "",
        organizacion: vulnerabilidad.organizacionId ?? vulnerabilidad.organizacion ?? "",
        categoria: vulnerabilidad.categoria ?? "",
        descripcion: vulnerabilidad.descripcion ?? "",
        es_generica: Boolean(vulnerabilidad.es_generica ?? false),
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, vulnerabilidad]);

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
      newErrors.nombre = "El nombre de la vulnerabilidad es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion = "Selecciona una organización.";
    }

    if (!formData.categoria) {
      newErrors.categoria = "Selecciona la categoría de la vulnerabilidad.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      nombre: formData.nombre.trim(),
      organizacion: Number(formData.organizacion),
      categoria: formData.categoria,
      descripcion: formData.descripcion.trim(),
      es_generica: Boolean(formData.es_generica),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error.message || "No fue posible guardar la vulnerabilidad.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md">
      <DialogTitle>
        {isEditing ? "Editar vulnerabilidad" : "Nueva vulnerabilidad"}
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
              Las vulnerabilidades son debilidades que pueden ser explotadas por
              amenazas. Forman el catálogo base para construir escenarios de
              riesgo (ISO/IEC 27005, sección 4.3).
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre de la vulnerabilidad"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={Boolean(errors.nombre)}
                  helperText={errors.nombre || "Ej: Falta de parches de seguridad, Contraseñas débiles"}
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
                    {(organizaciones || []).map((org) => (
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
                  error={Boolean(errors.categoria)}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    label="Categoría"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    disabled={loading}>
                    <MenuItem value="">
                      <em>Selecciona una categoría</em>
                    </MenuItem>
                    {CATEGORIAS.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoria && (
                    <FormHelperText>{errors.categoria}</FormHelperText>
                  )}
                  <FormHelperText>
                    TECNOLOGICA: sistemas/software · ORGANIZACIONAL: políticas/procesos · PROCESOS: flujos operativos · TERCEROS: proveedores/socios
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
                      ? "Vulnerabilidad genérica (catálogo base)"
                      : "Vulnerabilidad específica de la organización"
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
                  placeholder="Describe la debilidad, su causa raíz y cómo podría ser explotada por una amenaza."
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
          {isEditing ? "Guardar cambios" : "Crear vulnerabilidad"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VulnerabilidadFormDialog;
