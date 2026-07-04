import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Logout,
  Menu as MenuIcon,
  Person,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const getInitials = (user) => {
  const firstName =
    user?.firstName ??
    user?.first_name ??
    "";

  const lastName =
    user?.lastName ??
    user?.last_name ??
    "";

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  }

  const username =
    user?.username ??
    user?.email ??
    "U";

  return username.substring(0, 2).toUpperCase();
};

const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorElement, setAnchorElement] =
    useState(null);

  const isMenuOpen = Boolean(anchorElement);

  const handleOpenMenu = (event) => {
    setAnchorElement(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorElement(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,
        backgroundColor: "#071b2e",
        borderBottom:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onOpenSidebar}
          sx={{
            mr: 2,
            display: {
              md: "none",
            },
          }}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            noWrap
          >
            RiskCyberSystem
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.65)",
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            Gestión integral de riesgos cibernéticos
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
              textAlign: "right",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
            >
              {user?.username ||
                user?.email ||
                "Usuario"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {user?.role ||
                user?.rol ||
                "Usuario del sistema"}
            </Typography>
          </Box>

          <Tooltip title="Cuenta">
            <IconButton
              onClick={handleOpenMenu}
              sx={{ p: 0 }}
              aria-label="Abrir opciones de cuenta"
            >
              <Avatar
                sx={{
                  background:
                    "linear-gradient(135deg, #00a8a8, #1976d2)",
                  fontWeight: 700,
                }}
              >
                {getInitials(user)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorElement}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled>
            <Person sx={{ mr: 1.5 }} />
            {user?.email ||
              user?.username ||
              "Usuario"}
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1.5 }} />
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;