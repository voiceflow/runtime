import { expect } from 'chai';
import sinon from 'sinon';

import CreatorDataAPI from '@/lib/DataAPI/creatorDataAPI';

describe('creatorDataAPI client unit tests', () => {
  describe('new', () => {
    it('works correctly', async () => {
      const client = sinon.stub();

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: true };

      const creatorDataAPI = new CreatorDataAPI(config, client as any);
      await creatorDataAPI.init();

      expect(client.args).to.eql([[{ apiEndpoint: config.endpoint, authorization: config.authorization, clientKey: config.clientKey }]]);
    });
  });

  describe('fetchDisplayById', () => {
    it('no data', async () => {
      const client = sinon.stub();

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: true };
      const creatorDataAPI = new CreatorDataAPI(config, client as any);

      expect(await creatorDataAPI.fetchDisplayById()).to.eql(null);
    });
  });

  describe('getProgram', () => {
    it('prototype', async () => {
      const programID = 'programID';
      const program = 'program';
      const Client = { program: { get: sinon.stub().resolves(program) }, prototypeProgram: { get: sinon.stub().resolves(program) } };
      const client = sinon.stub().returns(Client);

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
      const creatorDataAPI = new CreatorDataAPI(config, client as any);

      expect(await creatorDataAPI.getProgram(programID)).to.eql(program);
      expect(Client.prototypeProgram.get.args).to.eql([[programID, []]]);
      expect(Client.program.get.callCount).to.eql(0);
    });

    it('no prototype', async () => {
      const programID = 'programID';
      const program = 'program';
      const Client = { program: { get: sinon.stub().resolves(program) }, prototypeProgram: { get: sinon.stub().resolves(program) } };
      const client = sinon.stub().returns(Client);

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: false };
      const creatorDataAPI = new CreatorDataAPI(config, client as any);

      expect(await creatorDataAPI.getProgram(programID)).to.eql(program);
      expect(Client.program.get.args).to.eql([[programID, []]]);
      expect(Client.prototypeProgram.get.callCount).to.eql(0);
    });
  });

  it('getVersion', async () => {
    const versionID = 'versionID';
    const version = 'version';
    const Client = { version: { get: sinon.stub().resolves(version) } };
    const client = sinon.stub().returns(Client);

    const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
    const creatorDataAPI = new CreatorDataAPI(config, client as any);

    expect(await creatorDataAPI.getVersion(versionID)).to.eql(version);
    expect(Client.version.get.args).to.eql([[versionID, []]]);
  });

  it('getProject', async () => {
    const projectID = 'projectID';
    const project = 'project';
    const Client = { project: { get: sinon.stub().resolves(project) } };
    const client = sinon.stub().returns(Client);

    const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
    const creatorDataAPI = new CreatorDataAPI(config, client as any);

    expect(await creatorDataAPI.getProject(projectID)).to.eql(project);
    expect(Client.project.get.args).to.eql([[projectID, []]]);
  });
});
