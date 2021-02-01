import _ from 'lodash';
import { sync as requireFromUrl } from 'require-from-url';
import { VM } from 'vm2';

// eslint-disable-next-line import/prefer-default-export
export const vmExecute = (data: { code: string; variables: Record<string, any> }) => {
  process.env = {
    PATH: process.env.PATH,
  };
  const keys = _.keys(data.variables);

  const vm = new VM({
    timeout: 1000,
    sandbox: {
      Promise: null,
      ..._.cloneDeep(data.variables),
      requireFromUrl,
    },
  });

  const clearContext = `
          (function() {
            Function = undefined;
            const keys = Object.getOwnPropertyNames(this).concat(['constructor']);
            keys.forEach((key) => {
              const item = this[key];
              if (!item || typeof item.constructor !== 'function') return;
              this[key].constructor = undefined;
            });
          })();`;

  vm.run(clearContext + data.code, 'utils.js');

  return keys.reduce<Record<string, any>>((acc, key) => {
    acc[key] = _.get(vm, '_context')[key];
    return acc;
  }, {});
};
