jest.mock('../../models', () => ({
    Todo: {
        find: jest.fn(),
        findById: jest.fn()
    }
}));

const { Todo } = require('../../models');

const request = require('supertest');
const app = require('../../app');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/todos', () => {
    test('GET01 - returns status 200', async () => {
        Todo.find.mockResolvedValue([]);

        const res = await request(app).get('/api/todos');

        expect(res.status).toBe(200);
    });

    test('GET02 - returns an empty array', async () => {
        Todo.find.mockResolvedValue([]);

        const res = await request(app).get('/api/todos');

        expect(res.body).toEqual([]);
    });

    test('GET03 - returns all tasks', async () => {
        Todo.find.mockResolvedValue([
            { _id: 1, title: 'Study', completed: false },
            { _id: 2, title: 'Exercise', completed: true }
        ]);

        const res = await request(app).get('/api/todos');

        expect(res.body).toHaveLength(2);
    });

    test('GET04 - returns task titles', async () => {
        Todo.find.mockResolvedValue([
            { _id: 1, title: 'Study', completed: false }
        ]);

        const res = await request(app).get('/api/todos');

        expect(res.body[0].title).toBe('Study');
    });

    test('GET05 - returns JSON content type', async () => {
        Todo.find.mockResolvedValue([]);

        const res = await request(app).get('/api/todos');

        expect(res.headers['content-type']).toMatch(/json/);
    });

    test('GET06 - returns status 500 if the database query fails', async () => {
        Todo.find.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/api/todos');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Database error');
    });
});

describe('GET /api/todos/:id', () => {
    test('GET07 - returns status 200 for an existing task', async () => {
        Todo.findById.mockResolvedValue({
            _id: 1, title: 'Study', completed: false
        });

        const res = await request(app).get('/api/todos/1');

        expect(res.status).toBe(200);
    });

    test('GET08 - returns the correct task', async () => {
        Todo.findById.mockResolvedValue({
            _id: 1, title: 'Study', completed: false
        });

        const res = await request(app).get('/api/todos/1');

        expect(res.body.title).toBe('Study');
        expect(res.body.completed).toBe(false);
    });

    test('GET09 - searches using the requested ID', async () => {
        Todo.findById.mockResolvedValue({
            _id: 5, title: 'Exercise', completed: true
        });

        await request(app).get('/api/todos/5');

        expect(Todo.findById).toHaveBeenCalledWith('5');
    });

    test('GET10 - returns 404 if the task does not exist', async () => {
        Todo.findById.mockResolvedValue(null);

        const res = await request(app).get('/api/todos/999');

        expect(res.status).toBe(404);
    });

    test('GET11 - returns an error message for a missing task', async () => {
        Todo.findById.mockResolvedValue(null);

        const res = await request(app).get('/api/todos/999');

        expect(res.body.message).toBe('Nincs ilyen feladat.');
    });

    test('GET12 - returns status 500 if the database query fails', async () => {
        Todo.findById.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/api/todos/1');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Database error');
    });
});
