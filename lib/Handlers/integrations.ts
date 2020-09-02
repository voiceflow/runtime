import axios from 'axios';
import _ from 'lodash';
import safeJSONStringify from 'safe-json-stringify';

import { HandlerFactory } from '@/lib/Handler';

import { CUSTOM_API, ENDPOINTS_MAP, IntegrationNode } from './utils/integrations/constants';
import { deepVariableSubstitution, resultMappings } from './utils/integrations/utils';

export type IntegrationsOptions = {
  customAPIEndpoint: string;
  integrationsLambdaEndpoint: string;
};

const IntegrationsHandler: HandlerFactory<IntegrationNode, IntegrationsOptions> = ({ customAPIEndpoint, integrationsLambdaEndpoint }) => ({
  canHandle: (node) => {
    return node.type === 'integrations';
  },
  handle: async (node, context, variables) => {
    if (!node.selected_integration || !node.selected_action) {
      context.trace.debug('no integration or action specified - fail by default');
      return node.fail_id ?? null;
    }

    let nextId: string | null = null;

    try {
      const { selected_action: selectedAction, selected_integration: selectedIntegration } = node;

      const actionBodyData = deepVariableSubstitution(_.cloneDeep(node.action_data), variables.getState());

      const BASE_URL = selectedIntegration === CUSTOM_API ? customAPIEndpoint : integrationsLambdaEndpoint;
      const { data } = await axios.post(`${BASE_URL}${ENDPOINTS_MAP[selectedIntegration][selectedAction]}`, actionBodyData);
      const resultVariables = selectedIntegration === CUSTOM_API ? data.variables : data;
      // map result data to variables
      const mappedVariables = resultMappings[selectedIntegration](node, resultVariables);
      // add mapped variables to variables store
      variables.merge(mappedVariables);

      // if custom api returned error http status nextId to fail port, otherwise success
      if (selectedIntegration === CUSTOM_API && data.response.status >= 400) {
        context.trace.debug(`action **${node.selected_action}** for integration **${node.selected_integration}** failed or encountered error`);
        nextId = node.fail_id ?? null;
      } else {
        context.trace.debug(`action **${node.selected_action}** for integration **${node.selected_integration}** successfully triggered`);
        nextId = node.success_id ?? null;
      }
    } catch (error) {
      context.trace.debug(
        `action **${node.selected_action}** for integration **${node.selected_integration}** failed  \n${safeJSONStringify(error.response?.data)}`
      );
      nextId = node.fail_id ?? null;
    }

    return nextId;
  },
});

export default IntegrationsHandler;
