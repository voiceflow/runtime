import { expect } from 'chai';
import sinon from 'sinon';

import CreatorDataAPI from '@/lib/DataAPI/creatorDataAPI';

describe('creatorDataAPI client unit tests', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('new', () => {
    it('constructor works correctly', async () => {
      const generateClientStub = sinon.stub();
      const VF = sinon.stub().returns({
        generateClient: generateClientStub,
      });

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: true };

      const creatorDataAPI = new CreatorDataAPI(config, VF as any);
      await creatorDataAPI.init();

      expect(VF.args).to.eql([[{ apiEndpoint: config.endpoint, clientKey: config.clientKey }]]);
      expect(generateClientStub.args).to.eql([[{ authorization: config.authorization }]]);
    });
  });

  it('updateAuthorization', () => {
    const generateClientStub = sinon.stub();
    const VF = sinon.stub().returns({
      generateClient: generateClientStub,
    });

    const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: true };

    const creatorDataAPI = new CreatorDataAPI(config, VF as any);
    creatorDataAPI.updateAuthorization('new auth');

    expect(generateClientStub.firstCall.args).to.eql([{ authorization: config.authorization }]);
    expect(generateClientStub.secondCall.args).to.eql([{ authorization: 'new auth' }]);
  });

  describe('fetchDisplayById', () => {
    it('no data', async () => {
      const generateClientStub = sinon.stub();
      const VF = sinon.stub().returns({
        generateClient: generateClientStub,
      });

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: true };
      const creatorDataAPI = new CreatorDataAPI(config, VF as any);

      expect(await creatorDataAPI.fetchDisplayById()).to.eql(null);
    });
  });

  describe('getProgram', () => {
    it('prototype', async () => {
      const programID = 'programID';
      const program = 'program';
      const Client = { program: { get: sinon.stub().resolves(program) }, prototypeProgram: { get: sinon.stub().resolves(program) } };
      const generateClientStub = sinon.stub().returns(Client);
      const VF = sinon.stub().returns({
        generateClient: generateClientStub,
      });

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
      const creatorDataAPI = new CreatorDataAPI(config, VF as any);

      expect(await creatorDataAPI.getProgram(programID)).to.eql(program);
      expect(Client.prototypeProgram.get.args).to.eql([[programID]]);
      expect(Client.program.get.callCount).to.eql(0);
    });

    it('no prototype', async () => {
      const programID = 'programID';
      const program = 'program';
      const Client = { program: { get: sinon.stub().resolves(program) }, prototypeProgram: { get: sinon.stub().resolves(program) } };
      const generateClientStub = sinon.stub().returns(Client);
      const VF = sinon.stub().returns({
        generateClient: generateClientStub,
      });

      const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey', prototype: false };
      const creatorDataAPI = new CreatorDataAPI(config, VF as any);

      expect(await creatorDataAPI.getProgram(programID)).to.eql(program);
      expect(Client.program.get.args).to.eql([[programID]]);
      expect(Client.prototypeProgram.get.callCount).to.eql(0);
    });
  });

  it('getVersion', async () => {
    const versionID = 'versionID';
    const version = 'version';
    const Client = { version: { get: sinon.stub().resolves(version) } };
    const generateClientStub = sinon.stub().returns(Client);
    const VF = sinon.stub().returns({
      generateClient: generateClientStub,
    });

    const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
    const creatorDataAPI = new CreatorDataAPI(config, VF as any);

    expect(await creatorDataAPI.getVersion(versionID)).to.eql(version);
    expect(Client.version.get.args).to.eql([[versionID]]);
  });

  it('getProject', async () => {
    const projectID = 'projectID';
    const project = 'project';
    const Client = { project: { get: sinon.stub().resolves(project) } };
    const generateClientStub = sinon.stub().returns(Client);
    const VF = sinon.stub().returns({
      generateClient: generateClientStub,
    });

    const config = { endpoint: '_endpoint', authorization: '_authorization', clientKey: '_clientKey' };
    const creatorDataAPI = new CreatorDataAPI(config, VF as any);

    expect(await creatorDataAPI.getProject(projectID)).to.eql(project);
    expect(Client.project.get.args).to.eql([[projectID]]);
  });
});
