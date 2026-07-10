# Concurso de Venta CN

## Versión

**v8-data-08-julio-ui-cleanup**

Proyecto estático actualizado y listo para desplegar en GitHub Pages, conservando la arquitectura, la navegación, los rankings y la PWA existentes.

## Fuente de datos

Archivo utilizado: **Base_Concurso_Dona&Items.xlsx**

Pestañas actualizadas:

- **Base_Dona G&G**
- **Base_Concurso General**

Fecha máxima integrada: **08/07/2026**.

La regeneración trabaja por nombre de hoja y encabezado mediante:

```bash
python scripts/refresh_data.py Base_Concurso_Dona\&Items.xlsx
```

## Cambios realizados

- Data de Dona Grab & Go actualizada al 8 de julio de 2026.
- Data de Concurso General actualizada al 8 de julio de 2026.
- Rankings, acumulados, ponderaciones y puntos recalculados con las reglas existentes.
- Tarjetas de producto simplificadas para mostrar únicamente imagen, nombre simple y ponderación por pieza.
- Piezas acumuladas, puntos acumulados y líder permanecen en la estructura de datos para cálculos, pero se ocultan de la tarjeta visual.
- Ajustes de espaciado, contraste, jerarquía y responsive en las tarjetas.
- Icono de ampliación sustituido por SVG monoline.
- Caché del service worker actualizado para publicar la nueva versión.

## Regla conservada

El Concurso General mantiene:

**Uso Ideal* (#) × Pts Concurso General + Bonus ¿Y Si, Sí?**

Dona Grab & Go conserva el cálculo de USD Real, Objetivo USD, diferencia y ranking de la versión anterior.

## Validaciones realizadas

- Fecha máxima de ambas bases: 08/07/2026.
- 71 registros en Base_Dona G&G.
- 104 registros en Base_Concurso General.
- Sin duplicados exactos en las pestañas actualizadas.
- Rutas de data, imágenes, manifest y service worker verificadas.
- Sintaxis JavaScript validada.
- Manifest JSON válido.
- Service worker conserva precaché y actualización de versión.
- Ningún archivo individual supera 20 MB.
- Estructura relativa compatible con GitHub Pages.

## Compatibilidad

Compatible con GitHub Pages y funcionamiento PWA mediante `manifest.json`, `service-worker.js` y `.nojekyll`.
