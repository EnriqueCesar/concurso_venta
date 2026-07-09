# Concurso de Venta CN

## Versión

**v6-concurso-general-ranking-bonus**

Proyecto estático listo para GitHub Pages con PWA conservada.

## Fuente de datos

Archivo usado: **Base_Concurso_Dona&Items.xlsx**

Pestañas principales:

- **Base_Dona G&G**: alimenta la pestaña **Dona Grab & Go**.
- **Base_Concurso General**: alimenta la pestaña **Concurso General**.
- **Y Si Sí**: alimenta el bonus de publicaciones.
- **Imagenes**: catálogo de productos, nombre simple, imagen y puntos.

La carga se trabajó por nombre de encabezado, no por posición fija.

## Productos Concurso General

| Nombre Reporte | Nombre Simple | Imagen | Puntos |
|---|---|---:|---:|
| Dona Grab & Go | Dona Grab & Go | Dona G&G.jpeg | 1 |
| Bis Nal Cheesecake Roulet Maxi | Cheesecake Roulet | Cheescake Roulete.jpeg | 1 |
| Bis Pan De Chocolate Margarina C | Pan de Chocolate | Pan de Chocolate.jpeg | 1 |
| Cookie Straw CJ/6 LTA/25 pzas | Cookie Straw | Cookie Straw.jpeg | 0.5 |

## Regla de puntos

El total del **Concurso General** por tienda considera:

- Dona Grab & Go x 1 punto.
- Cheesecake Roulet x 1 punto.
- Pan de Chocolate x 1 punto.
- Cookie Straw x 0.5 puntos.
- Bonus **¿Y Si, Sí?** x 5 puntos por partner publicado.

## Bonus ¿Y Si, Sí?

Regla: **5 puntos por cada Partner** que publique ¿Y Si, Sí? con:

- #OrgulloCN
- #DistritoKike
- #ModoMundialistaON

Límite: **domingo 5 de julio · 09:00 pm**.

Puntos cargados por tienda:

| Tienda | Partners | Puntos |
|---|---:|---:|
| Cc Coacalco | 2 | 10 |
| Cosmopol | 1 | 5 |
| Cosmopol N1 | 2 | 10 |
| Galerias Perinorte | 1 | 5 |
| Izcalli Mega Df | 1 | 5 |
| Luna Park | 2 | 10 |
| Patio Ecatepec | 2 | 10 |
| Plaza Las Flores | 4 | 20 |
| Plaza San Marcos | 1 | 5 |
| San Miguel Izcalli | 2 | 10 |

## Ajustes realizados

- Se conservó la pestaña **Dona Grab & Go** con su lógica de ranking por USD Real vs Objetivo USD.
- Se actualizó `data/contest-data.js` desde el Excel entregado.
- Se activó la pestaña **Concurso General** como dashboard de ranking.
- Se integró ranking de tiendas, puntos totales, avance por producto, bonus aplicado, posición y diferencia contra la tienda anterior.
- Se agregó resumen ejecutivo y tabla clara del bonus.
- Se validaron las imágenes esperadas en `assets/products`. No fue necesario cambiar nombres ni rutas porque existen exactamente:
  - `assets/products/Dona G&G.jpeg`
  - `assets/products/Cheescake Roulete.jpeg`
  - `assets/products/Pan de Chocolate.jpeg`
  - `assets/products/Cookie Straw.jpeg`

## Validaciones realizadas

- `index.html`, `app.js`, `styles.css`, `manifest.json`, `service-worker.js`, `assets` y `data` revisados.
- Sintaxis JavaScript validada con `node --check app.js`.
- JSON embebido de `data/contest-data.js` validado.
- Rutas locales referenciadas por HTML/JS/DATA verificadas contra archivos existentes.
- Ranking de Concurso General ordenado de mayor a menor por puntos totales.
- Bonus **¿Y Si, Sí?** sumado al total general.
- Productos con puntos correctos: 1, 1, 1 y 0.5.
- Archivos del proyecto verificados por tamaño: ninguno supera 20 MB.

## Compatibilidad

Proyecto compatible con **GitHub Pages**. Mantiene estructura estática, `.nojekyll`, manifest y service worker.
