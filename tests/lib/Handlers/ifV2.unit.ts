import { expect } from 'chai';
import sinon from 'sinon';

import { NodeType } from '@/../general-types/build';
import * as CodeHandler from '@/lib/Handlers/code';
import IfV2Handler from '@/lib/Handlers/ifV2';

describe('ifV2 handler unit tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('canHandle', () => {
    it('false', () => {
      expect(IfV2Handler().canHandle({ type: 'random' } as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(IfV2Handler().canHandle({ type: NodeType.IF_V2 } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    describe('no match', () => {
      it('with elseId', async () => {
        const handler = IfV2Handler();
        const codeHandler = { handle: sinon.stub() };
        const CodeHandlerStub = sinon.stub(CodeHandler, 'default').returns(codeHandler as any);

        const node = { expressions: ['a && b', 'arr.includes(a) && !b'], nextIds: [], elseId: 'else-id' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { var1: 'val1' };
        const program = { lines: [] };

        expect(await handler.handle(node as any, runtime as any, variables as any, program as any)).to.eql(node.elseId);

        expect(CodeHandlerStub.calledOnce).to.eql(true);
        expect(Object.keys((CodeHandlerStub.args[0][0] as any).callbacks)).to.eql(['setOutputPort']);
        expect(typeof (CodeHandlerStub.args[0][0] as any).callbacks.setOutputPort).to.eql('function');

        expect(codeHandler.handle.args).to.eql([
          [
            {
              code:
                'try { \n            if(a && b) {\n                setOutputPort(0); \n                throw(null);\n            }\n        \n            if(arr.includes(a) && !b) {\n                setOutputPort(1); \n                throw(null);\n            }\n         } catch (err) {}',
              id: 'PROGRAMMATICALLY-GENERATED-CODE-NODE',
              type: NodeType.CODE,
            },
            runtime,
            variables,
            program,
          ],
        ]);

        expect(runtime.trace.debug.args).to.eql([['no conditions matched - taking else path']]);
      });

      it('no elseId', async () => {
        const handler = IfV2Handler();
        const codeHandler = { handle: sinon.stub() };
        sinon.stub(CodeHandler, 'default').returns(codeHandler as any);

        const node = { expressions: [], nextIds: [] };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { var1: 'val1' };
        const program = { lines: [] };

        expect(await handler.handle(node as any, runtime as any, variables as any, program as any)).to.eql(null);
      });
    });

    describe('match', () => {
      it('works', async () => {
        const handler = IfV2Handler({ safe: false });

        const node = {
          expressions: ['a && b', 'arr.includes(a) && !b', 'a === 3'], // third condition is also true, but we exit early when there's a match
          nextIds: ['first-next', 'second-next', 'third-next'],
          elseId: 'else-id',
        };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({ a: 3, b: false, arr: [1, 3, 5] }), merge: sinon.stub() };
        const program = { lines: [] };

        expect(await handler.handle(node as any, runtime as any, variables as any, program as any)).to.eql(node.nextIds[1]);

        expect(runtime.trace.debug.args).to.eql([
          ['evaluating code - changes:  \n`{arr}`: `1,3,5` => `1,3,5`  \n'],
          ['condition true - taking path 2'],
        ]);
      });
    });
  });
});
