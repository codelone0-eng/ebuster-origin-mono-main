import React from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueryStateProps<T> {
  query: UseQueryResult<T, unknown>;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  skeletonCount?: number;
  errorTitle?: string;
  errorDescription?: string;
  showRefresh?: boolean;
}

export function QueryState<T>({
  query,
  children,
  skeleton,
  skeletonCount = 3,
  errorTitle = 'Ошибка загрузки',
  errorDescription = 'Не удалось загрузить данные. Попробуйте обновить страницу.',
  showRefresh = true
}: QueryStateProps<T>) {
  if (query.isLoading || query.isFetching) {
    if (skeleton) {
      return (
        <>
          {Array.from({ length: skeletonCount }).map((_, index) =>
            typeof skeleton === 'function'
              ? React.createElement(skeleton as any, { key: index, index })
              : React.cloneElement(skeleton as React.ReactElement, { key: index })
          )}
        </>
      );
    }

    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (query.isError) {
    const error = query.error as Error;
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorTitle}</AlertTitle>
          <AlertDescription className="mt-2">
            {error?.message || errorDescription}
          </AlertDescription>
          {showRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              className="mt-4"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Повторить попытку
            </Button>
          )}
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

export default QueryState;
