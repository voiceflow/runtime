import { AxiosInstance } from 'axios';

import Context from '@/lib/Context';
import Diagram from '@/lib/Diagram';
import { Event } from '@/lib/Lifecycle';

/**
 * use this class for CPU caching strategies when fetching diagrams/memory
 * https://en.wikipedia.org/wiki/Cache_replacement_policies
 */
class DiagramManager {
  private cachedDiagram: Diagram | null = null;

  constructor(private context: Context, private fetch: AxiosInstance) {}

  public async fetchDiagram(diagramID: string): Promise<Diagram> {
    const { data }: { data: Record<string, any> } = await this.fetch.get(`/diagrams/${diagramID}`);

    return new Diagram({
      id: diagramID,
      startBlockID: data.startId,
      variables: data.variables,
      blocks: data.lines,
      commands: data.commands,
    });
  }

  public async getDiagram(diagramID: string): Promise<Diagram> {
    let diagram: Diagram | undefined;

    // Event.diagramWillFetch can optionally override the diagram
    await this.context.callEvent(Event.diagramWillFetch, {
      diagramID,
      override: (_diagram: Diagram | undefined) => {
        diagram = _diagram;
      },
    });

    // this manager currently just caches the current diagram, incase it is repeatedly called
    if (!diagram && diagramID === this.cachedDiagram?.getID()) {
      diagram = this.cachedDiagram;
    }

    if (!diagram) {
      diagram = await this.fetchDiagram(diagramID);
    }

    this.context.callEvent(Event.diagramDidFetch, { diagramID, diagram });

    this.cachedDiagram = diagram;
    return diagram;
  }
}

export default DiagramManager;
