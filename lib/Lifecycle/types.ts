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
  stateWillExecute = 'stateWillExecute',
  stateDidExecute = 'stateDidExecute',
  stateDidCatch = 'stateDidCatch',
  handlerWillHandle = 'handlerWillHandle',
  handlerDidHandle = 'handlerDidHandle',
  handlerDidCatch = 'handlerDidCatch',
  stackWillChange = 'stackWillChange',
  stackDidChange = 'stackDidChange',
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

interface StackWillChangeEvent extends BaseEvent {
  nextFrames: Frame[];
}

interface StackDidChangeEvent extends BaseEvent {
  prevFrames: Frame[];
}

export interface EventMap {
  [EventType.updateWillExecute]: BaseEvent;
  [EventType.updateDidExecute]: BaseEvent;
  [EventType.updateDidCatch]: UpdateDidCatchEvent;

  [EventType.diagramWillFetch]: DiagramWillFetchEvent;
  [EventType.diagramDidFetch]: DiagramDidFetchEvent;

  [EventType.stackWillChange]: StackWillChangeEvent;
  [EventType.stackDidChange]: StackDidChangeEvent;

  [EventType.stateWillExecute]: StateWillExecute;
  [EventType.stateDidExecute]: StateDidExecute;
  [EventType.stateDidCatch]: StateDidCatch;

  [EventType.handlerWillHandle]: HandlerWillHandleEvent;
  [EventType.handlerDidHandle]: HandlerDidHandleEvent;
  [EventType.handlerDidCatch]: HandlerDidCatchEvent;
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
export type CallbackEvent<K extends EventType> = Event<K> & { context: Context };
export type EventCallbackMap = { [key in EventType]: (event: CallbackEvent<key>) => void | Promise<void> };
export type EventCallback<K extends EventType> = EventCallbackMap[K];
