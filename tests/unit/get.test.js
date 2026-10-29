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

    test('GET01 - The find function exists.', () => {
        expect(ManySide.find).toBeDefined();
        expect(typeof ManySide.find).toBe('function');
    });

    test('GET02 - Calls find and populate.', async () => {
        const populateMock = jest.fn().mockResolvedValue([]);

        ManySide.find.mockReturnValue({
            populate: populateMock
        });

        await request(app).get('/api/manyside');

        expect(ManySide.find).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledTimes(1);
    });

    test('GET03 - Calls populate with the correct arguments.', async () => {
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

    test('GET04 - Returns status 200.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });

        const response = await request(app).get('/api/manyside');

        expect(response.status).toBe(200);
    });

    test('GET05 - Returns all phones as JSON.', async () => {
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

    test('GET06 - Returns status 500 when the query fails.', async () => {
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

    test('GET07 - The findById function exists.', () => {
        expect(ManySide.findById).toBeDefined();
        expect(typeof ManySide.findById).toBe('function');
    });

    test('GET08 - Calls findById and populate.', async () => {
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

    test('GET09 - Calls findById with the requested ID.', async () => {
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

    test('GET10 - Returns status 200 for an existing phone.', async () => {
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

    test('GET11 - Returns the requested phone as JSON.', async () => {
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

    test('GET12 - Returns status 404 when the phone does not exist.', async () => {
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