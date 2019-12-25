enum Event {
  contextWillMount,
  contextWillUnmount,
  contextDidCatch,
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
  handlerDidHandler,
  handlerDidCatch,
  stackWillPop,
  stackDidPop,
}

export default Event;
