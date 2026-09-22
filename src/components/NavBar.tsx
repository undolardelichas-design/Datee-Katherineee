import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gardenColors as c } from '../theme/garden'

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/planner', label: 'Planificador' },
  { to: '/nuevo', label: 'Nuevo plan' },
  { to: '/gallery', label: 'Galería' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const linkBase = 'px-4 py-2 rounded-full text-sm font-semibold transition-colors'
  const idleCls = 'text-stone-600 hover:bg-white/60'
  const activeCls = 'text-white shadow-sm'

  return (
    <header className="animate-fade-in fixed top-0 inset-x-0 z-50 bg-white/25 backdrop-blur-md border-b border-white/50">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link
          to="/"
          className="font-serif italic text-xl md:text-2xl whitespace-nowrap"
          style={{ color: c.tituloColor }}
        >
          El Jardín de Katherine 🍃
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = isActive(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`${linkBase} ${active ? activeCls : idleCls}`}
                style={active ? { backgroundColor: c.botonPrincipal } : undefined}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Hamburguesa móvil */}
        <button
          className="sm:hidden w-11 h-11 grid place-items-center rounded-full text-stone-600 hover:bg-white/60 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Menú móvil */}
      {open && (
        <div className="sm:hidden border-t border-white/50 bg-white/70 backdrop-blur-md px-4 py-2">
          {LINKS.map((l) => {
            const active = isActive(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  active ? activeCls : 'text-stone-600 hover:bg-white/60'
                }`}
                style={active ? { backgroundColor: c.botonPrincipal } : undefined}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
