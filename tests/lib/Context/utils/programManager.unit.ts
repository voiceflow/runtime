import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import ProgramManager from '@/lib/Context/utils/programManager';
import { EventType } from '@/lib/Lifecycle';
import ProgramModel from '@/lib/Program';

describe('Context utils ProgramManager', () => {
  it('fetchProgramModel', async () => {
    const data = { startId: 'start-id', variables: { var: 'val' }, lines: [{ b1: 'v1' }, { b2: 'v2' }], commands: [{ c1: 'v1' }] };
    const get = sinon.stub().returns({ data });
    const programManager = new ProgramManager(null as any, { get } as any);

    const programId = 'program-id';
    const program = await programManager.get(programId);
    expect(program.getID()).to.eql(programId);
    expect(program.getStartNodeID()).to.eql(data.startId);
    expect(program.getVariables()).to.eql(data.variables);
    expect(program.getRaw()).to.eql(data.lines);
    expect(program.getCommands()).to.eql(data.commands);
    expect(get.args).to.eql([[`/programs/${programId}`]]);
  });

  describe('getProgramModel', () => {
    it('has to fetch program', async () => {
      const context = { callEvent: sinon.stub() };
      const program = { foo: 'bar' };
      const getProgram = sinon.stub().resolves(program);
      const programManager = new ProgramManager(context as any, getProgram as any);

      const programID = 'program-id';
      expect(await programManager.get(programID)).to.eql(program);
      expect(_.get(programManager, 'cachedProgramModel')).to.eql(program);
      expect(context.callEvent.callCount).to.eql(2);
      expect(context.callEvent.args[0][0]).to.eql(EventType.programWillFetch);
      expect(Object.keys(context.callEvent.args[0][1])).to.eql(['programID', 'override']);
      expect(context.callEvent.args[0][1].programID).to.eql(programID);
      expect(typeof context.callEvent.args[0][1].override).to.eql('function');
      expect(context.callEvent.args[1]).to.eql([EventType.programDidFetch, { programID, program }]);
    });

    it('program gets injected', async () => {
      const context = { callEvent: sinon.stub() };
      const injectedProgramModel = { foo: 'bar' };
      const fakeFn = (_event: string, utils: { programID: string; override: Function }) => {
        utils.override(injectedProgramModel);
      };

      context.callEvent.onFirstCall().callsFake(fakeFn);

      const programManager = new ProgramManager(context as any, null as any);
      expect(await programManager.get('program-id')).to.eql(injectedProgramModel);
    });

    it('program is in cache', async () => {
      const context = { callEvent: sinon.stub() };
      const programManager = new ProgramManager(context as any, null as any);

      const programID = 'program-id';
      _.set(programManager, 'cachedProgramModel', new ProgramModel({ id: programID } as any));

      const program = await programManager.get(programID);
      expect(program.getID()).to.eql(programID);
    });
  });
});
