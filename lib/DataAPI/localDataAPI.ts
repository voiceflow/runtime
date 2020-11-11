import { Program, Version } from '@voiceflow/api-sdk';
import * as FS from 'fs';
import * as Path from 'path';

import { DataAPI } from './types';

class LocalDataAPI<P extends Program<any, any>, V extends Version<any>> implements DataAPI<P, V> {
  private version: V;

  private programs: Record<string, P>;

  constructor({ projectSource }: { projectSource: string }, { fs, path }: { fs: typeof FS; path: typeof Path }) {
    if (!projectSource) throw new Error('project source undefined');

    const content = JSON.parse(fs.readFileSync(path.join('projects', projectSource), 'utf8'));

    this.version = content.version;
    this.programs = content.programs;
  }

  public init = async () => {
    // no-op
  };

  public getVersion = async () => this.version;

  public getProgram = async (programID: string) => this.programs[programID];

  public getTestProgram = async () => {
    throw new Error('local implementation does not support tests');
  };

  public fetchDisplayById = async () => null;
}

export default LocalDataAPI;
