import request from 'supertest';
import createServer from '../server';

const app = createServer();
const registerUrl = '/api/login/register';

describe.only('Register', () => {
    describe('Given a short username', () => {
        it('should return a validation error', async () => {
            const {body, statusCode} = await request(app).post(registerUrl).send({name: 'da', pass: btoa('34323')})
            expect(statusCode).toBe(301) 
            expect(body).toEqual('4') 
        })
    })
    describe('Given a short password', () => {
        it('should return a validation error', async () => {
            const {body, statusCode} = await request(app).post(registerUrl).send({name: 'daniel3', pass: btoa('34323')})
            expect(statusCode).toBe(301)
            expect(body).toEqual('4') 
        })
    })

    describe('Given valid user and pass', () => {
        it('should return a 200 with a confirmation message', async () => {
            const {body, statusCode} = await request(app).post(registerUrl).send({name: 'daniel3', pass: btoa('34323')})
            expect(statusCode).toBe(301)
            expect(body).toEqual('4')
        }) 
    })
})