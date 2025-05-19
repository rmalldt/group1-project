const { Pool } = require('pg');
const dotenv = require('dotenv');
const connect = require('./connect');

dotenv.config();

jest.mock('pg', () => {
    const PoolMock = jest.fn();
    return { Pool: PoolMock };
});

describe('setDb', () => {
    let setDb;
    let db;

    beforeEach(() => {
        jest.resetModules();
        db = null;
        jest.isolateModules(() => {
            setDb = connect.setDb;
            db = connect;
        });
        jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set db for development environment', () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_URL = 'postgres://dev-url';

        setDb();

        expect(Pool).toHaveBeenCalledWith({
            connectionString: process.env.SUPABASE_URL,
        });
        expect(console.log).toHaveBeenCalledWith(
            'DB connection established for development'
        );
    });

    it('should set db for test environment', () => {
        process.env.NODE_ENV = 'test';
        process.env.SUPABASE_URL = 'postgres://test-url';

        setDb();

        expect(Pool).toHaveBeenCalledWith({
            connectionString: process.env.SUPABASE_URL,
        });
        expect(console.log).toHaveBeenCalledWith(
            'DB connection established for test'
        );
    });

    it('should set db for production environment', () => {
        process.env.NODE_ENV = 'production';
        process.env.DB_USER = 'user';
        process.env.DB_HOST = 'host';
        process.env.DB_NAME = 'database';
        process.env.DB_PASSWORD = 'password';
        process.env.DB_PORT = "5432";

        setDb();

        expect(Pool).toHaveBeenCalledWith({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT, 10),
        });
        expect(console.log).toHaveBeenCalledWith(
            'DB connection established for production'
        );
    });

    it('should throw an error if NODE_ENV is not defined', () => {
        process.env.NODE_ENV = undefined;

        expect(() => setDb()).toThrow(
            'Database connection error: process.env.NODE_ENV not defined!'
        );
    });
});