import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Client, { DEFAULT_ENDPOINT } from '@/lib/Client';
import * as Context from '@/lib/Context';
import { DefaultHandlers } from '@/lib/Handler';

describe('client unit tests', () => {
  describe('constructor', () => {
    it('default values', () => {
      const secret = 'secret';

      const client = new Client({ secret });
      expect(_.get(client, 'options')).to.eql({
        secret,
        endpoint: DEFAULT_ENDPOINT,
        handlers: DefaultHandlers,
        services: {},
      });
    });

    it('correct options init', () => {
      const secret = 'secret';
      const endpoint = 'endpoint';
      const handlers = ['a', 'b'];
      const services = { s1: 'v1' };

      const client = new Client({ secret, endpoint, handlers: handlers as any, services });
      expect(_.get(client, 'options')).to.eql({
        secret,
        endpoint,
        handlers: [...handlers, ...DefaultHandlers],
        services,
      });
    });
  });

  describe('createContext', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('correct init of context', () => {
      const contextStub = sinon.stub(Context, 'default');
      const newContext = { foo: 'bar' };
      contextStub.returns(newContext);

      const client = new Client({ secret: 'secret' });

      const versionID = 'version-id';
      const state = 'state';
      const request = 'request';
      const options = { op1: 'val1' };

      expect(client.createContext(versionID, state as any, request as any, options as any)).to.eql(newContext);
      expect(contextStub.calledWithNew()).to.eql(true);
      expect(contextStub.args).to.eql([[versionID, state, request, { ..._.get(client, 'options'), ...options }, _.get(client, 'events')]]);
    });
  });
});
