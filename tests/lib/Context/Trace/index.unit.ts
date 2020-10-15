import { TraceFrame } from '@voiceflow/general-types';
import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Trace from '@/lib/Context/Trace';
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
});
