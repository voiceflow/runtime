import { expect } from 'chai';
import sinon from 'sinon';

import IfHandler from '@/lib/Handler/if';
import * as Utils from '@/lib/Handler/utils/shuntingYard';
import { EventType } from '@/lib/Lifecycle';

describe('IfHandler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      expect(IfHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(IfHandler.canHandle({ expressions: ['a', 'b'] } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('evaluates to smth', async () => {
      const shuntingYardStub = sinon.stub(Utils, 'evaluateExpression');
      const evaluateError = 'evaluate-error';
      shuntingYardStub.onFirstCall().throws(evaluateError);
      shuntingYardStub.onSecondCall().resolves(5);

      const block = { expressions: ['first', 'second', 'third'], nextIds: ['first-path', 'second-path', 'third'] };
      const context = { trace: { debug: sinon.stub() }, callEvent: sinon.stub() };
      const variablesState = 'variables-state';
      const variables = { getState: sinon.stub().returns(variablesState) };

      expect(await IfHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[1]);
      expect(shuntingYardStub.args).to.eql([
        [block.expressions[0], { v: variablesState }],
        [block.expressions[1], { v: variablesState }],
      ]);

      expect(context.callEvent.callCount).to.eql(1);
      expect(context.callEvent.args[0][0]).to.eql(EventType.handlerDidCatch);
      expect(context.callEvent.args[0][1].error.toString()).to.eql(evaluateError);

      expect(context.trace.debug.args).to.eql([
        [`unable to resolve expression \`${block.expressions[0]}\`  \n\`${evaluateError}\``],
        ['evaluating path 2: `second` to `5`'],
        ['condition true - taking path 2'],
      ]);
    });

    it('evaluates to 0', async () => {
      const shuntingYardStub = sinon.stub(Utils, 'evaluateExpression');
      shuntingYardStub.onFirstCall().resolves(null as any);
      shuntingYardStub.onSecondCall().resolves(0);

      const block = { expressions: ['first', 'second'], nextIds: ['first-path', 'second-path'] };
      const context = { trace: { debug: sinon.stub() } };
      const variablesState = 'variables-state';
      const variables = { getState: sinon.stub().returns(variablesState) };

      expect(await IfHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[1]);
      expect(shuntingYardStub.args).to.eql([
        [block.expressions[0], { v: variablesState }],
        [block.expressions[1], { v: variablesState }],
      ]);

      expect(context.trace.debug.args).to.eql([
        ['evaluating path 1: `first` to `undefined`'],
        ['evaluating path 2: `second` to `0`'],
        ['condition true - taking path 2'],
      ]);
    });

    describe('cant evaluate', () => {
      afterEach(() => {
        sinon.restore();
      });

      it('with elseId', async () => {
        sinon.stub(Utils, 'evaluateExpression').resolves(null as any);

        const block = { expressions: ['first'], nextIds: ['first-path'], elseId: 'else-id' };
        const context = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}) };

        expect(await IfHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.elseId);

        expect(context.trace.debug.args).to.eql([['evaluating path 1: `first` to `undefined`'], ['no conditions matched - taking else path']]);
      });

      it('without elseId', async () => {
        sinon.stub(Utils, 'evaluateExpression').resolves(null as any);

        const block = { expressions: ['first'], nextIds: ['first-path'] };
        const context = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}) };

        expect(await IfHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);

        expect(context.trace.debug.args).to.eql([['evaluating path 1: `first` to `undefined`'], ['no conditions matched - taking else path']]);
      });
    });
  });
});