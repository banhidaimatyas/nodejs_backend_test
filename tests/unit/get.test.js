jest.mock('../../models', () => ({
    ManySide: {
        find: jest.fn(),
        findById: jest.fn()
    }
}));

const { ManySide } = require('../../models');
const { getManySide, getManySideById } = require('../../controllers');

const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
});

describe('GET /api/manyside', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should call find once and populate its results.', async () => {
        const populateMock = jest.fn().mockResolvedValue([]);
        ManySide.find.mockReturnValue({ populate: populateMock });

        await getManySide({}, createResponse());

        expect(ManySide.find).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledTimes(1);
    });

    test('The query should populate foreignId while excluding _id.', async () => {
        const populateMock = jest.fn().mockResolvedValue([]);
        ManySide.find.mockReturnValue({ populate: populateMock });

        await getManySide({}, createResponse());

        expect(populateMock).toHaveBeenCalledWith('foreignId', '-_id');
    });

    test('The request should return HTTP 200 when the query resolves.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });
        const res = createResponse();

        await getManySide({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('The request should return all queried phones as JSON.', async () => {
        const phones = [
            { _id: 1, nev: 'Samsung', ar: 100000 },
            { _id: 2, nev: 'iPhone', ar: 200000 }
        ];
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(phones)
        });
        const res = createResponse();

        await getManySide({}, res);

        expect(res.json).toHaveBeenCalledWith(phones);
    });

    test('The request should return HTTP 200 with an empty array when there are no phones.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });
        const res = createResponse();

        await getManySide({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    test('The request should return HTTP 500 with the error message when the query rejects.', async () => {
        ManySide.find.mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Database error'))
        });
        const res = createResponse();

        await getManySide({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
});

describe('GET /api/manyside/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('The request should call findById once and populate its result.', async () => {
        const populateMock = jest.fn().mockResolvedValue({
            _id: 1,
            nev: 'Samsung',
            ar: 100000
        });
        ManySide.findById.mockReturnValue({ populate: populateMock });

        await getManySideById({ params: { id: '1' } }, createResponse());

        expect(ManySide.findById).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledTimes(1);
        expect(populateMock).toHaveBeenCalledWith('foreignId', '-_id');
    });

    test('The request should pass the URL ID to findById.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue({
                _id: 5,
                nev: 'iPhone',
                ar: 200000
            })
        });

        await getManySideById({ params: { id: '5' } }, createResponse());

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
        const res = createResponse();

        await getManySideById({ params: { id: '1' } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
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
        const res = createResponse();

        await getManySideById({ params: { id: '1' } }, res);

        expect(res.json).toHaveBeenCalledWith(phone);
    });

    test('The request should return HTTP 404 with a not-found message when no phone is found.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });
        const res = createResponse();

        await getManySideById({ params: { id: '999' } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Nincs ilyen azonosítóval rendelkező elem.'
        });
    });

    test('The request should return HTTP 400 with an invalid-ID message when the ID cannot be cast.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockRejectedValue({ name: 'CastError' })
        });
        const res = createResponse();

        await getManySideById({ params: { id: 'abc' } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Érvénytelen azonosító' });
    });

    test('The request should return HTTP 500 with the error message when the query rejects.', async () => {
        ManySide.findById.mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Database error'))
        });
        const res = createResponse();

        await getManySideById({ params: { id: '1' } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
});
