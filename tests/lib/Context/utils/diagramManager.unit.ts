import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import DiagramManager from '@/lib/Context/utils/diagramManager';
import Diagram from '@/lib/Diagram';
import { EventType } from '@/lib/Lifecycle';

describe('Context utils DiagramManager', () => {
  it('fetchDiagram', async () => {
    const data = { startId: 'start-id', variables: { var: 'val' }, lines: [{ b1: 'v1' }, { b2: 'v2' }], commands: [{ c1: 'v1' }] };
    const get = sinon.stub().returns({ data });
    const diagramManager = new DiagramManager(null as any, { get } as any);

    const diagramId = 'diagram-id';
    const diagram = await diagramManager.fetchDiagram(diagramId);
    expect(diagram.getID()).to.eql(diagramId);
    expect(diagram.getStartBlockID()).to.eql(data.startId);
    expect(diagram.getVariables()).to.eql(data.variables);
    expect(diagram.getRaw()).to.eql(data.lines);
    expect(diagram.getCommands()).to.eql(data.commands);
    expect(get.args).to.eql([[`/diagrams/${diagramId}`]]);
  });

  describe('getDiagram', () => {
    it('has to fetch diagram', async () => {
      const context = { callEvent: sinon.stub() };
      const diagramManager = new DiagramManager(context as any, null as any);

      const diagram = { foo: 'bar' };
      diagramManager.fetchDiagram = sinon.stub().resolves(diagram);

      const diagramID = 'diagram-id';
      expect(await diagramManager.getDiagram(diagramID)).to.eql(diagram);
      expect(_.get(diagramManager, 'cachedDiagram')).to.eql(diagram);
      expect(context.callEvent.callCount).to.eql(2);
      expect(context.callEvent.args[0][0]).to.eql(EventType.diagramWillFetch);
      expect(Object.keys(context.callEvent.args[0][1])).to.eql(['diagramID', 'override']);
      expect(context.callEvent.args[0][1].diagramID).to.eql(diagramID);
      expect(typeof context.callEvent.args[0][1].override).to.eql('function');
      expect(context.callEvent.args[1]).to.eql([EventType.diagramDidFetch, { diagramID, diagram }]);
    });

    it('diagram gets injected', async () => {
      const context = { callEvent: sinon.stub() };
      const injectedDiagram = { foo: 'bar' };
      const fakeFn = (_event: string, utils: { diagramID: string; override: Function }) => {
        utils.override(injectedDiagram);
      };

      context.callEvent.onFirstCall().callsFake(fakeFn);

      const diagramManager = new DiagramManager(context as any, null as any);
      expect(await diagramManager.getDiagram('diagram-id')).to.eql(injectedDiagram);
    });

    it('diagram is in cache', async () => {
      const context = { callEvent: sinon.stub() };
      const diagramManager = new DiagramManager(context as any, null as any);

      const diagramID = 'diagram-id';
      _.set(diagramManager, 'cachedDiagram', new Diagram({ id: diagramID } as any));

      const diagram = await diagramManager.getDiagram(diagramID);
      expect(diagram.getID()).to.eql(diagramID);
    });
  });
});
