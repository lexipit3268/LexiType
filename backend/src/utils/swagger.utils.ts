import { registry } from '../core/openApiRegistry';

export const registerApiDoc = (
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  summary: string,
  tag: string,
  schema?: any,
  isSecure: boolean = false,
) => {
  registry.registerPath({
    method,
    path,
    tags: [tag],
    summary,
    parameters: path.includes('{')
      ? [
          {
            in: 'path',
            name: path.split('{')[1].split('}')[0],
            required: true,
            schema: { type: 'string' },
          },
        ]
      : undefined,
    request: schema ? { body: { content: { 'application/json': { schema } } } } : undefined,
    security: isSecure ? [{ BearerAuth: [] }] : undefined,
    responses: {
      200: { description: 'Success' },
      201: { description: 'Created' },
      404: { description: 'Not found' },
      409: { description: 'CONFLICT' },
    },
  });
};
