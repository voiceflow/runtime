import axios from 'axios';
import _ from 'lodash';
import safeJSONStringify from 'safe-json-stringify';

import Handler from './index';
import { CUSTOM_API, ENDPOINTS_MAP, IntegrationBlock } from './utils/integrations/constants';
import { deepVariableSubstitution, resultMappings } from './utils/integrations/utils';

// TODO: move this to configs
const CUSTOM_API_INTEGRATIONS_ENDPOINT = 'http://localhost:8181';
const INTEGRATIONS_LAMBDA_ENDPOINT = 'http://localhost:8100';

const IntegrationsHandler: Handler<IntegrationBlock> = {
  canHandle: (block) => {
    return block.type === 'integrations';
  },
  handle: async (block, context, variables) => {
    if (!block.selected_integration || !block.selected_action) {
      context.trace.debug('no integration or action specified - fail by default');
      return block.fail_id ?? null;
    }

    let nextId: string | null = null;

    try {
      const { selected_action: selectedAction, selected_integration: selectedIntegration } = block;

      const actionBodyData = deepVariableSubstitution(_.cloneDeep(block.action_data), variables.getState());

      const BASE_URL = selectedIntegration === CUSTOM_API ? CUSTOM_API_INTEGRATIONS_ENDPOINT : INTEGRATIONS_LAMBDA_ENDPOINT;
      const { data } = await axios.post(`${BASE_URL}${ENDPOINTS_MAP[selectedIntegration][selectedAction]}`, actionBodyData);
      const resultVariables = selectedIntegration === CUSTOM_API ? data.variables : data;
      // map result data to variables
      const mappedVariables = resultMappings[selectedIntegration](block, resultVariables);
      // add mapped variables to variables store
      variables.merge(mappedVariables);

      // if custom api returned error http status nextId to fail port, otherwise success
      if (selectedIntegration === CUSTOM_API && data.response.status >= 400) {
        context.trace.debug(`action **${block.selected_action}** for integration **${block.selected_integration}** successfully triggered`);
        nextId = block.fail_id ?? null;
      } else {
        context.trace.debug(`action **${block.selected_action}** for integration **${block.selected_integration}** failed or encountered error`);
        nextId = block.success_id ?? null;
      }
    } catch (error) {
      context.trace.debug(
        `action **${block.selected_action}** for integration **${block.selected_integration}** failed  \n${safeJSONStringify(error?.response?.data)}`
      );
      nextId = block.fail_id ?? null;
    }

    return nextId;
  },
};

export default IntegrationsHandler;
