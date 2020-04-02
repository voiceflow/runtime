import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import cycleHandler, * as file from '@/lib/Context/cycleHandler';
import { EventType } from '@/lib/Lifecycle';

describe('Context cycleHandler unit tests', () => {
  it('no block', async () => {
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID) };
    const context = { stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) } };
    const diagram = { getBlock: sinon.stub().returns(null) };
    const variableState = {};

    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(diagram.getBlock.args).to.eql([[blockID]]);
  });

  it('no handler', async () => {
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID) };
    const handlers = [{ canHandle: () => false }, { canHandle: () => false }];
    const context = {
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
    };
    const block = {};
    const diagram = { getBlock: sinon.stub().returns(block) };
    const variableState = {};

    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(diagram.getBlock.args).to.eql([[blockID]]);
  });

  it('nextID is blockID', async () => {
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID) };
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().resolves(blockID) }];
    const context = {
      callEvent: sinon.stub(),
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
      end: sinon.stub(),
      hasEnded: sinon.stub().returns(true),
    };
    const block = { blockID };
    const diagram = { getBlock: sinon.stub().returns(block) };
    const variableState = {};

    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(context.callEvent.args).to.eql([
      [EventType.handlerWillHandle, { block, variables: variableState }],
      [EventType.handlerDidHandle, { block, variables: variableState }],
    ]);
    expect(context.end.callCount).to.eql(1);
  });

  it('handle error', async () => {
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID) };
    const error = new Error('random err');
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().throws(error) }];
    const context = {
      callEvent: sinon.stub(),
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
      hasEnded: sinon.stub().returns(true),
    };
    const block = {};
    const diagram = { getBlock: sinon.stub().returns(block) };
    const variableState = {};

    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(context.callEvent.args).to.eql([
      [EventType.handlerWillHandle, { block, variables: variableState }],
      [EventType.handlerDidCatch, { error }],
    ]);
  });

  it('frames changed', async () => {
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID) };
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().resolves('next-id') }];
    const context = {
      callEvent: sinon.stub(),
      stack: {
        getFrames: sinon
          .stub()
          .onFirstCall()
          .returns([])
          .onSecondCall()
          .returns([{}]),
        top: sinon.stub().returns(referenceFrame),
      },
      getHandlers: sinon.stub().returns(handlers),
      hasEnded: sinon.stub().returns(false),
    };
    const block = {};
    const diagram = { getBlock: sinon.stub().returns(block) };
    const variableState = {};

    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(context.stack.getFrames.callCount).to.eql(2);
  });

  it('cycle multiple times', async () => {
    const cyclesLimit = 3;
    _.set(file, 'HANDLER_OVERFLOW', cyclesLimit);
    const blockID = 'block-id';
    const referenceFrame = { getBlockID: sinon.stub().returns(blockID), setBlockID: sinon.stub() };
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().resolves('next-id') }];
    const context = {
      callEvent: sinon.stub(),
      stack: {
        getFrames: sinon.stub().returns([]),
        top: sinon.stub().returns(referenceFrame),
      },
      getHandlers: sinon.stub().returns(handlers),
      hasEnded: sinon.stub().returns(false),
    };
    const block = {};
    const diagram = { getBlock: sinon.stub().returns(block) };
    const variableState = {};

    // the fact that finishes means that i > HANDLER_OVERFLOW was hit
    await cycleHandler(context as any, diagram as any, variableState as any);
    expect(context.hasEnded.callCount).to.eql(cyclesLimit + 1);
    expect(referenceFrame.setBlockID.args[0]).to.eql(['next-id']);
  });
});
