import { NodeType } from '@voiceflow/general-types/';
import { Node } from '@voiceflow/general-types/build/nodes/ifV2';

import { HandlerFactory } from '@/lib/Handler';

import { TurnType } from '../Constants/flags';
import CodeHandler from './code';

export type IfV2Options = {
  endpoint?: string | null;
  safe?: boolean;
};

const IfV2Handler: HandlerFactory<Node, IfV2Options | void> = ({ endpoint, safe } = {}) => ({
  canHandle: (node, runtime) => node.type === NodeType.IF_V2 && !(runtime.turn.get<string[]>(TurnType.STOP_TYPES) || []).includes(NodeType.IF_V2),
  handle: async (node, runtime, variables, program) => {
    let outputPortIndex = -1;
    const setOutputPort = function(index: number) {
      outputPortIndex = index;
    };
    const codeHandler = CodeHandler({ endpoint, callbacks: { setOutputPort }, safe });

    let code = '';
    for (let i = 0; i < node.payload.expressions.length; i++) {
      code += `
            if(${node.payload.expressions[i]}) {
                setOutputPort(${i}); 
                throw(null);
            }
        `;
    }

    const codeTemplate = `try { ${code} } catch (err) {}`;

    await codeHandler.handle({ code: codeTemplate, id: 'PROGRAMMATICALLY-GENERATED-CODE-NODE', type: NodeType.CODE }, runtime, variables, program);

    if (outputPortIndex !== -1) {
      runtime.trace.debug(`condition true - taking path ${outputPortIndex + 1}`);
      return node.paths[outputPortIndex].nextID;
    }

    runtime.trace.debug('no conditions matched - taking else path');

    return node.payload.elseId || null;
  },
});

export default IfV2Handler;