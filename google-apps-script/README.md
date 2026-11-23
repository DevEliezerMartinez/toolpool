# Formulario → CRM en Google Sheets

El formulario del sitio manda cada envío a este script, que lo guarda como una fila en la hoja `Solicitudes` del CRM.

## Generar la URL (una sola vez)

1. Abre la hoja de cálculo del CRM con la cuenta de Google de ToolPool.
2. Confirma que la pestaña se llama **`Solicitudes`** y que la fila 1 tiene estos encabezados, uno por columna (A a M):

   `Folio` · `Fecha y hora` · `Nombre` · `WhatsApp` · `Tipo` · `Producto` · `Mensaje` · `Página de origen` · `Estatus` · `Primer contacto` · `Días para responder` · `Próximo seguimiento` · `Notas`

3. En el menú, abre **Extensiones → Apps Script**, borra lo que haya y pega el contenido de `Code.gs`. Guarda (Ctrl + S).
4. Arriba a la derecha: **Implementar → Nueva implementación**. En el engrane de "Seleccionar tipo" elige **Aplicación web** y llena:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Clic en **Implementar** y autoriza los permisos. Google mostrará "Google no ha verificado esta app": entra en **Configuración avanzada → Ir a (nombre del proyecto)** y permite el acceso.
6. Copia la **URL de la aplicación web**. Termina en `/exec`.
7. Pruébala: ábrela en el navegador. Debe responder `{"ok":true,"mensaje":"Formulario de ToolPool activo"}`.
8. En el proyecto del sitio, crea el archivo `.env` (copia de `.env.example`) y pon la URL:

   ```
   PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
   ```

9. Reinicia el servidor de desarrollo para que tome la variable y manda un envío de prueba desde el formulario: debe aparecer una fila nueva con folio `TP-0001` y estatus `Nuevo`.
10. Al publicar el sitio, define la misma variable `PUBLIC_FORM_ENDPOINT` en el servicio de hospedaje y vuelve a compilar.

## Al cambiar el script

Después de editar `Code.gs` en Apps Script hay que publicar una versión nueva: **Implementar → Administrar implementaciones → Editar (lápiz) → Versión: Nueva versión → Implementar**. La URL se conserva.

Si en lugar de eso creas una "Nueva implementación", la URL cambia y hay que actualizar `.env`.

## Qué llena el script

- **A a H:** folio, fecha y hora, nombre, WhatsApp, tipo, producto, mensaje y página de origen.
- **I Estatus:** siempre `Nuevo`.
- **K Días para responder:** fórmula que se calcula sola cuando se llena **J Primer contacto**.
- **J, L y M** se llenan a mano.

El número de WhatsApp queda como enlace: un clic abre el chat.

## Notas

- El folio es consecutivo (`TP-0001`, `TP-0002`, …) y se calcula a partir del mayor folio de la hoja.
- El script valida que haya nombre, tipo y un WhatsApp de 10 dígitos. Si algo falta, el formulario muestra el error y ofrece escribir por WhatsApp.
- Si el campo trampa (`empresa`) llega lleno, es un bot: se responde "ok" sin guardar nada.
- La URL del script es pública (va en el código del sitio): cualquiera que la tenga puede mandar filas. El campo trampa y las validaciones frenan el spam básico, no un ataque dirigido.
- `TOKEN` va vacío a propósito. Solo sirve si algún día el formulario se pasa a Netlify Forms con webhook: ahí la URL con `?token=…` queda guardada en Netlify y no es pública.
