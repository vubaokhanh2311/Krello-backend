export interface IAppConfig {
  name: string;
  globalPrefix: string;
}

export interface ISwaggerConfig {
  enable: boolean;
  path: string;
  serverUrl: string;
}

export type ConfigKeyPaths = 'app' | 'swagger';
