import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";

interface FinalStepBlockerProps {
  /** Open the results/download dialog. */
  onDownload: () => void;
}

/**
 * Full-cover overlay shown once the pipeline has finished successfully.
 *
 * It is positioned absolutely and must be rendered inside a positioned ancestor
 * (the viewer's `#svg-host`). Being an opaque, full-size div it intercepts all
 * pointer events, so the SVG underneath becomes unresponsive — the polymer is
 * "frozen" in its finalized state. The only action offered is downloading the
 * result files (which can seed a new session). zIndex sits above the busy
 * `Blocker` (z 5) and, crucially, above the GridButton / Legend overlays
 * (z 300) so they don't poke through the finalized blocker.
 */
export function FinalStepBlocker({ onDownload }: FinalStepBlockerProps) {
  return (
    <div
      className="viewerBlocker"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 400,
        background: "rgba(255, 255, 255, 0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <Typography variant="h6">Polymer generated</Typography>
      <Typography>
        Your files are ready — download them to start a new session.
      </Typography>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={onDownload}
      >
        Download files
      </Button>
    </div>
  );
}
