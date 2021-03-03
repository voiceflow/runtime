import { expect } from 'chai';
import sinon from 'sinon';

import TraceHandler from '@/lib/Handlers/trace';
import { Action } from '@/lib/Runtime';

describe('traceHandler unit tests', () => {
  const traceHandler = TraceHandler();

  describe('canHandle', () => {
    it('false', () => {
      expect(traceHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(traceHandler.canHandle({ _v: 1 } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    describe('stop false', () => {
      it('no defaultPath', () => {
        const node = {
          type: 'trace',
          data: { foo: 'bar' },
          paths: [
            { label: 'port1', nextID: 'one' },
            { label: 'port2', nextID: 'two' },
          ],
        };
        const runtime = {
          trace: { addTrace: sinon.stub() },
          getRequest: sinon.stub().returns(null),
          getAction: sinon.stub().returns(Action.RESPONSE),
        };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql(null);
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });

      it('wrong default path', () => {
        const node = {
          type: 'trace',
          data: { foo: 'bar' },
          defaultPath: 3, // wrong index
          paths: [
            { label: 'port1', nextID: 'one' },
            { label: 'port2', nextID: 'two' },
          ],
        };
        const runtime = {
          trace: { addTrace: sinon.stub() },
          getRequest: sinon.stub().returns(null),
          getAction: sinon.stub().returns(Action.RESPONSE),
        };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql(null);
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });

      it('with defaultPath', () => {
        const node = {
          type: 'trace',
          data: { foo: 'bar' },
          defaultPath: 1,
          paths: [
            { label: 'port1', nextID: 'one' },
            { label: 'port2', nextID: 'two' },
          ],
        };
        const runtime = {
          trace: { addTrace: sinon.stub() },
          getRequest: sinon.stub().returns(null),
          getAction: sinon.stub().returns(Action.RESPONSE),
        };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('two');
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });
    });

    describe('stop true', () => {
      it('no request', () => {
        const node = {
          id: 'node-id',
          type: 'trace',
          data: { foo: 'bar' },
          stop: true,
          paths: [
            { label: 'port1', nextID: 'one' },
            { label: 'port2', nextID: 'two' },
          ],
        };
        const runtime = {
          trace: { addTrace: sinon.stub() },
          getRequest: sinon.stub().returns(null),
          getAction: sinon.stub().returns(Action.REQUEST),
        };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('node-id');
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });

      it('no trace request', () => {
        const node = {
          id: 'node-id',
          type: 'trace',
          data: { foo: 'bar' },
          stop: true,
          paths: [
            { label: 'port1', nextID: 'one' },
            { label: 'port2', nextID: 'two' },
          ],
        };
        const runtime = {
          trace: { addTrace: sinon.stub() },
          getRequest: sinon.stub().returns({ type: 'general' }),
          getAction: sinon.stub().returns(Action.REQUEST),
        };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('node-id');
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });

      describe('trace request', () => {
        it('no request action', () => {
          const node = {
            id: 'node-id',
            type: 'trace',
            data: { foo: 'bar' },
            stop: true,
            paths: [
              { label: 'port1', nextID: 'one' },
              { label: 'port2', nextID: 'two' },
            ],
          };
          const runtime = {
            trace: { addTrace: sinon.stub() },
            getRequest: sinon.stub().returns({ type: 'trace' }),
            getAction: sinon.stub().returns(Action.RESPONSE),
          };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('node-id');
          expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
        });

        it('no pathIndex', () => {
          const node = {
            id: 'node-id',
            type: 'trace',
            data: { foo: 'bar' },
            stop: true,
            defaultPath: 1,
            paths: [
              { label: 'port1', nextID: 'one' },
              { label: 'port2', nextID: 'two' },
            ],
          };
          const runtime = {
            getRequest: sinon.stub().returns({ type: 'trace', payload: {} }),
            getAction: sinon.stub().returns(Action.REQUEST),
            setAction: sinon.stub(),
          };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('two');
          expect(runtime.setAction.args).to.eql([[Action.RESPONSE]]);
        });

        it('wrong path index', () => {
          const node = {
            id: 'node-id',
            type: 'trace',
            data: { foo: 'bar' },
            stop: true,
            defaultPath: 1,
            paths: [
              { label: 'port1', nextID: 'one' },
              { label: 'port2', nextID: 'two' },
            ],
          };
          const runtime = {
            getRequest: sinon.stub().returns({ type: 'trace', payload: { pathIndex: 5 } }),
            getAction: sinon.stub().returns(Action.REQUEST),
            setAction: sinon.stub(),
          };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('two');
          expect(runtime.setAction.args).to.eql([[Action.RESPONSE]]);
        });

        it('with pathIndex', () => {
          const node = {
            id: 'node-id',
            type: 'trace',
            data: { foo: 'bar' },
            stop: true,
            defaultPath: 1,
            paths: [
              { label: 'port1', nextID: 'one' },
              { label: 'port2', nextID: 'two' },
            ],
          };
          const runtime = {
            getRequest: sinon.stub().returns({ type: 'trace', payload: { pathIndex: 0 } }),
            getAction: sinon.stub().returns(Action.REQUEST),
            setAction: sinon.stub(),
          };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('one');
          expect(runtime.setAction.args).to.eql([[Action.RESPONSE]]);
        });
      });
    });
  });
});
