import { Timestamp } from 'firebase/firestore'

export type DateEstado = 'pendiente' | 'completada'

export interface DateItem {
  id: string
  categoria: string
  titulo: string
  lugar: string
  descripcion: string
  fechaPlaneada: Timestamp | null
  estado: DateEstado
  portadaURL: string | null
  fotos: string[]
  createdAt: Timestamp
}

export type NewDateItem = Omit<DateItem, 'id' | 'createdAt' | 'portadaURL' | 'fotos'>

/** Normaliza docs de Firestore: soporta registros viejos con imagenURL */
export function normalizeDate(id: string, data: Record<string, unknown>): DateItem {
  const d = data as Partial<DateItem> & { imagenURL?: string | null }
  return {
    id,
    categoria: d.categoria ?? '',
    titulo: d.titulo ?? '',
    lugar: d.lugar ?? '',
    descripcion: d.descripcion ?? '',
    fechaPlaneada: d.fechaPlaneada ?? null,
    estado: d.estado ?? 'pendiente',
    portadaURL: d.portadaURL ?? d.imagenURL ?? null,
    fotos: d.fotos ?? [],
    createdAt: d.createdAt ?? (d as unknown as { createdAt?: Timestamp }).createdAt ?? Timestamp.now(),
  }
}
