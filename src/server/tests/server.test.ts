import { describe, expect, test, vi } from 'vitest';
import { dbGetUser } from '../db.js';
import request from 'supertest';
import app from '../main';
import bcrypt from 'bcrypt';



vi.mock('../db.js', () => ({
    dbGetUser: (name: string) => {
        console.log('mock implementation for name', name)
        return {id: 3, name, pass: 234234}
    }
}))

vi.mock("bcrypt", async (importOriginal) => {
  const actual = await importOriginal() as {}
  return {
    ...actual,
     compare: (_a: string, _b: string) => {
        console.log('bcrypt compare', {_a, _b})
        return {isValid: true}
     }
  }
})

describe('test api', () => {
    test('correctly login user', async () => {
        const mock = vi.fn().mockImplementation(dbGetUser)
        mock.mockImplementation(() => {
            console.log('mock implementation');
            return {name: 'Daniel', pass: 200};
        })
        const res = await request(app).post('/api/login').send({name: 'daniel3', pass: '3432'})
        expect(mock).toBeCalledTimes(1);
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(mock()).toEqual(3);
        expect(res.body).toBe(3)
    })
});