const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/models');

describe('Social Features API', () => {
  let authToken;
  let userId;
  let recordingId;

  beforeAll(async () => {
    // Clean database
    await sequelize.sync({ force: true });
    
    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
    
    userId = userResponse.body.user.id;
    authToken = userResponse.body.token;

    // Create test recording (mock - would need actual file upload in real test)
    recordingId = 'test-recording-id';
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Likes', () => {
    test('should like a recording', async () => {
      const response = await request(app)
        .post(`/api/recordings/${recordingId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Recording liked successfully');
    });

    test('should not allow duplicate likes', async () => {
      const response = await request(app)
        .post(`/api/recordings/${recordingId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Recording already liked');
    });

    test('should unlike a recording', async () => {
      const response = await request(app)
        .delete(`/api/recordings/${recordingId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Like removed successfully');
    });
  });

  describe('Playlists', () => {
    let playlistId;

    test('should create a playlist', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Playlist',
          description: 'A test playlist',
          isPublic: true
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Playlist');
      playlistId = response.body.id;
    });

    test('should get user playlists', async () => {
      const response = await request(app)
        .get('/api/playlists/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Following', () => {
    let otherUserId;

    beforeAll(async () => {
      // Create another user to follow
      const userResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'password123'
        });
      
      otherUserId = userResponse.body.user.id;
    });

    test('should follow a user', async () => {
      const response = await request(app)
        .post(`/api/users/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User followed successfully');
    });

    test('should not allow following yourself', async () => {
      const response = await request(app)
        .post(`/api/users/${userId}/follow`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot follow yourself');
    });

    test('should unfollow a user', async () => {
      const response = await request(app)
        .delete(`/api/users/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User unfollowed successfully');
    });
  });
});

describe('Analytics API', () => {
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'analytics@example.com',
        username: 'analyticsuser',
        password: 'password123'
      });
    
    authToken = userResponse.body.token;

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin@example.com',
        username: 'adminuser',
        password: 'password123'
      });
    
    adminToken = adminResponse.body.token;
    
    // Update user role to admin (would be done via database in real scenario)
    // This is a simplified test setup
  });

  test('should get creator analytics', async () => {
    const response = await request(app)
      .get('/api/analytics/creator?timeframe=30d')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalRecordings');
    expect(response.body).toHaveProperty('totalLikes');
    expect(response.body).toHaveProperty('totalBookmarks');
    expect(response.body).toHaveProperty('totalShares');
  });

  test('should require authentication for analytics', async () => {
    const response = await request(app)
      .get('/api/analytics/creator');

    expect(response.status).toBe(401);
  });
});

describe('Governance API', () => {
  let authToken;
  let userId;
  let proposalId;

  beforeAll(async () => {
    // Create user with sufficient reputation
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'governance@example.com',
        username: 'governanceuser',
        password: 'password123'
      });
    
    authToken = userResponse.body.token;
    userId = userResponse.body.user.id;

    // Set user reputation to 500+ (would be done via database update in real scenario)
  });

  test('should create a proposal', async () => {
    const response = await request(app)
      .post('/api/governance/proposals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Proposal for Platform Improvement',
        description: 'This is a detailed description of a test proposal that aims to improve the platform in various ways. It needs to be at least 50 characters long.',
        type: 'platform_parameter',
        votingPeriod: 7
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Proposal for Platform Improvement');
    proposalId = response.body.id;
  });

  test('should get proposals', async () => {
    const response = await request(app)
      .get('/api/governance/proposals?status=active')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('should vote on a proposal', async () => {
    if (proposalId) {
      const response = await request(app)
        .post(`/api/governance/proposals/${proposalId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          option: 0 // Vote "For"
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Vote cast successfully');
    }
  });

  test('should get governance stats', async () => {
    const response = await request(app)
      .get('/api/governance/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalProposals');
    expect(response.body).toHaveProperty('activeProposals');
    expect(response.body).toHaveProperty('totalVotes');
  });
});

describe('Advanced Filtering', () => {
  let authToken;

  beforeAll(async () => {
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'filter@example.com',
        username: 'filteruser',
        password: 'password123'
      });
    
    authToken = userResponse.body.token;
  });

  test('should filter recordings by quality', async () => {
    const response = await request(app)
      .get('/api/recordings?quality=HIGH')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('recordings');
    expect(response.body).toHaveProperty('filters');
    expect(response.body.filters.quality).toBe('HIGH');
  });

  test('should filter recordings by license type', async () => {
    const response = await request(app)
      .get('/api/recordings?licenseType=CC_BY')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.filters.licenseType).toBe('CC_BY');
  });

  test('should filter recordings by creator reputation', async () => {
    const response = await request(app)
      .get('/api/recordings?creatorReputation=high')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.filters.creatorReputation).toBe('high');
  });

  test('should sort recordings by popularity', async () => {
    const response = await request(app)
      .get('/api/recordings?sortBy=popularity&sortOrder=DESC')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.filters.sortBy).toBe('popularity');
    expect(response.body.filters.sortOrder).toBe('DESC');
  });
});