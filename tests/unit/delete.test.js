jest.mock('../../models', () => ({
    OneSide: {},
    ManySide: {
        findByIdAndDelete: jest.fn()
    }
}));

const express = require('express');
const request = require('supertest');
const { ManySide } = require('../../models');
const router = require('../../routes');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('DELETE /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. The findByIdAndDelete method should be available on the model.', () => {
        expect(ManySide.findByIdAndDelete).toBeDefined();
        expect(typeof ManySide.findByIdAndDelete).toBe('function');
    });

    test('2. The request should call findByIdAndDelete once for the item.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            nev: 'Test phone'
        });

        await request(app).delete('/api/manyside/123');

        expect(ManySide.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    test('3. The request should pass the URL ID to findByIdAndDelete.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            nev: 'Test phone'
        });

        await request(app).delete('/api/manyside/123');

        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    test('4. The request should return HTTP 200 when the item is deleted.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            nev: 'Test phone'
        });

        const response = await request(app).delete('/api/manyside/123');

        expect(response.status).toBe(200);
    });

    test('5. The request should return the deleted item name in its response.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({
            nev: 'Test phone'
        });

        const response = await request(app).delete('/api/manyside/123');

        expect(response.text).toBe('A Test phone nevű elem törölve lett.');
    });

    test('6. The request should return HTTP 404 with a not-found message when no item is found.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue(null);

        const response = await request(app).delete('/api/manyside/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
    });

    test('7. The requests should return HTTP 200 then HTTP 404 when deleting the same item twice.', async () => {
        ManySide.findByIdAndDelete
            .mockResolvedValueOnce({ nev: 'Test phone' })
            .mockResolvedValueOnce(null);

        const firstResponse = await request(app).delete('/api/manyside/123');
        const secondResponse = await request(app).delete('/api/manyside/123');

        expect(firstResponse.status).toBe(200);
        expect(secondResponse.status).toBe(404);
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledTimes(2);
    });

    test('8. The request should return HTTP 500 with the error message when deletion fails.', async () => {
        ManySide.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete('/api/manyside/abc');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Database error'
        });
    });
});
