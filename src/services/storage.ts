/** Sube una imagen (jpg, png, gif, ...) a Cloudinary y devuelve su URL segura */
export async function uploadDatePhoto(dateId: string, file: File, tipo = 'foto'): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  // Renombramos el archivo para garantizar un public ID único
  const uniqueName = `${tipo}-${dateId}-${Date.now()}-${file.name}`
  const renamed = new File([file], uniqueName, { type: file.type })

  const formData = new FormData()
  formData.append('file', renamed)
  formData.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Error al subir la imagen a Cloudinary (${res.status})`)
  }

  const data = await res.json()
  return data.secure_url as string
}
