import { BaseDto, FileModel, Member } from "./GlobalModel";

export interface WorkspaceModel extends BaseDto {
  id: number;
  name: string;
  description: string;
  owner: Member;
  files?: FileModel[];
  members?: Member[];
  classifyItems?: string[];
}
