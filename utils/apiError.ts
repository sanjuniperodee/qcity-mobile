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

  // Приводим известные backend-фразы к локализованным вариантам
  const norm = (s: string) => (s || '').toLowerCase();
  const mapKnown = (s: string): string => {
    const n = norm(s);
    if (n.includes('invalid credentials')) return 'Неверный логин или пароль';
    if (n.includes('user not found')) return 'Пользователь не найден';
    if (n.includes('code not found') || n.includes('expired')) return 'Код не найден или истёк';
    if (n.includes('invalid code')) return 'Неверный код';
    if (n.includes('phone must be in +77')) return 'Телефон должен быть в формате +77XXXXXXXXX';
    if (n.includes('too many requests')) return 'Слишком много запросов. Повторите позже';
    if (n.includes('sms send failed') || n.includes('failed to send code')) return 'Не удалось отправить SMS. Повторите позже';
    if (n.includes('verification code sent')) return 'Код отправлен';
    if (n.includes('you do not have permission')) return 'Недостаточно прав для выполнения действия';
    if (n.includes('already in favourites')) return 'Уже в избранном';
    if (n.includes('post not found')) return 'Объявление не найдено';
    if (n.includes('password updated successfully')) return 'Пароль обновлён';
    return s;
  };

  if (message) message = mapKnown(message);

  if (!message) {
    if (status === 400) message = 'Ошибка валидации';
    else if (status === 401) message = 'Неверный логин или пароль';
    else if (status === 403) message = 'Доступ запрещён';
    else if (status === 404) message = 'Не найдено';
    else if (status === 429) message = 'Слишком много запросов. Повторите позже';
    else if (status >= 500) message = 'Сервис временно недоступен';
    else message = 'Произошла ошибка';
  }

  return { status, message, fieldErrors };
}


