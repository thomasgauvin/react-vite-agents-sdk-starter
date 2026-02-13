import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'
import { ChatWidget } from './ChatWidget'
import './App.css'

interface CounterState {
  name: string;
  count: number;
  loading: boolean;
  error: string | null;
}

function App() {
  const [counter, setCounter] = useState<CounterState>({
    name: 'default',
    count: 0,
    loading: true,
    error: null,
  })

  // Initialize counter from API
  useEffect(() => {
    fetchCounterValue()
  }, [counter.name])

  const fetchCounterValue = async () => {
    try {
      setCounter(prev => ({ ...prev, loading: true, error: null }))
      const res = await fetch(`/api/counter/${counter.name}`)
      const data = await res.json() as { name: string; count: number }
      setCounter(prev => ({ ...prev, count: data.count, loading: false }))
    } catch (err) {
      setCounter(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch',
        loading: false,
      }))
    }
  }

  const increment = async () => {
    try {
      setCounter(prev => ({ ...prev, loading: true, error: null }))
      const res = await fetch(`/api/counter/${counter.name}/increment`)
      const data = await res.json() as { name: string; count: number }
      setCounter(prev => ({ ...prev, count: data.count, loading: false }))
    } catch (err) {
      setCounter(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to increment',
        loading: false,
      }))
    }
  }

  const decrement = async () => {
    try {
      setCounter(prev => ({ ...prev, loading: true, error: null }))
      const res = await fetch(`/api/counter/${counter.name}/decrement`)
      const data = await res.json() as { name: string; count: number }
      setCounter(prev => ({ ...prev, count: data.count, loading: false }))
    } catch (err) {
      setCounter(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to decrement',
        loading: false,
      }))
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCounter(prev => ({ ...prev, name: e.target.value }))
  }

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
        <a href='https://workers.cloudflare.com/' target='_blank'>
          <img src={cloudflareLogo} className='logo cloudflare' alt='Cloudflare logo' />
        </a>
      </div>
      <h1>Vite + React + Cloudflare Workers</h1>
      
      <div className='container'>
        <div className='card'>
          <h2>Durable Object Counter</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor='counterName'>Counter Name: </label>
            <input
              id='counterName'
              type='text'
              value={counter.name}
              onChange={handleNameChange}
              placeholder='Enter counter name'
              style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
            />
          </div>

          {counter.error && (
            <p style={{ color: 'red' }}>Error: {counter.error}</p>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={decrement} disabled={counter.loading} aria-label='decrement'>
              −
            </button>
            <span style={{ margin: '0 1rem', fontSize: '2rem', minWidth: '4rem', display: 'inline-block', textAlign: 'center' }}>
              {counter.loading ? '...' : counter.count}
            </span>
            <button onClick={increment} disabled={counter.loading} aria-label='increment'>
              +
            </button>
          </div>

          <p>
            Each counter name is stored as a separate Durable Object instance with persistent state.
          </p>
        </div>

        <div className='card'>
          <ChatWidget />
        </div>
      </div>
      
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
