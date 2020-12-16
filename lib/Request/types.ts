import { TraceFrame } from '@voiceflow/general-types';

import { State } from '@/lib/Context';

export type RequestParams<I = Record<string, unknown>> = {
  input: I;
  state: Omit<State, 'trace'>;
  versionID: string;
  trace?: TraceFrame[];
  end?: boolean;
};

export type RequestHandle<I = Record<string, unknown>> = (request: RequestParams<I>) => RequestParams<I> | Promise<RequestParams<I>>;

export interface RequestHandler<I> {
  handle: RequestHandle<I>;
}

// for request handlers that generate the context
export type InitRequestHandler<I> = (params: Partial<RequestParams<I>>) => RequestParams<I> | Promise<RequestParams<I>>;
