import Context from '@/models/Context'
import openai from '@/helpers/openai'
import { InlineKeyboard } from 'grammy'
import env from '@/helpers/env'
import { encode, decode } from 'gpt-3-encoder'

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

function countTokens(text: string): number {
  return encode(text).length
}

function truncateTokens(text: string, maxTokens: number): string {
  const tokens = encode(text)
  if (tokens.length <= maxTokens) {
    return text
  }
  return decode(tokens.slice(0, maxTokens))
}

export default async function handleMessage(ctx: Context) {
  const messageText = ctx.message?.text
  if (!messageText) return

  const lowerMessageText = messageText.toLowerCase()

  // Обработка известных фраз
  if (
    lowerMessageText.includes('умничка, ты что, терпила?') ||
    lowerMessageText.includes('@umnichka_chika_bot, ты что, терпила?') ||
    lowerMessageText.includes('good girl, what are you, a patient?') ||
    lowerMessageText.includes('clever girl, what are you, a patient?') ||
    lowerMessageText.includes('umnichka, what are you, a patient?') ||
    lowerMessageText.includes('@umnichka_chika_bot, are you being patient?')
  ) {
    await ctx.replyWithLocalization('terpilaResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  if (
    lowerMessageText.includes('умничка, ты сильная и независимая?') ||
    lowerMessageText.includes(
      '@umnichka_chika_bot, ты сильная и независимая?'
    ) ||
    lowerMessageText.includes('good girl, are you strong and independent?') ||
    lowerMessageText.includes('clever girl, are you strong and independent?') ||
    lowerMessageText.includes('umnichka, are you strong and independent?')
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
    ) ||
    lowerMessageText.includes('good girl, what version are you running?') ||
    lowerMessageText.includes('clever girl, what version are you running?') ||
    lowerMessageText.includes('umnichka, what version are you running?') ||
    lowerMessageText.includes(
      '@umnichka_chika_bot, what version are you running?'
    )
  ) {
    await ctx.replyWithLocalization('versionResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  if (
    lowerMessageText.includes('умничка, никита') ||
    lowerMessageText.includes('@umnichka_chika_bot, никита') ||
    lowerMessageText.includes('good girl, nikita') ||
    lowerMessageText.includes('clever girl, nikita') ||
    lowerMessageText.includes('umnichka, nikita') ||
    lowerMessageText.includes('@umnichka_chika_bot, nikita')
  ) {
    await ctx.replyWithLocalization('nikitaResponse', {
      reply_to_message_id: ctx.message.message_id,
    })
    return
  }

  // Обработка сообщений с "стойло" или "stall"
  if (
    lowerMessageText.includes('стойло') ||
    lowerMessageText.includes('stall')
  ) {
    const prompt = ctx.i18n.t('stoyloPrompt')

    const waitingMessage = await ctx.replyWithLocalization(
      'generatingResponse',
      {
        reply_to_message_id: ctx.message.message_id,
      }
    )

    try {
      const promptTokens = countTokens(prompt)
      const maxResponseTokens = Math.min(env.MAX_TOKENS - promptTokens, 300) // Ограничиваем до 300 токенов или меньше

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: maxResponseTokens,
      })

      let response = completion.choices[0].message.content

      if (response) {
        response = truncateTokens(response, maxResponseTokens)
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
    lowerMessageText.includes('умничка') ||
    lowerMessageText.includes('good girl') ||
    lowerMessageText.includes('clever girl') ||
    lowerMessageText.includes('umnichka') ||
    lowerMessageText.includes('good girl. tell me how') ||
    lowerMessageText.includes('clever girl. tell me how') ||
    lowerMessageText.includes('umnichka. tell me how')
  ) {
    let prompt = lowerMessageText
      .replace('@umnichka_chika_bot', '')
      .replace('умничка подскажи как', '')
      .replace('умничка', '')
      .replace('good girl', '')
      .replace('clever girl', '')
      .replace('umnichka', '')
      .replace('tell me how', '')
      .trim()

    prompt += ctx.i18n.t('promptSuffix')

    const waitingMessage = await ctx.replyWithLocalization(
      'generatingResponse',
      {
        reply_to_message_id: ctx.message.message_id,
      }
    )

    try {
      const promptTokens = countTokens(prompt)
      const maxResponseTokens = env.MAX_TOKENS - promptTokens

      const completion = await openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        n: 1,
        max_tokens: maxResponseTokens,
      })

      let response = completion.choices[0].message.content

      if (response) {
        response = truncateTokens(response, maxResponseTokens)
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
