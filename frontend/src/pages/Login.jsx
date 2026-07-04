import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Security,
} from "@mui/icons-material";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination =
    location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    document.title = "Iniciar sesión | RiskCyberSystem";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username =
        "Ingresa tu nombre de usuario.";
    }

    if (!formData.password) {
      newErrors.password =
        "Ingresa tu contraseña.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.message ||
          "No fue posible iniciar sesión."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #061426 0%, #0b2647 45%, #0d5c63 100%)",
        py: 4,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "rgba(0, 229, 255, 0.08)",
          top: -160,
          right: -100,
          filter: "blur(4px)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "rgba(33, 150, 243, 0.08)",
          bottom: -140,
          left: -80,
          filter: "blur(4px)",
        }}
      />

      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            position: "relative",
            borderRadius: 4,
            border:
              "1px solid rgba(255,255,255,0.15)",
            backgroundColor:
              "rgba(255,255,255,0.97)",
            backdropFilter: "blur(16px)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 5,
              },
            }}
          >
            <Stack
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #0b5fa5, #00a8a8)",
                  color: "white",
                  boxShadow:
                    "0 12px 30px rgba(11, 95, 165, 0.3)",
                }}
              >
                <Security sx={{ fontSize: 40 }} />
              </Box>

              <Typography
                component="h1"
                variant="h4"
                fontWeight={800}
                textAlign="center"
                color="primary.main"
              >
                RiskCyberSystem
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
              >
                Plataforma de gestión y análisis de
                riesgos cibernéticos
              </Typography>
            </Stack>

            {location.state?.sessionExpired && (
              <Alert
                severity="info"
                sx={{ mb: 3 }}
              >
                Inicia sesión para acceder al sistema.
              </Alert>
            )}

            {serverError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
              >
                {serverError}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  autoFocus
                  label="Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                  disabled={isSubmitting}
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setShowPassword(
                              (currentValue) =>
                                !currentValue
                            )
                          }
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.4,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(135deg, #0b5fa5, #008f95)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={22}
                        color="inherit"
                        sx={{ mr: 1.5 }}
                      />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              sx={{ mt: 4 }}
            >
              Acceso exclusivo para usuarios autorizados.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;