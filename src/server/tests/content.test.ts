import request from 'supertest';
import createServer from '../server.js';
import bcrypt from 'bcrypt';
import * as DB from '../db/db';
import { QueryBuilder } from 'knex';
import { MockInstance } from 'vitest';

vi.mock('../db/db');
const app = createServer();
//@ts-ignore
let dbAddGuest: MockInstance<[name: string, user_id: number], Promise<number[]>>;

describe('Content validation', () => {
    let loginResult: QueryBuilder & { header: {'set-cookie': string}};
    beforeEach( async () => {
        //@ts-ignore
        vi.spyOn(DB, 'dbCheckUserExists').mockImplementationOnce((name: string) => ({
                id: 3,
                name
        }));
        
        //@ts-ignore
        vi.spyOn(DB, 'dbAddUser').mockImplementationOnce(({name, pass}) => {
            console.log({name, pass});
            return {changes: 1, lastInsertRowid: 4}
        })
        // dbAddGuest = vi.spyOn(DB, 'dbAddNewGuest').mockImplementation((name, user_id) => {
        //     console.log('add new guest mock', name, user_id)
        //     return Promise.resolve([3])
        // }); 
        // vi.spyOn(DB, 'dbGetGuest').mockImplementationOnce(() => { 
        //     console.log('-- mock first level dbGetGuest ')
        //     return Promise.resolve({id: 3, name: 'bica', user_id: 1})
        // })
        
        dbAddGuest = vi.spyOn(DB, 'dbAddNewGuest').mockImplementationOnce(() => Promise.resolve([3]));
        //@ts-ignore
        // vi.spyOn(DB, 'dbGetReservation').mockImplementationOnce(date => ({date, tables: '["bibi"]', users: '["bobo"]'}))

        //@ts-ignore
        vi.spyOn(DB, 'dbGetUser').mockImplementationOnce(() => ({id: 1, name: 'daniel', pass:'3234', token: '234'}))
        vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => (true));

        //@ts-ignore
        loginResult = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('23423')});
    })

    describe('Given the user is not logged in', () => {
        it('should return 401 when trying to get content', async () => {
            const {body, statusCode} = await request(app).post('/api/content').send({date: '21 Aug 2021'});
            expect(statusCode).toBe(401);
            expect(body).toBe('not authorized')
        })
    })
    describe('Given the user is logged in but use bad date', () => {
        it('should return 401 with an error message about date', async () => {
            const {body, statusCode} = await request(app).post('/api/content')
                .set('cookie', loginResult.header['set-cookie'])
                .send({date: btoa('asdf')}); 
            expect(statusCode).toBe(401); 
            expect(body).toStrictEqual( { 
                "error": true,
                "message": "Data invalida",
            })
        })
    })

    describe.only('Given a user want to add a guest', () => {

        it.only('should add the name to db if not exist', async () => {
            const {body, statusCode} = await request(app).post('/api/content/toggleGuest') 
                .set('cookie', loginResult.header['set-cookie'])
                .send({date: '2024-02-01T12:13:11.000Z', guest: 'blablacar'});
            expect(statusCode).toBe(200); 
            expect(body).toStrictEqual( { 
                "error": true,
                "message": "Data invalida", 
            })
        })
    })

    describe.skip('Given the user is logged and use correct formate date in request', () => {
        it('should return 200 with a list of tables and users (at min empty [])', async () => {
            const {body, statusCode} = await request(app).post('/api/content')
                .set('cookie', loginResult.header['set-cookie'])
                .send({date:  btoa('2024-02-01T12:13:11.000Z')});
            expect(statusCode).toBe(200);
            expect(body).toStrictEqual( {
                data: {tables: ['bibi'], users : ['bobo']},
                success: true,
            })
        })
    })
    
})