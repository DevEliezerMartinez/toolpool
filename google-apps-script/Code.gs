/**
 * CRM de solicitudes ToolPool — recibe los envíos del formulario del sitio y los guarda en la hoja.
 * Instrucciones de publicación: ver README.md en esta carpeta.
 *
 * Acepta dos orígenes:
 * 1. El formulario del sitio (src/components/ui/ContactForm.astro), que manda directo a esta URL:
 *    nombre, whatsapp, tipo, producto, mensaje, pagina y empresa (campo trampa).
 * 2. Un webhook de Netlify Forms, por si algún día se usa: los campos vienen dentro de "data",
 *    el teléfono puede llamarse "telefono" y la página llega como "referrer".
 *
 * Columnas de la hoja Solicitudes:
 * A Folio | B Fecha y hora | C Nombre | D WhatsApp | E Tipo | F Producto |
 * G Mensaje | H Página de origen | I Estatus | J Primer contacto |
 * K Días para responder | L Próximo seguimiento | M Notas
 * El script llena de A a K; L y M se llenan a mano.
 */

// Token opcional. Déjalo vacío con el formulario del sitio: su URL es pública (va en el código
// de la página), así que un token ahí no protege nada. Úsalo solo con el webhook de Netlify,
// agregando ?token=TU_TOKEN a la URL que se pega en Netlify.
const TOKEN = '';
const HOJA = 'Solicitudes';
const PREFIJO_FOLIO = 'TP-';

function doPost(e) {
  if (TOKEN && (!e || !e.parameter || e.parameter.token !== TOKEN)) {
    return respuesta({ ok: false, error: 'token' });
  }

  let cuerpo;
  try {
    cuerpo = JSON.parse(e.postData.contents);
  } catch (err) {
    return respuesta({ ok: false, error: 'json' });
  }

  // Netlify manda el envío completo con los campos en "data"; el sitio manda los campos directo.
  const envio = cuerpo.payload || cuerpo;
  const d = envio.data || envio;

  // Campo trampa: si viene lleno es un bot. Se responde "ok" sin guardar nada.
  if (d.empresa) return respuesta({ ok: true, folio: '' });

  const nombre = limpiar(d.nombre, 80);
  const tel = normalizarTelefono(d.whatsapp || d.telefono);
  const tipo = limpiar(d.tipo, 60);
  const producto = limpiar(d.producto, 120);
  const zona = limpiar(d.zona, 80);
  const texto = limpiar(d.mensaje, 1000);
  const mensaje = zona ? 'Zona: ' + zona + (texto ? '. ' + texto : '') : texto;
  const pagina = limpiar(d.pagina, 200) || rutaDe(d.referrer || envio.referrer);

  if (!nombre) return respuesta({ ok: false, error: 'Falta el nombre' });
  if (tel.length !== 10) return respuesta({ ok: false, error: 'WhatsApp inválido' });
  if (!tipo) return respuesta({ ok: false, error: 'Falta el tipo' });

  const lock = LockService.getScriptLock();
  try {
    // Bloqueo: dos envíos simultáneos no pueden obtener el mismo folio ni la misma fila
    lock.waitLock(20000);

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA);
    if (!hoja) return respuesta({ ok: false, error: 'No existe la hoja "' + HOJA + '"' });

    const fila = siguienteFila(hoja);
    const folio = PREFIJO_FOLIO + String(siguienteFolio(hoja)).padStart(4, '0');
    const fecha = envio.created_at ? new Date(envio.created_at) : new Date();

    const valores = [
      folio,     // A Folio
      fecha,     // B Fecha y hora
      nombre,    // C Nombre
      tel,       // D WhatsApp
      tipo,      // E Tipo
      producto,  // F Producto
      mensaje,   // G Mensaje
      pagina,    // H Página de origen
      'Nuevo',   // I Estatus
      '',        // J Primer contacto
      '=IF(J' + fila + '="","",INT(J' + fila + ')-INT(B' + fila + '))', // K Días para responder
    ];

    // Formatos antes de escribir, para que el teléfono se guarde como texto.
    hoja.getRange(fila, 2).setNumberFormat('dd/mm/yyyy hh:mm');  // B
    hoja.getRange(fila, 4).setNumberFormat('@');                 // D
    hoja.getRange(fila, 10).setNumberFormat('dd/mm/yyyy');       // J
    hoja.getRange(fila, 11).setNumberFormat('0');                // K
    hoja.getRange(fila, 12).setNumberFormat('dd/mm/yyyy');       // L

    hoja.getRange(fila, 1, 1, valores.length).setValues([valores]);
    hoja.getRange(fila, 7).setWrap(true);                        // G

    // El número de WhatsApp queda como link: un clic abre el chat.
    hoja.getRange(fila, 4).setRichTextValue(
      SpreadsheetApp.newRichTextValue()
        .setText(tel)
        .setLinkUrl('https://wa.me/52' + tel)
        .build()
    );

    return respuesta({ ok: true, folio: folio });
  } catch (err) {
    return respuesta({ ok: false, error: 'Error al guardar' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// Para probar la URL desde el navegador.
function doGet() {
  return respuesta({ ok: true, mensaje: 'Formulario de ToolPool activo' });
}

// Primera fila vacía según la columna Folio (no usa appendRow, así las
// fórmulas o formatos en otras columnas no mueven la fila de destino).
function siguienteFila(hoja) {
  const folios = hoja.getRange('A:A').getValues();
  let ultima = 1;
  for (let i = 0; i < folios.length; i++) {
    if (folios[i][0] !== '') ultima = i + 1;
  }
  return ultima + 1;
}

// Folio consecutivo a partir del mayor folio escrito (no del número de fila, por si se borran filas).
function siguienteFolio(hoja) {
  const folios = hoja.getRange('A2:A').getValues();
  let max = 0;
  folios.forEach(function (r) {
    const m = String(r[0]).match(/^TP-(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  });
  return max + 1;
}

// Deja los últimos 10 dígitos (quita +52, 52 o 521 si vienen).
function normalizarTelefono(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  return digitos.length >= 10 ? digitos.slice(-10) : digitos;
}

function rutaDe(url) {
  if (!url) return '';
  const m = String(url).match(/^https?:\/\/[^/]+(\/[^?#]*)?/);
  return m ? (m[1] || '/') : String(url);
}

// Recorta el texto y evita que un valor que empiece con = + - @ se interprete como fórmula.
function limpiar(valor, max) {
  const t = String(valor == null ? '' : valor).trim().slice(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
