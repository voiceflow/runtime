/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { RequestHandler, RequestParams } from './types';

export { RequestHandler, RequestHandle, RequestParams } from './types';

export const RequestPipe = <I>(handlers: RequestHandler<I>[]) => async (_request: RequestParams<I>) => {
  let request: RequestParams<I> = _request;

  for (const handler of handlers) {
    request = await handler.handle(request);

    if (request.end) return request;
  }

  return request;
};
