import { Sequelize } from 'sequelize-typescript'
import env from '@/helpers/env'
import { User } from '@/models/User'

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  models: [User],
  logging: false, // Отключаем логирование SQL-запросов
})

export async function startDatabase() {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    // eslint-disable-next-line no-console
    console.log('Database connected successfully')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

export default sequelize
