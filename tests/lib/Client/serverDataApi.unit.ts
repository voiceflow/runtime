import { expect } from 'chai';
import sinon from 'sinon';

import ServerDataAPI from '@/lib/DataAPI/serverDataAPI';

describe('serverDataAPI client unit tests', () => {
  describe('new', () => {
    it('works correctly', () => {
      const axios = { create: sinon.stub() };

      // eslint-disable-next-line no-new
      new ServerDataAPI({ dataSecret: 'test', dataEndpoint: 'random' }, { axios } as any);

      expect(axios.create.args).to.eql([
        [
          {
            baseURL: 'random',
            headers: { authorization: 'Bearer test' },
          },
        ],
      ]);
    });
  });

  describe('fetchDisplayById', () => {
    it('no data', async () => {
      const axiosInstance = { get: sinon.stub().returns({}) };
      const axios = { create: sinon.stub().returns(axiosInstance) };

      const client = new ServerDataAPI({ dataSecret: 'test', dataEndpoint: 'random' }, { axios } as any);

      const displayId = 1;
      expect(await client.fetchDisplayById(displayId)).to.eql(null);
      expect(axiosInstance.get.args).to.eql([[`/metadata/displays/${displayId}`]]);
    });

    it('with data', async () => {
      const data = { foo: 'bar' };
      const axiosInstance = { get: sinon.stub().returns({ data }) };
      const axios = { create: sinon.stub().returns(axiosInstance) };

      const client = new ServerDataAPI({ dataSecret: 'test', dataEndpoint: 'random' }, { axios } as any);

      const displayId = 1;
      expect(await client.fetchDisplayById(displayId)).to.eql(data);
    });
  });
});
