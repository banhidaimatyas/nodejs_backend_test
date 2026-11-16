jest.mock('../../models', () => ({
    ManySide: {
        findByIdAndUpdate: jest.fn()
    }
}));

const { ManySide } = require('../../models');
const { updateManySide } = require('../../controllers');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
});

describe('PATCH /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should return HTTP 200 when the update resolves with an item.', async () => {
        ManySide.findByIdAndUpdate.mockResolvedValue({
            _id: 21,
            nev: 'Frissített telefon'
        });
        const res = createResponse();

        await updateManySide({ params: { id: '21' }, body: { nev: 'Frissített telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    test('The request should pass the URL ID, submitted body, and update options to findByIdAndUpdate.', async () => {
        const body = { nev: 'Új név', ar: 250 };
        ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 22, ...body });

        await updateManySide({ params: { id: '22' }, body }, createResponse());

        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith('22', body, {
            returnDocument: 'after',
            runValidators: true
        });
    });

    test('The request should return the resolved updated item as JSON.', async () => {
        const updatedItem = { _id: 23, nev: 'Új telefon', ar: 300 };
        ManySide.findByIdAndUpdate.mockResolvedValue(updatedItem);
        const res = createResponse();

        await updateManySide({ params: { id: '23' }, body: updatedItem }, res);

        expect(res.json).toHaveBeenCalledWith(updatedItem);
    });

    test('The request should return HTTP 404 with a not-found message when the update resolves to null.', async () => {
        ManySide.findByIdAndUpdate.mockResolvedValue(null);
        const res = createResponse();

        await updateManySide({ params: { id: '24' }, body: { nev: 'Telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: '24 azonosítóval nem létezik elem!'
        });
    });

    test('The request should return HTTP 500 with the error message when the update rejects.', async () => {
        ManySide.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
        const res = createResponse();

        await updateManySide({ params: { id: '25' }, body: { nev: 'Telefon' } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    test('The request should pass supplied update values unchanged to findByIdAndUpdate.', async () => {
        const body = { ar: 0, szin: 'kék' };
        ManySide.findByIdAndUpdate.mockResolvedValue({ _id: 26, ...body });

        await updateManySide({ params: { id: '26' }, body }, createResponse());

        expect(ManySide.findByIdAndUpdate).toHaveBeenCalledWith(
            '26',
            { ar: 0, szin: 'kék' },
            { returnDocument: 'after', runValidators: true }
        );
    });
});
