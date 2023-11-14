import {
  EndpointsFactory,
  createResultHandler,
  defaultEndpointsFactory,
  getStatusCodeFromError,
} from 'express-zod-api';

import {z} from 'zod';
defaultEndpointsFactory;

const FieldSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const resultHandler = createResultHandler({
  getPositiveResponse(output) {
    return {
      schema: z.object({data: output, success: z.literal(true)}),
      mimeType: 'application/json',
    };
  },
  getNegativeResponse() {
    return {
      schema: z
        .union([
          z.object({message: z.string()}),
          z.object({messages: z.array(FieldSchema)}),
        ])
        .and(z.object({success: z.literal(false)})),
      mimeType: 'application/json',
    };
  },
  handler({error, request, response, input, output, logger}) {
    if (!error) {
      response.status(request.method === 'POST' ? 201 : 200).json({
        data: output,
        success: true,
      });
      return;
    }
    const statusCode = getStatusCodeFromError(error);
    if (statusCode === 500) {
      logger.error(`Internal server error\n${error.stack}\n`, {
        url: request.url,
        payload: input,
      });
    }
    if (error instanceof z.ZodError) {
      response.status(statusCode).json({
        messages: error.errors.map(each => {
          const value =
            (each.path.find(p => typeof p === 'string') as
              | string
              | undefined) ?? 'unknown';
          return {field: value, message: each.message};
        }),
        success: false,
      });
    }
    response.status(statusCode).json({
      message: error.message,
      success: false,
    });
  },
});

export const baseEndpointsFactory = new EndpointsFactory(resultHandler);
