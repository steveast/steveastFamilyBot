import dotenv from 'dotenv'
import { OpenAI } from 'openai'

dotenv.config()
const key = process.env.OPENAI_API_KEY

export const openai = key ? new OpenAI({ apiKey: key }) : null

export async function askChatGPT(prompt: string) {
  if (!openai) throw new Error('OPENAI_API_KEY not set')
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
  })
  // API returns different shape depending on package version — defensive
  const text = (res.choices && res.choices[0]?.message?.content) || res?.choices?.[0]?.text || ''
  return text
}
