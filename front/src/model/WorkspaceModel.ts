import { BaseDto, Member } from "./GlobalModel";

export interface Workspace extends BaseDto {
  id: number;
  name: string;
  description: string;
  owner: Member;
  files?: File[];
  members?: Member[];
}
