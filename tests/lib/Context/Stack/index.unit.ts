import { expect } from 'chai';
import sinon from 'sinon';

import Stack, { Frame } from '@/lib/Context/Stack';

describe('Context Stack unit tests', () => {
  it('getState', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    const state = stack.getState();
    expect(state.length).to.eql(2);
    expect(state[0].blockID).to.eql('one');
    expect(state[1].blockID).to.eql('two');
  });

  it('getSize', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    expect(stack.getSize()).to.eql(2);
  });

  it('get', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    expect(stack.get(0).getBlockID()).to.eql('one');
    expect(stack.get(1).getBlockID()).to.eql('two');
  });

  it('top', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    expect(stack.top().getBlockID()).to.eql('two');
  });

  it('getFrames', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    const state = stack.getFrames();
    expect(state[0].getBlockID()).to.eql('one');
    expect(state[1].getBlockID()).to.eql('two');
  });

  it('isEmpty', () => {
    const stack1 = new Stack(undefined as any, null as any);
    const stack2 = new Stack([{}] as any, null as any);

    expect(stack1.isEmpty()).to.eql(true);
    expect(stack2.isEmpty()).to.eql(false);
  });

  it('flush', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const stack = new Stack(frames as any, null as any);
    expect(stack.getSize()).to.eql(2);
    stack.flush();
    expect(stack.getSize()).to.eql(0);
  });

  it('updateFrames', () => {
    const frames = [{ blockID: 'one' }, { blockID: 'two' }];
    const nextFrames = [new Frame({ blockID: 'three' } as any), new Frame({ blockID: 'four' } as any)];
    const handlers = { willChange: sinon.stub(), didChange: sinon.stub() };
    const stack = new Stack(frames as any, handlers as any);
    const prevFrames = stack.getFrames();
    stack.updateFrames(nextFrames);
    expect(handlers.willChange.args).to.eql([[{ nextFrames }]]);
    expect(handlers.didChange.args).to.eql([[{ prevFrames }]]);
  });

  it('pop', () => {
    const stack = new Stack([{ blockID: 'one' }, { blockID: 'two' }] as any, null as any);
    const frames = stack.getFrames();
    expect(stack.pop()).to.eql(frames[1]);
    expect(stack.getSize()).to.eql(1);
    expect(stack.getFrames()[0]).to.eql(frames[0]);
  });

  it('popTo', () => {
    const stack = new Stack([{ blockID: 'one' }, { blockID: 'two' }, { blockID: 'three' }] as any, null as any);
    const frames = stack.getFrames();
    stack.popTo(1);
    expect(stack.getSize()).to.eql(1);
    expect(stack.getFrames()[0]).to.eql(frames[0]);
  });

  it('lift', () => {
    const stack = new Stack([{ blockID: 'one' }, { blockID: 'two' }, { blockID: 'three' }] as any, null as any);
    const frames = stack.getFrames();
    stack.lift(2);
    expect(stack.getSize()).to.eql(1);
    expect(stack.getFrames()[0]).to.eql(frames[0]);
    stack.lift();
    expect(stack.isEmpty()).to.eql(true);
  });

  it('push', () => {
    const stack = new Stack([{ blockID: 'one' }, { blockID: 'two' }] as any, null as any);
    const newFrame = new Frame({ blockID: 'three' } as any);
    stack.push(newFrame);
    expect(stack.getSize()).to.eql(3);
    expect(stack.getFrames()[2]).to.eql(newFrame);
  });

  it('update', () => {
    const stack = new Stack([{ blockID: 'one' } as any], null as any);
    const newFrames = [{ blockID: 'two' }];
    stack.update(newFrames as any);
    expect(stack.getSize()).to.eql(1);
    expect(stack.getState()[0].blockID).to.eql('two');
  });
});
