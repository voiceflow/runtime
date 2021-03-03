import { expect } from 'chai';
import sinon from 'sinon';

import TraceHandler from '@/lib/Handlers/trace';

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
        const runtime = { trace: { addTrace: sinon.stub() }, getRequest: sinon.stub().returns(null) };

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
        const runtime = { trace: { addTrace: sinon.stub() }, getRequest: sinon.stub().returns(null) };

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
        const runtime = { trace: { addTrace: sinon.stub() }, getRequest: sinon.stub().returns(null) };

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
        const runtime = { trace: { addTrace: sinon.stub() }, getRequest: sinon.stub().returns(null) };

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
        const runtime = { trace: { addTrace: sinon.stub() }, getRequest: sinon.stub().returns({ type: 'general' }) };

        expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('node-id');
        expect(runtime.trace.addTrace.args).to.eql([[{ type: node.type, payload: { data: node.data, paths: node.paths } }]]);
      });

      describe('trace request', () => {
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
          const runtime = { getRequest: sinon.stub().returns({ type: 'trace', payload: {} }) };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('two');
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
          const runtime = { getRequest: sinon.stub().returns({ type: 'trace', payload: { pathIndex: 5 } }) };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('two');
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
          const runtime = { getRequest: sinon.stub().returns({ type: 'trace', payload: { pathIndex: 0 } }) };

          expect(traceHandler.handle(node as any, runtime as any, null as any, null as any)).to.eql('one');
        });
      });
    });
  });
});
