/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { InitRequestHandler, RequestHandler, RequestParams } from './types';

export { RequestHandler, RequestHandle, RequestParams, InitRequestHandler } from './types';

export class RequestBuilder<I> {
  private pipes: RequestHandler<I>[][] = [];

  addPipe(handlers: RequestHandler<I>[]) {
    this.pipes.push(handlers);
  }

  async handle(_request: RequestParams<I>) {
    let request: RequestParams<I> = _request;

    for (const handlers of this.pipes) {
      for (const handler of handlers) {
        request = await handler.handle(request);

        if (request.end) break;
      }
    }

    return request;
  }
}

export class TurnBuilder<I> extends RequestBuilder<I> {
  constructor(private init: InitRequestHandler<I>) {
    super();
  }

  async handle(_request: Partial<RequestParams<I>>) {
    return super.handle(await this.init(_request));
  }
}

export const RequestPipe = <I>(handlers: RequestHandler<I>[]) => async (_request: RequestParams<I>) => {
  let request: RequestParams<I> = _request;

  for (const handler of handlers) {
    request = await handler.handle(request);

    if (request.end) return request;
  }

  return request;
};
