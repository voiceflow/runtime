import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Trace, { StreamAction, TraceFrame, TraceType } from '@/lib/Context/Trace';
import { EventType } from '@/lib/Lifecycle';

describe('Context Trace unit tests', () => {
  describe('addTrace', () => {
    it('adds frame', () => {
      const context = { callEvent: sinon.stub() };

      const trace = new Trace(context as any);
      const frame = { foo: 'bar' };
      trace.addTrace(frame as any);

      expect(_.get(trace, 'trace')).to.eql([frame]);
      expect(context.callEvent.callCount).to.eql(1);
      expect(context.callEvent.args[0][0]).to.eql(EventType.traceWillAdd);
      expect(context.callEvent.args[0][1].frame).to.eql(frame);
      expect(typeof context.callEvent.args[0][1].stop).to.eql('function');
    });

    it('does not add frame', () => {
      const context = { callEvent: sinon.stub() };
      const fakeFn = (_event: string, utils: { frame: TraceFrame; stop: Function }) => {
        utils.stop();
      };
      context.callEvent.callsFake(fakeFn);

      const trace = new Trace(context as any);
      trace.addTrace({ foo: 'bar' } as any);

      expect(_.get(trace, 'trace')).to.eql([]);
    });
  });

  it('get', () => {
    const traceObj = new Trace(null as any);
    const trace = [{}, {}];
    _.set(traceObj, 'trace', trace);
    expect(traceObj.get()).to.eql(trace);
  });

  it('node', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const blockID = 'node-id';
    trace.block(blockID);
    expect(trace.get()).to.eql([{ type: TraceType.BLOCK, payload: { blockID } }]);
  });

  it('speak', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const message = 'message';
    trace.speak(message);
    expect(trace.get()).to.eql([{ type: TraceType.SPEAK, payload: { message } }]);
  });

  it('end', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    trace.end();
    expect(trace.get()).to.eql([{ type: TraceType.END }]);
  });

  it('stream', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const src = 'src';
    const token = 'token';
    const action = StreamAction.PLAY;
    trace.stream(src, token, action);
    expect(trace.get()).to.eql([{ type: TraceType.STREAM, payload: { src, action, token } }]);
  });

  it('flow', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const diagramID = 'program-id';
    trace.flow(diagramID);
    expect(trace.get()).to.eql([{ type: TraceType.FLOW, payload: { diagramID } }]);
  });

  it('choice', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const choices = [{}, {}];
    trace.choice(choices as any);
    expect(trace.get()).to.eql([{ type: TraceType.CHOICE, payload: { choices } }]);
  });

  it('debug', () => {
    const trace = new Trace({ callEvent: sinon.stub() } as any);

    const message = 'msg';
    trace.debug(message);
    expect(trace.get()).to.eql([{ type: TraceType.DEBUG, payload: { message } }]);
  });
});
