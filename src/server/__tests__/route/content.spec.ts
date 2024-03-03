import request from '../test_server';
import * as dbQuery from '../../db/queries';
import bcrypt from 'bcrypt';
import {Response } from 'supertest';


describe('/api/content', () => {
    describe('given a user is not logged in', () => {
        it ('will return 401 - not authorized', async () => {
            const result = await request.get('/api/content');
            expect(result.statusCode).toBe(401) 
            expect(result.text).toBe('{"error":"not authorized"}')
        })
    })
    describe('given a user is logged in', () => {
        let loginResponse: Response;
        beforeAll(async () => {
            vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true))
            vi.spyOn(dbQuery, 'dbGetUserByName').mockImplementationOnce((name: string) => Promise.resolve({name: 'daniel', id: 1, pass: ''}));
            loginResponse = await request.post('/api/login').send({name: 'daniel', pass: btoa('23423')});
        })
        it ('will return 200', async() => {
            const result = await request.get('/api/content').set('cookie', loginResponse.header['set-cookie']);;
            expect(result.statusCode).toBe(200);
        })
        it.only('can get user roles', async() => {
            const result = await request.get('/api/content/roles').set('cookie', loginResponse.header['set-cookie']);
            expect(result.statusCode).toBe(200)
            expect(result.body).toStrictEqual({
                "data":  [
                    "admin",
                    "user",
                ],
                "success": true,
            })
        })
    })
})