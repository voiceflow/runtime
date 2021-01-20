import { BasePlatformData, Client, Program, Project, Version } from '@voiceflow/api-sdk';

import { DataAPI } from './types';

class CreatorDataAPI<P extends Program<any, any>, V extends Version<any>, PJ extends Project<any, any> = Project<BasePlatformData, BasePlatformData>>
  implements DataAPI<P, V, PJ> {
  protected client: Client;

  private prototype: boolean;

  constructor({
    endpoint,
    authorization,
    clientKey = '',
    prototype = true,
  }: {
    endpoint: string;
    authorization: string;
    clientKey?: string;
    prototype?: boolean;
  }) {
    this.client = new Client({ apiEndpoint: endpoint, authorization, clientKey });

    this.prototype = prototype;
  }

  public init = async () => {
    // no-op
  };

  public fetchDisplayById = async (): Promise<null> => {
    return null;
  };

  public getProgram = async (programID: string) => {
    if (this.prototype) {
      return this.client.prototypeProgram.get<P>(programID, []);
    }
    return this.client.program.get<P>(programID, []);
  };

  public getVersion = async (versionID: string) => {
    return this.client.version.get<V>(versionID, []);
  };

  public getProject = async (projectID: string) => {
    return this.client.project.get<PJ>(projectID, []);
  };
}

export default CreatorDataAPI;
