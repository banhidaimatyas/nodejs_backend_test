require('dotenv').config();

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

const { ManySide } = require('../../models');
const routes = require('../../routes');


const TEST_DB_URL = process.env.DATABASE_URL;

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

describe('DELETE /api/manyside/:id', () => {
    test('The router should register a DELETE route for /manyside/:id.', () => {
        const layer = routes.stack.find((l) => l.route && l.route.path === '/manyside/:id' && l.route.methods.delete);
        expect(layer).toBeDefined();
    });

    test('The request should call findByIdAndDelete once for the item.', async () => {
        const spy = jest.spyOn(ManySide, 'findByIdAndDelete');
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    test('The request should pass the URL ID to findByIdAndDelete.', async () => {
        const spy = jest.spyOn(ManySide, 'findByIdAndDelete');
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(spy).toHaveBeenCalledWith(String(ID_A));
        spy.mockRestore();
    });
    
    test('The request should return HTTP 200 when the item is deleted.', async () => {
        const res = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(res.status).toBe(200);
    });
    
    test('The request should return the deleted item name in its response.', async () => {
        const res = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(res.text).toBe('A Test phone A nevű elem törölve lett.');
    });
    
    
    test('The awaited database lookup should return null after the item is deleted.', async () => {
        expect(await ManySide.findById(ID_A)).not.toBeNull(); 
        await request(app).delete(`/api/manyside/${ID_A}`);
        expect(await ManySide.findById(ID_A)).toBeNull(); 
    });
    
    
    test('The awaited database lookup should find the other item after deletion.', async () => {
        await request(app).delete(`/api/manyside/${ID_A}`);
        const remainingItem = await ManySide.findById(ID_B);
        expect(remainingItem).not.toBeNull();
        expect(remainingItem.nev).toBe('Test phone B');
    });
    
    test('The request should return HTTP 404 with a not-found message for a nonexistent ID.', async () => {
        const res = await request(app).delete(`/api/manyside/${NONEXISTENT_ID}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Nincs ilyen azonosítóval rendelkező elem.');
    });
    
    test('The requests should return HTTP 200 then HTTP 404 when deleting the same item twice.', async () => {
        const firstResponse = await request(app).delete(`/api/manyside/${ID_A}`);
        const secondResponse = await request(app).delete(`/api/manyside/${ID_A}`);
        expect(firstResponse.status).toBe(200);
        expect(secondResponse.status).toBe(404);
    });


    test('The request should return HTTP 500 with an error message for a non-numeric ID.', async () => {
        const res = await request(app).delete('/api/manyside/abc');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message');
    });
});