# ToolPool — sitio web

Sitio de ToolPool: construcción, mantenimiento y rehabilitación de albercas y jacuzzis. Es un sitio estático hecho con [Astro](https://astro.build) y Tailwind CSS.

## Requisitos

- Node.js **22.23.4 o superior** (Astro no arranca con versiones anteriores).

## Puesta en marcha

```sh
npm install
cp .env.example .env   # y llena las variables (ver abajo)
npm run dev            # http://localhost:4321
```

| Comando           | Qué hace                                         |
| :---------------- | :----------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321`       |
| `npm run build`   | Compila el sitio en `dist/`                      |
| `npm run preview` | Sirve la compilación para revisarla en local     |

## Variables de entorno

Van en `.env` (no se versiona). Las dos son públicas: terminan en el código del sitio.

| Variable               | Para qué                                                                                   |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `PUBLIC_FORM_ENDPOINT` | URL del Apps Script que guarda el formulario en el CRM. Sin ella, el formulario no envía.  |
| `PUBLIC_CLARITY_ID`    | ID del proyecto de Microsoft Clarity. Sin ella no hay analítica ni aviso de cookies.       |

Al publicar hay que definir las mismas variables en el servicio de hospedaje y volver a compilar.

## Estructura

```text
src/
├── pages/            Una página por archivo: inicio, servicios, productos, nosotros,
│                     preguntas-frecuentes, contacto, aviso-de-privacidad
├── layouts/          BaseLayout (head, fuentes, scripts) y PageLayout (header + footer)
├── components/
│   ├── home/         Secciones de la página de inicio (varias se reutilizan en otras páginas)
│   ├── layout/       Header, Footer, menú móvil, botón de WhatsApp, aviso de cookies
│   └── ui/           Piezas compartidas: botón, formulario, encabezados, PageHero…
├── lib/              whatsapp.ts (número, enlaces, tienda) y gallery.ts (fotos de la galería)
├── scripts/          animations.ts (animaciones ligadas al scroll)
├── styles/           global.css (colores, tipografías, animaciones CSS)
└── assets/           Imágenes que Astro optimiza al compilar
public/               Archivos que se publican tal cual: favicons y fuentes woff2
google-apps-script/   Script del CRM en Google Sheets y sus instrucciones
```

## Cómo funciona cada parte

- **Formulario de contacto** (`src/components/ui/ContactForm.astro`): manda cada envío a un Apps Script que lo guarda como fila en la hoja `Solicitudes` del CRM, con folio consecutivo. Los pasos para generar la URL están en [google-apps-script/README.md](google-apps-script/README.md).
- **WhatsApp y Mercado Libre** (`src/lib/whatsapp.ts`): el número y la URL de la tienda están en un solo lugar. Cada botón manda un mensaje prellenado distinto para saber de qué sección llegó el chat.
- **Analítica y cookies** (`src/components/layout/CookieBanner.astro`): Microsoft Clarity solo se carga en producción y después de que la persona acepta en el aviso de cookies. Si rechaza, no se descarga.
- **Galería de proyectos** (`src/components/home/Projects.astro`): tabs por tipo de proyecto; las fotos se abren en grande con doble clic (un toque en móvil) y se navega con flechas. Para usar una foto nueva hay que registrarla en `src/lib/gallery.ts`.
- **Texto con agua** (clase `.water-text` en `global.css`): los números de "Cómo trabajamos" y los títulos de las páginas internas dejan ver una foto de agua en movimiento.
- **Iconos**: `<Icon name="lucide:…" />` para interfaz y `<Icon name="simple-icons:…" />` para marcas. Solo viajan los que se usan.
- **Tipografías**: Instrument Sans (Google Fonts) para texto y Century Gothic (archivos `woff2` en `public/fonts`) para títulos. Los TTF originales de Century Gothic no se versionan.

## Pendientes antes de publicar

Están marcados con `TODO` en el código. Los principales:

- **Aviso de privacidad**: faltan el responsable, el domicilio, la fecha y decidir si los datos se usarán para promociones. Mientras falten, la página muestra un aviso de "borrador". Requiere revisión legal.
- **Fotos provisionales**: las de Construcción y Rehabilitación en proyectos, las de cada servicio y la del equipo en Nosotros son una selección temporal de la galería.
- **Contenido por confirmar con la clienta**: qué incluye cada servicio, preguntas frecuentes reales, zona de cobertura, correo y horario de contacto.
- **Productos**: enlace directo a cada publicación de Mercado Libre (hoy todos llevan a la tienda).
- **Variables de entorno**: URL real del formulario e ID de Clarity.
