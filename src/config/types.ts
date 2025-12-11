export type ConfigBase = {
  env: string;
  code_table_name: string;
  settings_table_name: string;
  workers_table_name: string;
  api: {
    base: string;
  };
};

export type Config = {
  currentEnv: string;
  local: ConfigBase;
  dev: ConfigBase;
  prod: ConfigBase;
};
