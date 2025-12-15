import { Config, ConfigBase } from './types';

const config: Config = {
  currentEnv: '@DEPLOY-ENV@',
  local: {
    env: 'local',
    code_table_name: 'VaultCodeTest',
    settings_table_name: 'SettingsTest',
    workers_table_name: 'workersTest',
    api: {
      base: 'http://localhost:4200',
    },
  },
  dev: {
    env: 'dev',
    code_table_name: 'VaultCodeTest',
    settings_table_name: 'SettingsTest',
    workers_table_name: 'workersTest',
    api: {
      base: 'http://localhost:8080',
    },
  },
  prod: {
    env: 'prod',
    code_table_name: 'VaultCode',
    settings_table_name: 'Settings',
    workers_table_name: 'workers',
    api: {
      base: 'https://cherrytreevault.pages.dev/',
    },
  },
};

export function getConfig(): ConfigBase {
  if (config.currentEnv.startsWith('@')) {
    return config.local;
  }

  return config[<'dev' | 'prod'>config.currentEnv];
}
