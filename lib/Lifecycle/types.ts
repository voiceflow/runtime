import Context, { TraceFrame } from '../Context';
import Frame from '../Context/Stack/Frame';
import Storage from '../Context/Store';
import Diagram from '../Diagram';
import { Block } from '../Handler';

export enum EventType {
  updateWillExecute = 'updateWillExecute',
  updateDidExecute = 'updateDidExecute',
  updateDidCatch = 'updateDidCatch',
  diagramWillFetch = 'diagramWillFetch',
  diagramDidFetch = 'diagramDidFetch',
  stackWillPush = 'stackWillPush',
  stackDidPush = 'stackDidPush',
  stateWillExecute = 'stateWillExecute',
  stateDidExecute = 'stateDidExecute',
  stateDidCatch = 'stateDidCatch',
  handlerWillHandle = 'handlerWillHandle',
  handlerDidHandle = 'handlerDidHandle',
  handlerDidCatch = 'handlerDidCatch',
  stackWillPop = 'stackWillPop',
  stackDidPop = 'stackDidPop',
  frameDidFinish = 'frameDidFinish',
  storageWillUpdate = 'storageWillUpdate',
  storageDidUpdate = 'storageDidUpdate',
  turnWillUpdate = 'turnWillUpdate',
  turnDidUpdate = 'turnDidUpdate',
  variablesWillUpdate = 'variablesWillUpdate',
  variablesDidUpdate = 'variablesDidUpdate',
  traceWillAdd = 'traceWillAdd',
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BaseEvent {}
interface BaseErrorEvent {
  error: Error;
}

interface UpdateDidCatchEvent extends BaseEvent, BaseErrorEvent {}

interface DiagramWillFetchEvent extends BaseEvent {
  diagramID: string;
  override: (_diagram: Diagram | undefined) => void;
}

interface DiagramDidFetchEvent extends BaseEvent {
  diagramID: string;
  diagram: Diagram;
}

interface HandlerWillHandleEvent extends BaseEvent {
  block: Block;
  variables: Storage;
}

interface HandlerDidHandleEvent extends BaseEvent {
  block: Block;
  variables: Storage;
}

interface HandlerDidCatchEvent extends BaseEvent, BaseErrorEvent {}

interface StateWillExecute extends BaseEvent {
  diagram: Diagram;
  variables: Storage;
}

interface StateDidExecute extends BaseEvent {
  diagram: Diagram;
  variables: Storage;
}

interface StateDidCatch extends BaseEvent, BaseErrorEvent {}

interface FrameDidFinishEvent extends BaseEvent {
  frame?: Frame;
}

interface TraceWillAddEvent extends BaseEvent {
  frame: TraceFrame;
  stop: () => void;
}

export interface EventMap {
  [EventType.updateWillExecute]: BaseEvent;
  [EventType.updateDidExecute]: BaseEvent;
  [EventType.updateDidCatch]: UpdateDidCatchEvent;

  [EventType.diagramWillFetch]: DiagramWillFetchEvent;
  [EventType.diagramDidFetch]: DiagramDidFetchEvent;

  [EventType.updateDidExecute]: BaseEvent;

  [EventType.stackWillPush]: BaseEvent;
  [EventType.stackDidPush]: BaseEvent;

  [EventType.stateWillExecute]: StateWillExecute;
  [EventType.stateDidExecute]: StateDidExecute;
  [EventType.stateDidCatch]: StateDidCatch;

  [EventType.handlerWillHandle]: HandlerWillHandleEvent;
  [EventType.handlerDidHandle]: HandlerDidHandleEvent;
  [EventType.handlerDidCatch]: HandlerDidCatchEvent;

  [EventType.stackWillPop]: BaseEvent;
  [EventType.stackDidPop]: BaseEvent;

  [EventType.frameDidFinish]: FrameDidFinishEvent;

  [EventType.storageWillUpdate]: BaseEvent;
  [EventType.storageDidUpdate]: BaseEvent;

  [EventType.turnWillUpdate]: BaseEvent;
  [EventType.turnDidUpdate]: BaseEvent;

  [EventType.variablesWillUpdate]: BaseEvent;
  [EventType.variablesDidUpdate]: BaseEvent;

  [EventType.traceWillAdd]: TraceWillAddEvent;
}

export type Event<K extends EventType> = EventMap[K];
export type Callback<K extends EventType> = (event: Event<K> & { context: Context }) => void;
export type EventCallbackMap = { [key in EventType]: Callback<key> };
