/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Context, ContextHandler, InitContextHandler } from './types';

export { Context, ContextHandle, ContextHandler, InitContextHandler } from './types';

export class ContextBuilder<C extends Context<any, any, any>> {
  private pipes: ContextHandler<C>[][] = [];

  addHandlers(...handlers: ContextHandler<C>[]) {
    this.pipes.push(handlers);
    return this;
  }

  async handle(_request: C) {
    let request: C = _request;

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

export class TurnBuilder<C extends Context<any, any, any>> extends ContextBuilder<C> {
  constructor(private init: InitContextHandler<C>) {
    super();
  }

  async handle(_request: Partial<C>) {
    return super.handle(await this.init.handle(_request));
  }
}
