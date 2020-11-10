import { Program, Version } from '@voiceflow/api-sdk';
import { AxiosInstance, AxiosStatic } from 'axios';

import { DataAPI, Display } from './types';

class ServerDataAPI<P extends Program<any, any>, V extends Version<any>> implements DataAPI<P, V> {
  private client!: AxiosInstance;

  private axios: AxiosStatic;

  private dataEndpoint: string;

  private adminToken: string;

  constructor({ adminToken, dataEndpoint }: { adminToken: string; dataEndpoint: string }, { axios }: { axios: AxiosStatic }) {
    this.axios = axios;
    this.dataEndpoint = dataEndpoint;
    this.adminToken = adminToken;
  }

  public init = async () => {
    const {
      data: { token: VF_DATA_SECRET },
    } = await this.axios.post(
      `${this.dataEndpoint}/generate-platform-token`,
      {
        platform: 'alexa',
        ttl_min: 525600,
      },
      { headers: { admintoken: this.adminToken } }
    );

    this.client = this.axios.create({
      baseURL: this.dataEndpoint,
      headers: { authorization: `Bearer ${VF_DATA_SECRET}` },
    });
  };

  public fetchDisplayById = async (displayId: number): Promise<null | Display> => {
    const { data }: { data: undefined | null | Display } = await this.client.get(`/metadata/displays/${displayId}`);

    return data ?? null;
  };

  public getProgram = async (programID: string) => {
    const { data } = await this.client.get<P>(`/diagrams/${programID}`);

    return data;
  };

  public getTestProgram = async (programID: string) => {
    const { data } = await this.client.get<P>(`/test/diagrams/${programID}`);

    return data;
  };

  public getVersion = async (versionID: string) => {
    const { data } = await this.client.get<V>(`/version/${versionID}`);

    return data;
  };
}

export default ServerDataAPI;
