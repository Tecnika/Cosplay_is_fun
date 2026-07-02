/** Маппинг кодов ошибок Firebase Auth на русские сообщения */
const errorMap: Record<string, string> = {
  'auth/invalid-credential': 'Неверный логин или пароль',
  'auth/user-not-found': 'Пользователь не найден',
  'auth/wrong-password': 'Неверный пароль',
  'auth/email-already-in-use': 'Этот email или имя пользователя уже заняты',
  'auth/weak-password': 'Пароль слишком слабый (минимум 6 символов)',
  'auth/invalid-email': 'Неверный формат email',
  'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
  'auth/user-disabled': 'Аккаунт отключён',
  'auth/operation-not-allowed': 'Вход через email/пароль отключён в Firebase Console',
  'auth/network-request-failed': 'Ошибка сети. Проверьте соединение',
}

/** Возвращает русское описание ошибки Firebase */
export function getFirebaseErrorMessage(err: unknown): string {
  if (err instanceof Error && 'code' in err) {
    const code = (err as { code: string }).code
    return errorMap[code] || err.message
  }
  if (err instanceof Error) return err.message
  return 'Неизвестная ошибка'
}
