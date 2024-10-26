import Context from '@/models/Context'
import openai from '@/helpers/openai'
import { InlineKeyboard } from 'grammy'

const stickerIds = [
  'CAACAgIAAxkBAAEIkNtm6fn1brqTejJWy_NZ7z6epquxgQACwSYAAn7eCEnWVu7o25PceTYE',
  'CAACAgUAAxkBAAEIkQNm6gS7cV1iqJLrSbGAibJZ1knk8gACNAQAAlh1yVfyrajGRtcUATYE',
  'CAACAgUAAxkBAAEIkQRm6gS7ZZ38Gs2toUg1hNeFi9SZTAACLQUAAuqJ4FcgJXZYFUEHezYE',
  'CAACAgUAAxkBAAEIkQdm6gS9s0RwoUWfsbroeL_xa1KOagACXAgAAmEsYVTdfZHDIFC6LTYE',
  'CAACAgUAAxkBAAEIkQlm6gS-cR5aILzl5I96J_kbg7AD0AACPgUAAs7g0VeUAW-dwow6cjYE',
  'CAACAgUAAxkBAAEIkQtm6gS_VrFAaiQGKG5N99ji9A809wACSAYAAuqj2FffkXSvQ8S9uzYE',
  'CAACAgUAAxkBAAEIkQ1m6gS_5sg0hmLFdupAh6CfOVKgSgACUQYAAqRt0Fc3-8EKbI29NzYE',
  'CAACAgUAAxkBAAEIkQ9m6gTAgisGiAFYA9ZgHzSQgUjxjgACGQUAAlMeGVTHuozBR1CsoDYE',
  'CAACAgUAAxkBAAEIkRFm6gTA4YGAR6knyy39AfH97cQPTQACWQUAAv8P0FeVusKjlK0jqDYE',
  'CAACAgUAAxkBAAEIkRNm6gTBtp28myJtA9wLpuBPhZx7oAACCQQAAsfDeVSMoBKrlRHEoTYE',
  'CAACAgUAAxkBAAEIkRVm6gTC3FjFk9-PU1SGYwHJtGpQwQACoAYAAoTKCVRhJ_NMoerx4zYE',
  'CAACAgUAAxkBAAEIkRlm6gTEAg-n0gt75U-8ReO9hCYzigACEAQAAo9s0Vd_F6R_ImMxgzYE',
  'CAACAgUAAxkBAAEIkRtm6gTE519qqw3oe5rSvL-q_Bzi2wACywgAAhdpkFVpqwPMsxEivzYE',
  'CAACAgUAAxkBAAEIkR1m6gTFkdH7LVvkmRnhlllXW_JLygACvgQAAmmq8FcTngXHKa-lRTYE',
  'CAACAgUAAxkBAAEIkSFm6gTJgBDHnpdb-134Q6yAxUr-LQACqQQAAvpwkFQECCweQCiEzDYE',
]

export default async function handleMessage(ctx: Context) {
  const messageText = ctx.message?.text
  if (!messageText) return

  const lowerMessageText = messageText.toLowerCase()

  // Обработка известных фраз
  if (
    lowerMessageText.includes('умничка, ты что, терпила?') ||
    lowerMessageText.includes('@umnichka_chika_bot, ты что, терпила?')
  ) {
    await ctx.replyWithLocalization('terpilaResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  if (
    lowerMessageText.includes('умничка, ты сильная и независимая?') ||
    lowerMessageText.includes('@umnichka_chika_bot, ты сильная и независимая?')
  ) {
    await ctx.replyWithLocalization('strongIndependentResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  if (
    lowerMessageText.includes('умничка, на какой версии ты работаешь?') ||
    lowerMessageText.includes(
      '@umnichka_chika_bot, на какой версии ты работаешь?'
    )
  ) {
    await ctx.replyWithLocalization('versionResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  if (
    lowerMessageText.includes('умничка, никита') ||
    lowerMessageText.includes('@umnichka_chika_bot, никита')
  ) {
    await ctx.replyWithLocalization('nikitaResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  // Обработка сообщений с "стойло"
  if (lowerMessageText.includes('стойло')) {
    const prompt = ctx.i18n.t('stoyloPrompt')

    const waitingMessage = await ctx.replyWithLocalization(
      'generatingResponse',
      {
        reply_to_message_id: ctx.message.message_id,
      }
    )

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: 300,
      })

      const response = completion.choices[0].message.content

      if (response) {
        await ctx.reply(response, {
          reply_to_message_id: ctx.message.message_id,
        })
      } else {
        await ctx.replyWithLocalization('errorGeneratingResponse')
      }

      // Отправка случайного стикера
      const randomStickerId =
        stickerIds[Math.floor(Math.random() * stickerIds.length)]
      await ctx.replyWithSticker(randomStickerId)
    } catch (error) {
      console.error('Error generating response:', error)
      await ctx.replyWithLocalization('errorGeneratingResponse')
    } finally {
      if (ctx.chat) {
        await ctx.api.deleteMessage(ctx.chat.id, waitingMessage.message_id)
      }
    }
    return
  }

  // Обработка сообщений с упоминанием бота
  if (
    lowerMessageText.includes('@umnichka_chika_bot') ||
    lowerMessageText.includes('умничка подскажи как') ||
    lowerMessageText.includes('умничка')
  ) {
    let prompt = lowerMessageText
      .replace('@umnichka_chika_bot', '')
      .replace('умничка подскажи как', '')
      .replace('умничка', '')
      .trim()

    prompt += ctx.i18n.t('promptSuffix')

    const waitingMessage = await ctx.replyWithLocalization(
      'generatingResponse',
      {
        reply_to_message_id: ctx.message.message_id,
      }
    )

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: 3000,
      })

      const response = completion.choices[0].message.content

      if (response) {
        await ctx.reply(response, {
          reply_to_message_id: ctx.message.message_id,
        })
      } else {
        await ctx.replyWithLocalization('errorGeneratingResponse')
      }
    } catch (error) {
      console.error('Error generating response:', error)
      await ctx.replyWithLocalization('errorGeneratingResponse')
    } finally {
      if (ctx.chat) {
        await ctx.api.deleteMessage(ctx.chat.id, waitingMessage.message_id)
      }
    }
  }
}
