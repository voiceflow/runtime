// Saves the current aggregate state of variables to the global state.
import Frame from "@/lib/Context/Stack/Frame";
import Context from "@/lib/Context";
import Store from "@/lib/Context/Store";

export const createVariables = (context: Context, referenceFrame: Frame): Store => {
  return new Store({
    ...context.variables.getState(),
    ...referenceFrame.variables.getState(),
  });
};

export const saveVariables = (variableState: Store, context: Context, referenceFrame: Frame) => {
  context.variables.merge(
    context.variables.keys().reduce((global, variable) => {
      if (variable in variableState) {
        global[variable] = variableState[variable];
        delete variableState[variable];
      }
      return global;
    }, {})
  );

  referenceFrame.variables.update(variableState);
};
