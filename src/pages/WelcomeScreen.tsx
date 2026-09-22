import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useNavigate } from 'react-router-dom'
import { gardenColors as c } from '../theme/garden'
import NavBar from '../components/NavBar'

gsap.registerPlugin(DrawSVGPlugin, useGSAP)

const TITULO = 'Feliz 21 de septiembre'
const SUBTITULO =
  'Que bendición coincidir con alguien que ame la creación y que se fije en los detalles por más pequeño que sean, como una mariquita.'

const PETALOS_FLOTANTES = Array.from({ length: 10 }, (_, i) => ({
  left: `${6 + i * 9.5}%`,
  delay: i * 0.7,
  dur: 7 + (i % 4),
  size: 10 + (i % 3) * 5,
  color: [c.peoniaClara, c.violetaPetalo, c.cieloCeleste][i % 3],
}))

const SPARKLES = Array.from({ length: 7 }, (_, i) => ({
  left: `${10 + i * 13}%`,
  top: `${12 + (i % 3) * 14}%`,
  delay: i * 0.4,
  size: 8 + (i % 3) * 6,
}))

function Tulipan({
  x,
  y,
  escala,
  principal,
  cuerpo,
  centro,
  brillo,
}: {
  x: number
  y: number
  escala: number
  principal: boolean
  cuerpo?: string
  centro?: string
  brillo?: string
}) {
  const fillCuerpo = cuerpo ?? (principal ? c.tulipanAmarillo : c.tulipanAmarilloClaro)
  const fillCentro = centro ?? (principal ? c.tulipanAmarilloOscuro : c.tulipanAmarillo)
  const fillBrillo = brillo ?? c.tulipanAmarilloBrillo
  return (
    <g className="tulipan" transform={`translate(${x} ${y}) scale(${escala})`}>
      <path
        className="tallo"
        d="M0 0 C -4 -50, 4 -110, 0 -150"
        stroke={c.tallo}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="hoja"
        d="M0 -35 C 25 -45, 45 -42, 58 -68 C 30 -68, 12 -55, 0 -35 Z"
        fill={c.hoja}
      />
      <path
        className="hoja"
        d="M0 -55 C -25 -65, -45 -62, -58 -88 C -30 -88, -12 -75, 0 -55 Z"
        fill={c.hojaOscura}
      />
      {/* Capullo cerrado (huevo) */}
      <path
        className="capullo"
        fill={fillCuerpo}
        d="M0 -205 C 14 -198, 22 -184, 21 -168 C 20 -156, 11 -149, 0 -148 C -11 -149, -20 -156, -21 -168 C -22 -184, -14 -198, 0 -205 Z"
      />
      {/* Flor abierta: copa con puntas hacia arriba */}
      <g className="flor">
        <path
          className="copa"
          fill={fillCuerpo}
          d="M0 -150
             C -18 -150, -30 -164, -30 -188
             C -30 -208, -24 -222, -17 -226
             C -12 -218, -6 -210, 0 -208
             C 6 -210, 12 -218, 17 -226
             C 24 -222, 30 -208, 30 -188
             C 30 -164, 18 -150, 0 -150 Z"
        />
        <path
          className="petalo-centro"
          fill={fillCentro}
          d="M0 -232 C 9 -227, 13 -214, 12 -190 C 11 -172, 6 -158, 0 -152 C -6 -158, -11 -172, -12 -190 C -13 -214, -9 -227, 0 -232 Z"
        />
        <path
          className="brillo"
          fill={fillBrillo}
          opacity="0.55"
          d="M-8 -222 C -11 -210, -12 -194, -9 -178 C -12 -194, -12 -210, -8 -222 Z"
        />
      </g>
    </g>
  )
}

function Peonia({ x, y, escala }: { x: number; y: number; escala: number }) {
  return (
    <g className="peonia" transform={`translate(${x} ${y}) scale(${escala})`}>
      <path
        className="tallo"
        d="M0 0 C -5 -48, 5 -95, 0 -138"
        stroke={c.tallo}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path className="hoja" d="M0 -30 C 22 -40, 38 -38, 50 -60 C 27 -60, 10 -48, 0 -30 Z" fill={c.hoja} />
      <path className="hoja" d="M0 -48 C -22 -58, -38 -56, -50 -78 C -27 -78, -10 -66, 0 -48 Z" fill={c.hojaOscura} />
      {/* Capullo pequeño */}
      <circle className="capullo" cx="0" cy="-140" r="16" fill={c.peoniaOscura} />
      {/* Flor: capas de pétalos redondos */}
      <g className="flor" transform="translate(0 -140)">
        {[0, 60, 120, 180, 240, 300].map((ang) => (
          <ellipse
            key={`a${ang}`}
            rx="15"
            ry="25"
            cx="0"
            cy="-22"
            fill={c.peoniaOscura}
            transform={`rotate(${ang})`}
          />
        ))}
        {[30, 90, 150, 210, 270, 330].map((ang) => (
          <ellipse
            key={`b${ang}`}
            rx="13"
            ry="21"
            cy="-16"
            fill={c.peoniaMedia}
            transform={`rotate(${ang})`}
          />
        ))}
        {[0, 72, 144, 216, 288].map((ang) => (
          <ellipse
            key={`c${ang}`}
            rx="10"
            ry="15"
            cy="-10"
            fill={c.peoniaClara}
            transform={`rotate(${ang})`}
          />
        ))}
        {[-30, 30, 90, 150, 210, 270, 330].map((ang) => (
          <circle
            key={`d${ang}`}
            r="4"
            cx="0"
            cy="-6"
            fill={c.peoniaSuave}
            transform={`rotate(${ang})`}
          />
        ))}
        <circle r="5" fill={c.violetaCentro} />
      </g>
    </g>
  )
}

function Lavanda({ x, y, escala }: { x: number; y: number; escala: number }) {
  const brotes: Array<[number, number, string]> = [
    [0, -152, c.lavandaOscuro],
    [-8, -140, c.lavandaClaro],
    [8, -146, c.lavandaClaro],
    [-7, -128, c.lavandaOscuro],
    [7, -132, c.lavandaOscuro],
    [0, -118, c.lavandaClaro],
    [-6, -106, c.lavandaOscuro],
    [6, -104, c.lavandaClaro],
  ]
  return (
    <g className="lavanda" transform={`translate(${x} ${y}) scale(${escala})`}>
      <path
        className="tallo"
        d="M0 0 C 2 -48, -2 -95, 0 -145"
        stroke={c.tallo}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="0" y1="-32" x2="12" y2="-42" stroke={c.hojaOscura} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="0" y1="-48" x2="-11" y2="-58" stroke={c.hojaOscura} strokeWidth="2.5" strokeLinecap="round" />
      <g className="espigas">
        {brotes.map(([bx, by, color], i) => (
          <ellipse key={i} cx={bx} cy={by} rx="4.5" ry="8" fill={color} transform={`rotate(${bx} ${bx} ${by})`} />
        ))}
      </g>
    </g>
  )
}

function Florecita({ x, y, escala }: { x: number; y: number; escala: number }) {
  return (
    <g className="florecita" transform={`translate(${x} ${y}) scale(${escala})`}>
      <line x1="0" y1="16" x2="0" y2="0" stroke={c.tallo} strokeWidth="2.5" />
      {[0, 60, 120, 180, 240, 300].map((ang) => (
        <ellipse key={ang} className="petalo-mini" cx="0" cy="-9" rx="4" ry="8" fill={c.violetaPetalo} transform={`rotate(${ang})`} />
      ))}
      <circle className="centro-mini" cx="0" cy="0" r="4.5" fill={c.violetaCentro} />
    </g>
  )
}

export default function WelcomeScreen() {
  const container = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      gsap.set(
        '.capullo, .flor, .espigas, .titulo-letra, .dedicatoria, .subtitulo, .btn-entrar, .hoja, .florecita',
        { autoAlpha: 0 },
      )
      gsap.set('.flor, .espigas', { transformOrigin: '50% 100%', scaleY: 0 })
      gsap.set('.titulo-letra', { y: 26 })
      gsap.set('.btn-entrar', { y: 18 })

      const tl = gsap.timeline({ onComplete: () => setReady(true) })
      tlRef.current = tl

      // 0. Colinas aparecen
      tl.from('.colina', {
        yPercent: 8,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power2.out',
      })
        // 1. Tallos crecen en cascada
        .from(
          '.tallo',
          {
            drawSVG: '0%',
            duration: 1.6,
            stagger: 0.1,
            ease: 'power2.inOut',
          },
          '-=0.3',
        )
        // 2. Hojas brotan
        .to(
          '.hoja',
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.07,
            ease: 'back.out(2)',
            transformOrigin: 'left center',
          },
          '-=0.9',
        )
        // 3. Tulipanes y peonía florecen
        .to('.tulipan .capullo, .peonia .capullo', { autoAlpha: 1, duration: 0.3 }, '-=0.2')
        .to(
          '.florecita',
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(2)',
            transformOrigin: 'center bottom',
          },
          '<',
        )
        .to('.tulipan .capullo, .peonia .capullo', {
          scale: 0.7,
          transformOrigin: '50% 100%',
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power2.in',
        })
        .to('.tulipan .flor, .peonia .flor', {
          autoAlpha: 1,
          scaleY: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'back.out(1.6)',
        }, '-=0.3')
        .to('.tulipan .brillo', { autoAlpha: 0.55, duration: 0.5 }, '-=0.3')
        // 4. Espigas de lavanda
        .to('.espigas', { autoAlpha: 1, scaleY: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.8)' }, '-=0.4')
        // 5. Textos y botones
        .to('.titulo-letra', { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'power2.out' }, '-=0.2')
        .to('.dedicatoria', { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, '-=0.1')
        .to('.subtitulo', { autoAlpha: 1, duration: 0.9 }, '-=0.2')
        .to('.btn-entrar', { autoAlpha: 1, y: 0, duration: 0.6 }, '+=0.2')

      // 6. Sway infinito del jardín
      gsap.utils.toArray<SVGGElement>('.tulipan, .peonia, .lavanda').forEach((el, i) => {
        gsap.to(el, {
          rotation: i % 2 ? 1.8 : -1.8,
          transformOrigin: '50% 100%',
          duration: 2.2 + (i % 3) * 0.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 3 + i * 0.2,
        })
      })
      gsap.utils.toArray<SVGGElement>('.florecita').forEach((el, i) => {
        gsap.to(el, {
          rotation: i % 2 ? 4 : -4,
          transformOrigin: '50% 90%',
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 3.5 + i * 0.3,
        })
      })

      // 7. Pétalos flotantes en loop
      gsap.utils.toArray<SVGSVGElement>('.petalito-flotante').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: -60, x: 0, rotation: 0, autoAlpha: 0 },
          {
            y: 760,
            x: 'random(-70, 70)',
            rotation: 260,
            autoAlpha: 1,
            duration: PETALOS_FLOTANTES[i].dur,
            delay: PETALOS_FLOTANTES[i].delay + 2.5,
            repeat: -1,
            repeatDelay: 1.2,
            ease: 'none',
          },
        )
      })

      // 8. Sparkles parpadean
      gsap.utils.toArray<SVGElement>('.sparkle').forEach((el, i) => {
        gsap.to(el, {
          autoAlpha: 0.9,
          scale: 1.25,
          transformOrigin: 'center',
          duration: 0.9,
          delay: SPARKLES[i].delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    },
    { scope: container },
  )

  /** Completa el timeline hasta su estado final real: nada queda inconcluso */
  const skip = () => {
    tlRef.current?.progress(1)
    setReady(true)
  }

  return (
    <div
      ref={container}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-3 sm:px-4 py-10"
      style={{
        background: `linear-gradient(180deg,
          ${c.cielo1} 0%,
          ${c.cielo2} 22%,
          ${c.cielo3} 45%,
          ${c.cielo4} 70%,
          ${c.cielo5} 88%,
          ${c.cieloBrasa} 100%)`,
      }}
    >
      {/* Header de navegación: aparece al terminar la animación */}
      {ready && <NavBar />}

      {/* Corazones flotantes */}
      <span className="animate-float absolute top-24 left-[8%] text-rose-300 text-2xl select-none pointer-events-none" style={{ animationDelay: '0.5s' }}>
        ♥
      </span>
      <span className="animate-float absolute top-40 right-[10%] text-amber-300 text-xl select-none pointer-events-none" style={{ animationDelay: '1.6s' }}>
        ♥
      </span>
      <span className="animate-float absolute bottom-28 left-[14%] text-amber-300 text-xl select-none pointer-events-none" style={{ animationDelay: '2.4s' }}>
        ♥
      </span>

      {/* Pétalos flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PETALOS_FLOTANTES.map((p, i) => (
          <svg
            key={i}
            className="petalito-flotante absolute -top-10"
            style={{ left: p.left }}
            width={p.size}
            height={p.size}
            viewBox="0 0 20 20"
          >
            <path d="M10 0 C 16 5, 16 13, 10 19 C 4 13, 4 5, 10 0 Z" fill={p.color} opacity="0.8" />
          </svg>
        ))}
      </div>

      <svg viewBox="0 0 900 620" className="relative w-full max-w-3xl">
        {/* Sol de amanecer con glow suave */}
        <circle cx="450" cy="120" r="95" fill={c.solHalo} opacity="0.4" />
        <circle cx="450" cy="120" r="58" fill={c.solHalo} opacity="0.5" />
        <circle cx="450" cy="120" r="34" fill={c.sol} opacity="0.85" />

        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <path
            key={i}
            className="sparkle"
            style={{ opacity: 0.15 }}
            d={`M0 -${s.size / 2} L ${s.size / 6} -${s.size / 6} L ${s.size / 2} 0 L ${s.size / 6} ${s.size / 6} L 0 ${s.size / 2} L -${s.size / 6} ${s.size / 6} L -${s.size / 2} 0 L -${s.size / 6} -${s.size / 6} Z`}
            transform={`translate(${(900 * parseFloat(s.left)) / 100} ${(620 * parseFloat(s.top)) / 100})`}
            fill={c.sparkleColor}
          />
        ))}

        {/* Colina trasera */}
        <path className="colina" d="M0 520 C 220 470, 420 480, 900 515 L 900 620 L 0 620 Z" fill={c.colinaAtras} opacity="0.7" />
        {/* Colina frontal */}
        <path className="colina" d="M0 560 C 250 520, 550 525, 900 555 L 900 620 L 0 620 Z" fill={c.colinaFrente} />

        {/* Peonías rosas (contraste, en los extremos) */}
        <Peonia x={58} y={552} escala={1.15} />
        <Peonia x={835} y={550} escala={1.0} />

        {/* Tulipanes amarillos y coral, intercalados */}
        <Tulipan x={238} y={546} escala={1.0} principal />
        <Tulipan x={330} y={550} escala={0.8} principal={false} />
        <Tulipan x={420} y={548} escala={1.05} principal={false} />
        <Tulipan
          x={505}
          y={546}
          escala={1.0}
          principal={false}
          cuerpo={c.tulipanCoral}
          centro={c.tulipanCoralClaro}
          brillo={c.tulipanCoralClaro}
        />
        <Tulipan x={670} y={548} escala={1.0} principal />

        {/* Lavanda morada */}
        <Lavanda x={20} y={554} escala={0.85} />
        <Lavanda x={152} y={554} escala={0.9} />
        <Lavanda x={590} y={556} escala={0.8} />
        <Lavanda x={755} y={554} escala={0.9} />
        <Lavanda x={872} y={556} escala={0.75} />

        {/* Florecitas violetas */}
        <Florecita x={105} y={588} escala={0.9} />
        <Florecita x={295} y={590} escala={0.8} />
        <Florecita x={465} y={592} escala={0.85} />
        <Florecita x={640} y={590} escala={0.85} />
        <Florecita x={715} y={592} escala={0.75} />
      </svg>

      {/* Textos: jerarquía visual */}
      <div className="relative mt-2 flex flex-col items-center text-center">
        <h1
          className="font-serif italic text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight"
          style={{ color: c.tituloColor, textShadow: '0 2px 8px rgba(255,255,255,0.45)' }}
        >
          {TITULO.split('').map((ch, i) => (
            <span key={i} className="titulo-letra inline-block whitespace-pre">
              {ch}
            </span>
          ))}
        </h1>

        <div className="dedicatoria mt-3 flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
          <span className="font-serif italic text-lg md:text-xl" style={{ color: c.dedicatoriaColor }}>
            Srta. Flores
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
        </div>

        <p className="subtitulo text-sm md:text-base text-stone-500 italic mt-4 max-w-xs leading-relaxed">
          {SUBTITULO}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <button
            className="btn-entrar px-8 py-3 w-full sm:w-auto text-white font-semibold rounded-full shadow-lg transition-colors hover:brightness-110"
            style={{ backgroundColor: c.botonPrincipal, boxShadow: '0 10px 20px -6px rgba(194, 65, 12, 0.45)' }}
            onClick={() => navigate('/planner')}
          >
            Nuestros planes
          </button>
        </div>

        {!ready && (
          <button
            onClick={skip}
            className="mt-8 text-sm text-stone-400 hover:text-amber-500 underline underline-offset-4 transition-colors"
          >
            saltar intro
          </button>
        )}
      </div>
    </div>
  )
}
