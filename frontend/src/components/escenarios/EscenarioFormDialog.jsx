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
  activo: "",
  amenaza: "",
  vulnerabilidad: "",
  frecuencia: 3,
  impacto: 3,
  probabilidad: "Media",
  estado: "Identificado",
  activoEstado: true,
};

const PROBABILIDADES = [
  "Muy baja",
  "Baja",
  "Media",
  "Alta",
  "Muy alta",
];

const ESTADOS = [
  "Identificado",
  "En análisis",
  "Evaluado",
  "En tratamiento",
  "Aceptado",
  "Cerrado",
];

const SCALE_MARKS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

const getRiskScore = (frequency, impact) => {
  return Number(frequency || 0) * Number(impact || 0);
};

const getRiskLevel = (score) => {
  if (score >= 20) {
    return "Crítico";
  }

  if (score >= 12) {
    return "Alto";
  }

  if (score >= 6) {
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
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(escenario?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (escenario) {
      setFormData({
        nombre:
          escenario.nombre ??
          escenario.nombre_escenario ??
          "",

        descripcion:
          escenario.descripcion ??
          escenario.evento_riesgo ??
          "",

        organizacion:
          escenario.organizacionId ??
          escenario.organizacion_id ??
          "",

        activo:
          escenario.activoId ??
          escenario.activo_id ??
          "",

        amenaza:
          escenario.amenazaId ??
          escenario.amenaza_id ??
          "",

        vulnerabilidad:
          escenario.vulnerabilidadId ??
          escenario.vulnerabilidad_id ??
          "",

        frecuencia:
          Number(
            escenario.frecuencia ??
              escenario.frecuencia_anual ??
              3
          ),

        impacto:
          Number(
            escenario.impacto ??
              escenario.impacto_estimado ??
              3
          ),

        probabilidad:
          escenario.probabilidad ??
          escenario.nivel_probabilidad ??
          "Media",

        estado:
          escenario.estado ??
          "Identificado",

        activoEstado:
          escenario.activoEstado ??
          escenario.activo_estado ??
          true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, escenario]);

  const filteredAssets = useMemo(() => {
    if (!formData.organizacion) {
      return activos;
    }

    return activos.filter((activo) => {
      if (!activo.organizacionId) {
        return true;
      }

      return (
        String(activo.organizacionId) ===
        String(formData.organizacion)
      );
    });
  }, [activos, formData.organizacion]);

  const filteredThreats = useMemo(() => {
    return amenazas.filter((amenaza) => {
      const organizationMatches =
        !formData.organizacion ||
        !amenaza.organizacionId ||
        String(amenaza.organizacionId) ===
          String(formData.organizacion);

      const assetMatches =
        !formData.activo ||
        !amenaza.activoId ||
        String(amenaza.activoId) ===
          String(formData.activo);

      return organizationMatches && assetMatches;
    });
  }, [
    amenazas,
    formData.organizacion,
    formData.activo,
  ]);

  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilidades.filter(
      (vulnerabilidad) => {
        const organizationMatches =
          !formData.organizacion ||
          !vulnerabilidad.organizacionId ||
          String(
            vulnerabilidad.organizacionId
          ) === String(formData.organizacion);

        const assetMatches =
          !formData.activo ||
          !vulnerabilidad.activoId ||
          String(vulnerabilidad.activoId) ===
            String(formData.activo);

        return organizationMatches && assetMatches;
      }
    );
  }, [
    vulnerabilidades,
    formData.organizacion,
    formData.activo,
  ]);

  const riskScore = useMemo(() => {
    return getRiskScore(
      formData.frecuencia,
      formData.impacto
    );
  }, [formData.frecuencia, formData.impacto]);

  const riskLevel = useMemo(() => {
    return getRiskLevel(riskScore);
  }, [riskScore]);

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
        updated.activo = "";
        updated.amenaza = "";
        updated.vulnerabilidad = "";
      }

      if (name === "activo") {
        updated.amenaza = "";
        updated.vulnerabilidad = "";
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleSliderChange = (field) => (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre del escenario es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.activo) {
      newErrors.activo =
        "Selecciona un activo.";
    }

    if (!formData.amenaza) {
      newErrors.amenaza =
        "Selecciona una amenaza.";
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
      activo: Number(formData.activo),
      amenaza: Number(formData.amenaza),
      vulnerabilidad:
        formData.vulnerabilidad
          ? Number(formData.vulnerabilidad)
          : null,
      frecuencia: Number(
        formData.frecuencia
      ),
      impacto: Number(formData.impacto),
      probabilidad:
        formData.probabilidad,
      nivel_riesgo: riskLevel,
      estado: formData.estado,
      activo_estado: Boolean(
        formData.activoEstado
      ),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar el escenario."
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
          ? "Editar escenario de riesgo"
          : "Nuevo escenario de riesgo"}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nombre del escenario"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={Boolean(errors.nombre)}
                  helperText={errors.nombre}
                  disabled={loading}
                  placeholder="Ejemplo: Ransomware sobre servidor de base de datos"
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
                  <InputLabel id="escenario-organizacion-label">
                    Organización
                  </InputLabel>

                  <Select
                    labelId="escenario-organizacion-label"
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
                  error={Boolean(errors.activo)}
                >
                  <InputLabel id="escenario-activo-label">
                    Activo
                  </InputLabel>

                  <Select
                    labelId="escenario-activo-label"
                    label="Activo"
                    name="activo"
                    value={formData.activo}
                    onChange={handleChange}
                    disabled={
                      loading ||
                      !formData.organizacion
                    }
                  >
                    <MenuItem value="">
                      <em>
                        Selecciona un activo
                      </em>
                    </MenuItem>

                    {filteredAssets.map(
                      (activo) => (
                        <MenuItem
                          key={activo.id}
                          value={activo.id}
                        >
                          {activo.nombre}
                        </MenuItem>
                      )
                    )}
                  </Select>

                  {errors.activo && (
                    <FormHelperText>
                      {errors.activo}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.amenaza)}
                >
                  <InputLabel id="escenario-amenaza-label">
                    Amenaza
                  </InputLabel>

                  <Select
                    labelId="escenario-amenaza-label"
                    label="Amenaza"
                    name="amenaza"
                    value={formData.amenaza}
                    onChange={handleChange}
                    disabled={
                      loading ||
                      !formData.activo
                    }
                  >
                    <MenuItem value="">
                      <em>
                        Selecciona una amenaza
                      </em>
                    </MenuItem>

                    {filteredThreats.map(
                      (amenaza) => (
                        <MenuItem
                          key={amenaza.id}
                          value={amenaza.id}
                        >
                          {amenaza.nombre}
                        </MenuItem>
                      )
                    )}
                  </Select>

                  {errors.amenaza && (
                    <FormHelperText>
                      {errors.amenaza}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="escenario-vulnerabilidad-label">
                    Vulnerabilidad
                  </InputLabel>

                  <Select
                    labelId="escenario-vulnerabilidad-label"
                    label="Vulnerabilidad"
                    name="vulnerabilidad"
                    value={
                      formData.vulnerabilidad
                    }
                    onChange={handleChange}
                    disabled={
                      loading ||
                      !formData.activo
                    }
                  >
                    <MenuItem value="">
                      Sin vulnerabilidad específica
                    </MenuItem>

                    {filteredVulnerabilities.map(
                      (vulnerabilidad) => (
                        <MenuItem
                          key={vulnerabilidad.id}
                          value={vulnerabilidad.id}
                        >
                          {vulnerabilidad.nombre}
                          {vulnerabilidad.severidad
                            ? ` — ${vulnerabilidad.severidad}`
                            : ""}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="escenario-probabilidad-label">
                    Probabilidad
                  </InputLabel>

                  <Select
                    labelId="escenario-probabilidad-label"
                    label="Probabilidad"
                    name="probabilidad"
                    value={formData.probabilidad}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {PROBABILIDADES.map(
                      (probabilidad) => (
                        <MenuItem
                          key={probabilidad}
                          value={probabilidad}
                        >
                          {probabilidad}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="escenario-estado-label">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="escenario-estado-label"
                    label="Estado"
                    name="estado"
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
                  label="Descripción del evento de riesgo"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Describe cómo la amenaza podría explotar la vulnerabilidad y afectar al activo."
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
                    Evaluación preliminar
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Evalúa la frecuencia y el
                    impacto en una escala de 1 a 5.
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Frecuencia estimada
                      </Typography>

                      <Slider
                        value={Number(
                          formData.frecuencia
                        )}
                        onChange={handleSliderChange(
                          "frecuencia"
                        )}
                        min={1}
                        max={5}
                        step={1}
                        marks={SCALE_MARKS}
                        valueLabelDisplay="auto"
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        Impacto estimado
                      </Typography>

                      <Slider
                        value={Number(
                          formData.impacto
                        )}
                        onChange={handleSliderChange(
                          "impacto"
                        )}
                        min={1}
                        max={5}
                        step={1}
                        marks={SCALE_MARKS}
                        valueLabelDisplay="auto"
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      justifyContent:
                        "space-between",
                      alignItems: {
                        xs: "flex-start",
                        sm: "center",
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        color="text.secondary"
                      >
                        Puntaje preliminar
                      </Typography>

                      <Typography
                        variant="h4"
                        fontWeight={800}
                      >
                        {riskScore} / 25
                      </Typography>
                    </Box>

                    <Chip
                      label={`Riesgo ${riskLevel}`}
                      color={getRiskColor(
                        riskLevel
                      )}
                      sx={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        px: 1.5,
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Frecuencia anual"
                  name="frecuencia"
                  value={formData.frecuencia}
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Impacto estimado"
                  name="impacto"
                  value={formData.impacto}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(
                        formData.activoEstado
                      )}
                      onChange={handleChange}
                      name="activoEstado"
                      disabled={loading}
                    />
                  }
                  label={
                    formData.activoEstado
                      ? "Escenario habilitado"
                      : "Escenario deshabilitado"
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
            : "Crear escenario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EscenarioFormDialog;