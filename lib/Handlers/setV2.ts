import { NodeType } from '@voiceflow/general-types/build';
import { Node } from '@voiceflow/general-types/build/nodes/setV2';

import { HandlerFactory } from '@/lib/Handler';

import CodeHandler from './code';

export type SetV2Options = {
  endpoint?: string | null;
  safe?: boolean;
};

const SetV2Handler: HandlerFactory<Node, SetV2Options | void> = ({ endpoint, safe } = {}) => ({
  canHandle: (node) => node.type === NodeType.SET_V2,
  handle: async (node, runtime, variables, program) => {
    const codeHandler = CodeHandler({ endpoint, safe });

    let code = `
        let evaluated;
    `;
    node.sets.forEach((set) => {
      code += `
            evaluated = ${set.expression};
            ${set.variable} = !!evaluated || !Number.isNaN(evaluated) ? evaluated : undefined;
        `;
    });

    await codeHandler.handle({ code, id: 'PROGRAMMATICALLY-GENERATED-CODE-NODE', type: NodeType.CODE }, runtime, variables, program);

    return node.nextId || null;
  },
});

export default SetV2Handler;