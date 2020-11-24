import { Node } from '@voiceflow/api-sdk';

import Context from '@/lib/Context';
import Store from '@/lib/Context/Store';
import Program from '@/lib/Program';

export default interface Handler<N extends Node = Node<any, any>> {
  /**
   * returns if the handler should handle the current node the user is on
   * you should not perform any side effects on the context
   * 
   * @param node - the current node the user is on
   * @param context - the current context the user is in
   * @param variables - the current variable state
   * @param program - the current flow program the user is on
   * @returns if the handler should handle the current node the user is on
   */
  canHandle: (node: N, context: Context, variables: Store, program: Program) => boolean;
  /**
   * performs side effects on the context based on this node's data, such as adding additional traces for the final state
   * returns the next node to go to
   * 
   * @param node - the current node the user is on
   * @param context - the current context the user is in
   * @param variables - the current variable state
   * @param program - the current flow program the user is on
   * 
   * @returns the next node to go to, three possible scenerios
   * 
   * `null` - ends the current flow, and pops it off the stack
   * 
   * `nodeID` - if nodeID is present in the current flow program, it will attempt to be handled next. 
   * If it is not found, same behavior as return null
   * 
   * `node.nodeID` - if `handle()` returns the same nodeID as the node it is handling
   * then the execution of this interaction `context.update()` will end in the exact same state and 
   * wait for the next user interaction/webhook. The next request will begin on this same node. 
   * You would do this to await user input.
   */
  handle: (node: N, context: Context, variables: Store, program: Program) => null | string | Promise<string | null>;
}

export type HandlerFactory<N extends Node, O = void> = (options: O) => Handler<N>;
