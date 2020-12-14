import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Context, { Action } from '@/lib/Context';
import * as cycleStack from '@/lib/Context/cycleStack';
import * as ProgramManager from '@/lib/Context/utils/programManager';
import { AbstractLifecycle, EventType } from '@/lib/Lifecycle';

describe('Context unit', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructor', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined, {} as any, null as any);
    context.callEvent = sinon.stub().returns('foo');
    // assert that events are being initiated correctly
    expect(_.get(context.stack, 'handlers.willChange')()).to.eql('foo');
  });

  it('getInput', () => {
    const input = { type: 'req', payload: {} };
    const context = new Context(null as any, { stack: [] } as any, input, {} as any, null as any);
    expect(context.getInput()).to.eql(input);
  });

  it('setInput', () => {
    const input = { type: 'req', payload: {} };
    const context = new Context(null as any, { stack: [] } as any, 'oldInput' as any, {} as any, null as any);
    expect(context.setInput(input)).to.eq(undefined);
    expect(context.getInput()).to.eql(input);
  });

  it('setAction', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    const action = Action.RUNNING;
    context.setAction(action as any);
    expect(_.get(context, 'action')).to.eql(action);
  });

  it('getAction', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    const action = Action.RUNNING;
    context.setAction(action as any);
    expect(context.getAction()).to.eql(action);
  });

  it('end', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    context.end();
    expect(context.getAction()).to.eql(Action.END);
  });

  it('hasEnded', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    expect(context.hasEnded()).to.eql(false);
    context.end();
    expect(context.hasEnded()).to.eql(true);
  });

  it('getProgram', () => {
    const program = { foo: 'bar' };
    const getProgram = sinon.stub().returns(program);
    const ProgramManagerStub = sinon.stub(ProgramManager, 'default');
    ProgramManagerStub.returns({ get: getProgram });

    const context = new Context(null as any, { stack: [] } as any, undefined as any, { api: { getProgram } }, null as any);

    const programId = 'program-id';
    expect(context.getProgram(programId)).to.eql(program);
    expect(ProgramManagerStub.calledWithNew()).to.eql(true);
    expect(ProgramManagerStub.args).to.eql([[context]]);
    expect(getProgram.args).to.eql([[programId]]);
  });

  it('getHandlers', () => {
    const handlers = [{}, {}];
    const context = new Context(null as any, { stack: [] } as any, undefined as any, { handlers } as any, null as any);
    expect(context.getHandlers()).to.eql(handlers);
  });

  it('getRawState', () => {
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    expect(context.getRawState()).to.eql({ turn: {}, stack: [], storage: {}, variables: {} });
  });

  describe('getFinalState', () => {
    it('throws', () => {
      const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
      expect(() => {
        context.getFinalState();
      }).to.throw('context not updated');
    });

    it('returns', () => {
      const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
      context.setAction(Action.END);
      expect(context.getFinalState()).to.eql({ stack: [], storage: {}, variables: {} });
    });
  });

  describe('update', () => {
    it('catch error', async () => {
      const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
      context.setAction(Action.RUNNING);
      const callEventStub = sinon.stub().resolves();
      context.callEvent = callEventStub;
      await context.update();
      expect(callEventStub.callCount).to.eql(2);
      expect(callEventStub.args[0]).to.eql([EventType.updateWillExecute, {}]);
      expect(callEventStub.args[1][0]).to.eql(EventType.updateDidCatch);
      expect(Object.keys(callEventStub.args[1][1])).to.eql(['error']);
      expect(callEventStub.args[1][1].error.message).to.eql('context updated twice');
    });

    it('is idle', async () => {
      const cycleStackStub = sinon.stub(cycleStack, 'default');
      const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
      const callEventStub = sinon.stub();
      context.callEvent = callEventStub;
      const setActionStub = sinon.stub();
      context.setAction = setActionStub;
      await context.update();
      expect(callEventStub.args).to.eql([
        [EventType.updateWillExecute, {}],
        [EventType.updateDidExecute, {}],
      ]);
      expect(setActionStub.args).to.eql([[Action.RUNNING]]);
      expect(cycleStackStub.args).to.eql([[context]]);
    });
  });

  it('callEvent', async () => {
    const callEventStub = sinon.stub(AbstractLifecycle.prototype, 'callEvent');
    const context = new Context(null as any, { stack: [] } as any, undefined as any, {} as any, null as any);
    const type = 'type';
    const event = 'event';
    await context.callEvent(type as any, event);
    expect(callEventStub.args).to.eql([[type, event, context]]);
  });
});
