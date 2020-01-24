// @ts-nocheck

import axios from 'axios';
import _ from 'lodash';

import Store from '../Context/Store';
import { Block } from '../Diagram';
import Handler from './index';

// constants
const CUSTOM_API_INTEGRATIONS_ENDPOINT = 'http://localhost:8181';
const INTEGRATIONS_LAMBDA_ENDPOINT = 'http://localhost:8100';

const GOOGLE_SHEETS = 'Google Sheets';
const RETRIEVE_DATA = 'Retrieve Data';
const CREATE_DATA = 'Create Data';
const UPDATE_DATA = 'Update Data';
const DELETE_DATA = 'Delete Data';

const CUSTOM_API = 'Custom API';
const GET_REQUEST = 'Make a GET Request';
const POST_REQUEST = 'Make a POST Request';
const PATCH_REQUEST = 'Make a PATCH Request';
const PUT_REQUEST = 'Make a PUT Request';
const DELETE_REQUEST = 'Make a DELETE Request';

const ZAPIER = 'Zapier';
const START_ZAP = 'Start a Zap';

const endpointMap = {
  [GOOGLE_SHEETS]: {
    [RETRIEVE_DATA]: '/google_sheets/retrieve_data',
    [CREATE_DATA]: '/google_sheets/create_data',
    [UPDATE_DATA]: '/google_sheets/update_data',
    [DELETE_DATA]: '/google_sheets/delete_data',
  },
  [CUSTOM_API]: {
    [GET_REQUEST]: '/custom/make_api_call',
    [POST_REQUEST]: '/custom/make_api_call',
    [PATCH_REQUEST]: '/custom/make_api_call',
    [PUT_REQUEST]: '/custom/make_api_call',
    [DELETE_REQUEST]: '/custom/make_api_call',
  },
  [ZAPIER]: { [START_ZAP]: '/zapier/trigger' },
};

// end constants

const resultMappings = {
  [GOOGLE_SHEETS]: (block: Block<IntegrationBlock>, variables: Store, resultData: Record<string, any>) => {
    const newVariables = {};
    if (block.action_data && block.action_data.mapping) {
      block.action_data.mapping.forEach((m) => {
        const col = m.arg1;
        const toVar = m.arg2;
        newVariables[toVar] = col === 'row_number' ? resultData._cell_location.row : resultData[col];
      });
    }
    Object.assign(variables, newVariables);
  },
  [CUSTOM_API]: (_block: Block<IntegrationBlock>, variables: Store, resultData: Record<string, any>) => {
    Object.assign(variables, resultData);
  },
  [ZAPIER]: () => {},
};

const deepVariableSubstitution = (object, variableMap) => {
  const replacer = (match, inner, variablesMap, uriEncode = false) => {
    if (inner in variablesMap) {
      return uriEncode ? encodeURI(variablesMap[inner]) : variablesMap[inner];
    }
    return match;
  };

  const recurse = (subCollection, uriEncode = false) => {
    if (typeof subCollection === 'object') {
      Object.keys(subCollection).forEach((key) => {
        subCollection[key] = key === 'url' ? recurse(subCollection[key], true) : recurse(subCollection[key]);
      });
    } else if (typeof subCollection === 'string') {
      return subCollection.replace(/\{([A-Za-z0-9_]*)\}/g, (match, inner) => replacer(match, inner, variableMap, uriEncode));
    }
    return subCollection;
  };

  return recurse(object);
};

type IntegrationBlock = {
  type: string;
  selected_integration?: string;
  selected_action?: string;
  fail_id: string;
  success_id: string;
  action_data?: {
    mapping?: Array<{ arg1: string; arg2: string }>;
  };
};

// TODO: variablas are a store. use set and get to interact with them.
const IntegrationsHandler: Handler<IntegrationBlock> = {
  canHandle: (block) => {
    return block.type === 'integrations';
  },
  handle: async (block, _context, variables) => {
    if (!block.selected_integration || !block.selected_action) return block.fail_id;

    let nextId: string;
    try {
      let actionDataBody = _.cloneDeep(block.action_data);
      actionDataBody = deepVariableSubstitution(actionDataBody, variables);
      const BASE_URL = block.selected_integration === CUSTOM_API ? CUSTOM_API_INTEGRATIONS_ENDPOINT : INTEGRATIONS_LAMBDA_ENDPOINT;
      const result = await axios.post(`${BASE_URL}${endpointMap[block.selected_integration][block.selected_action]}`, actionDataBody);
      if (block.selected_integration === CUSTOM_API) {
        resultMappings[block.selected_integration](block, variables, result.data.variables);
        if (result.data.response.status < 400) {
          nextId = block.success_id;
        } else {
          nextId = block.fail_id;
        }
      } else {
        resultMappings[block.selected_integration](block, variables, result.data);
        nextId = block.success_id;
      }
    } catch (err) {
      nextId = block.fail_id;
    }

    return nextId;
  },
};

export default IntegrationsHandler;
