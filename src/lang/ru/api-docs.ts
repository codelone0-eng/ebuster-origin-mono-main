export const ru = {
  hero: {
    badge: "API Документация",
    title: "API",
    subtitle: "Документация",
    description: "Мощный RESTful API для интеграции с Chrome расширениями. Создавайте, управляйте и масштабируйте ваши расширения программно."
  },
  sections: {
    overview: "Обзор",
    baseUrl: "Базовый URL",
    dataFormat: "Формат данных",
    dataFormatDescription: "Все запросы и ответы используют JSON формат. Убедитесь, что заголовок Content-Type установлен в application/json.",
    requestExample: "Пример запроса",
    response: "Ответ",
    authentication: {
      title: "Аутентификация",
      description: "Используйте ваш API ключ в заголовке Authorization для аутентификации запросов."
    },
    endpoints: {
      title: "Эндпоинты",
      description: "Список всех доступных API методов"
    },
    examples: {
      title: "Примеры",
      description: "Практические примеры использования API"
    },
    sdk: {
      title: "SDK",
      description: "Готовые библиотеки для различных языков программирования"
    }
  },
  features: {
    title: "Почему выбирают EBUSTER API",
    items: [
      {
        title: "Быстрый старт",
        description: "Начните работу с API за 5 минут",
        icon: "Zap"
      },
      {
        title: "Безопасность",
        description: "OAuth 2.0 и JWT токены",
        icon: "Shield"
      },
      {
        title: "Масштабируемость",
        description: "Обрабатывает миллионы запросов",
        icon: "Database"
      },
      {
        title: "SDK",
        description: "Готовые библиотеки для всех языков",
        icon: "Code"
      }
    ]
  },
  endpoints: [
    {
      method: 'GET',
      path: '/api/v1/extensions',
      description: 'Получить список всех расширений',
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
      description: 'Создать новое расширение',
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
      description: 'Обновить расширение',
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
      description: 'Удалить расширение',
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

// Получить все расширения
const extensions = await api.extensions.list();

// Создать новое расширение
const newExtension = await api.extensions.create({
  name: 'My Extension',
  description: 'Custom extension',
  permissions: ['tabs', 'storage']
});`
  },
  cta: {
    title: "Готовы начать?",
    description: "Начните использовать EBUSTER API в ваших проектах уже сегодня",
    getApiKey: "Получить API ключ"
  }
};
