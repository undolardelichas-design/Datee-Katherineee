import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unlock } from '../services/auth'

export default function Gate() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (exitoso) return
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      unlock()
      setExitoso(true)
      // Un ratito celebrando antes de entrar (siempre al inicio)
      timerRef.current = setTimeout(() => navigate('/', { replace: true }), 1800)
    } else {
      setError(true)
      timerRef.current = setTimeout(() => setError(false), 2500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <span className="text-5xl inline-block animate-float">📜</span>
        <h1 className="font-serif text-4xl mt-4 text-rose-600 italic">
          Esta es una app secreta, prohibido el paso
        </h1>
        <p className="mt-2 text-stone-500 text-sm">Ingresa la contraseña para continuar</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña..."
            autoFocus
            disabled={exitoso}
            className={`w-full px-5 py-3 rounded-full bg-white border-2 text-center shadow-sm outline-none transition disabled:opacity-60
              ${error
                ? 'border-rose-400 shake'
                : 'border-rose-100 focus:border-rose-300'}`}
          />
          <button
            type="submit"
            disabled={exitoso}
            className="w-full px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md shadow-rose-200 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            alohomora 🪄
          </button>
        </form>

        {/* Contraseña correcta: celebrar un ratito antes de entrar */}
        {exitoso && (
          <div className="mt-6 animate-fade-in">
            <img
              src="/gif/celebrar.gif"
              alt="¡Contraseña correcta!"
              className="w-36 mx-auto rounded-2xl"
            />
            <p className="font-hand text-xl text-rose-400 mt-2">¡La puerta se abrió!</p>
          </div>
        )}

        {/* Contraseña incorrecta: feedback de intruso */}
        {error && !exitoso && (
          <div className="mt-6 animate-fade-in">
            <img
              src="/gif/empalagoso.gif"
              alt="Intruso detectado"
              className="w-36 mx-auto rounded-2xl"
            />
            <p className="font-serif italic text-lg text-rose-600 mt-2">
              Intruso, atrás, no soportarás.
            </p>
            <p className="text-stone-400 text-sm mt-0.5">(Inténtalo nuevamente)</p>
          </div>
        )}
      </div>
    </div>
  )
}
