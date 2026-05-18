import { ReactNode } from "react";
import WarningIcon from "@material-ui/icons/Warning";

interface tutoIM {
  message: ReactNode;
  loc?: "side" | "up";
  type?: "todo" | "info" | "warning";
  icon?: ReactNode;
}
export function TutorialMessage(props: tutoIM) {
  const iconLocation = props.loc ?? "side";
  const type = props.type ?? "todo";
  let icon = props?.icon;
  if (icon === undefined) {
    icon = <i className="material-icons inline-icon">launch</i>;
    if (type === "info")
      icon = <i className="material-icons inline-icon">info_outline</i>;
    if (type === "warning") icon = <WarningIcon />;
  }

  // Not using it right now
  return (
    <>
      <div
        className={type}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1em",
          alignItems: "center",
        }}
      >
        <div>{icon}</div>
        <div>{props.message}</div>
      </div>
    </>
  );
}
