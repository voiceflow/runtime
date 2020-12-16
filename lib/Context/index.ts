/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Context, ContextHandler, InitContextHandler } from './types';

export { Context, ContextHandle, ContextHandler, InitContextHandler } from './types';

export class ContextBuilder<R> {
  private pipes: ContextHandler<R>[][] = [];

  addHandlers(...handlers: ContextHandler<R>[]) {
    this.pipes.push(handlers);
    return this;
  }

  async handle(_request: Context<R>) {
    let request: Context<R> = _request;

    for (const handlers of this.pipes) {
      request.end = false;

      for (const handler of handlers) {
        request = await handler.handle(request);

        if (request.end) break;
      }
    }

    return request;
  }
}

export class TurnBuilder<R> extends ContextBuilder<R> {
  constructor(private init: InitContextHandler<R>) {
    super();
  }

  async handle(_request: Partial<Context<R>>) {
    return super.handle(await this.init.handle(_request));
  }
}
