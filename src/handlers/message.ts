import Context from '@/models/Context'
import openai from '@/helpers/openai'
import { InlineKeyboard } from 'grammy'

const stickerIds = [
  'CAACAgIAAxkBAAEIkNtm6fn1brqTejJWy_NZ7z6epquxgQACwSYAAn7eCEnWVu7o25PceTYE',
  // ... (добавьте остальные ID стикеров)
]

export default async function handleMessage(ctx: Context) {
  const messageText = ctx.message?.text
  if (!messageText) return

  const lowerMessageText = messageText.toLowerCase()

  // Обработка известных фраз
  if (lowerMessageText.includes('умничка, ты что, терпила?') || lowerMessageText.includes('@umnichka_chika_bot, ты что, терпила?')) {
    await ctx.replyWithLocalization('terpilaResponse', {
      reply_to_message_id: ctx.message.message_id
    })
    return
  }

  if (lowerMessageText.includes('умничка, ты сильная и независимая?') || lowerMessageText.includes('@umnichka_chika_bot, ты сильная и независимая?')) {
    await ctx.replyWithLocalization('strongIndependentResponse', {
      reply_to_message_id: ctx.message.message_id
    })
    return
  }

  if (lowerMessageText.includes('умничка, на какой версии ты работаешь?') || lowerMessageText.includes('@umnichka_chika_bot, на какой версии ты работаешь?')) {
    await ctx.replyWithLocalization('versionResponse', {
      reply_to_message_id: ctx.message.message_id
    })
    return
  }

  if (lowerMessageText.includes('умничка, никита') || lowerMessageText.includes('@umnichka_chika_bot, никита')) {
    await ctx.replyWithLocalization('nikitaResponse', {
      reply_to_message_id: ctx.message.message_id
    })
    return
  }

  // Обработка сообщений с "стойло"
  if (lowerMessageText.includes('стойло')) {
    const prompt = ctx.i18n.t('stoyloPrompt')
    
    const waitingMessage = await ctx.replyWithLocalization('generatingResponse', {
      reply_to_message_id: ctx.message.message_id
    })

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: 300,
      })

      const response = completion.choices[0].message.content

      await ctx.reply(response, { reply_to_message_id: ctx.message.message_id })

      // Отправка случайного стикера
      const randomStickerId = stickerIds[Math.floor(Math.random() * stickerIds.length)]
      await ctx.replyWithSticker(randomStickerId)
    } catch (error) {
      console.error('Error generating response:', error)
      await ctx.replyWithLocalization('errorGeneratingResponse')
    } finally {
      await ctx.api.deleteMessage(ctx.chat.id, waitingMessage.message_id)
    }
    return
  }

  // Обработка сообщений с упоминанием бота
  if (lowerMessageText.includes('@umnichka_chika_bot') || lowerMessageText.includes('умничка подскажи как') || lowerMessageText.includes('умничка')) {
    let prompt = lowerMessageText
      .replace('@umnichka_chika_bot', '')
      .replace('умничка подскажи как', '')
      .replace('умничка', '')
      .trim()

    prompt += ctx.i18n.t('promptSuffix')

    const waitingMessage = await ctx.replyWithLocalization('generatingResponse', {
      reply_to_message_id: ctx.message.message_id
    })

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: 3000,
      })

      const response = completion.choices[0].message.content

      await ctx.reply(response, { reply_to_message_id: ctx.message.message_id })
    } catch (error) {
      console.error('Error generating response:', error)
      await ctx.replyWithLocalization('errorGeneratingResponse')
    } finally {
      await ctx.api.deleteMessage(ctx.chat.id, waitingMessage.message_id)
    }
  }
}
