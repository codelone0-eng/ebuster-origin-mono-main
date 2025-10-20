export const eng = {
  hero: {
    badge: "API Documentation",
    title: "API",
    subtitle: "Documentation",
    description: "Powerful RESTful API for Chrome extension integration. Create, manage and scale your extensions programmatically."
  },
  sections: {
    overview: "Overview",
    baseUrl: "Base URL",
    dataFormat: "Data Format",
    dataFormatDescription: "All requests and responses use JSON format. Make sure the Content-Type header is set to application/json.",
    requestExample: "Request Example",
    response: "Response",
    authentication: {
      title: "Authentication",
      description: "Use your API key in the Authorization header to authenticate requests."
    },
    endpoints: {
      title: "Endpoints",
      description: "List of all available API methods"
    },
    examples: {
      title: "Examples",
      description: "Practical examples of API usage"
    },
    sdk: {
      title: "SDK",
      description: "Ready-made libraries for various programming languages"
    }
  },
  features: {
    title: "Why choose EBUSTER API",
    items: [
      {
        title: "Quick Start",
        description: "Start working with API in 5 minutes",
        icon: "Zap"
      },
      {
        title: "Security",
        description: "OAuth 2.0 and JWT tokens",
        icon: "Shield"
      },
      {
        title: "Scalability",
        description: "Handles millions of requests",
        icon: "Database"
      },
      {
        title: "SDK",
        description: "Ready-made libraries for all languages",
        icon: "Code"
      }
    ]
  },
  endpoints: [
    {
      method: 'GET',
      path: '/api/v1/extensions',
      description: 'Get list of all extensions',
      example: `curl -X GET "https://api.ebuster.ru/v1/extensions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
      response: {
        status: 200,
        data: {
          extensions: [
            {
              id: "ext_001",
              name: "Security Scanner",
              version: "2.1.0",
              status: "active",
              permissions: ["tabs", "storage", "activeTab"]
            }
          ],
          total: 1,
          page: 1,
          limit: 10
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/extensions',
      description: 'Create new extension',
      example: `curl -X POST "https://api.ebuster.ru/v1/extensions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Extension",
    "description": "Custom extension",
    "permissions": ["tabs", "storage"]
  }'`,
      response: {
        status: 201,
        data: {
          id: "ext_002",
          name: "My Extension",
          status: "pending",
          created_at: "2024-01-15T10:30:00Z"
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/v1/extensions/{id}',
      description: 'Update extension',
      example: `curl -X PUT "https://api.ebuster.ru/v1/extensions/ext_001" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Extension",
    "version": "2.2.0"
  }'`,
      response: {
        status: 200,
        data: {
          id: "ext_001",
          name: "Updated Extension",
          version: "2.2.0",
          updated_at: "2024-01-15T11:00:00Z"
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/extensions/{id}',
      description: 'Delete extension',
      example: `curl -X DELETE "https://api.ebuster.ru/v1/extensions/ext_001" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: {
        status: 204,
        message: "Extension deleted successfully"
      }
    }
  ],
  sdk: {
    title: "JavaScript SDK",
    installation: "npm install @ebuster/api-sdk",
    usage: `import { EbusterAPI } from '@ebuster/api-sdk';

const api = new EbusterAPI('YOUR_API_KEY');

// Get all extensions
const extensions = await api.extensions.list();

// Create new extension
const newExtension = await api.extensions.create({
  name: 'My Extension',
  description: 'Custom extension',
  permissions: ['tabs', 'storage']
});`
  },
  cta: {
    title: "Ready to start?",
    description: "Start using EBUSTER API in your projects today",
    getApiKey: "Get API Key"
  }
};
