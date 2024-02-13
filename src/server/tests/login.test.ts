import request from 'supertest';
import createServer from '../server.js';
import bcrypt from 'bcrypt';


vi.mock('../db.js', () => ({
    dbGetUser: (name: string) => {
        console.log('mock implementation for name', name)
        return {id: 3, name, pass: '$2b$10$T316WdqswBC8bdlJU/kJluWEatSeRUdrrdCp534DWQcxYR6g0jL2e'}
    }
}))

const app = createServer();

describe('test api', () => {
    describe('given a user has correct user name and pass', () => {
        it('returns a 200', async () => {
            vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true))
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel3', pass: btoa('34323')});
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
            expect(statusCode).toBe(400);
            expect(body).toEqual({
                "error": true,
                "message": "nume are min 4 caractere",
            });

        })
    })

    describe.skip('given a user has a short user pass', () => {
        it('returns a 401 with an error', async () => {
            const {body, statusCode} = await request(app).post('/api/login').send({name: 'daniel', pass: btoa('34')});
            expect(statusCode).toBe(400);
            expect(body).toEqual({
                "error": true,
                "message": "parola are min 4 caractere",
            });

        })
    })
});