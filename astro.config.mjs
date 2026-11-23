// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // Iconos: <Icon name="lucide:..." /> para interfaz y <Icon name="simple-icons:..." /> para marcas.
  // Se insertan como SVG al compilar; solo viajan los que se usan.
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
