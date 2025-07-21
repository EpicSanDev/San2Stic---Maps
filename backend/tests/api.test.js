const request = require('supertest');
const app = require('../src/server');

describe('API Health Tests', () => {
  test('Health endpoint should return status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });
  
  test('Recordings endpoint should return empty array', async () => {
    const response = await request(app)
      .get('/api/recordings')
      .expect(200);
    
    expect(Array.isArray(response.body.recordings)).toBe(true);
  });
});