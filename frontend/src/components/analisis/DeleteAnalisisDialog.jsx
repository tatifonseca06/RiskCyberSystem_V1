import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";

const DeleteAnalisisDialog = ({
  open,
  analisis,
  loading,
  onClose,
  onConfirm,
}) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    setError("");

    try {
      await onConfirm();
    } catch (requestError) {
      setError(
        requestError.message ||
          "No fue posible eliminar el análisis."
      );
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        Eliminar análisis FAIR
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <DialogContentText>
          ¿Seguro que deseas eliminar el análisis{" "}
          <strong>
            {analisis?.nombre ||
              "seleccionado"}
          </strong>
          ? También podrían eliminarse sus
          resultados de Monte Carlo.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && (
            <CircularProgress
              size={20}
              color="inherit"
              sx={{ mr: 1 }}
            />
          )}

          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAnalisisDialog;