// Example API endpoints configuration
import { z } from 'zod';
import { defineConfig, defineEndpoint } from '@cushin/api-codegen';

// ==================== Schemas ====================

// User schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']).optional().default('user'),
});

const UpdateUserSchema = CreateUserSchema.partial();

const UserListQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// Auth schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// ==================== Endpoints ====================

export const apiConfig = defineConfig({
  baseUrl: 'https://api.example.com',
  endpoints: {
    // ========== Auth Endpoints ==========
    login: defineEndpoint({
      path: '/auth/login',
      method: 'POST',
      body: LoginSchema,
      response: TokenResponseSchema,
      tags: ['auth', 'mutation'],
      description: 'Login with email and password',
    }),

    logout: defineEndpoint({
      path: '/auth/logout',
      method: 'POST',
      response: z.object({ success: z.boolean() }),
      tags: ['auth', 'mutation'],
      description: 'Logout current user',
    }),

    refreshToken: defineEndpoint({
      path: '/auth/refresh',
      method: 'POST',
      body: RefreshTokenSchema,
      response: TokenResponseSchema,
      tags: ['auth', 'mutation'],
      description: 'Refresh access token',
    }),

    me: defineEndpoint({
      path: '/auth/me',
      method: 'GET',
      response: UserSchema,
      tags: ['auth', 'query'],
      description: 'Get current authenticated user',
    }),

    // ========== User Endpoints ==========
    listUsers: defineEndpoint({
      path: '/users',
      method: 'GET',
      query: UserListQuerySchema,
      response: PaginatedResponseSchema(UserSchema),
      tags: ['users', 'query'],
      description: 'List all users with pagination and filtering',
    }),

    getUser: defineEndpoint({
      path: '/users/:id',
      method: 'GET',
      params: z.object({
        id: z.string().uuid(),
      }),
      response: UserSchema,
      tags: ['users', 'query'],
      description: 'Get user by ID',
    }),

    createUser: defineEndpoint({
      path: '/users',
      method: 'POST',
      body: CreateUserSchema,
      response: UserSchema,
      tags: ['users', 'mutation'],
      description: 'Create a new user',
    }),

    updateUser: defineEndpoint({
      path: '/users/:id',
      method: 'PUT',
      params: z.object({
        id: z.string().uuid(),
      }),
      body: UpdateUserSchema,
      response: UserSchema,
      tags: ['users', 'mutation'],
      description: 'Update user by ID',
    }),

    deleteUser: defineEndpoint({
      path: '/users/:id',
      method: 'DELETE',
      params: z.object({
        id: z.string().uuid(),
      }),
      response: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      tags: ['users', 'mutation'],
      description: 'Delete user by ID',
    }),

    // ========== Example: Different Base URL ==========
    getUserAvatar: defineEndpoint({
      path: '/users/:id/avatar',
      method: 'GET',
      baseUrl: 'https://cdn.example.com', // Different base URL
      params: z.object({
        id: z.string().uuid(),
      }),
      response: z.object({
        url: z.string().url(),
        size: z.number(),
        contentType: z.string(),
      }),
      tags: ['users', 'query'],
      description: 'Get user avatar URL from CDN',
    }),
  },
});

// Export for use in generated code
export default apiConfig;
