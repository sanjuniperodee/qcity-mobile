export type ParsedApiError = {
  status: number;
  message: string;
  fieldErrors: Record<string, string[]>;
};

export async function parseApiError(res: Response): Promise<ParsedApiError> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  const status = res.status;
  const fieldErrors: Record<string, string[]> = {};
  let message = '';

  if (data && typeof data === 'object') {
    // DRF common shapes
    if (typeof data.detail === 'string') message = data.detail;
    if (typeof data.error === 'string' && !message) message = data.error;

    // serializer errors
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (Array.isArray(val)) {
        fieldErrors[key] = val.map((v) => String(v));
      }
    });
  }

  if (!message) {
    if (status === 401) message = 'Неверные учетные данные';
    else if (status === 404) message = 'Не найдено';
    else if (status === 429) message = 'Слишком много запросов. Повторите позже';
    else if (status >= 500) message = 'Сервис временно недоступен';
    else message = 'Произошла ошибка';
  }

  return { status, message, fieldErrors };
}


