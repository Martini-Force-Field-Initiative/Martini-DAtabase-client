export type Sections =
  | "database"
  | "home"
  | "molecule"
  | "builder"
  | "polymer"
  | "system"
  | "api"
  | "architecture";

export type ToogleSection = (arg0: Sections) => void;

export interface SectionProps {
  onClick: ToogleSection;
}
