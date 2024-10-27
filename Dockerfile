# Используем официальный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Устанавливаем Corepack и активируем его
RUN corepack enable

# Выводим версию Yarn
RUN yarn --version

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем приложение
RUN yarn build-ts

# Команда для запуска приложения
CMD ["node", "dist/app.js"]
