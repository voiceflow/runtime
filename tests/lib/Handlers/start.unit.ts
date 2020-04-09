import { expect } from 'chai';
import sinon from 'sinon';

import StartHandler from '@/lib/Handlers/start';

describe('startHandler unit tests', () => {
  const startHandler = StartHandler();

  describe('canHandle', () => {
    it('false', () => {
      expect(startHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
      expect(startHandler.canHandle({ start: true, nextId: null } as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(startHandler.canHandle({ start: true, nextId: 'next-id' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('nextId', () => {
      const block = { nextId: 'next-id' };
      const context = { trace: { debug: sinon.stub() } };
      expect(startHandler.handle(block as any, context as any, null as any, null as any)).to.eql(block.nextId);
      expect(context.trace.debug.args).to.eql([['beginning flow']]);
    });

    it('no nextId', () => {
      const block = {};
      const context = { trace: { debug: sinon.stub() } };
      expect(startHandler.handle(block as any, context as any, null as any, null as any)).to.eql(null);
      expect(context.trace.debug.args).to.eql([['beginning flow']]);
    });
  });
});
