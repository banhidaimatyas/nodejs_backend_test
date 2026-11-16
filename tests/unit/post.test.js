jest.mock('../../models', () => ({
    ManySide: {
        create: jest.fn()
    }
}));

const { ManySide } = require('../../models');
const { createItem } = require('../../controllers');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
});

describe('POST /api/new', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should return the created item ID as JSON with HTTP 201.', async () => {
        ManySide.create.mockResolvedValue({ _id: 12 });
        const res = createResponse();

        await createItem({ body: { _id: 12, nev: 'Telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ _id: 12 });
    });

    test('The request should call create once with the submitted body.', async () => {
        const body = { _id: 13, nev: 'Tablet', ar: 100 };
        ManySide.create.mockResolvedValue({ _id: 13 });

        await createItem({ body }, createResponse());

        expect(ManySide.create).toHaveBeenCalledTimes(1);
        expect(ManySide.create).toHaveBeenCalledWith(body);
    });

    test('The request should return HTTP 400 with a validation message when creation rejects invalid data.', async () => {
        ManySide.create.mockRejectedValue({ name: 'ValidationError' });
        const res = createResponse();

        await createItem({ body: { _id: 14 } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Hiányos vagy érvénytelen adatok'
        });
        expect(ManySide.create).toHaveBeenCalledWith({ _id: 14 });
    });

    test('The request should return HTTP 400 with a validation message for an empty body.', async () => {
        ManySide.create.mockRejectedValue({ name: 'ValidationError' });
        const res = createResponse();

        await createItem({ body: {} }, res);

        expect(ManySide.create).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Hiányos vagy érvénytelen adatok'
        });
    });

    test('The request should return HTTP 409 with a duplicate-item message when the item exists.', async () => {
        ManySide.create.mockRejectedValue({ code: 11000 });
        const res = createResponse();

        await createItem({ body: { _id: 15, nev: 'Már létező telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'Már létezik ilyen telefon' });
    });

    test('The request should return HTTP 500 with a server-error message when creation rejects unexpectedly.', async () => {
        const logError = jest.spyOn(console, 'error').mockImplementation(() => {});
        ManySide.create.mockRejectedValue(new Error('Database error'));
        const res = createResponse();

        await createItem({ body: { _id: 16, nev: 'Telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Szerver hiba' });
        expect(logError).toHaveBeenCalled();
        logError.mockRestore();
    });
});
