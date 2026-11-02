jest.mock('../../models', () => ({
    OneSide: {},
    ManySide: {
        create: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
}));

const express = require('express');
const request = require('supertest');
const { ManySide } = require('../../models');
const router = require('../../routes');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('PATCH /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should return HTTP 200 when the update resolves with an item.', async () => {
        ManySide.findByIdAndUpdate.mockResolvedValue({
            _id: 21,
            nev: 'Frissített telefon'
        });

        const response = await request(app)
            .patch('/api/manyside/21')
            .send({ nev: 'Frissített telefon' });

        expect(response.status).toBe(200);
        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    test('The request should pass the URL ID, submitted body, and update options to findByIdAndUpdate.', async () => {
        const body = { nev: 'Új név', ar: 250 };
        ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 22, ...body });

        await request(app).patch('/api/manyside/22').send(body);

        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith('22', body, {
            returnDocument: 'after',
            runValidators: true
        });
    });

    test('The request should return the resolved updated item as JSON.', async () => {
        const updatedItem = { _id: 23, nev: 'Új telefon', ar: 300 };
        ManySide.findByIdAndUpdate.mockResolvedValue(updatedItem);

        const response = await request(app)
            .patch('/api/manyside/23')
            .send({ nev: 'Új telefon', ar: 300 });

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual(updatedItem);
    });

    test('The request should return HTTP 404 with a not-found message when the update resolves to null.', async () => {
        ManySide.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/api/manyside/24')
            .send({ nev: 'Telefon' });

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({
            message: '24 azonosítóval nem létezik elem!'
        });
    });

    test('The request should return HTTP 500 with the error message when the update rejects.', async () => {
        ManySide.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/api/manyside/25')
            .send({ nev: 'Telefon' });

        expect(response.status).toBe(500);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({ message: 'Database error' });
    });

    test('The request should pass supplied update values unchanged to findByIdAndUpdate.', async () => {
        const body = { ar: 0, szin: 'kék' };
        ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 26, ...body });

        await request(app).patch('/api/manyside/26').send(body);

        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith(
            '26',
            { ar: 0, szin: 'kék' },
            { returnDocument: 'after', runValidators: true }
        );
    });
});