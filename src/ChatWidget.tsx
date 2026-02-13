import { useState, useEffect, useRef } from 'react'
import { useAgent } from 'agents/react'

interface Message {
  role: string
  content: string
}

// Mirror of the server-side ChatAgentState (avoid importing from worker/ to prevent tsconfig conflicts)
interface ChatAgentState {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const agent = useAgent<ChatAgentState>({
    agent: 'ChatAgent',
    onStateUpdate: (state) => {
      // Sync messages from agent state
      if (state.messages) {
        setMessages(state.messages)
      }
    },
    onOpen: () => {
      console.log('Connected to ChatAgent')
    },
    onClose: () => {
      console.log('Disconnected from ChatAgent')
    },
    onError: (error) => {
      console.error('ChatAgent connection error:', error)
    },
    onMessage: (event) => {
      // Handle any non-framework messages
      console.log('Raw message:', event.data)
    },
  })

  const connected = agent.readyState === WebSocket.OPEN

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !connected || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      // Call the chat RPC method on the agent
      const response = await agent.stub.chat(userMessage)

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response'
      setMessages((prev) => [...prev, { role: 'error', content: errorMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='chat-widget'>
      <div className='chat-header'>
        <h3>AI Chat Agent</h3>
        <div
          className={`connection-status ${connected ? 'connected' : 'disconnected'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        >
          {connected ? '●' : '○'}
        </div>
      </div>

      <div className='chat-messages'>
        {messages.length === 0 ? (
          <div className='chat-empty'>
            <p>Start a conversation with the AI Agent</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {connected ? 'Ready to chat!' : 'Connecting...'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.role}`}>
              <div className='message-role'>
                {msg.role === 'user' ? '👤' : msg.role === 'error' ? '⚠️' : '🤖'}
              </div>
              <div className='message-content'>{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className='chat-input-form'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask me anything...'
          disabled={!connected || loading}
          className='chat-input'
        />
        <button type='submit' disabled={!connected || loading || !input.trim()}>
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  )
}
