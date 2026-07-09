# Concurso de Venta CN

## Versión

**v8-dona-gg-promedio-venta-24-26**

Proyecto estático listo para GitHub Pages con PWA conservada.

## Fuente de datos

Archivo usado: **Base_Concurso_Dona&Items.xlsx**

Pestañas revisadas:

- **Dona G&G Sem 24 a Sem 26**: fuente del Promedio Sem 24–26.
- **Base_Dona G&G**: fuente operativa de Dona G&G.
- **Base_Concurso General**: se conserva sin cambios respecto a v7.

## Ajuste realizado

Se corrigió únicamente el **Promedio de Venta Semanas 24–26** en la pestaña **Dona G&G** usando la última columna **Prom** como valor oficial.

Valores cargados:

| Tienda | Promedio Sem 24–26 |
|---|---:|
| Cc Coacalco | 3.7 |
| Cosmopol | 3.5 |
| Cosmopol N1 | 3.1 |
| Galerias Perinorte | 6.3 |
| Izcalli Mega Df | 5.1 |
| Luna Park | 4.1 |
| Patio Ecatepec | 6.5 |
| Plaza Las Flores | 4.6 |
| Plaza San Marcos | 4.1 |
| San Miguel Izcalli | 4.8 |

## Lógica conservada Dona G&G

- **USD Real** conserva la lógica actual del proyecto.
- **Objetivo USD** usa el Promedio Sem 24–26 corregido.
- **Diferencia** = USD Real - Objetivo USD.
- El ranking Dona G&G se ordena por USD Real vs Objetivo USD.

## Concurso General

Se conserva la versión v7 sin modificar la lógica de cálculo:

**Uso Ideal* (#) × Pts Concurso General + Bonus ¿Y Si, Sí?**

## Validaciones realizadas

- `data/contest-data.js` actualizado con los promedios oficiales.
- Promedio Sem 24–26 ya no queda en cero para ninguna tienda.
- USD Real conserva su fórmula actual y recibe el objetivo actualizado.
- Ranking Dona G&G recalculado por diferencia vs objetivo.
- Concurso General conservado sin cambios de lógica.
- Sintaxis JavaScript validada con `node --check app.js`.
- JSON embebido en `data/contest-data.js` validado.
- Rutas de imágenes y data referenciadas validadas.
- `manifest.json` y `service-worker.js` conservan compatibilidad PWA.
- Ningún archivo supera 20 MB.

## Compatibilidad

Proyecto compatible con **GitHub Pages**. Mantiene estructura estática, `.nojekyll`, manifest y service worker.
