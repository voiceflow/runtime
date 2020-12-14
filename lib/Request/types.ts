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
export type ContextRequestParams<I> = Omit<RequestParams<I>, 'context'> & { state?: Omit<State, 'trace'> };
export type ContextRequestHandler<I> = (params: ContextRequestParams<I>) => RequestParams<I> | Promise<RequestParams<I>>;
