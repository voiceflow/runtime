import axios from 'axios';
import _ from 'lodash';
import safeJSONStringify from 'safe-json-stringify';

import { HandlerFactory } from '@/lib/Handler';

export type CodeBlock = {
  code: string;
  fail_id?: string;
  success_id?: string;
};

export type CodeOptions = {
  endpoint: string;
};

const CodeHandler: HandlerFactory<CodeBlock, CodeOptions> = ({ endpoint }) => ({
  canHandle: (block) => {
    return !!block.code;
  },
  handle: async (block, context, variables) => {
    try {
      const variablesState = variables.getState();

      const result = await axios.post(endpoint, {
        code: block.code,
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

      return block.success_id ?? null;
    } catch (error) {
      context.trace.debug(`unable to resolve code  \n\`${safeJSONStringify(error.response?.data)}\``);
      return block.fail_id ?? null;
    }
  },
});

export default CodeHandler;
