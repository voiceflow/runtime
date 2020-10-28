import { Program, Version } from '@voiceflow/api-sdk';
import { AxiosInstance, AxiosStatic } from 'axios';

import { DataAPI, Display } from './types';

class ServerDataAPI<P extends Program<any, any>, V extends Version<any>> implements DataAPI<P, V> {
  private client: AxiosInstance;

  constructor({ dataSecret, dataEndpoint }: { dataSecret: string; dataEndpoint: string }, { axios }: { axios: AxiosStatic }) {
    this.client = axios.create({
      baseURL: dataEndpoint,
      headers: { authorization: `Bearer ${dataSecret}` },
    });
  }

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
