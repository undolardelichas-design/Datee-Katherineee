import { useEffect } from 'react'

/* ────────────────────────────────────────────────────────────────
   Lightbox: visualización a pantalla completa con navegación ‹ ›
   ──────────────────────────────────────────────────────────────── */
export default function Lightbox({
  fotos,
  indice,
  onCerrar,
  onNavegar,
}: {
  fotos: string[]
  indice: number
  onCerrar: () => void
  onNavegar: (i: number) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowLeft') onNavegar((indice - 1 + fotos.length) % fotos.length)
      if (e.key === 'ArrowRight') onNavegar((indice + 1) % fotos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, fotos.length, onCerrar, onNavegar])

  const prev = () => onNavegar((indice - 1 + fotos.length) % fotos.length)
  const next = () => onNavegar((indice + 1) % fotos.length)
  const varias = fotos.length > 1

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-[100] bg-stone-900/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      {/* Foto grande */}
      <img
        key={fotos[indice]}
        src={fotos[indice]}
        alt="Recuerdo en grande"
        className="lightbox-img max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Cerrar */}
      <button
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white text-xl backdrop-blur-sm transition-colors"
      >
        ✕
      </button>

      {/* Flechas de navegación */}
      {varias && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Anterior"
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl grid place-items-center transition-colors"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Siguiente"
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl grid place-items-center transition-colors"
          >
            ›
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-hand text-xl text-white/80">
            {indice + 1} de {fotos.length}
          </p>
        </>
      )}
    </div>
  )
}
