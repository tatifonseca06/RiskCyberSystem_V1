import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

// ──────────────────────────────────────────────
// Matches backend AnalisisRiesgo model fields exactly:
//   escenario (FK), probabilidad (1-5), impacto (1-5),
//   lef_min/probable/max, plm_min/probable/max, slm_min/probable/max, notas
// ──────────────────────────────────────────────

const SCALE_MARKS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

const INITIAL_FORM = {
  escenario: "",
  probabilidad: 3,
  impacto: 3,
  lef_min: "",
  lef_probable: "",
  lef_max: "",
  plm_min: "",
  plm_probable: "",
  plm_max: "",
  slm_min: "0",
  slm_probable: "0",
  slm_max: "0",
  notas: "",
};

const getRiesgoSimpleColor = (nivel) => {
  if (nivel === "MUY_ALTO") return "error";
  if (nivel === "ALTO") return "warning";
  if (nivel === "MEDIO") return "info";
  if (nivel === "BAJO") return "success";
  return "default";
};

const getRiesgoSimpleLabel = (r) => {
  if (r >= 20) return "MUY ALTO";
  if (r >= 12) return "ALTO";
  if (r >= 6) return "MEDIO";
  if (r >= 3) return "BAJO";
  return "MUY BAJO";
};

const formatUSD = (value) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const AnalisisFormDialog = ({
  open,
  onClose,
  onSubmit,
  analisis,
  organizaciones,
  escenarios,
  loading,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(analisis?.id);

  useEffect(() => {
    if (!open) return;

    if (analisis) {
      setFormData({
        escenario: analisis.escenarioId ?? analisis.escenario ?? "",
        probabilidad: Number(analisis.probabilidad ?? 3),
        impacto: Number(analisis.impacto ?? 3),
        lef_min: analisis.lef_min ?? "",
        lef_probable: analisis.lef_probable ?? "",
        lef_max: analisis.lef_max ?? "",
        plm_min: analisis.plm_min ?? "",
        plm_probable: analisis.plm_probable ?? "",
        plm_max: analisis.plm_max ?? "",
        slm_min: analisis.slm_min ?? "0",
        slm_probable: analisis.slm_probable ?? "0",
        slm_max: analisis.slm_max ?? "0",
        notas: analisis.notas ?? "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, analisis]);

  const riesgoSimple = useMemo(
    () => formData.probabilidad * formData.impacto,
    [formData.probabilidad, formData.impacto]
  );

  // ALE = LEF_probable × (PLM_probable + SLM_probable)
  const aleEstimado = useMemo(() => {
    const lef = Number(formData.lef_probable || 0);
    const plm = Number(formData.plm_probable || 0);
    const slm = Number(formData.slm_probable || 0);
    return lef * (plm + slm);
  }, [formData.lef_probable, formData.plm_probable, formData.slm_probable]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const handleSlider = (field) => (_, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateTriangular = (min, probable, max, key, errs) => {
    const mn = Number(min);
    const pr = Number(probable);
    const mx = Number(max);

    if (min === "" || probable === "" || max === "") {
      errs[key] = "Completa los tres valores (mínimo, probable, máximo).";
      return;
    }
    if (mn < 0 || pr < 0 || mx < 0) {
      errs[key] = "Los valores no pueden ser negativos.";
      return;
    }
    if (!(mn <= pr && pr <= mx)) {
      errs[key] = "Debe cumplirse: mínimo ≤ probable ≤ máximo.";
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.escenario) {
      errs.escenario = "Selecciona el escenario de riesgo.";
    }

    validateTriangular(formData.lef_min, formData.lef_probable, formData.lef_max, "lef", errs);
    validateTriangular(formData.plm_min, formData.plm_probable, formData.plm_max, "plm", errs);
    validateTriangular(formData.slm_min, formData.slm_probable, formData.slm_max, "slm", errs);

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Payload matches AnalisisRiesgo model fields exactly
    const payload = {
      escenario: Number(formData.escenario),
      probabilidad: Number(formData.probabilidad),
      impacto: Number(formData.impacto),
      lef_min: Number(formData.lef_min),
      lef_probable: Number(formData.lef_probable),
      lef_max: Number(formData.lef_max),
      plm_min: Number(formData.plm_min),
      plm_probable: Number(formData.plm_probable),
      plm_max: Number(formData.plm_max),
      slm_min: Number(formData.slm_min || 0),
      slm_probable: Number(formData.slm_probable || 0),
      slm_max: Number(formData.slm_max || 0),
      notas: formData.notas.trim(),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(error.message || "No fue posible guardar el análisis.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="lg">
      <DialogTitle>
        {isEditing ? "Editar análisis FAIR" : "Nuevo análisis FAIR"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Typography variant="body2" color="text.secondary">
            El análisis FAIR cuantifica el riesgo de un escenario mediante la
            frecuencia de eventos de pérdida (LEF) y su magnitud (PLM + SLM). La
            distribución PERT se usa en la simulación de Monte Carlo (sección 5.3).
          </Typography>

          <Grid container spacing={2.5}>
            {/* Escenario */}
            <Grid item xs={12} md={8}>
              <FormControl
                fullWidth
                required
                error={Boolean(errors.escenario)}>
                <InputLabel>Escenario de riesgo</InputLabel>
                <Select
                  name="escenario"
                  label="Escenario de riesgo"
                  value={formData.escenario}
                  onChange={handleChange}
                  disabled={loading}>
                  <MenuItem value="">
                    <em>Selecciona un escenario</em>
                  </MenuItem>
                  {escenarios.map((esc) => (
                    <MenuItem key={esc.id} value={esc.id}>
                      {esc.codigo ?? esc.nombre} — {esc.activoNombre ?? ""} / {esc.amenazaNombre ?? ""}
                    </MenuItem>
                  ))}
                </Select>
                {errors.escenario && (
                  <FormHelperText>{errors.escenario}</FormHelperText>
                )}
                <FormHelperText>
                  Cada escenario puede tener un único análisis FAIR (relación 1:1).
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Riesgo simple (P × I) */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Modelo simple R = P × I (Matriz de calor)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Escala 1-5 para probabilidad e impacto. Resultado: 1-25.
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight={700} gutterBottom>
                      Probabilidad de ocurrencia: {formData.probabilidad}
                    </Typography>
                    <Slider
                      value={formData.probabilidad}
                      onChange={handleSlider("probabilidad")}
                      min={1}
                      max={5}
                      step={1}
                      marks={SCALE_MARKS}
                      valueLabelDisplay="auto"
                      disabled={loading}
                    />
                    <Typography variant="caption" color="text.secondary">
                      1 = Muy improbable · 5 = Casi certero
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight={700} gutterBottom>
                      Impacto sobre el negocio: {formData.impacto}
                    </Typography>
                    <Slider
                      value={formData.impacto}
                      onChange={handleSlider("impacto")}
                      min={1}
                      max={5}
                      step={1}
                      marks={SCALE_MARKS}
                      valueLabelDisplay="auto"
                      disabled={loading}
                    />
                    <Typography variant="caption" color="text.secondary">
                      1 = Despreciable · 5 = Catastrófico
                    </Typography>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}>
                  <Typography color="text.secondary">Riesgo simple:</Typography>
                  <Typography variant="h4" fontWeight={900}>
                    {riesgoSimple} / 25
                  </Typography>
                  <Chip
                    label={getRiesgoSimpleLabel(riesgoSimple)}
                    color={getRiesgoSimpleColor(getRiesgoSimpleLabel(riesgoSimple))}
                    sx={{ fontWeight: 800, fontSize: "0.9rem" }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* LEF — Loss Event Frequency */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}>
                <Typography variant="h6" fontWeight={800}>
                  LEF — Frecuencia de eventos de pérdida
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Número estimado de veces al año que ocurre el evento de pérdida.
                  Distribución triangular/PERT (sección 5.3).
                </Typography>

                {errors.lef && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.lef}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF mínima"
                      name="lef_min"
                      value={formData.lef_min}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.0001" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">eventos/año</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF más probable"
                      name="lef_probable"
                      value={formData.lef_probable}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.0001" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">eventos/año</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF máxima"
                      name="lef_max"
                      value={formData.lef_max}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.0001" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">eventos/año</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* PLM — Primary Loss Magnitude */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}>
                <Typography variant="h6" fontWeight={800}>
                  PLM — Magnitud de pérdida primaria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pérdida económica directa por cada evento: daño operativo,
                  recuperación, sustitución de activos (sección 5.3).
                </Typography>

                {errors.plm && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.plm}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="PLM mínima"
                      name="plm_min"
                      value={formData.plm_min}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="PLM más probable"
                      name="plm_probable"
                      value={formData.plm_probable}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="PLM máxima"
                      name="plm_max"
                      value={formData.plm_max}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* SLM — Secondary Loss Magnitude */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}>
                <Typography variant="h6" fontWeight={800}>
                  SLM — Magnitud de pérdida secundaria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pérdidas indirectas: multas regulatorias, daño reputacional,
                  litigios, pérdida de clientes. Puede ser 0 si no aplica.
                </Typography>

                {errors.slm && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.slm}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="SLM mínima"
                      name="slm_min"
                      value={formData.slm_min}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="SLM más probable"
                      name="slm_probable"
                      value={formData.slm_probable}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="SLM máxima"
                      name="slm_max"
                      value={formData.slm_max}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 0, step: "0.01" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* ALE estimado */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                  backgroundColor: "rgba(11,95,165,0.04)",
                }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      LEF probable
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {Number(formData.lef_probable || 0).toFixed(4)} eventos/año
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      PLM + SLM probable
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {formatUSD(
                        Number(formData.plm_probable || 0) + Number(formData.slm_probable || 0)
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      ALE estimado = LEF × (PLM + SLM)
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="primary.main">
                      {formatUSD(aleEstimado)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pérdida anual esperada (estimación puntual)
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Notas */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notas y supuestos"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                disabled={loading}
                placeholder="Documenta las fuentes de los rangos, supuestos del análisis o referencias usadas."
              />
            </Grid>
          </Grid>
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
          {isEditing ? "Guardar cambios" : "Crear análisis"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalisisFormDialog;
