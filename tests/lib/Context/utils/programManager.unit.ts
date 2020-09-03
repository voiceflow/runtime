import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import ProgramManager from '@/lib/Context/utils/programManager';
import { EventType } from '@/lib/Lifecycle';
import ProgramModel from '@/lib/Program';

describe('Context utils ProgramManager', () => {
  afterEach(() => sinon.restore());

  it('get', async () => {
    const programID = 'program-id';
    const data = { id: programID, startId: 'start-id', variables: { var: 'val' }, lines: [{ b1: 'v1' }, { b2: 'v2' }], commands: [{ c1: 'v1' }] };
    const context = {
      api: { getProgram: sinon.stub().resolves(data) },
      callEvent: sinon.stub(),
    };
    const programManager = new ProgramManager(context as any);

    const program = await programManager.get(programID);
    expect(program.getID()).to.eql(programID);
    expect(program.getStartNodeID()).to.eql(data.startId);
    expect(program.getVariables()).to.eql(data.variables);
    expect(program.getRaw()).to.eql(data.lines);
    expect(program.getCommands()).to.eql(data.commands);
    expect(context.api.getProgram.args).to.eql([[programID]]);
    expect(context.callEvent.args[0][0]).to.eql(EventType.programWillFetch);
    expect(context.callEvent.args[0][1].programID).to.eql(programID);
    expect(context.callEvent.args[1]).to.eql([EventType.programDidFetch, { programID, program }]);

    expect(context.callEvent.args[0][1].override()).to.eql(undefined);
  });

  it('has to fetch program', async () => {
    const program = { id: 'id' };
    const context = { callEvent: sinon.stub(), api: { getProgram: sinon.stub().resolves(program) } };
    const programManager = new ProgramManager(context as any);

    const programID = 'program-id';
    const programModel = new ProgramModel(program as any);
    expect(await programManager.get(programID)).to.eql(programModel);
    expect(_.get(programManager, 'cachedProgram')).to.eql(programModel);
    expect(context.callEvent.callCount).to.eql(2);
    expect(context.callEvent.args[0][0]).to.eql(EventType.programWillFetch);
    expect(Object.keys(context.callEvent.args[0][1])).to.eql(['programID', 'override']);
    expect(context.callEvent.args[0][1].programID).to.eql(programID);
    expect(typeof context.callEvent.args[0][1].override).to.eql('function');
    expect(context.callEvent.args[1]).to.eql([EventType.programDidFetch, { programID, program: programModel }]);
  });

  it('program gets injected', async () => {
    const context = { callEvent: sinon.stub() };
    const injectedProgramModel = { foo: 'bar' };
    const fakeFn = (_event: string, utils: { programID: string; override: Function }) => {
      utils.override(injectedProgramModel);
    };

    context.callEvent.onFirstCall().callsFake(fakeFn);

    const programManager = new ProgramManager(context as any);
    expect(await programManager.get('program-id')).to.eql(injectedProgramModel);
  });

  it('program is in cache', async () => {
    const context = { callEvent: sinon.stub() };
    const programManager = new ProgramManager(context as any);

    const programID = 'program-id';
    _.set(programManager, 'cachedProgram', new ProgramModel({ id: programID } as any));

    const program = await programManager.get(programID);
    expect(program.getID()).to.eql(programID);
  });
});
