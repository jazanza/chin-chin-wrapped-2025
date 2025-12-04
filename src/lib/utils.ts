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

  // Convierte explícitamente a string y recorta espacios en blanco.
  const stringUrl = String(rawUrl).trim();

  // Si la cadena resultante está vacía, devuelve el placeholder.
  if (stringUrl === '') {
    return '/placeholder.svg';
  }

  // Si ya es una URL absoluta (http/https) o un URI de datos (Base64), la devuelve tal cual.
  if (stringUrl.startsWith('http://') || stringUrl.startsWith('https://') || stringUrl.startsWith('data:')) {
    return stringUrl;
  }

  // Normaliza la ruta: elimina cualquier barra inicial si existe.
  let cleanedUrl = stringUrl.startsWith('/') ? stringUrl.substring(1) : stringUrl;

  // Si la ruta ya comienza con 'images/' (insensible a mayúsculas/minúsculas),
  // simplemente asegúrate de que tenga una barra inicial.
  if (cleanedUrl.toLowerCase().startsWith('images/')) {
    return `/${cleanedUrl}`; // Ej: "images/beer.png" -> "/images/beer.png"
  }

  // De lo contrario, asume que es solo un nombre de archivo y prefija con '/images/'
  return `/images/${cleanedUrl}`; // Ej: "beer.png" -> "/images/beer.png"
}