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
  cve: "",
  cvss: 5,
  severidad: "Media",
  estadoRemediacion: "Pendiente",
  organizacion: "",
  activo: "",
  responsable: "",
  fechaDeteccion: "",
  fechaRemediacion: "",
  recomendacion: "",
  activa: true,
};

const SEVERIDADES = [
  "Informativa",
  "Baja",
  "Media",
  "Alta",
  "Crítica",
];

const ESTADOS_REMEDIACION = [
  "Pendiente",
  "En análisis",
  "En remediación",
  "Mitigada",
  "Remediada",
  "Aceptada",
];

const getSeverityFromCvss = (score) => {
  const numericScore = Number(score);

  if (numericScore === 0) {
    return "Informativa";
  }

  if (numericScore < 4) {
    return "Baja";
  }

  if (numericScore < 7) {
    return "Media";
  }

  if (numericScore < 9) {
    return "Alta";
  }

  return "Crítica";
};

const VulnerabilidadFormDialog = ({
  open,
  onClose,
  onSubmit,
  vulnerabilidad,
  organizaciones,
  activos,
  loading,
}) => {
  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const isEditing = Boolean(vulnerabilidad?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (vulnerabilidad) {
      const cvssValue = Number(
        vulnerabilidad.cvss ??
          vulnerabilidad.puntaje_cvss ??
          5
      );

      setFormData({
        nombre:
          vulnerabilidad.nombre ??
          vulnerabilidad.nombre_vulnerabilidad ??
          "",

        descripcion:
          vulnerabilidad.descripcion ?? "",

        cve:
          vulnerabilidad.cve ??
          vulnerabilidad.codigo_cve ??
          "",

        cvss: cvssValue,

        severidad:
          vulnerabilidad.severidad ??
          vulnerabilidad.nivel_severidad ??
          getSeverityFromCvss(cvssValue),

        estadoRemediacion:
          vulnerabilidad.estadoRemediacion ??
          vulnerabilidad.estado_remediacion ??
          vulnerabilidad.estado ??
          "Pendiente",

        organizacion:
          vulnerabilidad.organizacionId ??
          vulnerabilidad.organizacion_id ??
          (
            typeof vulnerabilidad.organizacion ===
            "object"
              ? vulnerabilidad.organizacion?.id
              : vulnerabilidad.organizacion
          ) ??
          "",

        activo:
          vulnerabilidad.activoId ??
          vulnerabilidad.activo_id ??
          (
            typeof vulnerabilidad.activo === "object"
              ? vulnerabilidad.activo?.id
              : vulnerabilidad.activo
          ) ??
          "",

        responsable:
          vulnerabilidad.responsable ??
          vulnerabilidad.asignado_a ??
          "",

        fechaDeteccion:
          vulnerabilidad.fechaDeteccion ??
          vulnerabilidad.fecha_deteccion ??
          "",

        fechaRemediacion:
          vulnerabilidad.fechaRemediacion ??
          vulnerabilidad.fecha_remediacion ??
          "",

        recomendacion:
          vulnerabilidad.recomendacion ??
          vulnerabilidad.solucion ??
          "",

        activa:
          vulnerabilidad.activa ??
          vulnerabilidad.habilitado ??
          true,
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError("");
  }, [open, vulnerabilidad]);

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
        const currentAsset = activos.find(
          (activo) =>
            String(activo.id) ===
            String(previous.activo)
        );

        if (
          currentAsset?.organizacionId &&
          String(currentAsset.organizacionId) !==
            String(value)
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

  const handleCvssChange = (
    event,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      cvss: value,
      severidad: getSeverityFromCvss(value),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre =
        "El nombre de la vulnerabilidad es obligatorio.";
    }

    if (!formData.organizacion) {
      newErrors.organizacion =
        "Selecciona una organización.";
    }

    if (!formData.activo) {
      newErrors.activo =
        "Selecciona un activo.";
    }

    if (
      Number(formData.cvss) < 0 ||
      Number(formData.cvss) > 10
    ) {
      newErrors.cvss =
        "El puntaje CVSS debe estar entre 0 y 10.";
    }

    if (
      formData.cve &&
      !/^CVE-\d{4}-\d{4,}$/i.test(
        formData.cve.trim()
      )
    ) {
      newErrors.cve =
        "Usa un formato válido, por ejemplo CVE-2025-12345.";
    }

    if (
      formData.fechaRemediacion &&
      formData.fechaDeteccion &&
      formData.fechaRemediacion <
        formData.fechaDeteccion
    ) {
      newErrors.fechaRemediacion =
        "La fecha de remediación no puede ser anterior a la detección.";
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
      cve: formData.cve.trim() || null,
      cvss: Number(formData.cvss),
      severidad: formData.severidad,
      estado_remediacion:
        formData.estadoRemediacion,
      organizacion: Number(
        formData.organizacion
      ),
      activo: Number(formData.activo),
      responsable:
        formData.responsable.trim(),
      fecha_deteccion:
        formData.fechaDeteccion || null,
      fecha_remediacion:
        formData.fechaRemediacion || null,
      recomendacion:
        formData.recomendacion.trim(),
      activa: Boolean(formData.activa),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error.message ||
          "No fue posible guardar la vulnerabilidad."
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
          ? "Editar vulnerabilidad"
          : "Nueva vulnerabilidad"}
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
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={Boolean(errors.nombre)}
                  helperText={errors.nombre}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código CVE"
                  name="cve"
                  value={formData.cve}
                  onChange={handleChange}
                  error={Boolean(errors.cve)}
                  helperText={
                    errors.cve ||
                    "Ejemplo: CVE-2025-12345"
                  }
                  disabled={loading}
                  inputProps={{
                    style: {
                      textTransform: "uppercase",
                    },
                  }}
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
                  <InputLabel id="vulnerabilidad-organizacion-label">
                    Organización
                  </InputLabel>

                  <Select
                    labelId="vulnerabilidad-organizacion-label"
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
                  <InputLabel id="vulnerabilidad-activo-label">
                    Activo afectado
                  </InputLabel>

                  <Select
                    labelId="vulnerabilidad-activo-label"
                    label="Activo afectado"
                    name="activo"
                    value={formData.activo}
                    onChange={handleChange}
                    disabled={loading}
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
                <FormControl fullWidth>
                  <InputLabel id="vulnerabilidad-severidad-label">
                    Severidad
                  </InputLabel>

                  <Select
                    labelId="vulnerabilidad-severidad-label"
                    label="Severidad"
                    name="severidad"
                    value={formData.severidad}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {SEVERIDADES.map(
                      (severidad) => (
                        <MenuItem
                          key={severidad}
                          value={severidad}
                        >
                          {severidad}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="vulnerabilidad-estado-label">
                    Estado de remediación
                  </InputLabel>

                  <Select
                    labelId="vulnerabilidad-estado-label"
                    label="Estado de remediación"
                    name="estadoRemediacion"
                    value={
                      formData.estadoRemediacion
                    }
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {ESTADOS_REMEDIACION.map(
                      (estado) => (
                        <MenuItem
                          key={estado}
                          value={estado}
                        >
                          {estado}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Responsable"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(
                        formData.activa
                      )}
                      onChange={handleChange}
                      name="activa"
                      disabled={loading}
                    />
                  }
                  label={
                    formData.activa
                      ? "Vulnerabilidad activa"
                      : "Vulnerabilidad cerrada"
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de detección"
                  name="fechaDeteccion"
                  value={
                    formData.fechaDeteccion
                  }
                  onChange={handleChange}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de remediación"
                  name="fechaRemediacion"
                  value={
                    formData.fechaRemediacion
                  }
                  onChange={handleChange}
                  error={Boolean(
                    errors.fechaRemediacion
                  )}
                  helperText={
                    errors.fechaRemediacion
                  }
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                  >
                    Puntaje CVSS
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Define la severidad técnica en
                    una escala de 0 a 10.
                  </Typography>

                  <Slider
                    value={Number(formData.cvss)}
                    onChange={handleCvssChange}
                    min={0}
                    max={10}
                    step={0.1}
                    marks={[
                      {
                        value: 0,
                        label: "0",
                      },
                      {
                        value: 4,
                        label: "4",
                      },
                      {
                        value: 7,
                        label: "7",
                      },
                      {
                        value: 9,
                        label: "9",
                      },
                      {
                        value: 10,
                        label: "10",
                      },
                    ]}
                    valueLabelDisplay="auto"
                    disabled={loading}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Severidad calculada
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="primary.main"
                    >
                      {Number(
                        formData.cvss
                      ).toFixed(1)}{" "}
                      — {formData.severidad}
                    </Typography>
                  </Box>

                  {errors.cvss && (
                    <FormHelperText error>
                      {errors.cvss}
                    </FormHelperText>
                  )}
                </Box>
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
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Recomendación de remediación"
                  name="recomendacion"
                  value={formData.recomendacion}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          alignSelf: "flex-start",
                          mt: 1.5,
                        }}
                      >
                        ✓
                      </InputAdornment>
                    ),
                  }}
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
            : "Crear vulnerabilidad"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VulnerabilidadFormDialog;