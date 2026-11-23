/**
 * Fotos de src/assets/img/galeria que usa el sitio.
 * Los archivos conservan el nombre con el que llegaron ("WhatsApp Image 2026-11-20 at <id>.jpeg").
 * Para usar una foto más: impórtala aquí, agrégala al mapa y pídela con photo('<id>').
 * Se importan una por una (y no toda la carpeta) para que al publicar solo viajen las que se usan.
 */
import agua from '../assets/img/agua.webp';
import p383805 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.38 PM (5).jpeg';
import p3839 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.39 PM.jpeg';
import p384001 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.40 PM (1).jpeg';
import p384003 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.40 PM (3).jpeg';
import p384102 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.41 PM (2).jpeg';
import p384204 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.42 PM (4).jpeg';
import p384303 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.43 PM (3).jpeg';
import p384304 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.43 PM (4).jpeg';
import p384401 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.44 PM (1).jpeg';
import p384402 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.44 PM (2).jpeg';
import p384601 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.46 PM (1).jpeg';
import p384605 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.46 PM (5).jpeg';
import p384606 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.46 PM (6).jpeg';
import p3837 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.37 PM.jpeg';
import p3838 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.38 PM.jpeg';
import p384005 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.40 PM (5).jpeg';
import p384106 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.41 PM (6).jpeg';
import p384404 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.44 PM (4).jpeg';
import p384502 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.45 PM (2).jpeg';
import p384504 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.45 PM (4).jpeg';
import p384602 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.46 PM (2).jpeg';
import p384701 from '../assets/img/galeria/WhatsApp Image 2026-11-20 at 3.38.47 PM (1).jpeg';

const photos: Record<string, ImageMetadata> = {
  '3.38.38 PM (5)': p383805, // jacuzzi exterior con deck gris
  '3.38.39 PM': p3839, // alberca techada de agua clara
  '3.38.40 PM (1)': p384001, // jacuzzi con muro de piedra
  '3.38.40 PM (3)': p384003, // alberca de borde infinito, mosaico azul
  '3.38.41 PM (2)': p384102, // limpieza de alberca techada
  '3.38.42 PM (4)': p384204, // alberca iluminada de noche
  '3.38.43 PM (3)': p384303, // alberca al pie de un edificio
  '3.38.43 PM (4)': p384304, // limpieza de alberca techada (otra toma)
  '3.38.44 PM (1)': p384401, // alberca en jardín de casa blanca
  '3.38.44 PM (2)': p384402, // alberca techada con ventanales
  '3.38.46 PM (1)': p384601, // jacuzzi exterior en conjunto residencial
  '3.38.46 PM (5)': p384605, // alberca residencial junto a jardín
  '3.38.46 PM (6)': p384606, // cuarto de máquinas
  '3.38.37 PM': p3837, // alberca residencial con muro gris
  '3.38.38 PM': p3838, // alberca en jardín con pasto
  '3.38.40 PM (5)': p384005, // alberca azul recién terminada
  '3.38.41 PM (6)': p384106, // alberca residencial con escalones
  '3.38.44 PM (4)': p384404, // alberca techada con mosaico azul
  '3.38.45 PM (2)': p384502, // alberca techada con mosaico a rayas
  '3.38.45 PM (4)': p384504, // alberca en jardín de casa
  '3.38.46 PM (2)': p384602, // jacuzzi exterior con camastros
  '3.38.47 PM (1)': p384701, // jacuzzi interior
};

/**
 * Valor CSS de la foto de agua que se ve dentro del texto con la clase .water-text (global.css).
 * src/assets/img/agua.webp es un recorte del agua de la foto '3.38.40 PM (3)' (alberca de borde
 * infinito), con el contraste de las ondas realzado y pasado a tonos de azul de la marca para que
 * se note dentro del texto y se lea sobre blanco.
 * Uso: style={`--water: ${waterTexture()}`}
 */
export function waterTexture(): string {
  return `url("${agua.src}")`;
}

export function photo(id: string): ImageMetadata {
  const image = photos[id];
  if (!image) throw new Error(`La foto de galería "${id}" no está registrada en src/lib/gallery.ts`);
  return image;
}
