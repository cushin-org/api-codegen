/** @type {import('@cushin/api-codegen').UserConfig} */
export default {
  // Provider type
  provider: 'vite',

  // Path to your API endpoints configuration
  endpoints: './src/lib/api/config/endpoints.ts',

  // Output directory for generated files
  output: './src/lib/api/generated',

  // Base URL for API requests
  baseUrl: process.env.VITE_API_URL || 'http://localhost:3000/api',

  // Generation options
  generateHooks: true, // Generate React Query hooks
  generateClient: true, // Generate API client

  // Advanced options
  options: {
    // Add 'use client' directive to generated files
    useClientDirective: true,

    // Prefix for generated hook names (e.g., useGetUser, useCreateUser)
    hookPrefix: 'use',

    // Custom imports can be added here if needed
    customImports: {
      // hooks: ['import { customUtil } from "@/lib/utils"'],
    },
  },
};
