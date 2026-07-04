import {
  Assessment,
  Business,
  Dashboard,
  GppMaybe,
  Healing,
  Inventory2,
  Science,
  Security,
  Shield,
  WarningAmber,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

export const SIDEBAR_WIDTH = 270;

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
  },
  {
    label: "Activos",
    path: "/activos",
    icon: <Inventory2 />,
  },
  {
    label: "Amenazas",
    path: "/amenazas",
    icon: <WarningAmber />,
  },
  {
    label: "Vulnerabilidades",
    path: "/vulnerabilidades",
    icon: <GppMaybe />,
  },
  {
    label: "Escenarios",
    path: "/escenarios",
    icon: <Security />,
  },
  {
    label: "Análisis FAIR",
    path: "/analisis",
    icon: <Assessment />,
  },
  {
    label: "Monte Carlo",
    path: "/monte-carlo",
    icon: <Science />,
  },
  {
    label: "Tratamientos",
    path: "/tratamientos",
    icon: <Healing />,
  },
  {
    label: "Organizaciones",
    path: "/organizaciones",
    icon: <Business />,
  },
];

const SidebarContent = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a2239",
        color: "white",
      }}
    >
      <Toolbar />

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Shield
          sx={{
            color: "#37d5d5",
          }}
        />

        <Box>
          <Typography
            fontWeight={800}
            variant="body1"
          >
            Navegación
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Módulos del sistema
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />

      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        {menuItems.map((menuItem) => {
          const isSelected =
            location.pathname === menuItem.path ||
            location.pathname.startsWith(
              `${menuItem.path}/`
            );

          return (
            <ListItemButton
              key={menuItem.path}
              selected={isSelected}
              onClick={() =>
                handleNavigation(menuItem.path)
              }
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: isSelected
                  ? "white"
                  : "rgba(255,255,255,0.72)",
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, rgba(0,168,168,0.8), rgba(25,118,210,0.8))",
                },
                "&.Mui-selected:hover": {
                  background:
                    "linear-gradient(135deg, rgba(0,168,168,0.9), rgba(25,118,210,0.9))",
                },
                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: "inherit",
                }}
              >
                {menuItem.icon}
              </ListItemIcon>

              <ListItemText
                primary={menuItem.label}
                primaryTypographyProps={{
                  fontWeight: isSelected
                    ? 700
                    : 500,
                  fontSize: "0.94rem",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

const Sidebar = ({
  mobileOpen,
  onClose,
}) => {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};

export default Sidebar;