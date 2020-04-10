import axios from 'axios';
import { expect } from 'chai';
import safeJSONStringify from 'safe-json-stringify';
import sinon from 'sinon';

import CodeHandler from '@/lib/Handlers/code';

describe('codeHandler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      const codeHandler = CodeHandler({ endpoint: '' });
      expect(codeHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      const codeHandler = CodeHandler({ endpoint: '' });
      expect(codeHandler.canHandle({ code: 'foo()' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    describe('catch', () => {
      afterEach(() => {
        sinon.restore();
      });

      it('no fail_id', async () => {
        const codeHandler = CodeHandler({ endpoint: 'foo' });
        const err = { response: { data: { foo: 'bar' } } };
        const axiosPost = sinon.stub(axios, 'post').throws(err);

        const block = { code: 'foo()' };
        const context = { trace: { debug: sinon.stub() } };
        const variables = { keys: sinon.stub().returns([]) };
        const result = await codeHandler.handle(block as any, context as any, variables as any, null as any);
        expect(result).to.eql(null);
        expect(axiosPost.args).to.eql([['foo', { code: block.code, variables: {} }]]);
        expect(context.trace.debug.args).to.eql([[`unable to resolve code  \n\`${safeJSONStringify(err.response.data)}\``]]);
      });

      it('with fail_id', async () => {
        const codeHandler = CodeHandler({ endpoint: 'foo' });
        const axiosPost = sinon.stub(axios, 'post').throws({});

        const block = { code: 'foo()', fail_id: 'fail-id' };
        const context = { trace: { debug: sinon.stub() } };
        const variables = { keys: sinon.stub().returns([]) };
        const result = await codeHandler.handle(block as any, context as any, variables as any, null as any);
        expect(result).to.eql(block.fail_id);
        expect(axiosPost.args).to.eql([['foo', { code: block.code, variables: {} }]]);
        expect(context.trace.debug.args).to.eql([['unable to resolve code  \n`undefined`']]);
      });
    });

    describe('success', () => {
      afterEach(() => {
        sinon.restore();
      });

      it('with variables changes', async () => {
        const codeHandler = CodeHandler({ endpoint: 'foo' });
        const axiosPost = sinon.stub(axios, 'post').resolves({ data: { var1: 1.1, var2: 2.2, newVar: 5 } });

        const block = { code: 'var1(); var2(); var3();', success_id: 'success-id' };
        const context = { trace: { debug: sinon.stub() } };
        const variablesGet = sinon.stub();
        variablesGet.withArgs('var1').returns(1);
        variablesGet.withArgs('var2').returns(2);
        variablesGet.withArgs('var3').returns(3);
        const variables = { keys: sinon.stub().returns(['var1', 'var2', 'var3', 'var4']), get: variablesGet, merge: sinon.stub() };
        const result = await codeHandler.handle(block as any, context as any, variables as any, null as any);
        expect(result).to.eql(block.success_id);
        expect(axiosPost.args).to.eql([['foo', { code: block.code, variables: { var1: 1, var2: 2, var3: 3 } }]]);
        expect(context.trace.debug.args).to.eql([
          [
            'evaluating code - changes:  \n`{var1}`: `1` => `1.1`  \n`{var2}`: `2` => `2.2`  \n`{var3}`: `3` => `undefined`  \n`{newVar}`: `undefined` => `5`  \n',
          ],
        ]);
      });

      it('no variables changes', async () => {
        const codeHandler = CodeHandler({ endpoint: 'foo' });
        const axiosPost = sinon.stub(axios, 'post').resolves({ data: { var1: 1 } });

        const block = { code: 'var1();' };
        const context = { trace: { debug: sinon.stub() } };
        const variablesGet = sinon.stub();
        variablesGet.withArgs('var1').returns(1);
        const variables = { keys: sinon.stub().returns(['var1', 'var2', 'var3', 'var4']), get: variablesGet, merge: sinon.stub() };
        const result = await codeHandler.handle(block as any, context as any, variables as any, null as any);
        expect(result).to.eql(null);
        expect(axiosPost.args).to.eql([['foo', { code: block.code, variables: { var1: 1 } }]]);
        expect(context.trace.debug.args).to.eql([['evaluating code - no variable changes']]);
      });
    });
  });
});
