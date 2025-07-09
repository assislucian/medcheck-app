import { Role } from "./role.enum";

export interface ProcedureGuide {
  guia: string;
  date: Date;
  code: string;
  description: string;
  role: Role;
  crm: string;
  quantity: number;
  presentedValue: number;
  approvedValue: number;
}
