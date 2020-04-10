import { expect } from 'chai';
import sinon from 'sinon';

import SetHandler from '@/lib/Handlers/set';
import * as Utils from '@/lib/Handlers/utils/shuntingYard';
import { EventType } from '@/lib/Lifecycle';

describe('setHandler unit tests', () => {
  const setHandler = SetHandler();

  describe('canHandle', () => {
    it('false', () => {
      expect(setHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(setHandler.canHandle({ sets: ['a', 'b'] } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('with nextId', async () => {
      const shuntingYardStub = sinon.stub(Utils, 'evaluateExpression');
      shuntingYardStub.onFirstCall().resolves(null as any);
      shuntingYardStub.onSecondCall().resolves(NaN);
      shuntingYardStub.onThirdCall().resolves(5);

      const block = {
        sets: [
          { expression: '' }, // no variable
          { variable: 'v1', expression: 'v1-expression' },
          { variable: 'v2', expression: 'v2-expression' },
          { variable: 'v3', expression: 'v3-expression' },
        ],
        nextId: 'next-id',
      };
      const context = { trace: { debug: sinon.stub() }, callEvent: sinon.stub() };
      const variablesState = 'variables-state';
      const variables = { getState: sinon.stub().returns(variablesState), set: sinon.stub() };

      expect(await setHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextId);
      expect(shuntingYardStub.args).to.eql([
        [block.sets[1].expression, { v: variablesState }],
        [block.sets[2].expression, { v: variablesState }],
        [block.sets[3].expression, { v: variablesState }],
      ]);
      expect(variables.set.args).to.eql([
        [block.sets[1].variable, null],
        [block.sets[2].variable, undefined],
        [block.sets[3].variable, 5],
      ]);
      expect(context.trace.debug.args).to.eql([
        ['unable to resolve expression `` for `{undefined}`  \n`Error: No Variable Defined`'],
        ['setting `{v1}`  \nevaluating `v1-expression` to `undefined`'],
        ['setting `{v2}`  \nevaluating `v2-expression` to `undefined`'],
        ['setting `{v3}`  \nevaluating `v3-expression` to `5`'],
      ]);
      expect(context.callEvent.callCount).to.eql(1);
      expect(context.callEvent.args[0][0]).to.eql(EventType.handlerDidCatch);
      expect(context.callEvent.args[0][1].error.toString()).to.eql('Error: No Variable Defined');
    });

    it('without nextId', async () => {
      const block = {
        sets: [{ expression: '' }],
      };
      const context = { trace: { debug: sinon.stub() }, callEvent: sinon.stub() };

      expect(await setHandler.handle(block as any, context as any, null as any, null as any)).to.eql(null);
    });
  });
});
