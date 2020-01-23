import Store from '@/lib/Context/Store';

export const initializeVariables = (variables: Store, keys: string[], initialValue: any = 0) => {
  const variablesToMerge = keys.reduce((acc, key) => {
    if (variables.get(key) === undefined) {
      acc[key] = initialValue;
    }

    return acc;
  }, {} as Record<string, any>);

  variables.merge(variablesToMerge);
};

export const createCombinedVariables = (contextVariables: Store, frameVariables: Store): Store => {
  return Store.merge(frameVariables, contextVariables);
};

export const saveCombinedVariables = (combinedVariables: Store, contextVariables: Store, frameVariables: Store) => {
  const updatedFrameVariables: Record<string, any> = {};
  const updatedContextVariables: Record<string, any> = {};

  combinedVariables.forEach(({ key, value }) => {
    if (frameVariables.has(key)) {
      updatedFrameVariables[key] = value;
    } else {
      updatedContextVariables[key] = value;
    }
  });

  frameVariables.merge(updatedFrameVariables);
  contextVariables.merge(updatedContextVariables);
};

export const mapInputsVariables = (inputs: [string, string][], mapFromVariables: Store, mapToVariables: Store) => {
  mapFromVariables.produce((draft) => {
    inputs.forEach(([currentVal, newVal]) => {
      draft[newVal] = mapToVariables.get(currentVal);
    });
  });
};
export const mapOutputsVariables = (outputs: [string, string][], mapFromVariables: Store, mapToVariables: Store) => {
  const newCombinedVariables = createCombinedVariables(mapToVariables, mapFromVariables);

  outputs.forEach(([newVal, currentVal]: [string, string]) => {
    newCombinedVariables.set(newVal, mapFromVariables.get(currentVal));
  });

  saveCombinedVariables(newCombinedVariables, mapToVariables, mapFromVariables);
};
