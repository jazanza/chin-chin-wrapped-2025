import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte datos binarios (Uint8Array) de una imagen a una Data URL Base64.
 * Asume que el formato de la imagen es JPEG.
 * Si binaryData es nulo o vacío, devuelve la ruta a una imagen de placeholder.
 * @param binaryData Los datos binarios de la imagen, típicamente un Uint8Array.
 * @returns Una Data URL (data:image/jpeg;base64,...) o la ruta al placeholder.
 */
export function createDataUrlFromBinary(binaryData: Uint8Array | null | undefined): string {
  if (!binaryData || binaryData.length === 0) {
    return '/placeholder.svg'; // Usamos el placeholder existente en /public/placeholder.svg
  }

  try {
    // Convertir Uint8Array a una cadena binaria
    let binaryString = '';
    for (let i = 0; i < binaryData.length; i++) {
      binaryString += String.fromCharCode(binaryData[i]);
    }
    // Codificar la cadena binaria a Base64
    const base64 = btoa(binaryString);
    return `data:image/jpeg;base64,${base64}`;
  } catch (e) {
    console.error("Error al convertir datos binarios a Base64:", e);
    return '/placeholder.svg'; // En caso de error, también devuelve el placeholder
  }
}