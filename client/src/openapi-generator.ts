import {Documentation} from 'express-zod-api';
import {writeFileSync} from 'node:fs';
import {ReferenceObject, SchemaObject} from 'openapi3-ts/oas30';
import {env} from './config/env';
import {config} from './config/server';
import {routing} from './routes';

class CustomDocumentation extends Documentation {
  protected isErrorCreated = false;

  protected makeRef(
    name: string,
    schema: SchemaObject | ReferenceObject
  ): ReferenceObject {
    if (name.endsWith('ErrorResponse')) {
      name = 'ErrorResponse';
      if (!this.isErrorCreated) {
        this.isErrorCreated = true;
        this.addSchema(name, schema);
      }
    } else {
      this.addSchema(name, schema);
    }
    return this.getRef(name)!;
  }

  protected getRef(name: string): ReferenceObject | undefined {
    if (name.endsWith('ErrorResponse')) {
      name = 'ErrorResponse';
    }
    return name in (this.rootDoc.components?.schemas || {})
      ? {$ref: `#/components/schemas/${name}`}
      : undefined;
  }
}

writeFileSync(
  'docs/openapi.swagger.yaml',
  new CustomDocumentation({
    routing,
    config,
    version: '1.0.0',
    title: 'Example API',
    serverUrl: 'http://localhost:' + env.PORT,
    composition: 'components',
  }).getSpecAsYaml(),
  'utf-8'
);
