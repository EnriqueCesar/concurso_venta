# Concurso Venta CN

Versión: `v4-2026-07-04-fix-pages`

Sitio estático listo para GitHub Pages desde `main` / `/root`.

## Publicación

Subir a la raíz del repositorio únicamente:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `.nojekyll`
- `README.md`
- `data/`
- `assets/`

## Cambios de esta versión

- Datos Dona G&G actualizados al 4 de julio desde `Base_Dona G&G`.
- Portafolio limitado a las 10 tiendas autorizadas.
- Métricas conservadas: Unidades Totales Periodo, Días válidos, USD Real, Objetivo USD y USD Real vs Objetivo.
- Fechas sin dato y unidades vacías no cuentan como cero ni como día válido.
- Limpieza de imágenes duplicadas no conectadas.
- `manifest.json` corregido con `start_url: "./"` y `scope: "./"`.
- `service-worker.js` actualizado con cache `concurso-venta-v4-2026-07-04-fix-pages` y rutas existentes.
- `.nojekyll` incluido en raíz para GitHub Pages.
