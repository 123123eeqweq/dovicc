export const ERROR_MESSAGES: Record<string, string> = {
  REVIEW_ALREADY_EXISTS: 'Ви вже залишили відгук про цей об\'єкт. Ви можете переглянути його на сторінці вашого профілю.',
  CANNOT_REACT_TO_OWN_REVIEW: 'Ви не можете реагувати на власний відгук',
  CANNOT_REPORT_OWN_REVIEW: 'Ви не можете поскаржитись на власний відгук',
  REVIEW_NOT_FOUND: 'Відгук не знайдено',
  COMPANY_NOT_FOUND: 'Об\'єкт не знайдено',
  USER_NOT_FOUND: 'Користувача не знайдено',
  CATEGORY_NOT_FOUND: 'Категорію не знайдено',
  CATEGORY_NOT_AVAILABLE: 'Ця категорія недоступна для додавання',
  REPORT_NOT_FOUND: 'Скаргу не знайдено',
  
  UNAUTHORIZED: 'Будь ласка, увійдіть',
  INVALID_PASSWORD: 'Неправильна пошта або пароль',
  INVALID_TOKEN: 'Недійсний токен. Будь ласка, увійдіть знову',
  USER_ALREADY_EXISTS: 'Користувач з таким email вже існує',
  EMAIL_NOT_ACTIVATED: 'Будь ласка, активуйте email перед написанням відгуків',
  
  FORBIDDEN: 'Доступ заборонено',
  CAN_ONLY_DELETE_OWN_REVIEWS: 'Ви можете видаляти тільки свої відгуки',
  ALREADY_REPORTED: 'Ви вже надсилали скаргу на цей відгук',
  
  COMPANY_SLUG_REQUIRED: 'Необхідно вказати об\'єкт',
  RATING_REQUIRED: 'Необхідно вказати рейтинг',
  TEXT_REQUIRED: 'Необхідно вказати текст відгуку',
  RATING_INVALID: 'Рейтинг повинен бути від 1 до 5',
  REASON_REQUIRED: 'Необхідно вказати причину скарги',
  VALUE_INVALID: 'Невірне значення реакції',
  DUPLICATE_REVIEW_TEXT: 'Ви вже надсилали відгук з таким текстом',
  REGISTER_COOLDOWN: 'Потрібно зачекати після реєстрації перед відправкою відгуку',
  REVIEWS_LIMIT_EXCEEDED: 'Ви перевищили ліміт відгуків за період часу',
  TEXT_TOO_SHORT: 'Текст відгуку занадто короткий',
  TITLE_REQUIRED: 'Заголовок обов\'язковий (мінімум 3 символи)',
  TITLE_TOO_LONG: 'Заголовок не може перевищувати 200 символів',
  
  NOT_FOUND: 'Не знайдено',
  UNKNOWN_ERROR: 'Упс, щось пішло не так. Спробуйте пізніше',
  PARSE_ERROR: 'Помилка обробки відповіді сервера',
  CONNECTION_ERROR: 'Не вдалося підключитися до сервера',
  
  'Name, email and password are required': 'Необхідно вказати ім\'я, email та пароль',
  'Password must be at least 6 characters': 'Пароль повинен містити мінімум 6 символів',
  'Email and password are required': 'Необхідно вказати email та пароль',
  'Invalid email or password': 'Невірний email або пароль',
  'Please activate your email before writing reviews': 'Будь ласка, активуйте email перед написанням відгуків',
  'Email already activated': 'Email вже активовано',
  'Cannot reset password for Google OAuth account. Please use Google sign in.': 'Це обліковий запис Google. Увійдіть через Google',
  'User with this email does not exist': 'Email не знайдено',
  'Invalid reset link': 'Недійсне посилання для скидання пароля',
  
  'You cannot react to your own review': 'Ви не можете реагувати на власний відгук',
  'You cannot report your own review': 'Ви не можете поскаржитись на власний відгук',
  'You can only delete your own reviews': 'Ви можете видаляти тільки свої відгуки',
  'You have already reviewed this company': 'Ви вже залишали відгук цьому об\'єкту',
  'You have already submitted a review with this text': 'Ви вже надсилали відгук з таким текстом',
  'You have already reported this review': 'Ви вже надсилали скаргу на цей відгук',
  'Company not found': 'Об\'єкт не знайдено',
  'Review not found': 'Відгук не знайдено',
  'User not found': 'Користувача не знайдено',
  'Unauthorized': 'Будь ласка, увійдіть',
  'Invalid token': 'Недійсний токен. Будь ласка, увійдіть знову',
  'User with this email already exists': 'Користувач з таким email вже існує',
  'Internal server error': 'Помилка сервера. Спробуйте пізніше',
  'JWT plugin not initialized': 'Помилка авторизації. Спробуйте пізніше',
};

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
    return 'Упс, щось пішло не так. Спробуйте пізніше';
  }

  if (error?.error) {
    const errorCode = error.error;
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    return 'Упс, щось пішло не так. Спробуйте пізніше';
  }

  if (error?.message) {
    const errorCode = error.message;
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
    if (ERROR_MESSAGES[error.message]) {
      return ERROR_MESSAGES[error.message];
    }
    return 'Упс, щось пішло не так. Спробуйте пізніше';
  }

  return 'Упс, щось пішло не так. Спробуйте пізніше';
}

export function getErrorType(status?: number, errorCode?: string): 'error' | 'info' | 'warning' {
  if (errorCode === 'REVIEW_ALREADY_EXISTS' || errorCode === 'CANNOT_REACT_TO_OWN_REVIEW') {
    return 'info';
  }

  if (status === 401 || errorCode === 'UNAUTHORIZED') {
    return 'info';
  }

  if (status === 403 || errorCode === 'FORBIDDEN') {
    return 'warning';
  }

  if (status === 500 || status === 502 || status === 503) {
    return 'error';
  }

  return 'error';
}
