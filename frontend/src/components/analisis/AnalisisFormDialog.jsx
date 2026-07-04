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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  organizacion: "",
  escenario: "",

  lefMin: "",
  lefMode: "",
  lefMax: "",

  lmMin: "",
  lmMode: "",
  lmMax: "",

  estado: "Borrador",
  iteraciones: 10000,
  nivelConfianza: 95,
};

const ESTADOS = [
  "Borrador",
  "En análisis",
  "Completado",
  "Aprobado",
  "Archivado",
];

const getRiskLevel = (annualLoss) => {
  const value = Number(annualLoss || 0);

  if (value >= 1000000) {
    return "Crítico";
  }

  if (value >= 250000) {
    return "Alto";
  }

  if (value >= 50000) {
    return "Medio";
  }

  return "Bajo";
};

const getRiskColor = (level) => {
  if (level === "Crítico") {
    return "error";
  }

  if (level === "Alto") {
    return "warning";
  }

  if (level === "Medio") {
    return "info";
  }

  return "success";
};

const averageThree = (
  minimum,
  mostLikely,
  maximum
) => {
  return (
    (Number(minimum || 0) +
      Number(mostLikely || 0) +
      Number(maximum || 0)) /
    3
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const AnalisisFormDialog = ({
  open,
  onClose,
  onSubmit,
  analisis,
  organizaciones,
  escenarios,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(analisis?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (analisis) {
      setFormData({
        nombre:
          analisis.nombre ??
          analisis.nombre_analisis ??
          "",

        descripcion:
          analisis.descripcion ??
          analisis.observaciones ??
          "",

        organizacion:
          analisis.organizacionId ??
          analisis.organizacion_id ??
          "",

        escenario:
          analisis.escenarioId ??
          analisis.escenario_id ??
          "",

        lefMin:
          analisis.lefMin ??
          analisis.lef_min ??
          "",

        lefMode:
          analisis.lefMode ??
          analisis.lef_mode ??
          "",

        lefMax:
          analisis.lefMax ??
          analisis.lef_max ??
          "",

        lmMin:
          analisis.lmMin ??
          analisis.lm_min ??
          "",

        lmMode:
          analisis.lmMode ??
          analisis.lm_mode ??
          "",

        lmMax:
          analisis.lmMax ??
          analisis.lm_max ??
          "",

        estado:
          analisis.estado ??
          "Borrador",

        iteraciones:
          analisis.iteraciones ??
          10000,

        nivelConfianza:
          analisis.confianza ??
          analisis.nivel_confianza ??
          95,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, analisis]);

  const filteredScenarios = useMemo(() => {
    if (!formData.organizacion) {
      return escenarios;
    }

    return escenarios.filter(
      (escenario) => {
        if (!escenario.organizacionId) {
          return true;
        }

        return (
          String(
            escenario.organizacionId
          ) ===
          String(formData.organizacion)
        );
      }
    );
  }, [
    escenarios,
    formData.organizacion,
  ]);

  const expectedLef = useMemo(() => {
    return averageThree(
      formData.lefMin,
      formData.lefMode,
      formData.lefMax
    );
  }, [
    formData.lefMin,
    formData.lefMode,
    formData.lefMax,
  ]);

  const expectedLm = useMemo(() => {
    return averageThree(
      formData.lmMin,
      formData.lmMode,
      formData.lmMax
    );
  }, [
    formData.lmMin,
    formData.lmMode,
    formData.lmMax,
  ]);

  const expectedAnnualLoss = useMemo(() => {
    return expectedLef * expectedLm;
  }, [expectedLef, expectedLm]);

  const riskLevel = useMemo(() => {
    return getRiskLevel(
      expectedAnnualLoss
    );
  }, [expectedAnnualLoss]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "organizacion") {
        updated.escenario = "";
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const validateTriangularValues = (
    minimum,
    mostLikely,
    maximum,
    prefix,
    newErrors
  ) => {
    const min = Number(minimum);
    const mode = Number(mostLikely);
    const max = Number(maximum);

    if (
      minimum === "" ||
      mostLikely === "" ||
      maximum === ""
    ) {
      newErrors[prefix] =
        "Completa los tres valores.";
      return;
    }

    if (min < 0 || mode < 0 || max < 0) {
      newErrors[prefix] =
        "Los valores no pueden ser negativos.";
      return;
    }

    if (min > mode || mode > max) {
      newErrors[prefix] =
        "Debe cumplirse: mínimo ≤ probable ≤ máximo.";
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre del análisis es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.escenario) {
      newErrors.escenario =
        "Selecciona un escenario.";
    }

    validateTriangularValues(
      formData.lefMin,
      formData.lefMode,
      formData.lefMax,
      "lef",
      newErrors
    );

    validateTriangularValues(
      formData.lmMin,
      formData.lmMode,
      formData.lmMax,
      "lm",
      newErrors
    );

    const iterations = Number(
      formData.iteraciones
    );

    if (
      !Number.isInteger(iterations) ||
      iterations < 1000 ||
      iterations > 1000000
    ) {
      newErrors.iteraciones =
        "Las iteraciones deben estar entre 1.000 y 1.000.000.";
    }

    const confidence = Number(
      formData.nivelConfianza
    );

    if (
      confidence < 50 ||
      confidence > 99.9
    ) {
      newErrors.nivelConfianza =
        "El nivel de confianza debe estar entre 50 y 99.9.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion:
        formData.descripcion.trim(),

      organizacion: Number(
        formData.organizacion
      ),

      escenario: Number(
        formData.escenario
      ),

      lef_min: Number(formData.lefMin),
      lef_mode: Number(formData.lefMode),
      lef_max: Number(formData.lefMax),

      lm_min: Number(formData.lmMin),
      lm_mode: Number(formData.lmMode),
      lm_max: Number(formData.lmMax),

      lef_esperada: expectedLef,
      lm_esperada: expectedLm,

      perdida_anual_esperada:
        expectedAnnualLoss,

      nivel_riesgo: riskLevel,
      estado: formData.estado,

      iteraciones: Number(
        formData.iteraciones
      ),

      nivel_confianza: Number(
        formData.nivelConfianza
      ),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar el análisis."
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
      maxWidth="lg"
    >
      <DialogTitle>
        {isEditing
          ? "Editar análisis FAIR"
          : "Nuevo análisis FAIR"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {submitError && (
            <Alert severity="error">
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Nombre del análisis"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={Boolean(
                  errors.organizacion
                )}
              >
                <InputLabel>
                  Organización
                </InputLabel>

                <Select
                  name="organizacion"
                  label="Organización"
                  value={formData.organizacion}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>
                      Selecciona una organización
                    </em>
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

                {errors.organizacion && (
                  <FormHelperText>
                    {errors.organizacion}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <FormControl
                fullWidth
                required
                error={Boolean(
                  errors.escenario
                )}
              >
                <InputLabel>
                  Escenario de riesgo
                </InputLabel>

                <Select
                  name="escenario"
                  label="Escenario de riesgo"
                  value={formData.escenario}
                  onChange={handleChange}
                  disabled={
                    loading ||
                    !formData.organizacion
                  }
                >
                  <MenuItem value="">
                    <em>
                      Selecciona un escenario
                    </em>
                  </MenuItem>

                  {filteredScenarios.map(
                    (escenario) => (
                      <MenuItem
                        key={escenario.id}
                        value={escenario.id}
                      >
                        {escenario.nombre}
                        {escenario.nivelRiesgo
                          ? ` — Riesgo ${escenario.nivelRiesgo}`
                          : ""}
                      </MenuItem>
                    )
                  )}
                </Select>

                {errors.escenario && (
                  <FormHelperText>
                    {errors.escenario}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Estado
                </InputLabel>

                <Select
                  name="estado"
                  label="Estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={loading}
                >
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Descripción u observaciones"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border:
                    "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Frecuencia de eventos de pérdida
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  LEF — Número estimado de eventos
                  de pérdida por año.
                </Typography>

                {errors.lef && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                  >
                    {errors.lef}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF mínima"
                      name="lefMin"
                      value={formData.lefMin}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            eventos/año
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF más probable"
                      name="lefMode"
                      value={formData.lefMode}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            eventos/año
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="LEF máxima"
                      name="lefMax"
                      value={formData.lefMax}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            eventos/año
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    textAlign: "right",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    LEF esperada
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {expectedLef.toFixed(2)} eventos/año
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border:
                    "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Magnitud de pérdida
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  LM — Pérdida económica estimada
                  por cada evento.
                </Typography>

                {errors.lm && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                  >
                    {errors.lm}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Pérdida mínima"
                      name="lmMin"
                      value={formData.lmMin}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            $
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Pérdida más probable"
                      name="lmMode"
                      value={formData.lmMode}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            $
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Pérdida máxima"
                      name="lmMax"
                      value={formData.lmMax}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{
                        min: 0,
                        step: "0.01",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            $
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    textAlign: "right",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Magnitud esperada
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {formatCurrency(expectedLm)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  border:
                    "1px solid rgba(15,61,91,0.12)",
                  borderRadius: 2,
                  p: 3,
                  backgroundColor:
                    "rgba(11,95,165,0.04)",
                }}
              >
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                >
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      LEF esperada
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                    >
                      {expectedLef.toFixed(2)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      LM esperada
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                    >
                      {formatCurrency(expectedLm)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Pérdida anual esperada
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {formatCurrency(
                        expectedAnnualLoss
                      )}
                    </Typography>

                    <Chip
                      label={`Riesgo ${riskLevel}`}
                      color={getRiskColor(
                        riskLevel
                      )}
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Iteraciones Monte Carlo"
                name="iteraciones"
                value={formData.iteraciones}
                onChange={handleChange}
                error={Boolean(
                  errors.iteraciones
                )}
                helperText={
                  errors.iteraciones ||
                  "Valor recomendado: 10.000"
                }
                disabled={loading}
                inputProps={{
                  min: 1000,
                  max: 1000000,
                  step: 1000,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Nivel de confianza"
                name="nivelConfianza"
                value={
                  formData.nivelConfianza
                }
                onChange={handleChange}
                error={Boolean(
                  errors.nivelConfianza
                )}
                helperText={
                  errors.nivelConfianza ||
                  "Valor recomendado: 95%"
                }
                disabled={loading}
                inputProps={{
                  min: 50,
                  max: 99.9,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      %
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
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
            : "Crear análisis"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalisisFormDialog;