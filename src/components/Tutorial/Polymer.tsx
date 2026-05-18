import { Typography, Box } from "@material-ui/core";
import "./index.css";

import { SectionProps } from "./types";
const Polymer = (props: SectionProps) => {
  return (
    <div className="container">
      <Typography variant="h2">Polymer Builder</Typography>
    </div>
  );
};
export default Polymer;
