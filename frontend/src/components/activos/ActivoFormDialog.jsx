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
  InputAdornment,
  InputLabel,
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

const normalizeTipo = (tipo) => {
  const map = {
    HW: "HW",
    SW: "SW",
    INF: "INF",
    RED: "RED",
    SRV: "SRV",
    PER: "PER",
    DOC: "DOC",
    REP: "REP",
    TER: "TER",
    OTRO: "OTRO",

    Hardware: "HW",
    Software: "SW",
    Información: "INF",
    "Base de datos": "DOC",
    Red: "RED",
    Servicio: "SRV",
    Proceso: "PROC",
    Persona: "PER",
    Instalación: "INST",
    Proveedor: "TER",
    Otro: "OTRO",
  };

  return map[tipo?.trim()] || tipo?.trim() || "";
};

const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  tipo: "",
  propietario: "",
  ubicacion: "",
  organizacion: "",
  criticidad: "Media",
  confidencialidad: 3,
  integridad: 3,
  disponibilidad: 3,
  valor: "",
  estado: true,
};

const TIPOS_ACTIVO = [
  { label: "Hardware", value: "HW" },
  { label: "Software", value: "SW" },
  { label: "Información", value: "INF" },
  { label: "Red", value: "RED" },
  { label: "Servicio", value: "SRV" },
  { label: "Proceso", value: "PROC" },
  { label: "Persona", value: "PER" },
  { label: "Instalación", value: "INST" },
  { label: "Proveedor", value: "TER" },
  { label: "Otro", value: "OTRO" },
];

const NIVELES_CRITICIDAD = [
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const CIA_MARKS = [
  {
    value: 1,
    label: "1",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 3,
    label: "3",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 5,
    label: "5",
  },
];

const ActivoFormDialog = ({
  open,
  onClose,
  onSubmit,
  activo,
  organizaciones,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(activo?.id);

  useEffect(() => {
    if (!open) return;
    if (activo) {
      setFormData({
        nombre: activo.nombre ?? activo.nombre_activo ?? "",
        descripcion: activo.descripcion ?? "",
        tipo: normalizeTipo(
          (activo?.tipo ?? activo?.tipo_activo ?? "").trim()
        ),
        propietario: activo.propietario ?? activo.responsable ?? "",
        ubicacion: activo.ubicacion ?? "",
        organizacion:activo.organizacionId ?? activo.organizacion_id ?? (typeof activo.organizacion === "object" ? activo.organizacion?.id : activo.organizacion) ?? "",
        criticidad: activo.criticidad ?? "Media",
        confidencialidad: Number(activo.confidencialidad ?? 3),
        integridad: Number(activo.integridad ?? 3),
        disponibilidad: Number(activo.disponibilidad ?? 3),
        valor: activo.valor ?? "",
        estado: activo.estado ?? true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setSubmitError("");
  }, [open, activo]);

  const ciaAverage = useMemo(() => {
    const total =
      Number(formData.confidencialidad) +
      Number(formData.integridad) +
      Number(formData.disponibilidad);

    return (total / 3).toFixed(1);
  }, [
    formData.confidencialidad,
    formData.integridad,
    formData.disponibilidad,
  ]);

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

  const handleSliderChange = (name) => (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre del activo es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.tipo) {
      newErrors.tipo =
        "Selecciona el tipo de activo.";
    }

    if (!formData.criticidad) {
      newErrors.criticidad =
        "Selecciona la criticidad.";
    }

    if (
      formData.valor !== "" &&
      Number(formData.valor) < 0
    ) {
      newErrors.valor =
        "El valor económico no puede ser negativo.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const payload = {
      codigo: formData.nombre
      .toUpperCase()
      .replace(/\s/g, "_")
      .slice(0, 20),
      organizacion: Number(formData.organizacion),
      nombre: formData.nombre,
      tipo: formData.tipo, // HW, SW, INF
      confidencialidad: Number(formData.confidencialidad),
      integridad: Number(formData.integridad),
      disponibilidad: Number(formData.disponibilidad),
      valor_economico_usd: Number(formData.valor || 0),
      descripcion: formData.descripcion || "",
      ubicacion: formData.ubicacion || "",
      propietario: formData.propietario || "",
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar el activo."
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
          ? "Editar activo"
          : "Nuevo activo"}
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
                  label="Nombre del activo"
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
                  <InputLabel id="organizacion-activo-label">
                    Organización
                  </InputLabel>

                  <Select
                    labelId="organizacion-activo-label"
                    label="Organización"
                    name="organizacion"
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
                  error={Boolean(errors.tipo)}
                >
                  <InputLabel id="tipo-activo-label">
                    Tipo de activo
                  </InputLabel>

                  <Select
                  labelId="tipo-activo-label"
                  label="Tipo de activo"
                  name="tipo"
                  value={formData.tipo || ""}
                  onChange={handleChange}
                  disabled={loading}
                  >
                    <MenuItem value="">
                    <em>Selecciona un tipo</em>
                    </MenuItem>
                    {TIPOS_ACTIVO.map((tipo) => (
                      <MenuItem
                      key={tipo.value}
                      value={tipo.value}
                      >
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.tipo && (
                    <FormHelperText>
                      {errors.tipo}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(
                    errors.criticidad
                  )}
                >
                  <InputLabel id="criticidad-activo-label">
                    Criticidad
                  </InputLabel>

                  <Select
                    labelId="criticidad-activo-label"
                    label="Criticidad"
                    name="criticidad"
                    value={formData.criticidad}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {NIVELES_CRITICIDAD.map(
                      (nivel) => (
                        <MenuItem
                          key={nivel}
                          value={nivel}
                        >
                          {nivel}
                        </MenuItem>
                      )
                    )}
                  </Select>

                  {errors.criticidad && (
                    <FormHelperText>
                      {errors.criticidad}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Propietario o responsable"
                  name="propietario"
                  value={formData.propietario}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor económico estimado"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  error={Boolean(errors.valor)}
                  helperText={errors.valor}
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(
                        formData.estado
                      )}
                      onChange={handleChange}
                      name="estado"
                      disabled={loading}
                    />
                  }
                  label={
                    formData.estado
                      ? "Activo habilitado"
                      : "Activo deshabilitado"
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
                    fontWeight={700}
                    gutterBottom
                  >
                    Clasificación CIA
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Evalúa cada dimensión en una
                    escala del 1 al 3.
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Confidencialidad
                      </Typography>

                      <Slider
                        value={
                          formData.confidencialidad
                        }
                        onChange={handleSliderChange(
                          "confidencialidad"
                        )}
                        min={1}
                        max={3}
                        step={1}
                        marks={CIA_MARKS}
                        valueLabelDisplay="auto"
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Integridad
                      </Typography>

                      <Slider
                        value={formData.integridad}
                        onChange={handleSliderChange(
                          "integridad"
                        )}
                        min={1}
                        max={3}
                        step={1}
                        marks={CIA_MARKS}
                        valueLabelDisplay="auto"
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Disponibilidad
                      </Typography>

                      <Slider
                        value={
                          formData.disponibilidad
                        }
                        onChange={handleSliderChange(
                          "disponibilidad"
                        )}
                        min={1}
                        max={3}
                        step={1}
                        marks={CIA_MARKS}
                        valueLabelDisplay="auto"
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Promedio CIA
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="primary.main"
                    >
                      {ciaAverage} / 3
                    </Typography>
                  </Box>
                </Box>
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
            : "Crear activo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivoFormDialog;