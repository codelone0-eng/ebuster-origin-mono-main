import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import Error404 from './Error404';
import Error500 from './Error500';
import Error503 from './Error503';
import Error403 from './Error403';

const ErrorBoundary = () => {
  const error = useRouteError();

  // Определяем тип ошибки
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return <Error404 />;
      case 403:
        return <Error403 />;
      case 500:
        return <Error500 />;
      case 503:
        return <Error503 />;
      default:
        return <Error500 />;
    }
  }

  // Для других типов ошибок показываем общую страницу 500
  return <Error500 />;
};

export default ErrorBoundary;
