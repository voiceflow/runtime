import { Node } from '@voiceflow/api-sdk';
import axios from 'axios';
import _ from 'lodash';
import safeJSONStringify from 'safe-json-stringify';

import { HandlerFactory } from '@/lib/Handler';

export type CodeNode = Node<
  'code',
  {
    code: string;
    fail_id?: string;
    success_id?: string;
  }
>;

export type CodeOptions = {
  endpoint: string;
};

const CodeHandler: HandlerFactory<CodeNode, CodeOptions> = ({ endpoint }) => ({
  canHandle: (node) => {
    return !!node.code;
  },
  handle: async (node, context, variables) => {
    try {
      const variablesState = variables.getState();

      const result = await axios.post(endpoint, {
        code: node.code,
        variables: variablesState,
      });

      // debugging changes find variable value differences
      const changes = _.union(Object.keys(variablesState), Object.keys(result.data)).reduce<string>((acc, variable) => {
        if (variablesState[variable] !== result.data[variable]) {
          acc += `\`{${variable}}\`: \`${variablesState[variable]?.toString?.()}\` => \`${result.data[variable]?.toString?.()}\`  \n`;
        }
        return acc;
      }, '');
      context.trace.debug(`evaluating code - ${changes ? `changes:  \n${changes}` : 'no variable changes'}`);

      variables.merge(result.data);

      return node.success_id ?? null;
    } catch (error) {
      context.trace.debug(`unable to resolve code  \n\`${safeJSONStringify(error.response?.data)}\``);
      return node.fail_id ?? null;
    }
  },
});

export default CodeHandler;
