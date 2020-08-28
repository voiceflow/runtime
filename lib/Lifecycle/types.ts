import { Node } from '@voiceflow/api-sdk';

import Context from '../Context';
import Frame from '../Context/Stack/Frame';
import Storage from '../Context/Store';
import { TraceFrame } from '../Context/Trace';
import Program from '../Program';

export enum EventType {
  updateWillExecute = 'updateWillExecute',
  updateDidExecute = 'updateDidExecute',
  updateDidCatch = 'updateDidCatch',
  programWillFetch = 'programWillFetch',
  programDidFetch = 'programDidFetch',
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

interface ProgramWillFetchEvent extends BaseEvent {
  programID: string;
  override: (_program: Program | undefined) => void;
}

interface ProgramDidFetchEvent extends BaseEvent {
  programID: string;
  program: Program;
}

interface HandlerWillHandleEvent extends BaseEvent {
  node: Node;
  variables: Storage;
}

interface HandlerDidHandleEvent extends BaseEvent {
  node: Node;
  variables: Storage;
}

interface HandlerDidCatchEvent extends BaseEvent, BaseErrorEvent {}

interface StateWillExecute extends BaseEvent {
  program: Program;
  variables: Storage;
}

interface StateDidExecute extends BaseEvent {
  program: Program;
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

  [EventType.programWillFetch]: ProgramWillFetchEvent;
  [EventType.programDidFetch]: ProgramDidFetchEvent;

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
export type EventCallback<K extends EventType> = (event: CallbackEvent<K>) => void | Promise<void>;
export type EventCallbackMap = { [key in EventType]: EventCallback<key> };

// export type Event<K extends EventType> = EventMap[K];
// export type EventCallbackMap = { [key in EventType]: (event: EventMap[key] & { context: Context }) => void | Promise<void> };

// export type EventCallback<K extends EventType> = EventCallbackMap[K];
// export type CallbackEvent<K extends EventType> = Parameters<EventCallback<K>>[0];
