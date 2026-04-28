// Test setup file
// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/homework_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';
