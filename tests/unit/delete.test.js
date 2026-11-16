jest.mock('../../models', () => ({
    ManySide: {
        findByIdAndDelete: jest.fn()
    }
}));

const { ManySide } = require('../../models');
const { deleteManySide } = require('../../controllers');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
});

describe('DELETE /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should return the deleted item as plain text.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({ nev: 'Telefon' });
        const res = createResponse();

        await deleteManySide({ params: { id: '123' } }, res);

        expect(res.send).toHaveBeenCalledWith('A Telefon nevű elem törölve lett.');
    });

    test('The request should call findByIdAndDelete once for the item.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({ nev: 'Telefon' });

        await deleteManySide({ params: { id: '123' } }, createResponse());

        expect(ManySide.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    test('The request should pass the URL ID to findByIdAndDelete.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({ nev: 'Telefon' });

        await deleteManySide({ params: { id: '123' } }, createResponse());

        expect(ManySide.findByIdAndDelete).toHaveBeenCalledWith('123');
    });

    test('The request should return HTTP 200 when the item is deleted.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({ nev: 'Telefon' });
        const res = createResponse();

        await deleteManySide({ params: { id: '123' } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('The request should return the deleted item name in its response.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue({ nev: 'Telefon' });
        const res = createResponse();

        await deleteManySide({ params: { id: '123' } }, res);

        expect(res.send).toHaveBeenCalledWith('A Telefon nevű elem törölve lett.');
    });

    test('The request should return HTTP 404 with a not-found message when no item is found.', async () => {
        ManySide.findByIdAndDelete.mockResolvedValue(null);
        const res = createResponse();

        await deleteManySide({ params: { id: '999' } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
    });

    test('The request should return HTTP 200 then HTTP 404 when deleting the same item twice.', async () => {
        ManySide.findByIdAndDelete
            .mockResolvedValueOnce({ nev: 'Telefon' })
            .mockResolvedValueOnce(null);
        const firstResponse = createResponse();
        const secondResponse = createResponse();

        await deleteManySide({ params: { id: '123' } }, firstResponse);
        await deleteManySide({ params: { id: '123' } }, secondResponse);

        expect(firstResponse.status).toHaveBeenCalledWith(200);
        expect(secondResponse.status).toHaveBeenCalledWith(404);
        expect(ManySide.findByIdAndDelete).toHaveBeenCalledTimes(2);
    });

    test('The request should return HTTP 500 with the error message when deletion fails.', async () => {
        ManySide.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
        const res = createResponse();

        await deleteManySide({ params: { id: 'abc' } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
});
