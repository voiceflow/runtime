import { TraceFrame } from '@voiceflow/general-types';

import { State } from '@/lib/Runtime';

export type Context<R = Record<string, unknown>> = {
  request: R;
  state: Omit<State, 'trace'>;
  versionID: string;
  trace?: TraceFrame[];
  end?: boolean;
};

export type ContextHandle<R = Record<string, unknown>> = (request: Context<R>) => Context<R> | Promise<Context<R>>;

export interface ContextHandler<R> {
  handle: ContextHandle<R>;
}

// for request handlers that generate the runtime
export type InitContextHandle<R> = (params: Partial<Context<R>>) => Context<R> | Promise<Context<R>>;

export interface InitContextHandler<R> {
  handle: InitContextHandle<R>;
}
