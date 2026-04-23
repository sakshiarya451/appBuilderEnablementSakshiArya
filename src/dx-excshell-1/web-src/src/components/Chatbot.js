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

export const Chatbot = ({ ims }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your Adobe App Builder FAQ assistant. Ask me anything about App Builder — actions, Spectrum UI, deployment, APIs, and more." }
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
      const parsed = typeof response === 'string' ? JSON.parse(response) : response
      const answer = parsed?.answer || 'Sorry, I could not get a response.'
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
    <Flex direction='column' height='100vh' UNSAFE_style={{ boxSizing: 'border-box' }}>

      {/* Header */}
      <View padding='size-200' backgroundColor='gray-50' borderBottomWidth='thin' borderBottomColor='gray-300'>
        <Heading level={2} margin='size-0'>App Builder Bot</Heading>
        <Text UNSAFE_style={{ fontSize: '12px', color: '#666' }}>Powered by Gemini 2.5 Flash · Adobe App Builder</Text>
      </View>

      {/* Messages area - grows to fill space */}
      <View flex='1' overflow='auto' padding='size-200' backgroundColor='gray-75'
        UNSAFE_style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            backgroundColor={msg.role === 'user' ? 'blue-500' : 'gray-200'}
            borderRadius='medium'
            padding='size-150'
            maxWidth='70%'
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
            <Text UNSAFE_style={{ color: '#666' }}>Thinking...</Text>
          </Flex>
        )}
        <div ref={bottomRef} />
      </View>

      {/* Input area - pinned to bottom */}
      <View padding='size-200' backgroundColor='gray-50' borderTopWidth='thin' borderTopColor='gray-300'>
        <Flex gap='size-100' alignItems='flex-end'>
          <TextArea
            aria-label='Question'
            placeholder='Ask me anything about Adobe App Builder...'
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            flex='1'
            height='size-800'
          />
          <ActionButton
            variant='cta'
            onPress={sendMessage}
            isDisabled={!input.trim() || loading}
            height='size-800'
          >
            Send
          </ActionButton>
        </Flex>
        <Text UNSAFE_style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Enter to send · Shift+Enter for new line
        </Text>
      </View>

    </Flex>
  )
}

Chatbot.propTypes = {
  ims: PropTypes.any
}

export default Chatbot
