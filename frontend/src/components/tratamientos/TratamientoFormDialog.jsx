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
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
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
  analisis: "",
  estrategia: "Mitigar",
  responsable: "",
  prioridad: "Media",
  estado: "Planificado",
  porcentajeAvance: 0,
  presupuesto: "",
  costoReal: "",
  fechaInicio: "",
  fechaLimite: "",
  fechaFinalizacion: "",
  efectividadEsperada: 50,
  riesgoResidual: "",
  observaciones: "",
  activo: true,
};

const ESTRATEGIAS = [
  "Mitigar",
  "Aceptar",
  "Transferir",
  "Evitar",
];

const PRIORIDADES = [
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const ESTADOS = [
  "Planificado",
  "En ejecución",
  "Pausado",
  "Completado",
  "Cancelado",
];

const getStrategyDescription = (strategy) => {
  const descriptions = {
    Mitigar:
      "Implementar controles para reducir la probabilidad o el impacto.",
    Aceptar:
      "Conservar el riesgo porque se encuentra dentro del apetito definido.",
    Transferir:
      "Trasladar parte del impacto a un tercero, seguro o proveedor.",
    Evitar:
      "Eliminar la actividad, proceso o condición que origina el riesgo.",
  };

  return descriptions[strategy] || "";
};

const getStrategyColor = (strategy) => {
  if (strategy === "Mitigar") {
    return "primary";
  }

  if (strategy === "Aceptar") {
    return "warning";
  }

  if (strategy === "Transferir") {
    return "info";
  }

  if (strategy === "Evitar") {
    return "error";
  }

  return "default";
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const TratamientoFormDialog = ({
  open,
  onClose,
  onSubmit,
  tratamiento,
  organizaciones,
  analisis,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(tratamiento?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (tratamiento) {
      setFormData({
        nombre:
          tratamiento.nombre ??
          tratamiento.nombre_tratamiento ??
          "",

        descripcion:
          tratamiento.descripcion ??
          tratamiento.acciones ??
          "",

        organizacion:
          tratamiento.organizacionId ??
          tratamiento.organizacion_id ??
          "",

        analisis:
          tratamiento.analisisId ??
          tratamiento.analisis_id ??
          "",

        estrategia:
          tratamiento.estrategia ??
          tratamiento.tipo_tratamiento ??
          "Mitigar",

        responsable:
          tratamiento.responsable ??
          tratamiento.asignado_a ??
          "",

        prioridad:
          tratamiento.prioridad ??
          "Media",

        estado:
          tratamiento.estado ??
          "Planificado",

        porcentajeAvance:
          Number(
            tratamiento.porcentajeAvance ??
              tratamiento.porcentaje_avance ??
              0
          ),

        presupuesto:
          tratamiento.presupuesto ??
          tratamiento.costo_estimado ??
          "",

        costoReal:
          tratamiento.costoReal ??
          tratamiento.costo_real ??
          "",

        fechaInicio:
          tratamiento.fechaInicio ??
          tratamiento.fecha_inicio ??
          "",

        fechaLimite:
          tratamiento.fechaLimite ??
          tratamiento.fecha_limite ??
          tratamiento.fecha_fin ??
          "",

        fechaFinalizacion:
          tratamiento.fechaFinalizacion ??
          tratamiento.fecha_finalizacion ??
          "",

        efectividadEsperada:
          Number(
            tratamiento.efectividadEsperada ??
              tratamiento.efectividad_esperada ??
              50
          ),

        riesgoResidual:
          tratamiento.riesgoResidual ??
          tratamiento.riesgo_residual ??
          "",

        observaciones:
          tratamiento.observaciones ??
          tratamiento.comentarios ??
          "",

        activo:
          tratamiento.activo ??
          tratamiento.habilitado ??
          true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, tratamiento]);

  const filteredAnalisis = useMemo(() => {
    if (!formData.organizacion) {
      return analisis;
    }

    return analisis.filter((item) => {
      if (!item.organizacionId) {
        return true;
      }

      return (
        String(item.organizacionId) ===
        String(formData.organizacion)
      );
    });
  }, [
    analisis,
    formData.organizacion,
  ]);

  const selectedAnalysis = useMemo(() => {
    return analisis.find(
      (item) =>
        String(item.id) ===
        String(formData.analisis)
    );
  }, [analisis, formData.analisis]);

  const estimatedResidualRisk = useMemo(() => {
    const originalRisk = Number(
      selectedAnalysis?.perdidaAnualEsperada || 0
    );

    const effectiveness =
      Number(formData.efectividadEsperada || 0) /
      100;

    return originalRisk * (1 - effectiveness);
  }, [
    selectedAnalysis,
    formData.efectividadEsperada,
  ]);

  const budgetVariance = useMemo(() => {
    return (
      Number(formData.presupuesto || 0) -
      Number(formData.costoReal || 0)
    );
  }, [
    formData.presupuesto,
    formData.costoReal,
  ]);

  const handleChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      if (name === "organizacion") {
        updated.analisis = "";
      }

      if (
        name === "estado" &&
        value === "Completado" &&
        !previous.fechaFinalizacion
      ) {
        updated.fechaFinalizacion =
          new Date().toISOString().split("T")[0];
        updated.porcentajeAvance = 100;
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleProgressChange = (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      porcentajeAvance: value,
      estado:
        value === 100
          ? "Completado"
          : previous.estado === "Completado"
            ? "En ejecución"
            : previous.estado,
    }));
  };

  const handleEffectivenessChange = (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      efectividadEsperada: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre del tratamiento es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.analisis) {
      newErrors.analisis =
        "Selecciona un análisis FAIR.";
    }

    if (!formData.responsable.trim()) {
      newErrors.responsable =
        "El responsable es obligatorio.";
    }

    if (
      Number(formData.presupuesto || 0) < 0
    ) {
      newErrors.presupuesto =
        "El presupuesto no puede ser negativo.";
    }

    if (
      Number(formData.costoReal || 0) < 0
    ) {
      newErrors.costoReal =
        "El costo real no puede ser negativo.";
    }

    if (
      formData.fechaInicio &&
      formData.fechaLimite &&
      formData.fechaLimite <
        formData.fechaInicio
    ) {
      newErrors.fechaLimite =
        "La fecha límite no puede ser anterior a la fecha de inicio.";
    }

    if (
      formData.fechaFinalizacion &&
      formData.fechaInicio &&
      formData.fechaFinalizacion <
        formData.fechaInicio
    ) {
      newErrors.fechaFinalizacion =
        "La finalización no puede ser anterior al inicio.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const residualRisk =
      formData.riesgoResidual !== ""
        ? Number(formData.riesgoResidual)
        : estimatedResidualRisk;

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion:
        formData.descripcion.trim(),

      organizacion: Number(
        formData.organizacion
      ),

      analisis: Number(
        formData.analisis
      ),

      estrategia: formData.estrategia,
      responsable:
        formData.responsable.trim(),
      prioridad: formData.prioridad,
      estado: formData.estado,

      porcentaje_avance: Number(
        formData.porcentajeAvance
      ),

      presupuesto: Number(
        formData.presupuesto || 0
      ),

      costo_real: Number(
        formData.costoReal || 0
      ),

      fecha_inicio:
        formData.fechaInicio || null,

      fecha_limite:
        formData.fechaLimite || null,

      fecha_finalizacion:
        formData.fechaFinalizacion || null,

      efectividad_esperada: Number(
        formData.efectividadEsperada
      ),

      riesgo_residual: residualRisk,

      observaciones:
        formData.observaciones.trim(),

      activo: Boolean(formData.activo),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar el tratamiento."
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
          ? "Editar tratamiento de riesgo"
          : "Nuevo tratamiento de riesgo"}
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
                label="Nombre del tratamiento"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre}
                disabled={loading}
                placeholder="Ejemplo: Implementar autenticación multifactor"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Responsable"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                error={Boolean(
                  errors.responsable
                )}
                helperText={
                  errors.responsable
                }
                disabled={loading}
                placeholder="Ejemplo: Jefe de Infraestructura"
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

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={Boolean(
                  errors.analisis
                )}
              >
                <InputLabel>
                  Análisis FAIR
                </InputLabel>

                <Select
                  name="analisis"
                  label="Análisis FAIR"
                  value={formData.analisis}
                  onChange={handleChange}
                  disabled={
                    loading ||
                    !formData.organizacion
                  }
                >
                  <MenuItem value="">
                    <em>
                      Selecciona un análisis
                    </em>
                  </MenuItem>

                  {filteredAnalisis.map(
                    (item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                      >
                        {item.nombre}
                        {item.nivelRiesgo
                          ? ` — ${item.nivelRiesgo}`
                          : ""}
                      </MenuItem>
                    )
                  )}
                </Select>

                {errors.analisis && (
                  <FormHelperText>
                    {errors.analisis}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Estrategia
                </InputLabel>

                <Select
                  name="estrategia"
                  label="Estrategia"
                  value={formData.estrategia}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {ESTRATEGIAS.map(
                    (estrategia) => (
                      <MenuItem
                        key={estrategia}
                        value={estrategia}
                      >
                        {estrategia}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>
                  Prioridad
                </InputLabel>

                <Select
                  name="prioridad"
                  label="Prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {PRIORIDADES.map(
                    (prioridad) => (
                      <MenuItem
                        key={prioridad}
                        value={prioridad}
                      >
                        {prioridad}
                      </MenuItem>
                    )
                  )}
                </Select>
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
              <Alert
                severity="info"
                icon={false}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                >
                  <Chip
                    size="small"
                    label={
                      formData.estrategia
                    }
                    color={getStrategyColor(
                      formData.estrategia
                    )}
                  />

                  <Typography variant="body2">
                    {getStrategyDescription(
                      formData.estrategia
                    )}
                  </Typography>
                </Stack>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Descripción y acciones"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
                placeholder="Describe los controles, actividades y entregables del tratamiento."
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border:
                    "1px solid rgba(15,61,91,0.12)",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Avance del tratamiento
                </Typography>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mb: 2 }}
                >
                  Registra el porcentaje de
                  implementación completado.
                </Typography>

                <Slider
                  value={Number(
                    formData.porcentajeAvance
                  )}
                  onChange={
                    handleProgressChange
                  }
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    {
                      value: 0,
                      label: "0%",
                    },
                    {
                      value: 25,
                      label: "25%",
                    },
                    {
                      value: 50,
                      label: "50%",
                    },
                    {
                      value: 75,
                      label: "75%",
                    },
                    {
                      value: 100,
                      label: "100%",
                    },
                  ]}
                  valueLabelDisplay="auto"
                  disabled={loading}
                />

                <LinearProgress
                  variant="determinate"
                  value={Number(
                    formData.porcentajeAvance
                  )}
                  sx={{
                    mt: 2,
                    height: 10,
                    borderRadius: 10,
                  }}
                />

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="primary.main"
                  sx={{ mt: 1 }}
                >
                  {formData.porcentajeAvance}%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de inicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha límite"
                name="fechaLimite"
                value={formData.fechaLimite}
                onChange={handleChange}
                error={Boolean(
                  errors.fechaLimite
                )}
                helperText={
                  errors.fechaLimite
                }
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de finalización"
                name="fechaFinalizacion"
                value={
                  formData.fechaFinalizacion
                }
                onChange={handleChange}
                error={Boolean(
                  errors.fechaFinalizacion
                )}
                helperText={
                  errors.fechaFinalizacion
                }
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Presupuesto"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleChange}
                error={Boolean(
                  errors.presupuesto
                )}
                helperText={
                  errors.presupuesto
                }
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Costo real"
                name="costoReal"
                value={formData.costoReal}
                onChange={handleChange}
                error={Boolean(
                  errors.costoReal
                )}
                helperText={errors.costoReal}
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

            <Grid item xs={12}>
              <Alert
                severity={
                  budgetVariance >= 0
                    ? "success"
                    : "warning"
                }
              >
                Diferencia presupuestaria:{" "}
                <strong>
                  {formatCurrency(
                    budgetVariance
                  )}
                </strong>
                {budgetVariance >= 0
                  ? " disponible."
                  : " por encima del presupuesto."}
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border:
                    "1px solid rgba(15,61,91,0.12)",
                  backgroundColor:
                    "rgba(11,95,165,0.03)",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Efectividad y riesgo residual
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Estima cuánto reducirá el
                  tratamiento la pérdida anual.
                </Typography>

                <Slider
                  value={Number(
                    formData.efectividadEsperada
                  )}
                  onChange={
                    handleEffectivenessChange
                  }
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    {
                      value: 0,
                      label: "0%",
                    },
                    {
                      value: 50,
                      label: "50%",
                    },
                    {
                      value: 100,
                      label: "100%",
                    },
                  ]}
                  valueLabelDisplay="auto"
                  disabled={loading}
                />

                <Grid
                  container
                  spacing={2}
                  sx={{ mt: 1 }}
                >
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Pérdida anual original
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {formatCurrency(
                        selectedAnalysis
                          ?.perdidaAnualEsperada
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Reducción esperada
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {
                        formData.efectividadEsperada
                      }
                      %
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Riesgo residual estimado
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {formatCurrency(
                        estimatedResidualRisk
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Riesgo residual manual"
                name="riesgoResidual"
                value={formData.riesgoResidual}
                onChange={handleChange}
                disabled={loading}
                helperText="Déjalo vacío para utilizar el valor calculado automáticamente."
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="activo"
                    checked={Boolean(
                      formData.activo
                    )}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label={
                  formData.activo
                    ? "Tratamiento activo"
                    : "Tratamiento deshabilitado"
                }
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
            : "Crear tratamiento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TratamientoFormDialog;