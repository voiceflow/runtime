import axios from 'axios';
import safeJSONStringify from 'safe-json-stringify';

import Handler from './index';

export type CodeBlock = {
  code: string;
  fail_id?: string;
  success_id?: string;
};

const codeHandler: Handler<CodeBlock> = {
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

      // TODO: move url to configs
      const result = await axios.post('https://cjpsnfbb56.execute-api.us-east-1.amazonaws.com/dev/code/execute', {
        code: block.code,
        variables: usedVariables,
      });

      // debugging changes find variable value differences
      const changes = Object.keys(usedVariables).reduce<string>((acc, variable) => {
        if (usedVariables[variable] !== result.data[variable]) {
          acc += `\`{${variable}}\`: \`${usedVariables[variable]?.toString?.()}\` => \`${result.data[variable]?.toString?.()}\`  \n`;
        }
        return acc;
      }, '');
      context.trace.debug(`evaluating code - ${changes ? `changes:  \n${changes}` : 'no variable changes'}`);

      variables.merge(result.data);

      return block.success_id ?? null;
    } catch (error) {
      context.trace.debug(`unable to resolve code  \n\`${safeJSONStringify(error?.response?.data)}\``);
      return block.fail_id ?? null;
    }
  },
};

export default codeHandler;
