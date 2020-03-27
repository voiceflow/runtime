import { expect } from 'chai';
import sinon from 'sinon';

import { S } from '@/lib/Constants';
import Store from '@/lib/Context/Store';
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

      describe('random === 2 | cannot repeat', () => {
        it('no previous choices', async () => {
          const context = { trace: { debug: sinon.stub() }, storage: new Store() };
          const nextIds = ['one', 'two', 'three'];
          const block = { blockID: 'block-id', nextIds, random: 2 };
          const result = await RandomHandler.handle(block as any, context as any, null as any, null as any);
          // result is one of the ids in nextIds
          expect(nextIds.includes(result as string)).to.eql(true);
          expect(context.trace.debug.args).to.eql([['going down random path']]);
          expect(context.storage.get(S.RANDOMS)[block.blockID]).to.eql([result]);
        });

        it('only one option left', async () => {
          const nextIds = ['one', 'two', 'three'];
          const block = { blockID: 'block-id', nextIds, random: 2 };

          const context = { trace: { debug: sinon.stub() }, storage: new Store({ [S.RANDOMS]: { [block.blockID]: ['one', 'three'] } }) };
          const result = await RandomHandler.handle(block as any, context as any, null as any, null as any);
          // only one option possible left
          expect(result).to.eql('two');
          expect(context.trace.debug.args).to.eql([['going down random path']]);
          expect(context.storage.get(S.RANDOMS)[block.blockID]).to.eql(['one', 'three', 'two']);
        });

        it('no option left', async () => {
          const nextIds = ['one', 'two', 'three'];
          const block = { blockID: 'block-id', nextIds, random: 2 };

          const context = { trace: { debug: sinon.stub() }, storage: new Store({ [S.RANDOMS]: { [block.blockID]: nextIds } }) };
          const result = await RandomHandler.handle(block as any, context as any, null as any, null as any);
          // result is one of the ids in nextIds
          expect(nextIds.includes(result as string)).to.eql(true);
          expect(context.trace.debug.args).to.eql([['going down random path']]);
          expect(context.storage.get(S.RANDOMS)[block.blockID]).to.eql([result]);
        });
      });
    });
  });
});
