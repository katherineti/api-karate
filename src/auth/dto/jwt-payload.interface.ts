export interface IJwtPayload {
  sub: number;
  email: string;
  name: string;
  lastname?: string;
  roles: any[];
  school_id?: number;
}