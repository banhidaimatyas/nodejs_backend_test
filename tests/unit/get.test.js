jest.mock('../../models', () => ({
    OneSide: {},
    ManySide: {
        find: jest.fn(),
        findById: jest.fn()
    }
}));

const express = require('express');
const request = require('supertest');
const { ManySide } = require('../../models');
const router = require('../../routes');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('GET /api/manyside', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The find method should be available on the model.', () => {
        expect(ManySide.find).toBeDefined();
        expect(typeof ManySide.find).toBe('function');
    });

    test('The request should call find once and populate its results.', async () => {
        const populateMock = jest.fn().mockResolvedValue([]);

        ManySide.find.mockReturnValue({
            populate: populateMock
        });

        await request(app).get('/api/manyside');

        expect(ManySide.find).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledTimes(1);
    });

    test('The query should populate foreignId while excluding _id.', async () => {
        const populateMock = jest.fn().mockResolvedValue([]);

        ManySide.find.mockReturnValue({
            populate: populateMock
        });

        await request(app).get('/api/manyside');

        expect(populateMock).toHaveBeenCalledWith(
            'foreignId',
            '-_id'
        );
    });

    test('The request should return HTTP 200 when the query resolves.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });

        const response = await request(app).get('/api/manyside');

        expect(response.status).toBe(200);
    });

    test('The request should return all queried phones as JSON.', async () => {
        const phones = [
            { _id: 1, nev: 'Samsung', ar: 100000 },
            { _id: 2, nev: 'iPhone', ar: 200000 }
        ];

        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(phones)
        });

        const response = await request(app).get('/api/manyside');

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual(phones);
    });

    test('The request should return HTTP 500 with the error message when the query rejects.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockRejectedValue(
                new Error('Database error')
            )
        });

        const response = await request(app).get('/api/manyside');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Database error'
        });
    });
});

describe('GET /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The findById method should be available on the model.', () => {
        expect(ManySide.findById).toBeDefined();
        expect(typeof ManySide.findById).toBe('function');
    });

    test('The request should call findById once and populate its result.', async () => {
        const populateMock = jest.fn().mockResolvedValue({
            _id: 1,
            nev: 'Samsung',
            ar: 100000
        });

        ManySide.findById.mockReturnValue({
            populate: populateMock
        });

        await request(app).get('/api/manyside/1');

        expect(ManySide.findById).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledTimes(1);
    });

    test('The request should pass the URL ID to findById.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                _id: 5,
                nev: 'iPhone',
                ar: 200000
            })
        });

        await request(app).get('/api/manyside/5');

        expect(ManySide.findById).toHaveBeenCalledWith('5');
    });

    test('The request should return HTTP 200 when the phone is found.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                _id: 1,
                nev: 'Samsung',
                ar: 100000
            })
        });

        const response = await request(app).get('/api/manyside/1');

        expect(response.status).toBe(200);
    });

    test('The request should return the found phone as JSON.', async () => {
        const phone = {
            _id: 1,
            nev: 'Samsung',
            ar: 100000,
            szin: 'fekete'
        };

        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(phone)
        });

        const response = await request(app).get('/api/manyside/1');

        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual(phone);
    });

    test('The request should return HTTP 404 with a not-found message when no phone is found.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });

        const response = await request(app).get('/api/manyside/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
    });
});