import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('Authentication Flow Integration Tests', () => {
  let authToken: string;

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test-user-123@example.com',
        password: 'SecurePassword123!',
        name: 'Test User'
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user.id');
      authToken = response.data.token;
    });

    it('should reject duplicate email registration', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/register`, {
          email: 'test-user-123@example.com',
          password: 'AnotherPassword123!',
          name: 'Another User'
        });
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('already exists');
      }
    });
  });

  describe('User Login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test-user-123@example.com',
        password: 'SecurePassword123!'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data.user.email).toBe('test-user-123@example.com');
    });

    it('should reject login with incorrect password', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/login`, {
          email: 'test-user-123@example.com',
          password: 'WrongPassword123!'
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to protected routes with valid token', async () => {
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.user.email).toBe('test-user-123@example.com');
    });

    it('should reject access without token', async () => {
      try {
        await axios.get(`${API_URL}/api/user/profile`);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
