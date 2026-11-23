/** Número de WhatsApp de ToolPool: 52 (México) + 10 dígitos. */
const WHATSAPP_NUMBER = '525574978784';

export const PHONE_DISPLAY = '55 7497 8784';

/** Tienda de ToolPool en Mercado Libre. */
export const MERCADO_LIBRE_URL = 'https://listado.mercadolibre.com.mx/_CustId_2478067025';

/**
 * Enlace a WhatsApp con mensaje prellenado.
 * Cada botón del sitio manda un mensaje distinto para saber de qué sección llegó el chat.
 */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
