import { useState, useEffect } from "react";
import CircularProgress from // CircularProgressProps,
"@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/*interface BlockerProps {
  width: number;
  height: number;
  visible: boolean;
}*/

export function Blocker() {
  //const [isVisible, setVisible] = useState(false);

  return (
    <div
      className="viewerBlocker"
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.9)",
        zIndex: "5",
        paddingTop: "20%",
        verticalAlign: "center",
        //display: isVisible ? "inline" : "none",
      }}
    >
      <Box position="relative" display="inline-flex">
        <CircularProgress size="12rem" />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="body1"
            component="div"
            sx={{ color: "text.primary" }}
          >
            Computing Layout
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
