const User = require('../../../models/userModels');
const db = require('../../../db/connect');

jest.mock('../../../db/connect'); // Mock the DB

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'hashedpassword',
    start_location: '100',
    isAdmin: false,
    journeys: [],
  };

  describe('Static Methods', () => {
    describe('getAll', () => {
      it('should return all users as User instances', async () => {
        const mockUsers = [mockUser, { ...mockUser, id: 2, username: 'bob' }];
        db.query.mockResolvedValueOnce({ rows: mockUsers });

        const result = await User.getAll();

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(User);
        expect(result[0].username).toBe('testuser');
        expect(result[1].username).toBe('bob');
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM users;');
      });

      it('should throw an error if no users are found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(User.getAll()).rejects.toThrow('No users available.');
      });
    });

    describe('getOneById', () => {
      it('should return a user when a valid ID is passed', async () => {
        db.query.mockResolvedValueOnce({ rows: [mockUser] });

        const result = await User.getOneById(1);

        expect(result).toBeInstanceOf(User);
        expect(result.id).toBe(1);
        expect(result.username).toBe('testuser');
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1;', [1]);
      });

      it('should throw an error if user not found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(User.getOneById(999)).rejects.toThrow('Unable to locate user.');
      });
    });

    describe('getOneByUsername', () => {
      it('should return a user when a valid username is passed', async () => {
        db.query.mockResolvedValueOnce({ rows: [mockUser] });

        const result = await User.getOneByUsername('testuser');

        expect(result).toBeInstanceOf(User);
        expect(result.username).toBe('testuser');
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      });

      it('should throw an error if the user is not found', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        await expect(User.getOneByUsername('nonexistent')).rejects.toThrow('Unable to locate user.');
      });
    });

    describe('create', () => {
      it('should create a new user and return it', async () => {
        const inputData = { username: 'newuser', email: 'newuser@example.com', password: 'securepassword' };
        const mockResponse = { ...mockUser, id: 3, username: 'newuser' };

        db.query
          .mockResolvedValueOnce({ rows: [mockResponse] }) // insert
          .mockResolvedValueOnce({ rows: [mockResponse] }); // getOneById

        const result = await User.create(inputData);

        expect(result).toBeInstanceOf(User);
        expect(result.username).toBe('newuser');
        expect(result.id).toBe(3);
        expect(db.query).toHaveBeenCalledTimes(2);
      });

      it('should throw an error if the user cannot be created', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const inputData = { username: 'failuser', email: 'failuser@example.com', password: 'failpassword' };

        await expect(User.create(inputData)).rejects.toThrow();
      });
    });
  });

  describe('Instance Methods', () => {
    describe('update', () => {
      it('should update the user fields and return updated User instance', async () => {
        const user = new User(mockUser);
        const updatedData = { ...mockUser, username: 'updateduser', start_location: '200' };

        db.query.mockResolvedValueOnce({ rows: [updatedData] });

        const result = await user.update({ username: 'updateduser', start_location: '200' });

        expect(result).toBeInstanceOf(User);
        expect(result.username).toBe('updateduser');
        expect(result.start_location).toBe('200');
        expect(db.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE users'),
          expect.arrayContaining(['updateduser', '200', 1])
        );
      });

      it('should throw an error if update fails', async () => {
        const user = new User(mockUser);
        db.query.mockResolvedValueOnce({ rows: [] });

        await expect(user.update({ username: 'fail' })).rejects.toThrow('Unable to update user.');
      });
    });

    describe('destroy', () => {
      it('should delete a user and return the deleted user instance', async () => {
        db.query.mockResolvedValueOnce({ rows: [mockUser] });

        const user = new User(mockUser);
        const result = await user.destroy();

        expect(result).toBeInstanceOf(User);
        expect(result.id).toBe(1);
        expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1 RETURNING *;', [1]);
      });

      it('should throw an error if the user cannot be deleted', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });

        const user = new User(mockUser);
        await expect(user.destroy()).rejects.toThrow('Unable to delete user.');
      });
    });
  });

  describe('Constructor', () => {
    it('should correctly initialize a User instance with provided properties', () => {
      const user = new User(mockUser);

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('testuser@example.com');
      expect(user.password).toBe('hashedpassword');
      expect(user.start_location).toBe('100');
      expect(user.isAdmin).toBe(false);
      expect(user.journeys).toEqual([]);
    });

    it('should handle missing optional properties gracefully', () => {
      const minimalUser = { id: 2, username: 'minimaluser', email: 'minimal@example.com', password: 'minimalpass' };
      const user = new User(minimalUser);

      expect(user.id).toBe(2);
      expect(user.username).toBe('minimaluser');
      expect(user.email).toBe('minimal@example.com');
      expect(user.password).toBe('minimalpass');
      expect(user.start_location).toBeUndefined();
      expect(user.isAdmin).toBeUndefined();
      expect(user.journeys).toEqual([]);
    });
  });
});
