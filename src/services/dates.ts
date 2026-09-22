import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { uploadDatePhoto } from './storage'
import { normalizeDate, type DateItem, type NewDateItem } from '../types'

const DATES_COLLECTION = 'dates'

export function subscribeToDates(
  callback: (dates: DateItem[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, DATES_COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => normalizeDate(d.id, d.data())))
    },
    (error) => onError?.(error),
  )
}

/** Suscripción a un solo plan en tiempo real */
export function subscribeToDate(
  id: string,
  callback: (date: DateItem | null) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, DATES_COLLECTION, id),
    (snap) => callback(snap.exists() ? normalizeDate(snap.id, snap.data()) : null),
    (error) => onError?.(error),
  )
}

/** Crea el plan y define su portada (imagen/GIF elegido o ticket por defecto) */
export async function createDate(data: NewDateItem, portadaFile?: File | null) {
  const ref = await addDoc(collection(db, DATES_COLLECTION), {
    ...data,
    portadaURL: null,
    fotos: [],
    createdAt: serverTimestamp(),
  })
  if (portadaFile) {
    const url = await uploadDatePhoto(ref.id, portadaFile, 'portada')
    await updateDoc(ref, { portadaURL: url })
  } else {
    await updateDoc(ref, { portadaURL: '/gif/ticket.png' })
  }
  return ref
}

/** Reemplaza la portada de un plan existente */
export async function updatePortada(dateId: string, file: File) {
  const url = await uploadDatePhoto(dateId, file, 'portada')
  return updateDoc(doc(db, DATES_COLLECTION, dateId), { portadaURL: url })
}

export async function updateDate(id: string, data: Partial<NewDateItem>) {
  return updateDoc(doc(db, DATES_COLLECTION, id), data)
}

export async function setDatePlaneada(id: string, fecha: Date | null) {
  return updateDate(id, {
    fechaPlaneada: fecha ? Timestamp.fromDate(fecha) : null,
  })
}

export async function marcarVivido(id: string) {
  return updateDate(id, { estado: 'completada' })
}

export async function addPhoto(dateId: string, file: File) {
  const url = await uploadDatePhoto(dateId, file, 'foto')
  return updateDoc(doc(db, DATES_COLLECTION, dateId), { fotos: arrayUnion(url) })
}

export async function removePhoto(dateId: string, url: string) {
  return updateDoc(doc(db, DATES_COLLECTION, dateId), { fotos: arrayRemove(url) })
}

export async function deleteDate(id: string) {
  return deleteDoc(doc(db, DATES_COLLECTION, id))
}
