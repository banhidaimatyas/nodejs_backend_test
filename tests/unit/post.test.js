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

describe('POST /api/new', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Creates a valid item and returns its ID as JSON with status 201.', async () => {
        ManySide.create.mockResolvedValue({ _id: 12 });

        const response = await request(app)
            .post('/api/new')
            .send({ _id: 12, nev: 'Telefon' });

        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({ _id: 12 });
    });

    test('Calls create once with the request body.', async () => {
        const body = { _id: 13, nev: 'Tablet', ar: 100 };
        ManySide.create.mockResolvedValue({ _id: 13 });

        await request(app).post('/api/new').send(body);

        expect(ManySide.create).toHaveBeenCalledTimes(1);
        expect(ManySide.create).toHaveBeenCalledWith(body);
    });

    test('Returns a JSON 400 response when the data fails validation.', async () => {
        ManySide.create.mockRejectedValue({ name: 'ValidationError' });

        const response = await request(app)
            .post('/api/new')
            .send({ _id: 14 });

        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({
            message: 'Hiányos vagy érvénytelen adatok'
        });
        expect(ManySide.create).toHaveBeenCalledWith({ _id: 14 });
    });

    test('Passes an empty body to create and returns 400 for invalid data.', async () => {
        ManySide.create.mockRejectedValue({ name: 'ValidationError' });

        const response = await request(app).post('/api/new').send({});

        expect(ManySide.create).toHaveBeenCalledWith({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'Hiányos vagy érvénytelen adatok'
        });
    });

    test('Returns a JSON 409 response when the item already exists.', async () => {
        ManySide.create.mockRejectedValue({ code: 11000 });

        const response = await request(app)
            .post('/api/new')
            .send({ _id: 15, nev: 'Már létező telefon' });

        expect(response.status).toBe(409);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({ message: 'Már létezik ilyen telefon' });
    });

    test('Returns a JSON 500 response when creation fails unexpectedly.', async () => {
        const logError = jest.spyOn(console, 'error').mockImplementation(() => {});
        ManySide.create.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/new')
            .send({ _id: 16, nev: 'Telefon' });

        expect(response.status).toBe(500);
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toEqual({ message: 'Szerver hiba' });
        expect(logError).toHaveBeenCalled();
        logError.mockRestore();
    });
});