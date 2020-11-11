import { Command, Node, Program, Version, VersionPlatformData } from '@voiceflow/api-sdk';

export type Display = { document?: string };

export interface DataAPI<
  P extends Program<Node, Command> = Program<Node, Command>,
  V extends Version<VersionPlatformData> = Version<VersionPlatformData>
> {
  init(): Promise<void>;

  fetchDisplayById(displayId: number): Promise<null | Display>;

  getProgram(programID: string): Promise<P>;

  getTestProgram(programID: string): Promise<P>;

  getVersion(versionID: string): Promise<V>;
}
