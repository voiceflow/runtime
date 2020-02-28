import Context, { TraceFrame } from '../Context';
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

export interface GenericEvent<T extends EventType, E extends Record<string, any> = {}> {
  Action: (event: E & { context: Context }) => void;
  SetEvent: { type: T; action: (event: E & { context: Context }) => void };
  CallEvent: { type: T; context?: Context; event: E };
}

export type updateWillExecute = GenericEvent<EventType.updateWillExecute>;
export type updateDidExecute = GenericEvent<EventType.updateDidExecute>;
export type updateDidCatch = GenericEvent<EventType.updateDidCatch, { error: Error }>;

export type diagramWillFetch = GenericEvent<EventType.updateWillExecute, { diagramID: string; override: (_diagram: Diagram | undefined) => void }>;
export type diagramDidFetch = GenericEvent<EventType.updateWillExecute, { diagramID: string; diagram: Diagram }>;

export type stackWillPush = GenericEvent<EventType.stackWillPush, {}>;
export type stackDidPush = GenericEvent<EventType.stackDidPush, {}>;

export type stateWillExecute = GenericEvent<EventType.stateWillExecute, {}>;
export type stateDidExecute = GenericEvent<EventType.stateDidExecute, {}>;
export type stateDidCatch = GenericEvent<EventType.stateDidCatch, {}>;

export type handlerWillHandle = GenericEvent<EventType.handlerWillHandle>;
export type handlerDidHandle = GenericEvent<EventType.handlerDidHandle>;
export type handlerDidCatch = GenericEvent<EventType.handlerDidCatch>;

export type stackWillPop = GenericEvent<EventType.stackWillPop, {}>;
export type stackDidPop = GenericEvent<EventType.stackDidPop, {}>;

export type frameDidFinish = GenericEvent<EventType.frameDidFinish, {}>;

export type storageWillUpdate = GenericEvent<EventType.storageWillUpdate, {}>;
export type storageDidUpdate = GenericEvent<EventType.storageDidUpdate, {}>;

export type turnWillUpdate = GenericEvent<EventType.turnWillUpdate, {}>;
export type turnDidUpdate = GenericEvent<EventType.turnDidUpdate, {}>;

export type variablesWillUpdate = GenericEvent<EventType.variablesWillUpdate, {}>;
export type variablesDidUpdate = GenericEvent<EventType.variablesDidUpdate, {}>;

export type traceWillAdd = GenericEvent<EventType.traceWillAdd, { frame: TraceFrame; stop: () => void }>;

export type EventUnion =
  | updateWillExecute
  | updateDidExecute
  | updateDidCatch
  | diagramWillFetch
  | stackWillPush
  | stackDidPush
  | stateWillExecute
  | stateDidExecute
  | stateDidCatch
  | handlerWillHandle
  | handlerDidHandle
  | handlerDidCatch
  | stackWillPop
  | stackDidPop
  | frameDidFinish
  | storageWillUpdate
  | storageDidUpdate
  | turnWillUpdate
  | variablesWillUpdate
  | traceWillAdd;

export type SetEvent = EventUnion['SetEvent'];

export type CallEvent = EventUnion['CallEvent'];

export type EventAction = EventUnion['Action'];
