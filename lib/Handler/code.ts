import axios from 'axios';

import Handler from './index';

export type CodeBlock = {
  code?: string;
  fail_id?: string;
  success_id?: string;
};

const codeHandler: Handler<CodeBlock> = {
  canHandle: (block) => {
    return !!block.code;
  },
  handle: async (block, _, variables) => {
    try {
      const result = await axios.post('https://cjpsnfbb56.execute-api.us-east-1.amazonaws.com/dev/code/execute', {
        code: block.code,
        variables: variables,
      });

      variables.merge(result.data);

      return block.success_id ?? null;
    } catch (err) {
      return block.fail_id ?? null;
    }
  },
};

export default codeHandler;
