import { connection } from "./connection";

export type User = {
    id: number;
    name: string;
    pass: string;
}

const getUsersTable = () => connection<User>('users');
const getUserRoleTable = () => connection<Array<'admin'|'user'|'guest'>>('user_role')

export const dbGetUserByName = async (name: string) =>
    getUsersTable().where({name}).then(response => response[0])

export const dbGetUserRoles = async (user_id: number) =>
    getUserRoleTable()
        .leftJoin('roles','user_role.role_id', 'roles.id')
        .where<Array<{name: 'admin'|'user'}>>('user_role.user_id', user_id)
        .then(result => result.map(r => r.name))