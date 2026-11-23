/**
 * Animaciones del sitio con Motion. Se carga en diferido desde BaseLayout (no bloquea la carga)
 * y no se ejecuta con prefers-reduced-motion.
 *
 * Reglas (Core Web Vitals):
 * - Solo se animan transform, opacity y clip-path: nada mueve el layout (CLS).
 * - Este script es quien oculta los elementos, y solo los que están fuera de pantalla:
 *   si no carga, todo el contenido queda visible; lo que ya se ve no parpadea.
 * - Cada entrada ocurre una sola vez.
 * - Lo ligado al scroll usa scroll() de Motion (ScrollTimeline nativo donde existe).
 * - El hero NO se anima aquí: su entrada es CSS (ver global.css) para no retrasar el LCP.
 *
 * Hooks en el marcado:
 *   data-animate="fade-up"   el elemento sube y aparece
 *   data-animate="stagger"   sus hijos directos entran en cascada
 *   data-animate="parallax"  fondo con desplazamiento leve (solo desktop)
 *   data-animate="ruler" / "ruler-card" / "ruler-connector" / "ruler-dot" / "ruler-line"
 *                            sección "Cómo trabajamos", ligada al scroll (ver el final del archivo)
 */
import { inView, scroll } from 'motion';
import { animate } from 'motion/mini';

// Lenguaje de movimiento único para todo el sitio
const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.6;
const DISTANCE = 20; // px
const STAGGER = 0.07; // s entre hermanos
const PARALLAX = 6; // % de recorrido del fondo

const all = (selector: string, root: ParentNode = document) => [...root.querySelectorAll<HTMLElement>(selector)];
const desktop = window.matchMedia('(min-width: 1024px)').matches;
const offScreen = (el: HTMLElement) => el.getBoundingClientRect().top >= window.innerHeight;

/* ── Entradas al hacer scroll ─────────────────────────────────────────── */

// Cada grupo es una lista de elementos que entran juntos (en cascada) cuando su disparador se ve
const groups: { trigger: HTMLElement; items: HTMLElement[] }[] = [
  ...all('[data-animate="fade-up"]').map((el) => ({ trigger: el, items: [el] })),
  ...all('[data-animate="stagger"]').map((el) => ({ trigger: el, items: [...el.children] as HTMLElement[] })),
  // En móvil las tarjetas del proceso entran una por una; en desktop van ligadas al scroll (abajo)
  ...(desktop ? [] : all('[data-animate="ruler-card"]').map((el) => ({ trigger: el, items: [el] }))),
].filter((group) => offScreen(group.trigger)); // primero todas las lecturas de layout…

for (const { items } of groups) {
  // …y después las escrituras
  for (const item of items) {
    item.style.opacity = '0';
    item.style.transform = `translateY(${DISTANCE}px)`;
  }
}

for (const { trigger, items } of groups) {
  inView(
    trigger,
    () => {
      items.forEach((item, i) => {
        animate(
          item,
          { opacity: [0, 1], transform: [`translateY(${DISTANCE}px)`, 'translateY(0px)'] },
          { duration: DURATION, ease: EASE, delay: i * STAGGER },
        ).then(() => {
          // Devuelve el control al CSS (hover, transiciones propias)
          item.style.opacity = '';
          item.style.transform = '';
        });
      });
    },
    { margin: '0px 0px -10% 0px' },
  );
}

/* ── Ligadas al scroll ────────────────────────────────────────────────── */

// Todas usan el rango "start end" → "end start" (desde que el elemento asoma por abajo hasta que
// sale por arriba) porque es el que Motion puede delegar al ScrollTimeline nativo del navegador;
// con otros offsets cae a un cálculo por frame en el hilo principal.
const COVER = ['start end', 'end start'] as const;

if (desktop) {
  // Parallax de fondos: el contenedor recorta lo que sobra
  for (const el of all('[data-animate="parallax"]')) {
    const section = el.parentElement!;
    // El hero ya trae su escala desde el CSS (zoom de entrada)
    if (!el.classList.contains('hero-zoom')) el.style.scale = '1.14';
    scroll(
      animate(
        el,
        { transform: [`translateY(-${PARALLAX}%)`, `translateY(${PARALLAX}%)`] },
        { ease: 'linear' },
      ),
      { target: section, offset: COVER },
    );
  }
}

// "Cómo trabajamos"
for (const track of all('[data-process-track]')) {
  const timeline = { target: track, offset: COVER };

  if (!desktop) {
    // Móvil y tablet: la línea vertical se llena conforme se recorre la lista
    for (const line of all('[data-animate="ruler-line"]', track)) {
      scroll(
        animate(
          line,
          { transform: ['scaleY(0)', 'scaleY(0)', 'scaleY(1)', 'scaleY(1)'] },
          { ease: 'linear', times: [0, 0.15, 0.7, 1] },
        ),
        timeline,
      );
    }
    continue;
  }

  // Desktop: la regla se dibuja de izquierda a derecha y, al llegar a cada paso,
  // aparece su tarjeta, baja el conector y se enciende el punto.
  const FROM = 0.28; // la regla empieza a dibujarse al asomar por abajo
  const TO = 0.6; // y queda completa con la sección ya centrada
  const hold = (from: string, to: string) => [from, from, to, to];
  // Reparte los 4 fotogramas: quieto hasta `start`, cambia hasta `end`, quieto después
  const between = (start: number, end: number) => ({ ease: 'linear', times: [0, start, end, 1] }) as const;

  for (const ruler of all('[data-animate="ruler"]', track)) {
    // Se revela con un recorte (no con scaleX, que apretaría las marcas de la regla)
    scroll(animate(ruler, { clipPath: hold('inset(0 100% 0 0)', 'inset(0 0% 0 0)') }, between(FROM, TO)), timeline);
  }

  const cards = all('[data-animate="ruler-card"]', track);
  const connectors = all('[data-animate="ruler-connector"]', track);
  const dots = all('[data-animate="ruler-dot"]', track);

  cards.forEach((card, i) => {
    // Momento en que la regla llega al punto de este paso (los puntos van al inicio de cada columna)
    const at = FROM + (i / cards.length + 0.03) * (TO - FROM);

    scroll(
      animate(
        card,
        { opacity: hold('0', '1'), transform: hold('translateY(16px)', 'translateY(0px)') },
        between(at - 0.1, at - 0.05),
      ),
      timeline,
    );
    if (connectors[i]) {
      scroll(
        animate(connectors[i], { transform: hold('scaleY(0)', 'scaleY(1)') }, between(at - 0.05, at - 0.01)),
        timeline,
      );
    }
    if (dots[i]) {
      scroll(
        animate(
          dots[i],
          { opacity: hold('0', '1'), transform: hold('scale(0.5)', 'scale(1)') },
          between(at - 0.01, at + 0.02),
        ),
        timeline,
      );
    }
  });
}
