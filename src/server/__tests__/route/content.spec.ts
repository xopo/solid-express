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
        it('can get user roles', async() => {
            const result = await request.get('/api/content/roles')
                .set('cookie', loginResponse.header['set-cookie']);
            expect(result.statusCode).toBe(200)
            expect(result.body).toStrictEqual({
                "data":  [
                    "admin",
                    "user",
                ],
                "success": true,
            })
        })

        describe('given the user post add media from an incorrect url', () => {
            it('returns 400', async () => {
                const result = await request.post('/api/content/add')
                    .send({url: 'bibi'})
                    .set('cookie', loginResponse.header['set-cookie']);
                expect(result.statusCode).toBe(400)
            })
        })

        describe.only('given the user post a correct url', () => {
            it('will add the media to db', async () => {
                const result = await request.post('/api/content/add')
                    // https://youtu.be/30vF9gTTwvU?feature=shared
                    //https://rumble.com/v4f32nl-ex-who-consultant-who-leadership-is-compromised-and-seizing-power-w-dr.-tes.html
                    .send({url: 'https://www.youtube.com/watch?v=egkG6ynXs-0'})
                    .set('cookie', loginResponse.header['set-cookie']);
                expect(result.statusCode).toBe(200)
            })
            it('will return media data if already in db', async () => {
                const result = 4;
            })
        })
    })
})