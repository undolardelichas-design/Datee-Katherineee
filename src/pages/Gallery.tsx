import { useEffect, useState } from 'react'
import { subscribeToDates } from '../services/dates'
import type { DateItem } from '../types'
import Lightbox from '../components/Lightbox'

export default function Gallery() {
  const [dates, setDates] = useState<DateItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    const unsub = subscribeToDates(setDates, () =>
      setError('No se pudo conectar con Firebase. Revisa tu configuración en .env'),
    )
    return unsub
  }, [])

  // Lock del scroll cuando la lightbox está abierta
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightbox])

  const fotos = (dates ?? []).flatMap((d) => d.fotos)

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 pt-24 pb-10">
      <header className="text-center mb-10">
        <h1 className="font-serif italic text-4xl md:text-5xl text-rose-600">Galería</h1>
        <p className="text-stone-500 mt-2 text-sm">
          Una foto es una nostalgia futura, pero vivirlo fue un privilegio
        </p>
      </header>

      {error && (
        <p className="text-center text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl p-4">
          {error}
        </p>
      )}

      {dates === null && !error && (
        <p className="text-center text-stone-400 italic">Abriendo el álbum...</p>
      )}

      {dates !== null && fotos.length === 0 && (
        <p className="text-center text-stone-400 italic mt-10">
          Todavía no hay recuerdos. Completa un plan y sube sus primeras fotos 📷
        </p>
      )}

      {/* Galería plana: todas las fotos de todos los planes juntas */}
      {fotos.length > 0 && (
        <div className="animate-fade-in grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((url, i) => (
            <button
              key={url}
              onClick={() => setLightbox(i)}
              aria-label={`Abrir recuerdo ${i + 1} en grande`}
              className="block rounded-2xl overflow-hidden border border-rose-100 bg-white cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              <img
                src={url}
                alt={`Recuerdo ${i + 1}`}
                className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox compartido */}
      {lightbox !== null && fotos.length > 0 && (
        <Lightbox
          fotos={fotos}
          indice={Math.min(lightbox, fotos.length - 1)}
          onCerrar={() => setLightbox(null)}
          onNavegar={setLightbox}
        />
      )}
    </div>
  )
}
