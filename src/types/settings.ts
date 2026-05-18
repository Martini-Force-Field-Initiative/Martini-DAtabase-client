export interface SettingsJson {
  force_fields: string[];
  create_way: { [wayId: string]: string };
  category_tree: CategoryTree;
  force_fields_info: ForceFieldsInfo;
  vermouth_libs_info: VermouthLibsInfo;
}

interface ForceFieldsInfo {
  [ff_name: string]: {
    polarizable: boolean;
    martinize2_support: boolean;
    insane_support: boolean;
    downloadable: boolean;
    metadata?: ForceFieldMetadata;
  };
}

export interface VermouthLibsInfo {
  [vlib_name: string]: {
    files: string[];
    target_polyply_lib: string;
    metadata?: ForceFieldMetadata;
  };
}

export interface ForceFieldMetadata {
  comments: string;
  cite: string;
}

export interface CategoryTree {
  [go_id: string]: {
    children: CategoryTree;
    name: string;
  };
}
