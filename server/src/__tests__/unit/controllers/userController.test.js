const User = require('../../../models/userModels');
const userController = require('../../../controllers/userController');

jest.mock('../../../models/userModels');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('index', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }];
      User.getAll.mockResolvedValue(mockUsers);

      await userController.index(req, res);

      expect(User.getAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors and return status 500', async () => {
      User.getAll.mockRejectedValue(new Error('DB failure'));

      await userController.index(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB failure' });
    });
  });

  describe('show', () => {
    it('should return a user by ID with status 200', async () => {
      req.params = { id: '1' };
      const mockUser = { id: 1, username: 'testuser' };
      User.getOneById.mockResolvedValue(mockUser);

      await userController.show(req, res);

      expect(User.getOneById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user is not found', async () => {
      req.params = { id: '999' };
      User.getOneById.mockRejectedValue(new Error('User not found'));

      await userController.show(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('signup', () => {
    it('should register a new user and return it with status 201', async () => {
      req.body = {
        username: 'new',
        email: 'new@example.com',
        password: 'secret',
      };
      const newUser = { id: 3, ...req.body };

      User.create.mockResolvedValue(newUser);

      await userController.signup(req, res);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it('should handle creation error with status 400', async () => {
      req.body = { username: 'fail', password: 'fail' };
      User.create.mockRejectedValue(new Error('Creation error'));

      await userController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Creation error' });
    });
  });

  describe('update', () => {
    it('should update a user and return the result with status 200', async () => {
      req.params = { id: '5' };
      req.body = { username: 'updated', start_location: 'new location' };

      const mockUser = {
        update: jest.fn().mockResolvedValue({
          id: 5,
          username: 'updated',
          start_location: 'new location',
        }),
      };

      User.getOneById.mockResolvedValue(mockUser);

      await userController.update(req, res);

      expect(User.getOneById).toHaveBeenCalledWith(5);
      expect(mockUser.update).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 5,
        username: 'updated',
        start_location: 'new location',
      });
    });

    it('should return 404 if update fails', async () => {
      req.params = { id: '999' };
      User.getOneById.mockRejectedValue(new Error('User not found'));

      await userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('destroy', () => {
    it('should delete a user and return the result with status 204', async () => {
      req.params = { id: '7' };

      const mockUser = {
        destroy: jest.fn().mockResolvedValue({ success: true }),
      };

      User.getOneById.mockResolvedValue(mockUser);

      await userController.destroy(req, res);

      expect(User.getOneById).toHaveBeenCalledWith(7);
      expect(mockUser.destroy).toHaveBeenCalledWith({ id: 7 });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 if user cannot be deleted', async () => {
      req.params = { id: '404' };
      User.getOneById.mockRejectedValue(new Error('Deletion failed'));

      await userController.destroy(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Deletion failed' });
    });
  });
});
