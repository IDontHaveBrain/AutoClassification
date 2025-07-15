import { type BaseDto, type FileModel, type Member } from './GlobalModel';

export interface WorkspaceModel extends BaseDto {
  id: number;
  name: string;
  description: string;
  owner: Member;
  files?: FileModel[];
  members?: Member[];
  classes?: string[];
}
