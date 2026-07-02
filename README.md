# Cosplay is Fun 🎭

Планировщик косплей-проектов и небольшая социальная сеть для косплееров.

## Стек

- **Фронтенд:** React 19 + TypeScript + Vite
- **База данных:** Firebase (Auth, Firestore, Storage)
- **Деплой:** GitHub Pages (через GitHub Actions)
- **Стили:** CSS Modules + CSS Variables (мульти-темы)

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск дев-сервера
npm run dev

# Сборка
npm run build

# Локальный просмотр сборки
npm run preview
```

## Переменные окружения

Скопируй `.env.example` в `.env` и заполни данные своего Firebase-проекта:

```bash
cp .env.example .env
```

## Структура проекта

```
src/
├── components/    # Общие UI-компоненты
│   ├── layout/    # Header, Footer, Layout
│   └── ui/        # Кнопки, инпуты, карточки
├── features/      # Функциональные модули (изолированы)
│   ├── auth/      # Регистрация и вход
│   ├── profile/   # Профиль пользователя
│   ├── planner/   # Планировщик косплеев
│   ├── social/    # Социальная лента
│   └── gallery/   # Галерея фотографий
├── hooks/         # Общие React-хуки
├── services/      # Firebase-сервисы (auth, firestore, storage)
├── styles/        # Глобальные стили и темы
│   └── themes/    # Светлая и тёмная темы
├── types/         # TypeScript-типы
└── utils/         # Утилиты
```

## Лицензия

MIT
