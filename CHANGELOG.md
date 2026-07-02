# Changelog

Все значимые изменения проекта фиксируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [0.2.0] — 2026-07-02 — Модуль авторизации и роли

### Добавлено
- AuthContext: глобальное состояние авторизации
- AuthProvider: отслеживание сессии через onAuthStateChanged
- Сервис регистрации с созданием профиля в Firestore
- Система ролей: superadmin, admin, moderator, user
- Первый пользователь получает superadmin, остальные — user
- LoginPage и RegisterPage (отдельные маршруты /auth и /auth/register)
- RoleGuard: компонент для защиты частей UI по ролям
- useRequireAuth: хук для защиты целых страниц
- Обработка ошибок при входе/регистрации

### Изменено
- UserProfile: добавлено поле role
- Layout и Header: используют реальное состояние авторизации
- Маршруты обёрнуты в AuthProvider

## [0.1.0] — 2026-07-02 — Начальная структура

### Добавлено
- Каркас React + Vite + TypeScript
- Firebase интегрирован (Auth, Firestore, Storage)
- Система тем: светлая / тёмная (CSS Variables)
- Базовый роутинг (React Router)
- Макет: Header, Footer, Layout
- Страницы: Home, Auth (заглушка), 404
- CI/CD: GitHub Actions для автоматического деплоя на Pages
- LICENSE (MIT)
- CHANGELOG
