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

const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  categoria: "",
  origen: "",
  probabilidad: "Media",
  frecuenciaAnual: "",
  impacto: "Medio",
  organizacion: "",
  activo: "",
  estado: true,
};

const CATEGORIAS = [
  "Malware",
  "Ransomware",
  "Phishing",
  "Ingeniería social",
  "Acceso no autorizado",
  "Fuga de información",
  "Denegación de servicio",
  "Amenaza interna",
  "Fraude",
  "Error humano",
  "Falla tecnológica",
  "Desastre natural",
  "Cadena de suministro",
  "Otro",
];

const ORIGENES = [
  "Externo",
  "Interno",
  "Tercero",
  "Ambiental",
  "Tecnológico",
  "Humano",
  "Mixto",
];

const PROBABILIDADES = [
  "Muy baja",
  "Baja",
  "Media",
  "Alta",
  "Muy alta",
];

const IMPACTOS = [
  "Muy bajo",
  "Bajo",
  "Medio",
  "Alto",
  "Crítico",
];

const PROBABILITY_MARKS = [
  {
    value: 1,
    label: "Muy baja",
  },
  {
    value: 2,
    label: "Baja",
  },
  {
    value: 3,
    label: "Media",
  },
  {
    value: 4,
    label: "Alta",
  },
  {
    value: 5,
    label: "Muy alta",
  },
];

const PROBABILITY_VALUES = {
  "Muy baja": 1,
  Baja: 2,
  Media: 3,
  Alta: 4,
  "Muy alta": 5,
};

const PROBABILITY_LABELS = {
  1: "Muy baja",
  2: "Baja",
  3: "Media",
  4: "Alta",
  5: "Muy alta",
};

const AmenazaFormDialog = ({
  open,
  onClose,
  onSubmit,
  amenaza,
  organizaciones,
  activos,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(amenaza?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (amenaza) {
      setFormData({
        nombre:
          amenaza.nombre ??
          amenaza.nombre_amenaza ??
          "",

        descripcion:
          amenaza.descripcion ??
          "",

        categoria:
          amenaza.categoria ??
          amenaza.tipo ??
          amenaza.tipo_amenaza ??
          "",

        origen:
          amenaza.origen ??
          amenaza.fuente ??
          "",

        probabilidad:
          amenaza.probabilidad ??
          amenaza.nivel_probabilidad ??
          "Media",

        frecuenciaAnual:
          amenaza.frecuenciaAnual ??
          amenaza.frecuencia_anual ??
          amenaza.frecuencia ??
          "",

        impacto:
          amenaza.impacto ??
          amenaza.nivel_impacto ??
          "Medio",

        organizacion:
          amenaza.organizacionId ??
          amenaza.organizacion_id ??
          (
            typeof amenaza.organizacion ===
            "object"
              ? amenaza.organizacion?.id
              : amenaza.organizacion
          ) ??
          "",

        activo:
          amenaza.activoId ??
          amenaza.activo_id ??
          (
            typeof amenaza.activo === "object"
              ? amenaza.activo?.id
              : amenaza.activo
          ) ??
          "",

        estado:
          amenaza.estado ??
          amenaza.habilitado ??
          true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, amenaza]);

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
  }, [
    activos,
    formData.organizacion,
  ]);

  const probabilitySliderValue =
    PROBABILITY_VALUES[
      formData.probabilidad
    ] ?? 3;

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
        const selectedAsset = activos.find(
          (activo) =>
            String(activo.id) ===
            String(previous.activo)
        );

        if (
          selectedAsset?.organizacionId &&
          String(
            selectedAsset.organizacionId
          ) !== String(value)
        ) {
          updated.activo = "";
        }
      }

      return updated;
    });

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleProbabilityChange = (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      probabilidad:
        PROBABILITY_LABELS[value] ??
        "Media",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre de la amenaza es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.categoria) {
      newErrors.categoria =
        "Selecciona una categoría.";
    }

    if (!formData.origen) {
      newErrors.origen =
        "Selecciona el origen.";
    }

    if (!formData.probabilidad) {
      newErrors.probabilidad =
        "Selecciona la probabilidad.";
    }

    if (
      formData.frecuenciaAnual !== "" &&
      Number(formData.frecuenciaAnual) < 0
    ) {
      newErrors.frecuenciaAnual =
        "La frecuencia anual no puede ser negativa.";
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
      categoria: formData.categoria,
      origen: formData.origen,
      probabilidad:
        formData.probabilidad,
      frecuencia_anual:
        formData.frecuenciaAnual === ""
          ? 0
          : Number(
              formData.frecuenciaAnual
            ),
      impacto: formData.impacto,
      organizacion: Number(
        formData.organizacion
      ),
      activo: formData.activo
        ? Number(formData.activo)
        : null,
      estado: Boolean(formData.estado),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar la amenaza."
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
          ? "Editar amenaza"
          : "Nueva amenaza"}
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
                  label="Nombre de la amenaza"
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
                  <InputLabel id="amenaza-organizacion-label">
                    Organización
                  </InputLabel>

                  <Select
                    labelId="amenaza-organizacion-label"
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
                  error={Boolean(
                    errors.categoria
                  )}
                >
                  <InputLabel id="amenaza-categoria-label">
                    Categoría
                  </InputLabel>

                  <Select
                    labelId="amenaza-categoria-label"
                    label="Categoría"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>
                        Selecciona una categoría
                      </em>
                    </MenuItem>

                    {CATEGORIAS.map(
                      (categoria) => (
                        <MenuItem
                          key={categoria}
                          value={categoria}
                        >
                          {categoria}
                        </MenuItem>
                      )
                    )}
                  </Select>

                  {errors.categoria && (
                    <FormHelperText>
                      {errors.categoria}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.origen)}
                >
                  <InputLabel id="amenaza-origen-label">
                    Origen
                  </InputLabel>

                  <Select
                    labelId="amenaza-origen-label"
                    label="Origen"
                    name="origen"
                    value={formData.origen}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>
                        Selecciona un origen
                      </em>
                    </MenuItem>

                    {ORIGENES.map((origen) => (
                      <MenuItem
                        key={origen}
                        value={origen}
                      >
                        {origen}
                      </MenuItem>
                    ))}
                  </Select>

                  {errors.origen && (
                    <FormHelperText>
                      {errors.origen}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="amenaza-activo-label">
                    Activo relacionado
                  </InputLabel>

                  <Select
                    labelId="amenaza-activo-label"
                    label="Activo relacionado"
                    name="activo"
                    value={formData.activo}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      Todos los activos
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
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="amenaza-impacto-label">
                    Impacto estimado
                  </InputLabel>

                  <Select
                    labelId="amenaza-impacto-label"
                    label="Impacto estimado"
                    name="impacto"
                    value={formData.impacto}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {IMPACTOS.map((impacto) => (
                      <MenuItem
                        key={impacto}
                        value={impacto}
                      >
                        {impacto}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Frecuencia anual estimada"
                  name="frecuenciaAnual"
                  value={
                    formData.frecuenciaAnual
                  }
                  onChange={handleChange}
                  error={Boolean(
                    errors.frecuenciaAnual
                  )}
                  helperText={
                    errors.frecuenciaAnual ||
                    "Cantidad estimada de eventos por año."
                  }
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
                      ? "Amenaza activa"
                      : "Amenaza inactiva"
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
                    Probabilidad de ocurrencia
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Selecciona el nivel estimado de
                    ocurrencia de la amenaza.
                  </Typography>

                  <Slider
                    value={
                      probabilitySliderValue
                    }
                    onChange={
                      handleProbabilityChange
                    }
                    min={1}
                    max={5}
                    step={1}
                    marks={PROBABILITY_MARKS}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) =>
                      PROBABILITY_LABELS[value]
                    }
                    disabled={loading}
                  />

                  <Typography
                    align="center"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ mt: 2 }}
                  >
                    {formData.probabilidad}
                  </Typography>

                  {errors.probabilidad && (
                    <FormHelperText error>
                      {errors.probabilidad}
                    </FormHelperText>
                  )}
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
            : "Crear amenaza"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AmenazaFormDialog;