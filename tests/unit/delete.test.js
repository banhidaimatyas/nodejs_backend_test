require('dotenv').config();

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

const { ManySide } = require('../../models');
const routes = require('../../routes');


const TEST_DB_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/test_db';

const app = express();
app.use(express.json());
app.use('/api', routes);

const ID_A = 900001;
const ID_B = 900002;
const NONEXISTENT_ID = 999999;

const phoneA = { _id: ID_A, nev: 'Test phone A', ar: 100000, szin: 'blue', foreignId: 1 };
const phoneB = { _id: ID_B, nev: 'Test phone B', ar: 200000, szin: 'red', foreignId: 1 };

beforeAll(async () => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(TEST_DB_URL);
    await ManySide.init();
});

beforeEach(async () => {
    await ManySide.deleteMany({ _id: { $in: [ID_A, ID_B] } });
    await ManySide.create([phoneA, phoneB]);
});

afterAll(async () => {
    await ManySide.deleteMany({ _id: { $in: [ID_A, ID_B] } });
    await mongoose.connection.close();
});

describe('DELETE /api/manyside/:id (with a real database)', () => {
    test('1. the DELETE /manyside/:id route exists in the router', () => {
        const layer = routes.stack.find((l) => l.route && l.route.path === '/manyside/:id' && l.route.methods.delete);
        expect(layer).toBeDefined();
    });

    test('2. findByIdAndDelete is called once', async () => {
        const spy = jest.spyOn(ManySide, 'findByIdAndDelete');
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    test('3. findByIdAndDelete is called with the ID from the URL', async () => {
        const spy = jest.spyOn(ManySide, 'findByIdAndDelete');
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(spy).toHaveBeenCalledWith(String(ID_A));
        spy.mockRestore();
    });
    
    test('4. a successful deletion returns status code 200', async () => {
        const res = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(res.status).toBe(200);
    });
    
    test('5. the response contains the deleted item name', async () => {
        const res = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(res.text).toBe('A Test phone A nevű elem törölve lett.');
    });
    
    
    test('6. the item is no longer in the database after deletion', async () => {
        expect(await ManySide.findById(ID_A)).not.toBeNull(); 
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(await ManySide.findById(ID_A)).toBeNull(); 
    });
    
    
    test('7. only the specified item is deleted; the others remain', async () => {
        await request(app).delete(`/api/manyside/${ID_A}`);
        const remainingItem = await ManySide.findById(ID_B);
        expect(remainingItem).not.toBeNull();
        expect(remainingItem.nev).toBe('Test phone B');
    });
    
    test('8. a nonexistent ID currently returns 500 (TypeError: null.nev)', async () => {
        const res = await request(app).delete(`/api/manyside/${NONEXISTENT_ID}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/null/);
    });
    
    test('9. deleting the same item a second time returns an error', async () => {
        const firstResponse = await request(app).delete(`/api/manyside/${ID_A}`);
        const secondResponse = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(firstResponse.status).toBe(200);
        expect(secondResponse.status).toBe(500);
    });


    test('10. a non-numeric ID returns 500 with a CastError message', async () => {
        const res = await request(app).delete('/api/manyside/abc');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message');
    });


    test.skip('11. a nonexistent ID returns 404 (after the fix)', async () => {
        const res = await request(app).delete(`/api/manyside/${NONEXISTENT_ID}`);
        expect(res.status).toBe(404);
    });
});