import { useState, useEffect, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import type { DateItem } from '../types'
import { setDatePlaneada, deleteDate } from '../services/dates'

function fmt(ts: Timestamp | null) {
  if (!ts) return null
  return ts.toDate().toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function fmtManuscrita(ts: Timestamp | null) {
  if (!ts) return null
  return ts.toDate().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })
}

function toInputValue(ts: Timestamp | null) {
  if (!ts) return ''
  const d = ts.toDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ────────────────────────────────────────────────────────────────
   Modal de confirmación — para no borrar un plan sin querer.
   Se renderiza con portal a document.body: si viviera dentro de la
   card, el transform (rotación/hover) convertiría el fixed del
   overlay en relativo a la card y se vería recortado.
   ──────────────────────────────────────────────────────────────── */
function ConfirmarEliminar({
  titulo,
  onConfirmar,
  onCancelar,
}: {
  titulo: string
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
      className="lightbox-overlay fixed inset-0 z-[100] bg-stone-900/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <div
        className="lightbox-img bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/gif/como-que-no.gif"
          alt="¿Seguro que quieres eliminar?"
          className="w-40 mx-auto rounded-2xl"
        />
        <h3 className="font-serif italic text-2xl text-stone-800 mt-4 leading-tight">
          ¿Eliminar “{titulo}”?
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          Estás a punto de eliminar este plan, ojalá vengan mejores :D
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={onConfirmar}
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200 transition-colors"
          >
            Sí, eliminar
          </button>
          <button
            onClick={onCancelar}
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Mejor no
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ────────────────────────────────────────────────────────────────
   Polaroid — card exclusiva de los recuerdos vividos (completados)
   ──────────────────────────────────────────────────────────────── */
function PolaroidCard({ item, indice }: { item: DateItem; indice: number }) {
  const navigate = useNavigate()
  const [confirmar, setConfirmar] = useState(false)
  const rot = indice % 2 === 0 ? '-rotate-2' : 'rotate-2'
  const washiRot = indice % 2 === 0 ? '-5deg' : '5deg'

  return (
    <article
      className={`polaroid ${rot} hover:!rotate-0 relative mt-2`}
      style={{ '--washi-rot': washiRot } as React.CSSProperties}
    >
      {/* Cinta washi */}
      <span
        className="washi -top-3 left-1/2 -translate-x-1/2"
        style={{ transform: `rotate(${washiRot})` }}
      />

      {/* Foto */}
      <div className="polaroid-foto relative overflow-hidden rounded-sm">
        {item.portadaURL ? (
          <img
            src={item.portadaURL}
            alt={item.titulo}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-40 grid place-items-center text-5xl bg-rose-50">🌷</div>
        )}

        {/* Sello Completado */}
        <span
          className="sello -bottom-3 -left-2 w-16 h-16 text-[9px] rotate-[-14deg]"
          style={{ backgroundColor: 'rgba(225, 29, 72, 0.92)' }}
        >
          completado
        </span>
      </div>

      {/* Pie de la polaroid */}
      <div className="polaroid-caption pt-4 pb-1 px-1 text-center">
        {item.categoria && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500 mb-1">
            ✨ {item.categoria}
          </p>
        )}
        <h3 className="font-serif text-xl md:text-2xl text-stone-800 leading-tight">
          {item.titulo}
        </h3>

        {item.lugar && <p className="text-sm text-rose-500 mt-0.5 truncate">📍 {item.lugar}</p>}

        {/* Anotación manuscrita, como en una foto impresa */}
        {item.fechaPlaneada && (
          <p className="mt-1 text-lg md:text-xl text-rose-400 leading-none">
            <span className="font-hand">lo vivimos el {fmtManuscrita(item.fechaPlaneada)} ♥</span>
          </p>
        )}

        <p className="text-xs text-stone-400 mt-2">
          📷 {item.fotos.length} {item.fotos.length === 1 ? 'recuerdo' : 'recuerdos'}
        </p>

        <button
          onClick={() => navigate(`/date/${item.id}`)}
          className="mt-3 w-full text-sm font-semibold px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200/70 transition-colors"
        >
          Ver álbum
        </button>
      </div>

      <button
        onClick={() => setConfirmar(true)}
        className="absolute bottom-3 left-3 text-[11px] text-stone-300 hover:text-rose-400 transition-colors"
      >
        eliminar
      </button>

      {confirmar && (
        <ConfirmarEliminar
          titulo={item.titulo}
          onConfirmar={() => deleteDate(item.id)}
          onCancelar={() => setConfirmar(false)}
        />
      )}
    </article>
  )
}

/* ────────────────────────────────────────────────────────────────
   Card estándar — planes por vivir (pendientes)
   ──────────────────────────────────────────────────────────────── */
export default function DateCard({ item, indice = 0 }: { item: DateItem; indice?: number }) {
  const [editMode, setEditMode] = useState(false)
  const [fechaInput, setFechaInput] = useState(toInputValue(item.fechaPlaneada))
  const [confirmar, setConfirmar] = useState(false)
  const navigate = useNavigate()
  const completada = item.estado === 'completada'

  const onPickDate = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFechaInput(value)
    await setDatePlaneada(item.id, value ? new Date(`${value}T12:00:00`) : null)
  }

  if (completada) {
    return <PolaroidCard item={item} indice={indice} />
  }

  return (
    <article className="group rounded-3xl border shadow-sm hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-0.5 transition-all overflow-hidden bg-white/90 border-rose-100">
      {/* Portada con badge sobre la imagen */}
      <div className="relative">
        {item.portadaURL ? (
          <img
            src={item.portadaURL}
            alt={item.titulo}
            className="w-full h-40 md:h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-28 md:h-32 grid place-items-center text-4xl bg-rose-50">🌷</div>
        )}
        <span className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm bg-white/90 text-amber-700 shadow-sm">
          ⏳ Pendiente
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4 md:p-5">
        <h3 className="font-serif text-xl md:text-2xl text-stone-800 leading-tight">{item.titulo}</h3>
        <div className="flex items-center gap-2 mt-1">
          {item.lugar && <p className="text-sm text-rose-500 truncate">📍 {item.lugar}</p>}
          {item.categoria && (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">
              ✨ {item.categoria}
            </span>
          )}
        </div>

        {/* Fecha */}
        <div className="mt-3">
          {editMode ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={fechaInput}
                onChange={onPickDate}
                className="px-3 py-2 rounded-xl bg-white border border-rose-200 outline-none focus:border-rose-400 text-sm"
              />
              <button
                onClick={() => setEditMode(false)}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium"
              >
                Listo
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-1.5 text-xs md:text-sm px-3.5 py-2 rounded-full bg-rose-100/70 hover:bg-rose-100 text-rose-600 transition-colors"
            >
              🗓️ {item.fechaPlaneada ? fmt(item.fechaPlaneada) : 'Elegir la fecha para ir'}
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/date/${item.id}`)}
            className="text-sm font-semibold px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200 transition-colors"
          >
            Ver detalle
          </button>
          <button
            onClick={() => setConfirmar(true)}
            className="text-xs text-stone-300 hover:text-rose-400 ml-auto px-2 py-2 transition-colors"
          >
            eliminar
          </button>
        </div>
      </div>

      {confirmar && (
        <ConfirmarEliminar
          titulo={item.titulo}
          onConfirmar={() => deleteDate(item.id)}
          onCancelar={() => setConfirmar(false)}
        />
      )}
    </article>
  )
}
