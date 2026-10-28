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
});