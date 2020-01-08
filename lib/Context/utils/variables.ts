import Store from '@/lib/Context/Store';

export const initializeVariables = (variables: Store, keys: string[], initialValue: any = 0) => {
  keys.forEach((key) => {
    if (variables.get(key) === undefined) {
      variables.set(key, initialValue);
    }
  });
};

export const createCombinedVariables = (contextVariables: Store, frameVariables: Store): Store => {
  return Store.merge(contextVariables, frameVariables);
};

export const saveCombinedVariables = (combinedVariables: Store, contextVariables: Store, frameVariables: Store) => {
  combinedVariables.forEach(({ key, value }) => {
    if (contextVariables.has(key)) {
      contextVariables.set(key, value);
    } else {
      frameVariables.set(key, value);
    }
  });
};
