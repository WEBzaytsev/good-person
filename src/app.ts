import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleLanguage from '@/handlers/language'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import sendHelp from '@/handlers/help'
import startMariaDb from '@/helpers/startMariaDb'

async function runApp() {
  // eslint-disable-next-line no-console
  console.log('Starting app...')
  // Database
  await startMariaDb()
  // eslint-disable-next-line no-console
  console.log('Database connected')
  
  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld())
    .use(attachUser)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)
  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', handleLanguage)
  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  // eslint-disable-next-line no-console
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
