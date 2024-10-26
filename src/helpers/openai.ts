import OpenAI from 'openai'
import env from '@/helpers/env'

const openai = new OpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
})

export default openai
