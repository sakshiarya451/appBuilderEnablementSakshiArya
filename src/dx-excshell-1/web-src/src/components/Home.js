import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Heading,
  TextArea,
  ActionButton,
  Text,
  Flex,
  ProgressCircle,
  Divider
} from '@adobe/react-spectrum'
import actionWebInvoke from '../utils'
import allActions from '../config.json'

const BOT_NAME = 'App Builder Bot'
const PLACEHOLDER = 'Ask me anything about Adobe App Builder...'

export const Home = ({ ims }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your Adobe App Builder FAQ assistant. Ask me anything about App Builder — actions, Spectrum UI, deployment, APIs, and more.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage () {
    const question = input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const actionUrl = allActions['dx-excshell-1/generic']
      const headers = {}
      if (ims?.token) headers.authorization = `Bearer ${ims.token}`
      if (ims?.org) headers['x-gw-ims-org-id'] = ims.org

      const response = await actionWebInvoke(actionUrl, headers, { question })
      const answer = response?.answer || 'Sorry, I could not get a response.'
      setMessages(prev => [...prev, { role: 'bot', text: answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: ' + e.message }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <View width='size-6000' maxWidth='100%'>
      <Heading level={1}>{BOT_NAME}</Heading>
      <Text>Powered by Gemini 2.5 Flash · Adobe App Builder</Text>
      <Divider marginTop='size-200' marginBottom='size-200' />

      {/* Chat history */}
      <View
        backgroundColor='gray-100'
        borderRadius='medium'
        padding='size-200'
        height='size-6000'
        overflow='auto'
        UNSAFE_style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            backgroundColor={msg.role === 'user' ? 'blue-400' : 'gray-200'}
            borderRadius='medium'
            padding='size-150'
            alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            maxWidth='80%'
            UNSAFE_style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <Text UNSAFE_style={{ color: msg.role === 'user' ? 'white' : 'inherit', whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <Flex alignItems='center' gap='size-100'>
            <ProgressCircle aria-label='loading' isIndeterminate size='S' />
            <Text>Thinking...</Text>
          </Flex>
        )}
        <div ref={bottomRef} />
      </View>

      {/* Input area */}
      <Flex marginTop='size-200' gap='size-100' alignItems='flex-end'>
        <TextArea
          aria-label='Question'
          placeholder={PLACEHOLDER}
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          width='size-5000'
          maxWidth='100%'
          height='size-800'
        />
        <ActionButton
          variant='cta'
          onPress={sendMessage}
          isDisabled={!input.trim() || loading}
        >
          Send
        </ActionButton>
      </Flex>
      <Text UNSAFE_style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
        Press Enter to send · Shift+Enter for new line
      </Text>
    </View>
  )
}

Home.propTypes = {
  ims: PropTypes.any
}

export default Home
