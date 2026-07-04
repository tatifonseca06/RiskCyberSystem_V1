import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";

const MonteCarloDialog = ({
  open,
  analisis,
  loading,
  onClose,
  onExecute,
}) => {
  const [iteraciones, setIteraciones] =
    useState(10000);

  const [
    nivelConfianza,
    setNivelConfianza,
  ] = useState(95);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setIteraciones(
      Number(analisis?.iteraciones || 10000)
    );

    setNivelConfianza(
      Number(analisis?.confianza || 95)
    );

    setError("");
  }, [open, analisis]);

  const handleExecute = async () => {
    const iterations = Number(iteraciones);
    const confidence = Number(
      nivelConfianza
    );

    if (
      !Number.isInteger(iterations) ||
      iterations < 1000 ||
      iterations > 1000000
    ) {
      setError(
        "Las iteraciones deben estar entre 1.000 y 1.000.000."
      );
      return;
    }

    if (
      confidence < 50 ||
      confidence > 99.9
    ) {
      setError(
        "El nivel de confianza debe estar entre 50 y 99.9."
      );
      return;
    }

    setError("");

    try {
      await onExecute({
        iteraciones: iterations,
        nivelConfianza: confidence,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "No fue posible ejecutar la simulación."
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
      maxWidth="sm"
    >
      <DialogTitle>
        Ejecutar Monte Carlo
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
            >
              {analisis?.nombre}
            </Typography>

            <Typography
              color="text.secondary"
            >
              {analisis?.escenarioNombre}
            </Typography>
          </Box>

          <Alert severity="info">
            La simulación utilizará las
            distribuciones mínima, probable y máxima
            definidas para LEF y magnitud de pérdida.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Iteraciones"
                value={iteraciones}
                onChange={(event) =>
                  setIteraciones(
                    event.target.value
                  )
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
                value={nivelConfianza}
                onChange={(event) =>
                  setNivelConfianza(
                    event.target.value
                  )
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
          onClick={handleExecute}
          disabled={loading}
        >
          {loading && (
            <CircularProgress
              size={20}
              color="inherit"
              sx={{ mr: 1 }}
            />
          )}

          Ejecutar simulación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonteCarloDialog;