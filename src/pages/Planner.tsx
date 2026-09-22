import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToDates } from '../services/dates'
import type { DateItem } from '../types'
import DateCard from '../components/DateCard'

type Tab = 'pendientes' | 'completados'

export default function Planner() {
  const [dates, setDates] = useState<DateItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('pendientes')

  useEffect(() => {
    const unsub = subscribeToDates(setDates, (err) => {
      console.error(err)
      setError('No se pudo conectar con Firebase. Revisa tu configuración en .env')
    })
    return unsub
  }, [])

  const pendientes = dates?.filter((d) => d.estado === 'pendiente') ?? []
  const completados = dates?.filter((d) => d.estado === 'completada') ?? []
  const activos = tab === 'pendientes' ? pendientes : completados

  return (
    <div className="min-h-screen max-w-3xl lg:max-w-6xl mx-auto px-4 pt-24 pb-14">
      {/* Hero de la vista */}
      <header className="text-center mb-8">
        <h1 className="font-serif italic text-4xl md:text-5xl text-rose-600">Nuestros planes</h1>
        <p className="text-stone-500 mt-2 text-sm">
          Cada salida, un recuerdo por crear
        </p>
        <Link
          to="/nuevo"
          className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 text-white font-semibold rounded-full shadow-lg shadow-rose-200 transition-all"
        >
          + Proponer una salida
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setTab('pendientes')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            tab === 'pendientes'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'bg-white/90 border border-rose-200 text-rose-500 hover:bg-rose-50'
          }`}
        >
          Por vivir
          <span
            className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              tab === 'pendientes' ? 'bg-white/25' : 'bg-rose-50'
            }`}
          >
            {pendientes.length}
          </span>
        </button>
        <button
          onClick={() => setTab('completados')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            tab === 'completados'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
              : 'bg-white/90 border border-stone-200 text-stone-400 hover:bg-stone-50'
          }`}
        >
          Completados
          <span
            className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              tab === 'completados' ? 'bg-white/25' : 'bg-stone-100'
            }`}
          >
            {completados.length}
          </span>
        </button>
      </div>

      {error && (
        <p className="text-center text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl p-4">
          {error}
        </p>
      )}

      {dates === null && !error && (
        <p className="text-center text-stone-400 mt-10 italic">Cargando nuestros planes...</p>
      )}

      {/* Grid del tab activo */}
      {dates !== null && activos.length > 0 && (
        <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activos.map((d, i) => (
            <DateCard key={d.id} item={d} indice={i} />
          ))}
        </div>
      )}

      {/* Estado vacío por tab */}
      {dates !== null && activos.length === 0 && !error && (
        <div className="text-center mt-12 animate-fade-in">
          {tab === 'pendientes' ? (
            <>
              <p className="text-5xl">🌷</p>
              <p className="text-stone-500 mt-3 italic">Aún no hay planes... ¡propon el primero!</p>
              <Link
                to="/nuevo"
                className="inline-block mt-4 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md shadow-rose-200 transition-colors"
              >
                Crear el primer plan
              </Link>
            </>
          ) : (
            <>
              <p className="text-5xl animate-float">📷</p>
              <p className="text-stone-500 mt-3 italic">
                Los recuerdos aparecen cuando completen un plan
              </p>
              <Link
                to="/gallery"
                className="inline-block mt-4 px-6 py-2.5 bg-white border border-rose-200 text-rose-500 font-semibold rounded-full hover:bg-rose-50 transition-colors"
              >
                Ir a la galería
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
