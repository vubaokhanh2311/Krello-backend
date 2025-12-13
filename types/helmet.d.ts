declare module 'helmet' {
  import { RequestHandler } from 'express';

  interface CrossOriginResourcePolicyOptions {
    policy?: 'same-origin' | 'same-site' | 'cross-origin';
  }

  interface HelmetOptions {
    crossOriginResourcePolicy?: CrossOriginResourcePolicyOptions | boolean;
  }

  type HelmetMiddleware = RequestHandler;

  function helmet(options?: HelmetOptions): HelmetMiddleware;

  export = helmet;
}
