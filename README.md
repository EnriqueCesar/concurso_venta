# Concurso Venta CN

Versión: `v5-2026-07-05-db-update`

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

- Nueva versión declarada: `v5-2026-07-05-db-update`.
- Fecha de actualización de base: `05/07/2026`.
- Archivo fuente utilizado: `Base_Concurso_Dona&Items.xlsx`.
- Hoja utilizada: `Base_Dona G&G`.
- Sección impactada: `Concurso Dona G&G` / Dona Grab & Go.
- Datos Dona G&G actualizados al 5 de julio de 2026 desde `Base_Dona G&G`.
- Portafolio limitado a las 10 tiendas autorizadas.
- Métricas conservadas: Unidades Totales Periodo, Días válidos, USD Real, Objetivo USD y USD Real vs Objetivo.
- Fechas sin dato y unidades vacías no cuentan como cero ni como día válido.
- Compatibilidad conservada con GitHub Pages.
- `service-worker.js` conserva rutas existentes y actualiza el cache a `v5-2026-07-05-db-update` para evitar servir data anterior.
