import { Box } from "@mui/system";
import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Paper, Tooltip } from "@mui/material";
import "./index.css";

interface CtcProps {
  inputText: string;
}

const CopyToClipboard = (props: CtcProps) => {
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState(props.inputText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Paper className="copy-box">
      <Box sx={{ p: "0.5em" }}>{shortUrl}</Box>
      <Tooltip title="Copy to clipboard">
        <Button onClick={handleCopy} sx={{ minWidth: "30px" }}>
          <ContentCopyIcon sx={{ height: "20px", color: "#216C17" }} />
        </Button>
      </Tooltip>
    </Paper>
  );
};

export default CopyToClipboard;
