import { expect } from 'chai';
import sinon from 'sinon';

import RandomHandler from '@/lib/Handler/random';

describe('RandomHandler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      expect(RandomHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', () => {
      expect(RandomHandler.canHandle({ random: true } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no nextIds', async () => {
      const context = { trace: { debug: sinon.stub() } };
      expect(await RandomHandler.handle({ nextIds: [] } as any, context as any, null as any, null as any)).to.eql(null);
      expect(context.trace.debug.args).to.eql([['no random paths connected - exiting']]);
    });

    it('1 nextIds', async () => {
      const context = { trace: { debug: sinon.stub() } };
      const id = 'next-id';
      expect(await RandomHandler.handle({ nextIds: [id] } as any, context as any, null as any, null as any)).to.eql(id);
      expect(context.trace.debug.args).to.eql([['going down random path']]);
    });

    describe('many nextIds', () => {
      it('random can be repeated', async () => {
        const context = { trace: { debug: sinon.stub() } };
        const nextIds = ['one', 'two', 'three'];
        const result = await RandomHandler.handle({ nextIds } as any, context as any, null as any, null as any);
        // result is one of the ids in nextIds
        expect(nextIds.includes(result as string)).to.eql(true);
        expect(context.trace.debug.args).to.eql([['going down random path']]);
      });
    });
  });
});
