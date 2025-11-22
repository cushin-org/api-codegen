/** @type {import('@cushin/api-codegen').UserConfig} */
export default {
  // Provider type
  provider: 'nextjs',

  // Path to your API endpoints configuration
  endpoints: './lib/api/config/endpoints.ts',

  // Output directory for generated files
  output: './lib/api/generated',

  // Base URL for API requests
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Generation options
  generateHooks: true, // Generate React Query hooks (for client components)
  generateClient: true, // Generate API client
  generateServerActions: true, // Generate Server Actions
  generateServerQueries: true, // Generate Server Queries (with Next.js cache)

  // Advanced options
  options: {
    // Add 'use client' directive to client-side generated files
    useClientDirective: true,

    // Prefix for generated hook names (e.g., useGetUser, useCreateUser)
    hookPrefix: 'use',

    // Suffix for generated server action names (e.g., createUserAction, deleteUserAction)
    actionSuffix: 'Action',

    // Custom imports can be added here if needed
    customImports: {
      // hooks: ['import { customUtil } from "@/lib/utils"'],
      // actions: ['import { logger } from "@/lib/logger"'],
    },
  },
};
