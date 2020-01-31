import { Block } from '@/lib/Diagram';

import { CUSTOM_API, GOOGLE_SHEETS, IntegrationBlock, ZAPIER } from './constants';

export const resultMappings: Record<string, (block: Block<IntegrationBlock>, resultData: Record<string, any>) => Record<string, any>> = {
  [GOOGLE_SHEETS]: (block, resultData) => {
    const newVariables: Record<string, string> = {};
    if (block.action_data && block.action_data.mapping) {
      block.action_data.mapping.forEach((m: { arg1: string; arg2: string }) => {
        const col = m.arg1;
        const toVar = m.arg2;
        newVariables[toVar] = col === 'row_number' ? resultData._cell_location.row : resultData[col];
      });
    }
    return newVariables;
  },
  [CUSTOM_API]: (_block, resultData) => {
    return resultData;
  },
  [ZAPIER]: () => ({}),
};

const _replacer = (match: string, inner: string, variablesMap: Record<string, any>, uriEncode = false) => {
  if (inner in variablesMap) {
    return uriEncode ? encodeURI(variablesMap[inner]) : variablesMap[inner];
  }
  return match;
};

export const deepVariableSubstitution = (bodyData: Record<string, any>, variableMap: Record<string, any>) => {
  const _recurse = (subCollection: Record<string, any> | string, uriEncode = false) => {
    if (typeof subCollection === 'object' && subCollection) {
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
