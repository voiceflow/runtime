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
      const usedVariables = variables.keys().reduce<Record<string, any>>((acc, variable) => {
        if (block.code.indexOf(variable) !== -1) {
          acc[variable] = variables.get(variable);
        }
        return acc;
      }, {});

      const result = await axios.post(endpoint, {
        code: block.code,
        variables: usedVariables,
      });

      // debugging changes find variable value differences
      const changes = _.union(Object.keys(usedVariables), Object.keys(result.data)).reduce<string>((acc, variable) => {
        if (usedVariables[variable] !== result.data[variable]) {
          acc += `\`{${variable}}\`: \`${usedVariables[variable]?.toString?.()}\` => \`${result.data[variable]?.toString?.()}\`  \n`;
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
