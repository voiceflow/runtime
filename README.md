# Voiceflow Runtime

[![circleci](https://circleci.com/gh/voiceflow/runtime/tree/master.svg?style=shield)](https://circleci.com/gh/voiceflow/runtime/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime/branch/master/graph/badge.svg)](https://codecov.io/gh/voiceflow/runtime)
[![sonar quality gate](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime&metric=alert_status)](https://sonarcloud.io/dashboard?id=voiceflow_runtime)

runtime SDK for executing voiceflow projects and conversational state management across different platforms.

> ⚠️ **This repository is still undergoing active development**: Major breaking changes may be pushed periodically and the documentation may become outdated - a stable version has not been released

`yarn add @voiceflow/runtime`

`npm i @voiceflow/runtime`

---

## Concepts

![ci pipeline](https://user-images.githubusercontent.com/5643574/99609472-fa5f6880-29dd-11eb-8635-7f8496ddd7de.png)

At a very high level, you can think of the whole Voiceflow system like code:

- The frontend creator system allows conversation designers to "write" in a visual programming language, like an IDE. Each of their `diagrams` is like a function/instruction.
- When they press _Upload_ or _Export_ all their flow `diagrams` are "compiled" into `programs`
- The `runtime` is like the CPU that reads these `programs` and executes them based on end user input.
- these `programs` can be read through **Local Project Files** or through an **Voiceflow API** where they are hosted with Voiceflow databases
- the runtime handles state management and tracks the user's state at each turn of conversation

Where conversational state management differs from traditional code execution is that it is heavily I/O based and always blocked when awaiting user input:

It is important to understand the Conversation Request/Response Webhook Model

![client architecture](https://user-images.githubusercontent.com/5643574/99591510-e7886c00-29bc-11eb-83b2-843f75ff3cac.png)

The **end user session storage** is determined by the implementation of the runtime, but stores the most sensitive data in this architecture (what the user has said, where they are in the conversation, variables, etc.)

### Anatomy of an Interaction (Alexa Example)

As a practical example, here's what happens when a user speaks to a custom skill (app) on their Alexa device. Most other conversational platforms function in this manner - if it is a text/or chat, it would be the exact same, just without a voice-to-text/text-to-voice layer.

1. user says something to alexa, alexa uses natural language processing to transcribe user intent, then sends it via **webhook** (along with other metadata i.e. _userID_) to `alexa-runtime`, which implements `@voiceflow/runtime`
2. fetch user state (JSON format) from **end user session storage** based on a _userID_ identifier
3. fetch the current program (flow) that the user is on from **Voiceflow API/Local Project File**
4. go through nodes in the flow and update the user state
5. save the final user state to **end user session storage**
6. generate a **webhook** response based on the final user state, send back to alexa
7. alexa interprets response and speaks to user

repeat all steps each time a user speaks to the alexa skill, to perform a conversation.
([here's Amazon Alexa's documentation](https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-and-response-json-reference.html))

---

## Implementation Example (Generic Conversation Platform)

### Initialization

```ts
import Client, { LocalDataApi } from '@voiceflow/runtime';

import CustomHandlers from './handlers';

const client = new Client({
  handlers: {
    ...DefaultHandlers,
    ...CustomHandlers,
  },
  api: new LocalDataApi({ projectSource: PROJECT_SOURCE /* local project file */ }),
});

// if you want to inject custom handlers during lifecycle events
client.setEvent(EventType.handlerDidCatch, (err, runtime) => {
  logger.log(err);
  throw err;
});
```

`Client` can be initialized with either `LocalDataApi`, which reads a local file for project and program source, or `ServerDataApi`, which requires an API key (`adminToken`) and endpoint (`dataEndpoint`) and fetches the data remotely.

### Handle Interaction Request

```ts
// incoming webhook request
const handleRequest = async (userID, versionID, payload) => {
  // retrieve the previous user state
  const rawState = DB.fetchState(userID);
  const runtime = client.createRuntime(versionID, rawState, payload);

  // update the state and generate new runtime (step through the program)
  runtime.update();

  // save the new user state
  DB.saveState(userID, runtime.getFinalState());

  // generate a response based on trace
  let response = {};
  runtime.trace.forEach((trace) => {
    if (trace.type === 'card') response.card = trace.payload;
    if (trace.type === 'speak') response.speak += trace.payload;
  });

  return response; // the SDK usually handles this
};
```

### Custom Node Handler

```ts
import { HandlerFactory } from '@voiceflow/runtime';

// create a handler for a particular node type
export const CustomNodeHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  // return a boolean whether or not this handler can handle a particular node
  canHandle: (node) => {
    return node.type === 'CUSTOM_NODE' && typeof node.custom === 'string';
  },
  // perform side effects and return the next node to go to
  handle: (node, runtime, variables) => {
    if (runtime.storage.get('customSetting')) {
      // add something to the trace to help generate the response
      runtime.trace.addTrace({
        type: 'card',
        payload: node.custom,
      });
      // maybe add something to analytics when this block is triggered
      metrics.log(node.custom);
    }

    // if you return null it will immediately end the current flow
    return node.nextId;
  },
});
```

**Return Types**

- return `null`: ends the current flow, and pops it off the stack
- return different `nodeID`: as long as the nodeID is present in the current flow program, it will attempt to be handled next - if it is not found, same behavior as return `null`
- return self `nodeID`: if the handler's `handle()` returns the same nodeID as the node it is handling, then the execution of this interaction (`runtime.update()`) will end in the exact same state and wait for the next user interaction/webhook. The next request will begin on this same node. You would do this to await user input. Example: [Choice Node](https://github.com/voiceflow/alexa-runtime/blob/master/lib/services/voiceflow/handlers/interaction.ts)

---

## Vocabulary

**request**: what the end user has done (intent, push button, etc)

**runtime**: general purpose object that provides an API to manipulate state

**platform**: alexa, google, IVR, messenger, slack, twilio, etc.

**frame**: program frame - contains local variables, pointers, etc.

**stack**: stack of program frames (like code execution stack)

**program**: flow program object (equivalent to text/code in memory model) (READ ONLY)

**node**: node metadata - each individual step/block in the program

**variables**: global variables

**storage**: object full of things you want to persist between requests

**turn**: object full of things that only matter during this turn

**handlers:** array of handlers that handle specific node functionalities

---

## Documentation

### (in progress)
