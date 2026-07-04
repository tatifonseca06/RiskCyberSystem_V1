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

const DeleteActivoDialog = ({
  open,
  activo,
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
          "No fue posible eliminar el activo."
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
        Eliminar activo
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
          ¿Seguro que deseas eliminar el activo{" "}
          <strong>
            {activo?.nombre ||
              "seleccionado"}
          </strong>
          ? Esta acción no se puede deshacer.
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

export default DeleteActivoDialog;