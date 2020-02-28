import Context from '../Context';
import Diagram from '../Diagram';

export enum EventType {
  updateWillExecute,
  updateDidExecute,
  updateDidCatch,
  diagramWillFetch,
  diagramDidFetch,
  stackWillPush,
  stackDidPush,
  stateWillExecute,
  stateDidExecute,
  stateDidCatch,
  handlerWillHandle,
  handlerDidHandle,
  handlerDidCatch,
  stackWillPop,
  stackDidPop,
  frameDidFinish,
  storageWillUpdate,
  storageDidUpdate,
  turnWillUpdate,
  turnDidUpdate,
  variablesWillUpdate,
  variablesDidUpdate,
  traceWillAdd,
}

export interface GenericEvent<T extends EventType, P extends Record<string, any>> {
  Callback: (context: Context, payload: P) => void | Promise<void>;
  SetEvent: (eventType: T, callback: (context: Context, payload: P) => void) => void;
  CallEvent: (eventType: T, context: Context, payload: P) => void | Promise<void>;
}

export type updateWillExecute = GenericEvent<EventType.updateWillExecute, {}>;
export type updateDidExecute = GenericEvent<EventType.updateWillExecute, {}>;
export type updateDidCatch = GenericEvent<EventType.updateWillExecute, { error: Error }>;

export type diagramWillFetch = GenericEvent<EventType.updateWillExecute, { diagramID: string; override: (_diagram: Diagram | undefined) => void }>;
export type diagramDidFetch = GenericEvent<EventType.updateWillExecute, { diagramID: string; diagram: Diagram }>;

export type stackWillPush = GenericEvent<EventType.stackWillPush, {}>;
export type stackDidPush = GenericEvent<EventType.stackDidPush, {}>;

export type stateWillExecute = GenericEvent<EventType.stackDidPush, {}>;
export type stateDidExecute = GenericEvent<EventType.stackDidPush, {}>;

export type EventUnion =
  | updateWillExecute
  | updateDidExecute
  | updateDidCatch
  | diagramWillFetch
  | stackWillPush
  | stackDidPush
  | stateWillExecute
  | stateDidExecute;

export type SetEvent = EventUnion['SetEvent'];

export type CallEvent = EventUnion['CallEvent'];

export type EventCallback = EventUnion['Callback'];
