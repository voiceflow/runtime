import { Node } from '@voiceflow/general-types/build/nodes/code';
import axios from 'axios';
import _ from 'lodash';
import safeJSONStringify from 'safe-json-stringify';

import { HandlerFactory } from '@/lib/Handler';

import { vmExecute } from './utils';

export type CodeOptions = {
  endpoint?: string | null;
  callbacks?: Record<string, Function>;
  safe?: boolean;
  VF_VARS?: Record<string, any>;
};

const CodeHandler: HandlerFactory<Node, CodeOptions | void> = ({ endpoint, callbacks, safe, VF_VARS } = {}) => ({
  canHandle: (node) => !!node.code,
  handle: async (node, runtime, variables) => {
    try {
      const variablesState = variables.getState();

      const reqData = {
        code: node.code,
        variables: variablesState,
      };
      const data = endpoint ? (await axios.post(endpoint, reqData)).data : vmExecute(reqData, safe, callbacks, VF_VARS);

      // debugging changes find variable value differences
      const changes = _.union(Object.keys(variablesState), Object.keys(data))
        .filter((key) => key !== 'VF_VARS')
        .reduce<string>((acc, variable) => {
          if (variablesState[variable] !== data[variable]) {
            acc += `\`{${variable}}\`: \`${variablesState[variable]?.toString?.()}\` => \`${data[variable]?.toString?.()}\`  \n`;
          }
          return acc;
        }, '');

      runtime.trace.debug(`evaluating code - ${changes ? `changes:  \n${changes}` : 'no variable changes'}`);

      variables.merge(data);

      if (VF_VARS && data.VF_VARS) {
        const UPDATED_VF_VARS = Object.keys(data.VF_VARS as Record<string, any>).reduce<Record<string, any>>((acc, key) => {
          if (VF_VARS![key]) {
            acc[key] = data.VF_VARS[key];
          }
          return acc;
        }, {});

        VF_VARS = { ...UPDATED_VF_VARS };
      }

      return node.success_id ?? null;
    } catch (error) {
      runtime.trace.debug(`unable to resolve code  \n\`${safeJSONStringify(error.response?.data)}\``);

      return node.fail_id ?? null;
    }
  },
});

export default CodeHandler;
