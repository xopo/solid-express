import request from 'supertest';
import createServer from '../server.js';
import bcrypt from 'bcrypt';
import * as DB from '../db.js';

const app = createServer();

describe('Login', () => {
    describe('given a user has correct user name and pass', () => {
        it('returns a 200', async () => {
            vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true))
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('34d323')});
            expect(statusCode).toBe(200);
            expect(body).toEqual({ 
                "message": "all good",
                "success": true,
            });
        })
    }) 
    describe('given a user types wrong user or pass', () => {
        it('returns a 401 with an error', async () => {
            vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => (false))
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel3', pass: btoa('343d2d')});
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "combinatia nume parola gresite", 
            });

        })
    })
    describe('given a user has a short user name', () => {
        it('returns a 401 with an error', async () => {
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'da', pass: btoa('3432')});
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "nume are min 4 caractere",
            });

        })
    })

    describe('given a user has a short user pass', () => {
        it('returns a 401 with an error', async () => { 
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('34     ')});
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "parola are min 4 caractere",
            });

        })
    })

    describe('given a user has a long user pass', () => {
        it('returns a 401 with an error', async () => { 
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('34     asdfasfasfasfd')});
            expect(statusCode).toBe(401);
            expect(body).toEqual({
                "error": true,
                "message": "parola are max 10 caractere",
            });

        })
    })
    describe('With logged in user', () => {
        let result: request.Response;
        beforeEach(async () => {
            vi.spyOn(DB, 'dbCheckUserExists').mockImplementationOnce((name: string) => ({
                id: 3,
                name
            }));
            vi.spyOn(DB, 'dbAddUser').mockImplementationOnce(({name, pass}) => {
                console.log({name, pass});
                return {changes: 1, lastInsertRowid: 4}
            })
            vi.spyOn(DB, 'dbGetUser').mockImplementationOnce(() => ({id: 1, name: 'daniel', pass:'3234', token: '234'}))
            vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => (true));
            
            result = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('23423')});
        });

        describe('GetSelf', () => {
            describe('Given the user is not logged in,', () => {
                it('should return a 401', async () => {
                    const {statusCode} = await request(app).get('/api/login/getSelf').send({name: 'daniel', id: 3});
                    expect(statusCode).toBe(401);
                })
            })

            describe('Given the user is logging in', () => {
                it('should return a 200 with correct data1', async () => {
                    const {statusCode, body} = await request(app).get('/api/login/getSelf')
                        .set('cookie', result.header['set-cookie']);
                    expect(statusCode).toBe(200); 
                    expect(body).toStrictEqual({id: 1, name: 'daniel', safeName: '1-daniel'})
                })
            })
        })
        
        describe('Check user', () => {
            describe('Given that a name is too small', () => {
                it('returns a 401 with an error message', async() => {
                    const {statusCode, body} = await request(app).get('/api/login/checkUser').query({name:"da"})
                        .set('cookie', result.header['set-cookie']);
                    expect(statusCode).toBe(401);
                    expect(body).toStrictEqual({error: true, message:'nume are min 4 caractere'})
                })
            })
            describe('Given that an existing name is checked', () => {
                it('returns a 400 with an error message', async() => {
                    const {statusCode, body} = await request(app).get('/api/login/checkUser').query({name:"daniel"})
                        .set('cookie', result.header['set-cookie']);
                    expect(statusCode).toBe(400);
                    expect(body).toStrictEqual({ error: 'exista un utilizator cu acest nume' })
                })
            })
            describe('Given that a name is not register', () => {
                it('returns a 200 with success message', async() => {
                    vi.spyOn(DB, 'dbCheckUserExists').mockImplementationOnce((name: string) => undefined);
                    const {statusCode, body} = await request(app).get('/api/login/checkUser').query({name:"daniel"})
                        .set('cookie', result.header['set-cookie']);
                    expect(statusCode).toBe(200);
                    expect(body).toStrictEqual({ "success": true })
                })
            })
        })
    })
});