import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { createDate } from '../services/dates'

const CATEGORIAS: Array<{ nombre: string; emoji: string }> = [
  { nombre: 'Comida', emoji: '🍜' },
  { nombre: 'Arte', emoji: '🎨' },
  { nombre: 'Cine', emoji: '🎬' },
  { nombre: 'Café', emoji: '☕' },
  { nombre: 'Naturaleza', emoji: '🌿' },
  { nombre: 'Iglesia', emoji: '⛪' },
  { nombre: 'Juegos', emoji: '🎲' },
  { nombre: 'Tour', emoji: '🗺️' },
]

const CHECKS = [
  'REVISANDO AGENDA',
  'COORDINANDO PERMISOS',
  'PENSANDO MEMES U STICKERS',
  'PREPARANDO OUTFIT',
  'LIMPIANDO LA CÁMARA PARA LAS PICS',
]

type Fase = 'form' | 'checklist' | 'confirmado' | 'revisando' | 'pago'

const inputCls =
  'w-full px-4 py-3.5 text-lg rounded-2xl bg-white border border-rose-100 focus:border-rose-300 focus:shadow-[0_4px_16px_-4px_rgba(244,63,94,0.15)] outline-none transition placeholder:text-stone-300'
const btnBack =
  'px-6 py-3 rounded-full bg-white/90 border border-stone-200 text-stone-400 hover:bg-stone-50 text-base font-medium transition-colors'
const btnNext =
  'px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 text-white text-base font-semibold shadow-lg shadow-rose-200 transition-all disabled:opacity-40 disabled:hover:translate-y-0'

/* ── Pantalla de checklist de espera ── */
function Checklist({ checked, error, onReintentar }: { checked: number; error: string | null; onReintentar: () => void }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <img src="/gif/mabel-tiempo-espera.gif" alt="Esperando con ansias" className="w-56 mx-auto rounded-2xl" />
      <h2 className="font-serif italic text-3xl md:text-4xl text-rose-600 mt-4">PROCESANDO...</h2>
      <p className="font-hand text-2xl text-stone-500 mt-2 leading-snug">
        “no sé qué poner, como es un formulario abierto no puedo intuir los planes
        JAJAJAJAJA, pero primero Dios podamos ir” 😂
      </p>

      <div className="mt-6 bg-white/80 backdrop-blur rounded-3xl border border-rose-100 p-5 text-left space-y-3">
        {CHECKS.map((tarea, i) => (
          <div key={tarea} className="flex items-center gap-3">
            <span
              className={`grid place-items-center w-6 h-6 rounded-full border-2 text-xs font-bold transition-all ${
                i < checked
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-stone-200 text-transparent'
              }`}
            >
              ✓
            </span>
            <span
              className={`text-base font-semibold tracking-wide transition-colors ${
                i < checked ? 'text-green-700' : 'text-stone-300'
              }`}
            >
              {tarea}
            </span>
            {i === checked && <span className="ml-auto animate-pulse text-rose-400">•••</span>}
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl p-3">{error}</p>
      )}
      {error && (
        <button onClick={onReintentar} className="mt-3 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full transition-colors">
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

/* ── Pantalla de confirmación ── */
function Confirmado({ onVerDetalles }: { onVerDetalles: () => void }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <img src="/gif/working.gif" alt="Plan guardado" className="w-56 mx-auto rounded-2xl" />
      <h2 className="font-serif italic text-3xl md:text-4xl text-rose-600 mt-4">
        ¡Plan guardado! 🌷
      </h2>
      <p className="font-hand text-xl text-stone-500 mt-1">
        ya está en nuestros planes... y en la agenda del destino
      </p>
      <button
        onClick={onVerDetalles}
        className="mt-6 px-8 py-3.5 bg-rose-500 hover:bg-rose-600 hover:-translate-y-0.5 text-white font-semibold rounded-full shadow-lg shadow-rose-200 transition-all"
      >
        VER DETALLES ♥
      </button>
    </div>
  )
}

/* ── Interstitial: pasarela cargando ── */
function Revisando() {
  return (
    <div className="text-center max-w-md mx-auto">
      <img src="/gif/como-que-no.gif" alt="¿Cómo que no?" className="w-64 mx-auto rounded-2xl" />
      <p className="font-hand text-2xl text-stone-500 mt-3">cargando pasarela de pago...</p>
    </div>
  )
}

/* ── Iconos de marca (broma) ── */
function VisaIcon() {
  return (
    <span className="font-serif italic font-bold text-lg tracking-tight" style={{ color: '#1a1f71' }}>
      VISA
    </span>
  )
}

function MastercardIcon() {
  return (
    <svg width="34" height="22" viewBox="0 0 48 30" aria-label="Mastercard">
      <circle cx="18" cy="15" r="11" fill="#eb001b" />
      <circle cx="30" cy="15" r="11" fill="#f79e1b" opacity="0.92" />
    </svg>
  )
}

/* ── Pasarela de pago falsa ── */
function PagoFalso({ onEsBroma }: { onEsBroma: () => void }) {
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [venc, setVenc] = useState('')
  const [cvv, setCvv] = useState('')
  const [pagando, setPagando] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pagando) return
    setPagando(true)
    // Hace de todo... menos cobrar 😌
    setTimeout(() => {
      setPagando(false)
      onEsBroma()
    }, 2200)
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-serif italic text-3xl md:text-4xl text-rose-600 mt-3">
        Pasarela de pago 🔒
      </h2>

      {/* Tarjeta visual en vivo */}
      <div
        className="relative mt-6 rounded-2xl p-5 text-left text-white overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(120deg, #9f1239, #be185d 45%, #a855f7)' }}
      >
        <div className="flex items-center justify-between">
          <span className="w-10 h-7 rounded-md bg-amber-300/90 shadow-inner" />
          <span className="flex items-center gap-1.5 bg-white/15 rounded-full px-2 py-1">
            <MastercardIcon />
            <VisaIcon />
          </span>
        </div>
        <p className="font-mono text-xl md:text-2xl tracking-[0.18em] mt-5 drop-shadow">
          {numeroFormateado(numero) || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between mt-4 text-[11px] uppercase tracking-wider text-white/80">
          <span className="truncate max-w-[55%]">{nombre || 'NOMBRE DEL TITULAR'}</span>
          <span>{venc || 'MM/AA'}</span>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 bg-white/85 backdrop-blur rounded-3xl border border-rose-100 p-5 md:p-6 space-y-4">
        <div className="text-left">
          <label className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
            Número de tarjeta
          </label>
          <input
            className={`${inputCls} font-mono tracking-widest`}
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={numeroFormateado(numero)}
            onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 16))}
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
            Nombre del titular
          </label>
          <input
            className={inputCls}
            placeholder="Como aparece en la tarjeta"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-left">
            <label className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Vencimiento
            </label>
            <input
              className={inputCls}
              placeholder="MM/AA"
              maxLength={5}
              value={venc}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                setVenc(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v)
              }}
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              CVV
            </label>
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={3}
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pagando || numero.length < 12 || !nombre.trim() || venc.length < 4 || cvv.length < 3}
          className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 disabled:opacity-50 text-white font-semibold rounded-full shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
        >
          {pagando ? 'Procesando pago falso...' : `Pagar $0.00 ♥`}
        </button>

        <p className="text-[11px] text-stone-400">
          🔒 Conexión falsamente segura · tus datos no van a ningún lado
        </p>
      </form>

      <button
        onClick={onEsBroma}
        className="mt-6 font-hand text-3xl text-rose-500 hover:text-rose-600 hover:scale-105 transition-all underline decoration-wavy underline-offset-8"
      >
        ES BROMAAAA - Click aqui
      </button>
      <img src="/gif/risa.gif" alt="JAJAJA" className="w-40 mx-auto rounded-2xl mt-5" />
    </div>
  )
}

function numeroFormateado(v: string) {
  return v.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/* ── Wizard principal ── */
export default function NewDate() {
  const [fase, setFase] = useState<Fase>('form')
  const [paso, setPaso] = useState(0)
  const [categoria, setCategoria] = useState('')
  const [nombre, setNombre] = useState('')
  const [lugar, setLugar] = useState('')
  const [fecha, setFecha] = useState('')
  const [notas, setNotas] = useState('')
  const [portada, setPortada] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [checked, setChecked] = useState(0)
  const [dateId, setDateId] = useState<string | null>(null)
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [intentos, setIntentos] = useState(0)
  const creadoRef = useRef(false)
  const navigate = useNavigate()

  const pasoValido =
    (paso === 0 && categoria !== '') ||
    (paso === 1 && lugar.trim() !== '') ||
    paso === 2 ||
    paso === 3 ||
    paso === 4

  // Checklist: los checks van apareciendo uno a uno
  useEffect(() => {
    if (fase !== 'checklist') return
    const timers: number[] = []
    for (let i = 1; i <= CHECKS.length; i++) {
      timers.push(window.setTimeout(() => setChecked(i), i * 750))
    }
    return () => timers.forEach((t) => clearTimeout(t))
  }, [fase])

  // Cuando terminan los checks y el plan existe → confirmación
  useEffect(() => {
    if (fase === 'checklist' && checked === CHECKS.length && dateId) {
      const t = setTimeout(() => setFase('confirmado'), 500)
      return () => clearTimeout(t)
    }
  }, [fase, checked, dateId])

  // Interstitial revisando → pasarela de pago
  useEffect(() => {
    if (fase !== 'revisando') return
    const t = setTimeout(() => setFase('pago'), 1600)
    return () => clearTimeout(t)
  }, [fase])

  // Creación real del plan (ocurre detrás del checklist)
  useEffect(() => {
    if (fase !== 'checklist' || creadoRef.current) return
    creadoRef.current = true
    ;(async () => {
      try {
        const ref = await createDate(
          {
            categoria,
            titulo: nombre.trim() || categoria,
            lugar: lugar.trim(),
            descripcion: notas.trim(),
            fechaPlaneada: fecha ? Timestamp.fromDate(new Date(`${fecha}T12:00:00`)) : null,
            estado: 'pendiente',
          },
          portada,
        )
        setDateId(ref.id)
      } catch (err) {
        console.error(err)
        setErrorCrear('Ups, algo se trabó creando el plan. Revisa la conexión e intenta de nuevo.')
        creadoRef.current = false
      }
    })()
  }, [fase, categoria, nombre, lugar, fecha, notas, portada, intentos])

  const siguiente = () => setPaso((p) => Math.min(4, p + 1))
  const atras = () => setPaso((p) => Math.max(0, p - 1))

  const onPortadaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPortada(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const irAlDetalle = () => {
    if (dateId) navigate(`/date/${dateId}`)
  }

  /* ── Pantallas de fase ── */
  if (fase === 'checklist') {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 pt-24 pb-10">
        <Checklist
          checked={checked}
          error={errorCrear}
          onReintentar={() => {
            setErrorCrear(null)
            creadoRef.current = false
            setChecked(0)
            setIntentos((i) => i + 1)
          }}
        />
      </div>
    )
  }

  if (fase === 'confirmado') {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 pt-24 pb-10">
        <Confirmado onVerDetalles={() => setFase('revisando')} />
      </div>
    )
  }

  if (fase === 'revisando') {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <Revisando />
      </div>
    )
  }

  if (fase === 'pago') {
    return (
      <div className="min-h-screen max-w-lg mx-auto px-4 pt-24 pb-10">
        <PagoFalso onEsBroma={irAlDetalle} />
      </div>
    )
  }

  /* ── Wizard: pasos 1-5 ── */
  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 pt-24 pb-10">
      <nav className="mb-6">
        <Link
          to="/planner"
          className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-white/90 border border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-rose-400 transition-colors"
        >
          ← Ver nuestros planes
        </Link>
      </nav>

      <header className="text-center mb-6">
        <h1 className="font-serif italic text-5xl md:text-6xl text-rose-600">Proponer una salida</h1>
        <p className="text-stone-500 mt-2 text-sm">paso a paso, con calma y con amor</p>
      </header>

      {/* Progreso con tulipanes */}
      <div className="flex justify-center gap-2 mb-6" aria-label={`Paso ${paso + 1} de 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`w-10 h-2.5 rounded-full transition-colors ${
              i <= paso ? 'bg-rose-400' : 'bg-rose-100'
            }`}
          />
        ))}
      </div>

      {/* Paso 1: categoría */}
      {paso === 0 && (
        <section className="animate-fade-in bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-rose-100/60 border border-rose-100 p-5 md:p-7">
          <img src="/gif/uwu.gif" alt="uwu" className="w-40 mx-auto rounded-2xl" />
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 text-center mt-4">
            ¿Qué clase de tripsito es?
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.nombre}
                onClick={() => setCategoria(cat.nombre)}
                className={`px-5 py-3 rounded-full text-base font-semibold border transition-all ${
                  categoria === cat.nombre
                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200 -translate-y-0.5'
                    : 'bg-white border-rose-200 text-stone-600 hover:bg-rose-50 hover:border-rose-300'
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <label htmlFor="nombrePlan" className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              ¿Cómo le llamamos? (opcional)
            </label>
            <input
              id="nombrePlan"
              className={inputCls}
              placeholder="Ej. Cena japonesa con Nami"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
            />
            {categoria && !nombre.trim() && (
              <p className="font-hand text-xl text-stone-400 mt-2">
                se llamará “{categoria}” si no le pones nombre
              </p>
            )}
          </div>
        </section>
      )}

      {/* Paso 2: lugar */}
      {paso === 1 && (
        <section className="animate-fade-in bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-rose-100/60 border border-rose-100 p-5 md:p-7">
          <img src="/gif/cargando.gif" alt="Cargando" className="w-40 mx-auto rounded-2xl" />
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 text-center mt-4">
            ¿Pa’ donde vamos?
          </h2>
          <div className="mt-5">
            <label htmlFor="lugar" className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Lugar 📍
            </label>
            <input
              id="lugar"
              className={inputCls}
              placeholder="Restaurante La Terraza"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              maxLength={80}
            />
          </div>
        </section>
      )}

      {/* Paso 3: fecha */}
      {paso === 2 && (
        <section className="animate-fade-in bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-rose-100/60 border border-rose-100 p-5 md:p-7">
          <img src="/gif/Revisando-fecha.gif" alt="Revisando la agenda" className="w-40 mx-auto rounded-2xl" />
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 text-center mt-4">
            ¿Pa’ cuando la carnita asada puesss?
          </h2>
          <p className="font-hand text-xl text-stone-400 text-center mt-1">opcional, si la fecha ya es segura</p>
          <div className="mt-5">
            <label htmlFor="fecha" className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Fecha 🗓️
            </label>
            <input
              id="fecha"
              type="date"
              className={`${inputCls} text-center`}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            {fecha && (
              <button
                onClick={() => setFecha('')}
                className="mt-2 text-xs text-stone-400 hover:text-rose-400 underline underline-offset-2"
              >
                quitar fecha
              </button>
            )}
          </div>
        </section>
      )}

      {/* Paso 4: notas */}
      {paso === 3 && (
        <section className="animate-fade-in bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-rose-100/60 border border-rose-100 p-5 md:p-7">
          <img src="/gif/aura.gif" alt="Aura" className="w-40 mx-auto rounded-2xl" />
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 text-center mt-4">
            ¿Algo que deba saber?
          </h2>
          <p className="font-hand text-xl text-stone-400 text-center mt-1">opcional, pero un buen aura nunca sobra</p>
          <div className="mt-5">
            <label htmlFor="notas" className="block text-sm font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Notas ✍️
            </label>
            <textarea
              id="notas"
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Chambrecitoo, restricción, código"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={300}
            />
          </div>
        </section>
      )}

      {/* Paso 5: portada */}
      {paso === 4 && (
        <section className="animate-fade-in bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-rose-100/60 border border-rose-100 p-5 md:p-7">
          <img src="/gif/uwu.gif" alt="uwu" className="w-40 mx-auto rounded-2xl" />
          <h2 className="font-serif italic text-3xl md:text-4xl text-stone-800 text-center mt-4">
            ¿Con qué portada lo guardamos?
          </h2>
          <p className="font-hand text-xl text-stone-400 text-center mt-1">
            foto o GIF — si no eliges, será un ticket de cortesía 🎟️
          </p>

          {preview ? (
            <div className="relative mt-5 rounded-2xl overflow-hidden border border-rose-100">
              <img src={preview} alt="Portada elegida" className="w-full h-40 sm:h-48 object-cover" />
              <label className="absolute inset-0 grid place-items-end justify-end p-2 cursor-pointer">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-rose-500 shadow transition-colors">
                  Cambiar
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPortadaChange}
                />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1 mt-5 w-full h-28 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 hover:bg-rose-50 cursor-pointer transition-colors">
              <span className="text-3xl">🖼️</span>
              <span className="text-xs text-stone-400">Elige la portada del plan (opcional)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPortadaChange}
              />
            </label>
          )}

          <button
            onClick={() => setFase('checklist')}
            className="w-full mt-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-lg shadow-rose-200 transition-colors"
          >
            ¡Listo, agendemos! 🌷
          </button>
        </section>
      )}

      {/* Navegación entre pasos */}
      {paso < 4 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={atras}
            disabled={paso === 0}
            className={`${btnBack} ${paso === 0 ? 'invisible' : ''}`}
          >
            ← Atrás
          </button>
          <button onClick={siguiente} disabled={!pasoValido} className={btnNext}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
