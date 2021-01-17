import { IntegrationType } from '@voiceflow/general-types';
import { APIActionType } from '@voiceflow/general-types/build/nodes/api';
import { GoogleSheetsActionType } from '@voiceflow/general-types/build/nodes/googleSheets';
import { Node } from '@voiceflow/general-types/build/nodes/integration';
import { ZapierActionType } from '@voiceflow/general-types/build/nodes/zapier';

// integrations repos endpoints based on action
export const ENDPOINTS_MAP: Record<string, Record<string, string>> = {
  [IntegrationType.GOOGLE_SHEETS]: {
    [GoogleSheetsActionType.RETRIEVE_DATA]: '/google_sheets/retrieve_data',
    [GoogleSheetsActionType.CREATE_DATA]: '/google_sheets/create_data',
    [GoogleSheetsActionType.UPDATE_DATA]: '/google_sheets/update_data',
    [GoogleSheetsActionType.DELETE_DATA]: '/google_sheets/delete_data',
  },
  [IntegrationType.CUSTOM_API]: {
    [APIActionType.GET]: '/custom/make_api_call',
    [APIActionType.POST]: '/custom/make_api_call',
    [APIActionType.PATCH]: '/custom/make_api_call',
    [APIActionType.PUT]: '/custom/make_api_call',
    [APIActionType.DELETE]: '/custom/make_api_call',
  },
  [IntegrationType.ZAPIER]: {
    [ZapierActionType.START_A_ZAP]: '/zapier/trigger',
  },
};

export const resultMappings = (node: Node, resultData: any): Record<string, string> => {
  switch (node.selected_integration) {
    case IntegrationType.GOOGLE_SHEETS: {
      const newVariables: Record<string, string> = {};

      if (node.action_data && node.action_data.mapping) {
        node.action_data.mapping.forEach((m) => {
          const col = m.arg1;
          const toVar = m.arg2;

          // FIXME: possible bug, col is number based on the general types
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          const isRowNumber = col === 'row_number';

          newVariables[toVar] = isRowNumber ? resultData._cell_location.row : resultData[col];
        });
      }
      return newVariables;
    }
    case IntegrationType.CUSTOM_API: {
      return resultData;
    }
    case IntegrationType.ZAPIER:
    default: {
      return {};
    }
  }
};

export const _replacer = (match: string, inner: string, variablesMap: Record<string, any>, uriEncode = false) => {
  if (inner in variablesMap) {
    return uriEncode ? encodeURI(decodeURI(variablesMap[inner])) : variablesMap[inner];
  }
  return match;
};

export const deepVariableSubstitution = <T extends {}>(bodyData: T, variableMap: Record<string, unknown>): T => {
  const _recurse = (subCollection: any, uriEncode = false) => {
    if (subCollection && typeof subCollection === 'object') {
      Object.keys(subCollection).forEach((key) => {
        subCollection[key] = key === 'url' ? _recurse(subCollection[key], true) : _recurse(subCollection[key]);
      });
    } else if (typeof subCollection === 'string') {
      return subCollection.replace(/\{([A-Za-z0-9_]*)\}/g, (match, inner) => _replacer(match, inner, variableMap, uriEncode));
    }
    return subCollection;
  };

  return _recurse(bodyData);
};
