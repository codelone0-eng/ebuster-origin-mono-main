/**
 * Централизованная конфигурация API endpoints
 */

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_CONFIG = {
  BASE_URL: isLocalhost ? 'http://localhost:3001' : 'https://api.ebuster.ru',
  
  get AUTH_URL() {
    return `${this.BASE_URL}/api/auth`;
  },
  
  get EMAIL_URL() {
    return `${this.BASE_URL}/api/email`;
  },
  
  get USER_URL() {
    return `${this.BASE_URL}/api/user`;
  },
  
  get ADMIN_URL() {
    return `${this.BASE_URL}/api/admin`;
  },
  
  get SCRIPTS_URL() {
    return `${this.BASE_URL}/api/scripts`;
  }
};

export default API_CONFIG;
