import Chip from "@mui/material/Chip";
import GitHubIcon from "@mui/icons-material/GitHub";

export interface GitHubChipsProps {
  url: string;
  alias: string;
  iconSize?: number;
  fontSize?: number;
}

export default function GitHubChip(props: GitHubChipsProps) {
  const { url, alias, iconSize = 1, fontSize = 0.7 } = props;

  return (
    <Chip
      icon={<GitHubIcon />}
      label={alias}
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      clickable
      variant="outlined"
      sx={{
        height: "auto",
        alignItems: "center",
        "& .MuiChip-label": {
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
          fontSize: `${fontSize}rem`,
          fontStyle: "italic",
          px: 1,
        },
        "& .MuiChip-icon": {
          fontSize: `${iconSize}rem`,
        },
      }}
    />
  );
}
