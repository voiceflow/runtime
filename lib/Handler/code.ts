import Handler from './index';

const axios = require('axios');

const codeHandler: Handler = {
  canHandle: (block) => {
    return block.code;
  },
  handle: async (block, _, variables) => {
    try {
      const result = await axios.post('https://cjpsnfbb56.execute-api.us-east-1.amazonaws.com/dev/code/execute', {
        code: block.code,
        variables: variables,
      });
      variables.produce((draft) => {
        Object.assign(draft, result.data);
      });
      return block.success_id;
    } catch (err) {
      return block.fail_id;
    }
  },
};

export default codeHandler;
