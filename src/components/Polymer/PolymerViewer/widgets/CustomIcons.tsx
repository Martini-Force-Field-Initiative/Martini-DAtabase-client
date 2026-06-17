import Box from "@mui/material/Box";
import AnchorTwoToneIcon from "@mui/icons-material/AnchorTwoTone";
import PushPinTwoToneIcon from "@mui/icons-material/PushPinTwoTone";

interface BarredAnchorIconProps {
  style?: React.CSSProperties;
}

export function BarredAnchorIcon({ style }: BarredAnchorIconProps) {
  return (
    <Box
      component="span"
      style={style}
      sx={{
        position: "relative",
        display: "inline-flex",
        fontSize: "1.5rem", // default; overridden by style.fontSize if passed
      }}
    >
      <AnchorTwoToneIcon sx={{ fontSize: "inherit" }} />
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <line
          x1="3"
          y1="21"
          x2="21"
          y2="3"
          stroke="currentColor"
          strokeWidth="2"
        />
      </Box>
    </Box>
  );
}

export function BarredPushPinIcon({ style }: BarredAnchorIconProps) {
  return (
    <Box
      component="span"
      style={style}
      sx={{
        position: "relative",
        display: "inline-flex",
        fontSize: "1.5rem", // default; overridden by style.fontSize if passed
      }}
    >
      <PushPinTwoToneIcon sx={{ fontSize: "inherit" }} />
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <line
          x1="3"
          y1="21"
          x2="21"
          y2="3"
          stroke="currentColor"
          strokeWidth="2"
        />
      </Box>
    </Box>
  );
}
