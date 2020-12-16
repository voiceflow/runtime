import axios from 'axios';
import { expect } from 'chai';
import sinon from 'sinon';

import IntegrationsHandler from '@/lib/Handlers/integrations';
import { ENDPOINTS_MAP } from '@/lib/Handlers/utils/integrations';

const DEFAULT_OPTIONS = { customAPIEndpoint: '', integrationsLambdaEndpoint: '' };

describe('integrationsHandler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
      expect(integrationsHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
      expect(integrationsHandler.canHandle({ type: 'integrations' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('no selected_integration', async () => {
      const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
      const node = { fail_id: 'fail-id' };
      const runtime = { trace: { debug: sinon.stub() } };

      expect(await integrationsHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql(node.fail_id);
      expect(runtime.trace.debug.args).to.eql([['no integration or action specified - fail by default']]);
    });

    it('no selected_action', async () => {
      const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
      const node = { selected_integration: 'integration1' };
      const runtime = { trace: { debug: sinon.stub() } };

      expect(await integrationsHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql(null);
      expect(runtime.trace.debug.args).to.eql([['no integration or action specified - fail by default']]);
    });

    describe('http call fails', () => {
      it('without fail_id', async () => {
        const customAPIEndpoint = 'https://foo';
        const integrationsHandler = IntegrationsHandler({ customAPIEndpoint, integrationsLambdaEndpoint: '' });
        const axiosErr = { response: { data: 'http call error' } };
        const axiosPost = sinon.stub(axios, 'post').throws(axiosErr);

        const node = { selected_integration: 'Custom API', selected_action: 'Make a GET Request' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}) };

        expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(null);
        expect(runtime.trace.debug.args).to.eql([
          [`action **${node.selected_action}** for integration **${node.selected_integration}** failed  \n"${axiosErr.response.data}"`],
        ]);
        expect(axiosPost.args).to.eql([[`${customAPIEndpoint}${ENDPOINTS_MAP[node.selected_integration][node.selected_action]}`, undefined]]);
      });

      it('with fail_id', async () => {
        // const axiosErr = { response: { data: 'http call error' } };
        const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
        sinon.stub(axios, 'post').throws(null);

        const node = { fail_id: 'fail-id', selected_integration: 'Custom API', selected_action: 'Make a GET Request' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}) };

        expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(node.fail_id);
        expect(runtime.trace.debug.args).to.eql([
          [`action **${node.selected_action}** for integration **${node.selected_integration}** failed  \nundefined`],
        ]);
      });
    });

    describe('custom api', () => {
      it('success', async () => {
        const customAPIEndpoint = 'https://foo';
        const integrationsHandler = IntegrationsHandler({ customAPIEndpoint, integrationsLambdaEndpoint: '' });
        const resultVariables = { data: { variables: { foo: 'bar' }, response: { status: 200 } } };
        const axiosPost = sinon.stub(axios, 'post').resolves(resultVariables);

        const node = { selected_integration: 'Custom API', selected_action: 'Make a GET Request' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}), merge: sinon.stub() };

        expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(null);
        expect(runtime.trace.debug.args).to.eql([
          [`action **${node.selected_action}** for integration **${node.selected_integration}** successfully triggered`],
        ]);
        expect(axiosPost.args).to.eql([[`${customAPIEndpoint}${ENDPOINTS_MAP[node.selected_integration][node.selected_action]}`, undefined]]);
        expect(variables.merge.args).to.eql([[resultVariables.data.variables]]);
      });

      it('error status without fail_id', async () => {
        const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
        const resultVariables = { data: { variables: {}, response: { status: 401 } } };
        sinon.stub(axios, 'post').resolves(resultVariables);

        const node = { selected_integration: 'Custom API', selected_action: 'Make a GET Request' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}), merge: sinon.stub() };

        expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(null);
        expect(runtime.trace.debug.args).to.eql([
          [`action **${node.selected_action}** for integration **${node.selected_integration}** failed or encountered error`],
        ]);
      });

      it('error status with fail_id', async () => {
        const integrationsHandler = IntegrationsHandler(DEFAULT_OPTIONS);
        const resultVariables = { data: { variables: {}, response: { status: 401 } } };
        sinon.stub(axios, 'post').resolves(resultVariables);

        const node = { fail_id: 'fail-id', selected_integration: 'Custom API', selected_action: 'Make a GET Request' };
        const runtime = { trace: { debug: sinon.stub() } };
        const variables = { getState: sinon.stub().returns({}), merge: sinon.stub() };

        expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(node.fail_id);
        expect(runtime.trace.debug.args).to.eql([
          [`action **${node.selected_action}** for integration **${node.selected_integration}** failed or encountered error`],
        ]);
      });
    });

    it('success integrations', async () => {
      const integrationsLambdaEndpoint = 'https://lambda';
      const integrationsHandler = IntegrationsHandler({ customAPIEndpoint: '', integrationsLambdaEndpoint });
      const resultVariables = { data: null };
      const axiosPost = sinon.stub(axios, 'post').resolves(resultVariables);

      const node = { success_id: 'success-id', selected_integration: 'Zapier', selected_action: 'Start a Zap' };
      const runtime = { trace: { debug: sinon.stub() } };
      const variables = { getState: sinon.stub().returns({}), merge: sinon.stub() };

      expect(await integrationsHandler.handle(node as any, runtime as any, variables as any, null as any)).to.eql(node.success_id);
      expect(runtime.trace.debug.args).to.eql([
        [`action **${node.selected_action}** for integration **${node.selected_integration}** successfully triggered`],
      ]);
      expect(axiosPost.args).to.eql([[`${integrationsLambdaEndpoint}${ENDPOINTS_MAP[node.selected_integration][node.selected_action]}`, undefined]]);
      expect(variables.merge.args).to.eql([[{}]]);
    });
  });
});
