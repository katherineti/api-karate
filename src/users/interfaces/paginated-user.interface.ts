export interface IRole {
    id: number;
    name: string;
}
export interface IPaginatedUser {
    id: number;
    name: string;
    lastname: string;
    email: string;
    roles: IRole[]; 
}

/**
 * src/users/interfaces/paginated-response.interface.ts
 * Define la estructura completa de la respuesta del endpoint GET /users.
 */
export interface IPaginatedResponse {
    data: IPaginatedUser[];
    total: number;
    page: number;
    limit: number;
}