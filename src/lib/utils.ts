import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea la URL de una imagen para asegurar que sea accesible por el navegador.
 * Asume que las imágenes relativas están en la carpeta `public/images/`.
 * Si la ruta es nula o vacía, devuelve una imagen de placeholder.
 * @param rawUrl La ruta de la imagen tal como se obtiene de la base de datos.
 * @returns Una URL de imagen formateada o la ruta al placeholder.
 */
export function formatImageUrl(rawUrl: string | null | undefined): string {
  // Si la URL es nula o indefinida, devuelve la ruta al placeholder.
  if (rawUrl === null || rawUrl === undefined) {
    return '/placeholder.svg';
  }

  // Convierte explícitamente a string para asegurar que .trim() funcione.
  const stringUrl = String(rawUrl);

  // Si la cadena resultante está vacía después de limpiar espacios, devuelve el placeholder.
  if (stringUrl.trim() === '') {
    return '/placeholder.svg';
  }

  // Si ya es una URL absoluta (http/https) o un URI de datos (Base64), la devuelve tal cual.
  if (stringUrl.startsWith('http://') || stringUrl.startsWith('https://') || stringUrl.startsWith('data:')) {
    return stringUrl;
  }

  // Si es una ruta relativa, asume que está dentro de 'public/images/'
  // y la prefija con '/images/'. Asegura que no haya doble barra al inicio.
  const cleanedUrl = stringUrl.startsWith('/') ? stringUrl.substring(1) : stringUrl;
  return `/images/${cleanedUrl}`;
}