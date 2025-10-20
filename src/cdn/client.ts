// CDN утилиты для работы с файлами и изображениями
export const CDN_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.ebuster.ru' 
  : 'http://localhost:3001';

export const CDN_ENDPOINTS = {
  // Изображения
  IMAGES: {
    AVATARS: '/images/avatars',
    SCRIPTS: '/images/scripts',
    LOGOS: '/images/logos',
    ICONS: '/images/icons',
  },
  
  // Файлы
  FILES: {
    SCRIPTS: '/files/scripts',
    DOCUMENTS: '/files/documents',
    TEMP: '/files/temp',
  },
  
  // Медиа
  MEDIA: {
    VIDEOS: '/media/videos',
    AUDIO: '/media/audio',
  }
};

// Утилиты для работы с CDN
export class CDNClient {
  private baseURL: string;

  constructor(baseURL: string = CDN_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Получить URL файла
  getFileUrl(path: string): string {
    return `${this.baseURL}${path}`;
  }

  // Получить URL аватара пользователя
  getAvatarUrl(userId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: '64x64',
      medium: '128x128',
      large: '256x256'
    };
    return `${this.baseURL}/images/avatars/${userId}_${sizes[size]}.jpg`;
  }

  // Получить URL иконки скрипта
  getScriptIconUrl(scriptId: string): string {
    return `${this.baseURL}/images/scripts/${scriptId}_icon.png`;
  }

  // Получить URL логотипа
  getLogoUrl(type: 'main' | 'small' | 'white' = 'main'): string {
    return `${this.baseURL}/images/logos/ebuster_${type}.svg`;
  }

  // Загрузить файл
  async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseURL}/upload`);
      xhr.send(formData);
    });
  }

  // Удалить файл
  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Получить информацию о файле
  async getFileInfo(path: string): Promise<{
    size: number;
    type: string;
    lastModified: string;
  } | null> {
    try {
      const response = await fetch(`${this.baseURL}/info?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        return response.json();
      }
      return null;
    } catch {
      return null;
    }
  }
}

// Экспорт экземпляра клиента
export const cdnClient = new CDNClient();

// Утилиты для работы с изображениями
export const ImageUtils = {
  // Создать превью изображения
  createThumbnail(file: File, size: number = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        
        // Вычисляем размеры для центрирования
        const scale = Math.min(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;

        ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  // Проверить размер файла
  validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Проверить тип файла
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }
};
