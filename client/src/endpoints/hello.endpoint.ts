import {baseEndpointsFactory} from 'src/factories/base';
import {z} from 'zod';

export const helloEndpoint = baseEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({message: z.string()}),
  async handler() {
    return {message: 'Hello, world!'};
  },
  operationId: 'hello',
});
