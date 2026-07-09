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
  descripcionPlan: "",
  analisis: "",
  estrategia: "MITIGAR",
  responsable: "",
  estado: "PENDIENTE",
  aprobadoPor: "",
  plazo_dias: "",
  fechaInicio: "",
  fechaLimite: "",
  fechaImplementacion: "",
  efectividadEsperada: 50,
  riesgoResidual: "",
};

const ESTRATEGIAS = [
  {
    value: "MITIGAR",
    label: "Mitigar",
  },
  {
    value: "ACEPTAR",
    label: "Aceptar",
  },
  {
    value: "TRANSFERIR",
    label: "Transferir",
  },
  {
    value: "EVITAR",
    label: "Evitar",
  },
];

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "IMPLEMENTADO", label: "Implementado" },
  { value: "VENCIDO", label: "Vencido" },
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

const TratamientoFormDialog = ({
  open,
  onClose,
  onSubmit,
  tratamiento,
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
        descripcionPlan:
          tratamiento.descripcionPlan ??
          tratamiento.descripcion_plan ??
          "",

        analisis:
          tratamiento.analisisId ??
          tratamiento.analisis_id ??
          "",

        estrategia:
          tratamiento.estrategia ?? "MITIGAR",

        responsable:
          tratamiento.responsable ?? "",

        estado:
          tratamiento.estado ?? "PENDIENTE",

        aprobadoPor:
          tratamiento.aprobado_por ?? "",

        plazo_dias:
          tratamiento.plazo_dias ?? "",

        fechaInicio:
          tratamiento.fechaInicio ??
          tratamiento.fecha_inicio ??
          "",

        fechaLimite:
          tratamiento.fechaLimite ??
          tratamiento.fecha_limite ??
          "",

        fechaImplementacion:
          tratamiento.fecha_implementacion ??
          "",

        efectividadEsperada: 50,

        riesgoResidual:
          tratamiento.riesgoResidual ?? "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, tratamiento]);

  const filteredAnalisis = analisis;

  const selectedAnalysis = useMemo(() => {
    return analisis.find(
      (item) =>
        String(item.id) ===
        String(formData.analisis)
    );
  }, [analisis, formData.analisis]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.descripcionPlan.trim()) {
      newErrors.descripcionPlan =
        "La descripción del plan es obligatoria.";
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
      formData.estrategia === "ACEPTAR" &&
      !formData.aprobadoPor.trim()
    ) {
      newErrors.aprobadoPor =
        "La estrategia 'Aceptar' requiere aprobación documentada (sección 7.1).";
    }

    if (
      formData.fechaInicio &&
      formData.fechaLimite &&
      formData.fechaLimite < formData.fechaInicio
    ) {
      newErrors.fechaLimite =
        "La fecha límite no puede ser anterior a la fecha de inicio.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const payload = {
      escenario: selectedAnalysis?.escenarioId ?? null,
      descripcion_plan: formData.descripcionPlan.trim(),
      estrategia: formData.estrategia,
      responsable: formData.responsable.trim(),
      estado: formData.estado,
      aprobado_por: formData.aprobadoPor.trim(),
      plazo_dias: formData.plazo_dias !== "" ? Number(formData.plazo_dias) : null,
      fecha_inicio: formData.fechaInicio || null,
      fecha_limite: formData.fechaLimite || null,
      fecha_implementacion: formData.fechaImplementacion || null,
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
                label="Responsable"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                error={Boolean(errors.responsable)}
                helperText={errors.responsable}
                disabled={loading}
                placeholder="Ejemplo: Jefe de Infraestructura"
              />
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
                  disabled={loading}
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
                  {ESTRATEGIAS.map((estrategia) => (
  <MenuItem 
    key={estrategia.value}
    value={estrategia.value}
  >
    {estrategia.label}
  </MenuItem>
))}
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
                      key={estado.value}
                      value={estado.value}
                    >
                      {estado.label}
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
                required
                multiline
                minRows={3}
                label="Descripción del plan"
                name="descripcionPlan"
                value={formData.descripcionPlan}
                onChange={handleChange}
                error={Boolean(errors.descripcionPlan)}
                helperText={errors.descripcionPlan || "Ej: instalar MFA, contratar seguro cibernético, etc."}
                disabled={loading}
                placeholder="Describe los controles, actividades y entregables del tratamiento."
              />
            </Grid>

            {formData.estrategia === "ACEPTAR" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Aprobado por"
                  name="aprobadoPor"
                  value={formData.aprobadoPor}
                  onChange={handleChange}
                  error={Boolean(errors.aprobadoPor)}
                  helperText={errors.aprobadoPor || "Requerido cuando la estrategia es 'Aceptar' (sección 7.1)"}
                  disabled={loading}
                  placeholder="Nombre del responsable que aprueba aceptar el riesgo"
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de inicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={loading}
                slotProps={{ inputLabel: { shrink: true } }}
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
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de implementación"
                name="fechaImplementacion"
                value={formData.fechaImplementacion}
                onChange={handleChange}
                disabled={loading}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Plazo (días)"
                name="plazo_dias"
                value={formData.plazo_dias}
                onChange={handleChange}
                disabled={loading}
                inputProps={{ min: 0 }}
                helperText="Ej: 30 (Alto), 90 (Medio)"
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