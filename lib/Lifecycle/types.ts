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

export interface EventCallbackMap {
  [EventType.updateWillExecute]: (context: Context, event: BaseEvent) => void;
  [EventType.updateDidExecute]: (context: Context, event: BaseEvent) => void;
  [EventType.updateDidCatch]: (context: Context, event: UpdateDidCatchEvent) => void;

  [EventType.diagramWillFetch]: (context: Context, event: DiagramWillFetchEvent) => void;
  [EventType.diagramDidFetch]: (context: Context, event: DiagramDidFetchEvent) => void;

  [EventType.updateDidExecute]: (context: Context, event: BaseEvent) => void;

  [EventType.stackWillPush]: (context: Context, event: BaseEvent) => void;
  [EventType.stackDidPush]: (context: Context, event: BaseEvent) => void;

  [EventType.stateWillExecute]: (context: Context, event: StateWillExecute) => void;
  [EventType.stateDidExecute]: (context: Context, event: StateDidExecute) => void;
  [EventType.stateDidCatch]: (context: Context, event: StateDidCatch) => void;

  [EventType.handlerWillHandle]: (context: Context, event: HandlerWillHandleEvent) => void;
  [EventType.handlerDidHandle]: (context: Context, event: HandlerDidHandleEvent) => void;
  [EventType.handlerDidCatch]: (context: Context, event: HandlerDidCatchEvent) => void;

  [EventType.stackWillPop]: (context: Context, event: BaseEvent) => void;
  [EventType.stackDidPop]: (context: Context, event: BaseEvent) => void;

  [EventType.frameDidFinish]: (context: Context, event: FrameDidFinishEvent) => void;

  [EventType.storageWillUpdate]: (context: Context, event: BaseEvent) => void;
  [EventType.storageDidUpdate]: (context: Context, event: BaseEvent) => void;

  [EventType.turnWillUpdate]: (context: Context, event: BaseEvent) => void;
  [EventType.turnDidUpdate]: (context: Context, event: BaseEvent) => void;

  [EventType.variablesWillUpdate]: (context: Context, event: BaseEvent) => void;
  [EventType.variablesDidUpdate]: (context: Context, event: BaseEvent) => void;

  [EventType.traceWillAdd]: (context: Context, event: TraceWillAddEvent) => void;
}

export type Callback<K extends keyof EventCallbackMap> = EventCallbackMap[K];
