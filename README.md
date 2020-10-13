# Voiceflow Client

---

`yarn add @voiceflow/client`

`npm i @voiceflow/client`

runtime for executing voiceflow projects and conversational state management across different platforms - requires `api` function defined.

## Implementation Example

### Initialization
```ts
import DefaultHandlers from '@voiceflow/client/handlers';
import Client from '@voiceflow/client';

import CustomHandlers from './handlers';
import DataAPI from './api';

const client = new Client({
	handlers: {
		...DefaultHandlers,
		...CustomHandlers,
	},
	api: DataAPI,
});

// if you want to inject custom handlers during lifecycle events
client.setEvent(EventType., (err, context) => {
	logger.log(err);
	throw err;
});
```

### Handle Interaction Request
```tsx
const handleRequest = async (userID, versionID, payload) => {
	
	// retrieve the previous user state
	const rawState = DB.fetchState(userID);
	const context = client.createContext(versionID, rawState, payload);

	// update the state and generate new context (step through the program)
	context.update();

	// save the new user state
	DB.saveState(userID, context.getFinalState());

	// generate response based on trace
	let response = {};
	context.trace.forEach((trace) => {
		if (trace.type === 'card') response.card = trace.payload;
		if (trace.type === 'speak') response.speak += trace.payload;
	})

	return response; // the SDK usually handles this
}
```

## Vocabulary

**context**: general purpose object that provides an API to manipulate state

**platform**: alexa, google, IVR, messenger, slack, twilio

**secret**: secret key sent to Voiceflow server-data-api to fetch metadata or diagrams

**storage**: object full of things you want to persist between requests

**stack**: diagram stack

**frame**: diagram stack frame

**request**: what the end user has done (intent, push button, etc)

**diagram**: full diagram object (equivalent to text/code in memory model) (READ ONLY)

**block**: block metadata (currently referred to as line in most of server)

**variables**: global variables

**turn**: object full of things that only matter during this turn

**handlers:** array of handlers that handle specific block functionalities 

## Documentation

### Voiceflow

```tsx
Voiceflow: {
	constructor: fn({ secret: string, handlers: Handler[], endpoint: string, defaults: { storage: Object, turn: Object, variables: Object } }) // creates the object
	createContext: fn(versionID: string, rawState: Object) => context: Context // generates a context object

	getHandlers: fn() => Handler[]
	// LIFECYCLE EVENTS (directly overwrite these)
	onError: fn(err: Error, context: Context) => context: Context
}
```

## Store

```tsx
Store: {
	produce: (producer: (draft: Draft<object>) => void)=> void
	update: (key: string, value: any) => void
	merge: (payload: object) => void
	delete: (key: string) => void
	getState: () => object
	get: (key:string) => any
}
```

### Frame

```tsx
Frame: {
	getState,
	storage: Store,
	variables: Store,
	triggers: object[],
	diagramID,
	lineID,
}
```

### Context

```tsx
Context: {
	constructor: fn( versionID: string, rawState: Object, turn?: Object ) // creates the object

	update: async fn() => undefined // triggers entire lifecycle call - can only be done once per object

	getState: fn() => Object // returns state in rawState JSON format

	produce: (({variables, storage, turn}) => {
		//mutate
	})

	// storage properties
	variables: Store

	storage: Store

	// temporary turn variables
	turn: Store

	stack: {
		initialize,
		getState, // serialize
		top, // read top item
		pop,
		lift, // pop off a certain number of things
		push
	}

	fetchDiagram: async fn(diagramID) => JSON // get 
	fetchMetadata: async fn() => JSON // get

	// context controls
	action

	finish: fn() => rawState

	isTesting: fn() => boolean

	// LIFECYCLE EVENTS (directly overwrite these) - this overrides Voiceflow lifecycle events
	onError: fn(err, context)
}
```

### Handlers

there are default ones and ones provided by the package

```tsx
Handler: {
	canHandle: fn(block: Block, context: Context) => boolean,
	handle: (block: Block, context: Context) => (next)blockID
}
```

## Server/Context Lifecycle Events TBD (chronological)

- can all be async

        contextWillMount
        updateWillExecute
            storageWillUpdate
            storageDidUpdate
            turnWillUpdate
            turnDidUpdate
            variableWillUpdate
            variableDidUpdate
        diagramWillFetch
        diagramDidFetch
        stackWillPush
        stackDidPush
        stateWillExecute
        handlerWillHandle
        handlerDidHandle
        handlerDidCatch
        stateDidExecute
        stateDidCatch
        stackWillPop
        stackDidPop
        updateDidExecute
        updateDidCatch
        contextWillUnmount
        contextDidCatch
