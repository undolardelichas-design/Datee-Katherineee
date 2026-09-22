import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { subscribeToDate, addPhoto, removePhoto, deleteDate, updatePortada, marcarVivido } from '../services/dates'
import Lightbox from '../components/Lightbox'
import type { DateItem } from '../types'

function fmt(ts: Timestamp | null) {
  if (!ts) return null
  return ts.toDate().toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* Rotaciones suaves y alternadas, como fotos pegadas a mano */
const ROTACIONES = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg']

/* ────────────────────────────────────────────────────────────────
   Modal de confirmación. Portal a document.body: las polaroids
   tienen transform (rotación), que convertiría el fixed del overlay
   en relativo a la card y se vería recortado.
   ──────────────────────────────────────────────────────────────── */
function ConfirmarModal({
  gif,
  alt,
  heading,
  mensaje,
  textoConfirmar,
  textoCancelar,
  onConfirmar,
  onCancelar,
}: {
  gif: string
  alt: string
  heading: string
  mensaje?: string
  textoConfirmar: string
  textoCancelar: string
  onConfirmar: () => void
  onCancelar: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancelar])

  return createPortal(
    <div
      className="lightbox-overlay fixed inset-0 z-[110] bg-stone-900/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <div
        className="lightbox-img bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={gif} alt={alt} className="w-40 mx-auto rounded-2xl" />
        <h3 className="font-serif italic text-2xl text-stone-800 mt-4 leading-tight">{heading}</h3>
        {mensaje && <p className="text-sm text-stone-500 mt-1">{mensaje}</p>}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={onConfirmar}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200 transition-colors"
          >
            {textoConfirmar}
          </button>
          <button
            onClick={onCancelar}
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
          >
            {textoCancelar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function PolaroidMini({
  url,
  indice,
  puedeEliminar,
  onEliminar,
  onAbrir,
}: {
  url: string
  indice: number
  puedeEliminar: boolean
  onEliminar: () => void
  onAbrir: () => void
}) {
  return (
    <div
      className="polaroid !p-2 !pb-3 group relative hover:!scale-[1.03] hover:!rotate-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-lg"
      style={{ transform: `rotate(${ROTACIONES[indice % ROTACIONES.length]})` }}
      onClick={onAbrir}
      onKeyDown={(e) => e.key === 'Enter' && onAbrir()}
      tabIndex={0}
      role="button"
      aria-label={`Ver recuerdo ${indice + 1} en grande`}
    >
      <div className="polaroid-foto relative overflow-hidden rounded-sm">
        <img
          src={url}
          alt="Recuerdo del plan"
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        {puedeEliminar && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEliminar()
            }}
            title="Quitar foto"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-rose-500 shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
      <p className="text-center font-hand text-base text-stone-400 pt-1.5 leading-none">
        #{indice + 1}
      </p>
    </div>
  )
}

export default function DateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [date, setDate] = useState<DateItem | null | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [cambiandoPortada, setCambiandoPortada] = useState(false)
  const [fotoAEliminar, setFotoAEliminar] = useState<string | null>(null)
  const [confirmarPlan, setConfirmarPlan] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    return subscribeToDate(id, setDate, (err) => {
      console.error(err)
      setError('No se pudo conectar con Firebase. Revisa tu configuración en .env')
    })
  }, [id])

  // Lock del scroll cuando la lightbox está abierta
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightbox])

  const navegarLightbox = useCallback((i: number) => setLightbox(i), [])

  if (date === undefined) {
    return (
      <p className="min-h-screen grid place-items-center font-hand text-2xl text-stone-400">
        abriendo el recuerdo...
      </p>
    )
  }

  if (date === null) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center">
        <div>
          <p className="text-5xl">🥀</p>
          <p className="font-serif italic text-2xl text-stone-500 mt-3">Este plan ya no existe</p>
          <button
            onClick={() => navigate('/planner')}
            className="mt-5 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full transition-colors"
          >
            Volver al planificador
          </button>
        </div>
      </div>
    )
  }

  const completada = date.estado === 'completada'

  // Galería para el lightbox: portada + fotos del álbum
  const galeria = date.portadaURL ? [date.portadaURL, ...date.fotos] : date.fotos

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    setError(null)
    try {
      await addPhoto(id, file)
    } catch (err) {
      console.error(err)
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onRemove = async (url: string) => {
    if (!id) return
    try {
      await removePhoto(id, url)
    } catch (err) {
      console.error(err)
      setError('No se pudo quitar la foto. Intenta de nuevo.')
    }
  }

  const onDelete = async () => {
    if (!id) return
    await deleteDate(id)
    navigate('/planner')
  }

  const onCambiarPortada = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setCambiandoPortada(true)
    try {
      await updatePortada(id, file)
    } catch (err) {
      console.error(err)
      setError('No se pudo cambiar la portada. Intenta de nuevo.')
    } finally {
      setCambiandoPortada(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 pt-24 pb-16">
      {/* Lightbox */}
      {lightbox !== null && galeria.length > 0 && (
        <Lightbox
          fotos={galeria}
          indice={Math.min(lightbox, galeria.length - 1)}
          onCerrar={() => setLightbox(null)}
          onNavegar={navegarLightbox}
        />
      )}

      {/* Barra superior */}
      <nav className="mb-8">
        <Link
          to="/planner"
          className="text-sm px-4 py-2 rounded-full bg-white/90 border border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-rose-400 transition-colors"
        >
          ← Planificador
        </Link>
      </nav>

      {/* Encabezado propio: info a la izquierda (protagonista), polaroid a la derecha */}
      <header className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10 items-center">
        {/* Texto de la date — 3/5 del ancho, protagonista */}
        <div className="md:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full ${
              completada
                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {completada ? 'plan completado' : 'plan pendiente'}
          </span>
            {date.categoria && (
              <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">
                ✨ {date.categoria}
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 leading-tight mt-4">
            {date.titulo}
          </h1>

          {date.lugar && <p className="text-lg text-rose-500 mt-2">📍 {date.lugar}</p>}

          {date.descripcion && (
            <p className="font-serif italic text-xl text-stone-600 mt-4 leading-relaxed">
              “{date.descripcion}”
            </p>
          )}

          {date.fechaPlaneada && (
            <p className="font-hand text-2xl md:text-3xl text-rose-400 mt-5 leading-none">
              nos vamos el {fmt(date.fechaPlaneada)} 🌷
            </p>
          )}

          {!completada && (
            <button
              onClick={() => date && marcarVivido(date.id)}
              className="mt-6 inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 text-white font-semibold rounded-full shadow-lg shadow-rose-200 transition-all"
            >
              Marcar como completado
            </button>
          )}
        </div>

        {/* Polaroid de portada — compacta, 2/5 del ancho */}
        <div className="md:col-span-2">
          <article
            className="polaroid relative max-w-xs sm:max-w-sm mx-auto md:mx-0 md:-rotate-1 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-4 rounded-lg"
            style={{ '--washi-rot': '-4deg' } as React.CSSProperties}
            onClick={() => setLightbox(0)}
            onKeyDown={(e) => e.key === 'Enter' && setLightbox(0)}
            tabIndex={0}
            role="button"
            aria-label="Ver la portada en grande"
          >
          <span
            className="washi -top-3 left-1/2 -translate-x-1/2"
            style={{ transform: 'rotate(-4deg)' }}
          />

          <div className="polaroid-foto relative overflow-hidden rounded-sm bg-rose-50">
            {date.portadaURL ? (
              <img
                src={date.portadaURL}
                alt={date.titulo}
                className="w-full h-auto max-h-[300px] object-contain"
              />
            ) : (
              <div className="w-full h-40 sm:h-44 grid place-items-center text-6xl">🌷</div>
            )}

          {completada ? (
            <span
              className="sello -bottom-3 -right-2 w-20 h-20 text-[11px] rotate-[12deg]"
              style={{ backgroundColor: 'rgba(225, 29, 72, 0.92)' }}
            >
              completado
            </span>
          ) : (
            <span
              className="sello -bottom-3 -right-2 w-20 h-20 text-[11px] rotate-[-10deg]"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.9)' }}
            >
              pendiente
            </span>
          )}
          </div>

          <p className="text-center font-hand text-2xl text-rose-400 -rotate-2 pt-3 pb-1 leading-none">
            ✿ Propuesta ✿
          </p>

          {/* Cambiar portada */}
          <label
            className={`block text-center cursor-pointer font-hand text-lg text-stone-400 hover:text-rose-400 underline underline-offset-4 transition-colors pb-2 ${
              cambiandoPortada ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {cambiandoPortada ? 'cambiando portada...' : 'cambiar portada 🖼️'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onCambiarPortada}
              disabled={cambiandoPortada}
            />
          </label>
          </article>
        </div>
      </header>

      {/* Álbum de recuerdos */}
      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-serif italic text-2xl md:text-3xl text-stone-700">
              Recuerdos de este plan
            </h2>
            <p className="font-hand text-lg text-rose-400 -mt-1">
              {date.fotos.length === 0
                ? 'todavía sin fotos'
                : `${date.fotos.length} ${date.fotos.length === 1 ? 'momento guardado' : 'momentos guardados'} 📷`}
            </p>
          </div>

          {completada ? (
            <label
              className={`cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
                uploading
                  ? 'bg-stone-100 text-stone-400 pointer-events-none'
                  : 'bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 text-white shadow-lg shadow-rose-200'
              }`}
            >
              {uploading ? 'Subiendo...' : 'Agregar recuerdo 📷'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
            </label>
          ) : null}
        </div>

        {error && (
          <p className="mb-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl p-3">
            {error}
          </p>
        )}

        {date.fotos.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-rose-200 bg-white/60 p-10 text-center">
            <p className="text-5xl animate-float">📷</p>
            <p className="font-hand text-xl text-stone-400 mt-3">
              {completada
                ? 'aún no hay recuerdos... ¡sube la primera foto!'
                : 'cuando este plan se realice, aquí guardarán sus recuerdos 🌷'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-7">
            {date.fotos.map((url, i) => (
              <PolaroidMini
                key={url}
                url={url}
                indice={i}
                puedeEliminar={completada}
                onEliminar={() => setFotoAEliminar(url)}
                onAbrir={() => setLightbox(date.portadaURL ? i + 1 : i)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-14 text-center">
        <button
          onClick={() => setConfirmarPlan(true)}
          className="font-hand text-lg text-stone-300 hover:text-rose-400 underline underline-offset-4 transition-colors"
        >
          eliminar este plan
        </button>
      </div>

      {/* Confirmación: quitar una foto del álbum */}
      {fotoAEliminar && (
        <ConfirmarModal
          gif="/gif/Bad-day.gif"
          alt="Un día malo por perder una foto"
          heading="¿Estás segura de eliminar esta fotografía?"
          textoConfirmar="Sí"
          textoCancelar="No"
          onConfirmar={() => {
            onRemove(fotoAEliminar)
            setFotoAEliminar(null)
          }}
          onCancelar={() => setFotoAEliminar(null)}
        />
      )}

      {/* Confirmación: eliminar el plan entero */}
      {confirmarPlan && (
        <ConfirmarModal
          gif="/gif/como-que-no.gif"
          alt="¿Seguro que quieres eliminar el plan?"
          heading={`¿Eliminar “${date.titulo}”?`}
          mensaje="Estás a punto de eliminar este plan, ojalá vengan mejores :D"
          textoConfirmar="Sí, eliminar"
          textoCancelar="Mejor no"
          onConfirmar={onDelete}
          onCancelar={() => setConfirmarPlan(false)}
        />
      )}
    </div>
  )
}
