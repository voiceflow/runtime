import { READABLE_VARIABLE_REGEXP } from '@voiceflow/general-types';
import _ from 'lodash';

export const variableReplacer = (match: string, inner: string, variables: Record<string, any>, modifier?: Function) => {
  if (inner in variables) {
    return typeof modifier === 'function' ? modifier(variables[inner]) : variables[inner];
  }

  return match;
};

export const replaceVariables = (phrase: string | undefined | null, variables: Record<string, any>, modifier?: Function) => {
  if (!phrase?.trim()) {
    return '';
  }

  return phrase.replace(READABLE_VARIABLE_REGEXP, (match, inner) => variableReplacer(match, inner, variables, modifier));
};

// turn float variables to 2 decimal places
export const sanitizeVariables = (variables: Record<string, any>) =>
  Object.entries(variables).reduce<Record<string, any>>((acc, [key, value]) => {
    if (_.isNumber(value) && !Number.isInteger(value)) {
      acc[key] = value.toFixed(2);
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

export const transformStringVariableToNumber = (str: string | null): number | string | null => {
  if (str?.startsWith('0') && str.length > 1) {
    return str;
  }

  const number = Number(str);

  return Number.isNaN(number) ? str : number;
};
