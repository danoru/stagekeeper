import { Box, IconButton } from "@mui/material";
import { useContext } from "react";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";

function Topbar() {
  return (
    <Box display="flex" justifyContent="space-between" padding={2}>
      <Box display="flex" borderRadius="3px"></Box>
      <Box display="flex">
        <IconButton>
          <LightModeOutlined />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Topbar;
