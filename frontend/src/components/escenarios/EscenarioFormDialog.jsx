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
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const INITIAL_FORM = {
  organizacion: "",
  codigo: "",
  activo: "",
  amenaza: "",
  vulnerabilidad: "",
  descripcion_resultado: "",
};

const EscenarioFormDialog = ({
  open,
  onClose,
  onSubmit,
  escenario,
  organizaciones,
  activos,
  amenazas,
  vulnerabilidades,
  loading,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(escenario?.id);

  useEffect(() => {
    if (!open) return;

    if (escenario) {
      setFormData({
        organizacion: escenario.organizacionId ?? escenario.organizacion ?? "",
        codigo: escenario.codigo ?? "",
        activo: escenario.activoId ?? escenario.activo ?? "",
        amenaza: escenario.amenazaId ?? escenario.amenaza ?? "",
        vulnerabilidad: escenario.vulnerabilidadId ?? escenario.vulnerabilidad ?? "",
        descripcion_resultado: escenario.descripcionResultado ?? escenario.descripcion_resultado ?? "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, escenario]);

  const filteredActivos = useMemo(() => {
    if (!formData.organizacion) return activos;
    return activos.filter(
      (a) => !a.organizacionId || String(a.organizacionId) === String(formData.organizacion)
    );
  }, [activos, formData.organizacion]);

  const filteredAmenazas = useMemo(() => {
    if (!formData.organizacion) return amenazas;
    return amenazas.filter(
      (a) => !a.organizacionId || String(a.organizacionId) === String(formData.organizacion)
    );
  }, [amenazas, formData.organizacion]);

  const filteredVulnerabilidades = useMemo(() => {
    if (!formData.organizacion) return vulnerabilidades;
    return vulnerabilidades.filter(
      (v) => !v.organizacionId || String(v.organizacionId) === String(formData.organizacion)
    );
  }, [vulnerabilidades, formData.organizacion]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "organizacion") {
        updated.activo = "";
        updated.amenaza = "";
        updated.vulnerabilidad = "";
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.organizacion) {
      newErrors.organizacion = "Selecciona una organización.";
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es obligatorio. Ej: R-001";
    }

    if (!formData.activo) {
      newErrors.activo = "Selecciona el activo expuesto.";
    }

    if (!formData.amenaza) {
      newErrors.amenaza = "Selecciona la amenaza que aplica.";
    }

    if (!formData.vulnerabilidad) {
      newErrors.vulnerabilidad = "Selecciona la vulnerabilidad explotada.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      organizacion: Number(formData.organizacion),
      codigo: formData.codigo.trim().toUpperCase(),
      activo: Number(formData.activo),
      amenaza: Number(formData.amenaza),
      vulnerabilidad: formData.vulnerabilidad ? Number(formData.vulnerabilidad) : null,
      descripcion_resultado: formData.descripcion_resultado.trim(),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error.message || "No fue posible guardar el escenario.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md">
      <DialogTitle>
        {isEditing ? "Editar escenario de riesgo" : "Nuevo escenario de riesgo"}
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
              Un escenario de riesgo vincula un <strong>activo</strong>, una{" "}
              <strong>amenaza</strong> y una <strong>vulnerabilidad</strong> para
              describir cómo podría materializarse una pérdida. Cada escenario es
              la unidad base del análisis FAIR (ISO/IEC 27005, sección 4.4).
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Código del escenario"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  error={Boolean(errors.codigo)}
                  helperText={errors.codigo || "Único por organización · Ej: R-001"}
                  disabled={loading}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.activo)}>
                  <InputLabel>Activo expuesto</InputLabel>
                  <Select
                    label="Activo expuesto"
                    name="activo"
                    value={formData.activo}
                    onChange={handleChange}
                    disabled={loading || !formData.organizacion}>
                    <MenuItem value="">
                      <em>Selecciona un activo</em>
                    </MenuItem>
                    {filteredActivos.map((activo) => (
                      <MenuItem key={activo.id} value={activo.id}>
                        {activo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.activo && (
                    <FormHelperText>{errors.activo}</FormHelperText>
                  )}
                  {!formData.organizacion && (
                    <FormHelperText>Selecciona primero una organización</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.amenaza)}>
                  <InputLabel>Amenaza</InputLabel>
                  <Select
                    label="Amenaza"
                    name="amenaza"
                    value={formData.amenaza}
                    onChange={handleChange}
                    disabled={loading || !formData.organizacion}>
                    <MenuItem value="">
                      <em>Selecciona una amenaza</em>
                    </MenuItem>
                    {filteredAmenazas.map((amenaza) => (
                      <MenuItem key={amenaza.id} value={amenaza.id}>
                        {amenaza.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.amenaza && (
                    <FormHelperText>{errors.amenaza}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.vulnerabilidad)}>
                  <InputLabel>Vulnerabilidad explotada</InputLabel>
                  <Select
                    label="Vulnerabilidad explotada"
                    name="vulnerabilidad"
                    value={formData.vulnerabilidad}
                    onChange={handleChange}
                    disabled={loading || !formData.organizacion}>
                    <MenuItem value="">
                      <em>Sin vulnerabilidad específica</em>
                    </MenuItem>
                    {filteredVulnerabilidades.map((vuln) => (
                      <MenuItem key={vuln.id} value={vuln.id}>
                        {vuln.nombre}
                        {vuln.categoria ? ` — ${vuln.categoria}` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.vulnerabilidad && (
                    <FormHelperText>{errors.vulnerabilidad}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Descripción del resultado del riesgo"
                  name="descripcion_resultado"
                  value={formData.descripcion_resultado}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ej: Cifrado y pérdida de datos de clientes con impacto operativo, legal y reputacional."
                  helperText="Describe el impacto concreto si el escenario se materializa."
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
          {isEditing ? "Guardar cambios" : "Crear escenario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EscenarioFormDialog;
