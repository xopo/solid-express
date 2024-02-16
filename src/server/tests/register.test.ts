
import request from 'supertest';
import createServer from '../server';
import * as DB from '../db/db';
import { MockInstance } from 'vitest';
import { QueryBuilder } from 'knex';

const app = createServer();
const registerUrl = '/api/login/register';

let addUserMock: MockInstance<[user: {
    name: string;
    pass: string;
}], QueryBuilder> 

describe('Register', () => {
    beforeAll(() => { 
        addUserMock = vi.spyOn(DB, 'dbAddUser');
    })
    describe('Given a short username', () => {
        it('should return a validation error', async () => {
            const {body, statusCode} = await request(app).post(registerUrl).send({name: 'da', pass: btoa('34323')})
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "nume are min 4 caractere",
            });
            expect(addUserMock).not.toBeCalled();
        })
    })
    describe('Given a short password', () => {
        it('should return a validation error', async () => {
            const {body, statusCode} = await request(app).post(registerUrl).send({name: 'daniel13', pass: btoa('323')})
            expect(addUserMock).not.toBeCalled();
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "parola are min 4 caractere",
            });
        })
    })

    describe('Given valid user and pass', () => {
        it('should return a 200 with a confirmation message', async () => {
            //@ts-ignore
            const addUserMock = vi.spyOn(DB, 'dbAddUser').mockImplementationOnce(() => ({changes: 1, lastInsertRowid: 4}));
            const user = {name: 'daniel3', pass: btoa('34323')};
            const {body, statusCode} = await request(app).post(registerUrl).send(user)
            expect(addUserMock).toBeCalledTimes(1);
            expect(addUserMock).toBeCalledWith({
                name: user.name,
                pass: expect.any(String),
            })
            expect(statusCode).toBe(200)
            expect(body).toEqual({
            "message": {
                "changes": 1,
                "lastInsertRowid": 4,
            },
            "success": true,
            })
        }) 
    })
})