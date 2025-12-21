const RATE_LIMIT_WINDOW_MS = 15 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const rateLimitStore = new Map()

/**
 * 简单的内存限流，基于 IP
 * @param {string} identifier
 */
function isRateLimited(identifier) {
  if (!identifier) return false
  const now = Date.now()
  const records = rateLimitStore.get(identifier) || []
  const recentRecords = records.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
  if (recentRecords.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(identifier, recentRecords)
    return true
  }
  recentRecords.push(now)
  rateLimitStore.set(identifier, recentRecords)
  return false
}

async function parseRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body)
    }
    return req.body
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString()
  return raw ? JSON.parse(raw) : {}
}

function buildContextText(contextData = {}) {
  const segments = []

  if (Array.isArray(contextData.projects) && contextData.projects.length > 0) {
    const preview = contextData.projects
      .slice(0, 5)
      .map((project, index) => {
        const info = [
          project?.title,
          project?.category,
          project?.location
        ]
          .filter(Boolean)
          .join(' · ')
        return `${index + 1}. ${info || '项目' + (index + 1)}`
      })
    segments.push(`部分在建/已交付项目：\n${preview.join('\n')}`)
  }

  if (Array.isArray(contextData.reviews) && contextData.reviews.length > 0) {
    const preview = contextData.reviews
      .slice(0, 5)
      .map((review, index) => {
        const info = [
          review?.name,
          review?.project_name,
          review?.rating ? `${review.rating}★` : null
        ]
          .filter(Boolean)
          .join(' · ')
        return `${index + 1}. ${info || '客户评价'}`
      })
    segments.push(`客户反馈（概览）：\n${preview.join('\n')}`)
  }

  return segments.join('\n\n')
}

function extractErrorMessage(payload) {
  if (!payload) return '未知错误'
  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload
    return (
      parsed?.error?.message ||
      parsed?.msg ||
      parsed?.message ||
      JSON.stringify(parsed)
    )
  } catch {
    return typeof payload === 'string' ? payload : '未知错误'
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: '当前请求过于频繁，请稍后再试。' })
  }

  let body
  try {
    body = await parseRequestBody(req)
  } catch (error) {
    return res.status(400).json({ error: '请求体不是有效的 JSON 格式。' })
  }

  const message = String(body?.message || '').trim()
  if (!message) {
    return res.status(400).json({ error: '请输入问题内容。' })
  }

  const zhipuKey = process.env.ZHIPU_API_KEY
  if (!zhipuKey) {
    console.error('[chat] Missing ZHIPU_API_KEY')
    return res.status(500).json({ error: '服务端未配置 AI 密钥，请联系管理员。' })
  }

  const contextText = buildContextText(body?.contextData)
  const systemPrompt =
    '你是维度空间设计（WeiDU）的智能客服，擅长室内设计、施工、项目管理、客户沟通。回答要专业、简洁、友好，必要时提醒用户可通过电话/微信继续沟通。'

  const payload = {
    model: 'glm-4.5-flash',
    stream: false,
    temperature: 0.6,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: contextText
          ? `${message}\n\n【可参考的项目/评价信息】\n${contextText}`
          : message
      }
    ]
  }

  try {
    const upstreamResponse = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${zhipuKey}`
        },
        body: JSON.stringify(payload)
      }
    )

    if (!upstreamResponse.ok) {
      const errorPayload = await upstreamResponse
        .json()
        .catch(async () => await upstreamResponse.text())
      const errorMessage = extractErrorMessage(errorPayload)
      console.error('[chat] upstream error:', upstreamResponse.status, errorMessage)
      const status =
        upstreamResponse.status === 401 ? 500 : upstreamResponse.status
      return res.status(status).json({
        error: errorMessage || '上游模型服务暂时不可用，请稍后再试。'
      })
    }

    const result = await upstreamResponse.json()
    const reply =
      result?.choices?.[0]?.message?.content?.trim() ||
      '抱歉，我暂时无法回答这个问题。'

    return res.status(200).json({ message: reply })
  } catch (error) {
    console.error('[chat] request failed:', error)
    return res.status(500).json({ error: '服务器开小差了，请稍后再试。' })
  }
}
