import { useState } from "react";
import {
  Box,
  Toolbar,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar, {
  SIDEBAR_WIDTH,
} from "../components/Sidebar";

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const handleOpenSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f7fb",
      }}
    >
      <Navbar onOpenSidebar={handleOpenSidebar} />

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={handleCloseSidebar}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          },
          minWidth: 0,
        }}
      >
        <Toolbar />

        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;