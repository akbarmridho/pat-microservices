import {Documentation} from 'express-zod-api';
import {writeFileSync} from 'node:fs';
import {env} from './config/env';
import {config} from './config/server';
import {routing} from './routes';

writeFileSync(
  'docs/openapi.swagger.yaml',
  new Documentation({
    routing,
    config,
    version: '1.0.0',
    title: 'Example API',
    serverUrl: 'http://localhost:' + env.PORT,
  }).getSpecAsYaml(),
  'utf-8'
);
