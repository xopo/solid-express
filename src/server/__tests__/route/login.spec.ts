import request from '../test_server';
import bcrypt from 'bcrypt';
import * as dbQuery from '../../db/queries';


describe('login route', () => {
    vi.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true))
    describe('given a user want to login', () => {
        it('should return 401 when the user/pass are missing ', async () => {
            expect(true).toBeTruthy();
            const result = await request.post('/api/login')
            expect(result.statusCode).toBe(401)
        })
        it('should return 401 when the user is empty string ', async () => {
            const loginData = {name: '     ', pass: 'baba'}
            expect(true).toBeTruthy();
            const result = await request.post('/api/login').send(loginData)
            expect(result.statusCode).toBe(401)
        })
        it('should return 401 when the password is empty string ', async () => {
            const loginData = {name: 'asfasdf', pass: '     '}
            expect(true).toBeTruthy();
            const result = await request.post('/api/login').send(loginData)
            expect(result.statusCode).toBe(401)
        })
        it('should return 200 when user and pass are set', async () => {
            //@ts-ignore
            vi.spyOn(dbQuery, 'dbGetUserByName').mockImplementationOnce((name: string)=> ({id:4, name: 'asfaf', pass: 'aasfasf'}));
            const loginData = {name: 'daniel', pass: btoa('asdfasf')}
            expect(true).toBeTruthy();
            const result = await request.post('/api/login').send(loginData)
            expect(result.statusCode).toBe(200) 
        })
    })
})