import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import cycleHandler, * as file from '@/lib/Context/cycleHandler';
import { EventType } from '@/lib/Lifecycle';

describe('Context cycleHandler unit tests', () => {
  it('no node', async () => {
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID) };
    const context = { stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) } };
    const program = { getNode: sinon.stub().returns(null) };
    const variableState = {};

    await cycleHandler(context as any, program as any, variableState as any);
    expect(program.getNode.args).to.eql([[nodeID]]);
  });

  it('no handler', async () => {
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID) };
    const handlers = [{ canHandle: () => false }, { canHandle: () => false }];
    const context = {
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
    };
    const node = {};
    const program = { getNode: sinon.stub().returns(node) };
    const variableState = {};

    await cycleHandler(context as any, program as any, variableState as any);
    expect(program.getNode.args).to.eql([[nodeID]]);
  });

  it('nextID is nodeID', async () => {
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID) };
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().resolves(nodeID) }];
    const context = {
      callEvent: sinon.stub(),
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
      end: sinon.stub(),
      hasEnded: sinon.stub().returns(true),
    };
    const node = { nodeID };
    const program = { getNode: sinon.stub().returns(node) };
    const variableState = {};

    await cycleHandler(context as any, program as any, variableState as any);
    expect(context.callEvent.args).to.eql([
      [EventType.handlerWillHandle, { node, variables: variableState }],
      [EventType.handlerDidHandle, { node, variables: variableState }],
    ]);
    expect(context.end.callCount).to.eql(1);
  });

  it('handle error', async () => {
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID) };
    const error = new Error('random err');
    const handlers = [{ canHandle: () => false }, { canHandle: () => true, handle: sinon.stub().throws(error) }];
    const context = {
      callEvent: sinon.stub(),
      stack: { getFrames: sinon.stub().returns([]), top: sinon.stub().returns(referenceFrame) },
      getHandlers: sinon.stub().returns(handlers),
      hasEnded: sinon.stub().returns(true),
    };
    const node = {};
    const program = { getNode: sinon.stub().returns(node) };
    const variableState = {};

    await cycleHandler(context as any, program as any, variableState as any);
    expect(context.callEvent.args).to.eql([
      [EventType.handlerWillHandle, { node, variables: variableState }],
      [EventType.handlerDidCatch, { error }],
    ]);
  });

  it('frames changed', async () => {
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID) };
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
    const node = {};
    const program = { getNode: sinon.stub().returns(node) };
    const variableState = {};

    await cycleHandler(context as any, program as any, variableState as any);
    expect(context.stack.getFrames.callCount).to.eql(2);
  });

  it('cycle multiple times', async () => {
    const cyclesLimit = 3;
    _.set(file, 'HANDLER_OVERFLOW', cyclesLimit);
    const nodeID = 'node-id';
    const referenceFrame = { getNodeID: sinon.stub().returns(nodeID), setNodeID: sinon.stub() };
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
    const node = {};
    const program = { getNode: sinon.stub().returns(node) };
    const variableState = {};

    // the fact that finishes means that i > HANDLER_OVERFLOW was hit
    await cycleHandler(context as any, program as any, variableState as any);
    expect(context.hasEnded.callCount).to.eql(cyclesLimit + 1);
    expect(referenceFrame.setNodeID.args[0]).to.eql(['next-id']);
  });
});
