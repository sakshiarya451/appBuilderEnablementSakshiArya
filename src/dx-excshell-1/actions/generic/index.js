const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

const SYSTEM_PROMPT = `You are a helpful Adobe App Builder expert assistant.
Answer questions about Adobe App Builder clearly and concisely.
Topics you know well: App Builder architecture, Adobe I/O Runtime, serverless actions,
Spectrum UI, Adobe APIs, deployment, configuration, extension points, and App Builder vs AEM.
If a question is not related to Adobe App Builder or Adobe developer tools, politely redirect the user.
Keep answers under 200 words unless more detail is truly needed.`

async function main (params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Calling the main action')
    logger.debug(stringParameters(params))

    const { question } = params
    if (!question || !question.trim()) {
      return errorResponse(400, 'Missing required parameter: question', logger)
    }

    const apiKey = params.GEMINI_API_KEY
    if (!apiKey) {
      return errorResponse(500, 'GEMINI_API_KEY is not configured', logger)
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: question }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7
      }
    }

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody)
    })

    if (!res.ok) {
      const errText = await res.text()
      logger.error('Gemini API error: ' + errText)
      return errorResponse(502, 'Gemini API request failed: ' + errText, logger)
    }

    const data = await res.json()
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.'

    logger.info('200: successful request')
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({ answer })
    }
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
