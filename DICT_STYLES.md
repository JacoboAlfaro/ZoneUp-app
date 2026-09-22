# Diccionario de estilos · ZoneUp

Guía de referencia para mantener una interfaz visual consistente en ZoneUp.

Los estilos personalizados están definidos principalmente en `global.css`.
En los componentes se deben utilizar las clases `zu-*` en lugar de valores hexadecimales o colores definidos directamente.

---

## 1. Principios generales

* Usar las clases `zu-*` para los colores definidos por ZoneUp.
* Evitar colores hexadecimales directamente dentro de los componentes.
* Mantener la jerarquía tipográfica definida en este documento.
* Usar `font-bold` para elementos de mayor jerarquía visual.
* Usar `font-semibold` para acciones, etiquetas importantes y títulos secundarios.
* Usar `font-medium` para etiquetas de formularios.
* Mantener los textos secundarios en `zu-slate`.
* Priorizar `zu-navy` para elementos principales y de interacción.
* Mantener suficiente contraste entre texto y fondo.

---

# 2. Colores

## 2.1 Paleta principal

| Clase       | Valor     | Uso                                                                 |
| ----------- | --------- | ------------------------------------------------------------------- |
| `zu-navy`   | `#1E3A5F` | Color principal, botones, títulos, enlaces y opciones seleccionadas |
| `zu-slogan` | `#4A8EC4` | Textos pequeños de marca                                            |
| `zu-accent` | `#7EC8E3` | Detalles decorativos y líneas de acento                             |

### `zu-navy`

Color principal de ZoneUp.

Usar en:

* Títulos.
* Botones principales.
* Enlaces.
* Texto destacado.
* Opciones seleccionadas.
* Nombres de entidades.

```text
text-zu-navy
bg-zu-navy
border-zu-navy
```

---

## 2.2 Fondos

| Clase           | Valor     | Uso                                        |
| --------------- | --------- | ------------------------------------------ |
| `zu-sky-bottom` | `#D4ECF8` | Fondo de login y registro                  |
| `zu-sky-mid`    | `#9FD4F0` | Decoraciones e iconos                      |
| `zu-sky-fade`   | `#EEF8FC` | Fondos suaves de pantallas administrativas |
| `zu-sky-top`    | `#6BB8E8` | Bordes o indicadores de foco               |

---

## 2.3 Neutros

| Clase       | Valor     | Uso                                                       |
| ----------- | --------- | --------------------------------------------------------- |
| `zu-white`  | `#FFFFFF` | Tarjetas, inputs y superficies                            |
| `zu-slate`  | `#6B8698` | Texto secundario y metadatos                              |
| `zu-border` | `#C5D5E0` | Bordes de inputs, buscadores y elementos no seleccionados |

### `zu-slate`

Usar para contenido de menor jerarquía visual:

* Descripciones.
* Subtítulos.
* Fechas.
* Metadatos.
* Mensajes vacíos.
* Texto de apoyo.

```text
text-zu-slate
```

### `zu-border`

Usar para separar visualmente elementos sin generar demasiado contraste.

```text
border-zu-border
```

---

## 2.4 Superficies

| Clase          | Valor                       | Uso                                |
| -------------- | --------------------------- | ---------------------------------- |
| `zu-card`      | `rgba(255, 255, 255, 0.9)`  | Tarjetas blancas semitransparentes |
| `zu-card-cyan` | `rgba(200, 235, 245, 0.82)` | Tarjetas celestes translúcidas     |

Estas superficies están disponibles para componentes que necesiten una separación visual del fondo sin utilizar un blanco completamente sólido.

---

## 2.5 Decoración

| Clase        | Valor     | Uso                              |
| ------------ | --------- | -------------------------------- |
| `zu-skyline` | `#7A93A8` | Ilustraciones y siluetas urbanas |

---

# 3. Tipografía

ZoneUp utiliza la fuente del sistema del dispositivo.

No se utiliza actualmente una fuente personalizada.

## 3.1 Pesos

| Clase           | Peso | Uso                                            |
| --------------- | ---: | ---------------------------------------------- |
| `font-medium`   |  500 | Etiquetas de campos                            |
| `font-semibold` |  600 | Botones, secciones, chips y títulos de bloque  |
| `font-bold`     |  700 | Títulos, nombres, números destacados y enlaces |
| Regular         |  400 | Descripciones, valores y texto de apoyo        |

---

## 3.2 Tamaños

| Clase       | Uso                                            |
| ----------- | ---------------------------------------------- |
| `text-3xl`  | Títulos principales y estadísticas             |
| `text-2xl`  | Títulos intermedios                            |
| `text-lg`   | Títulos de tarjetas y nombres de elementos     |
| `text-base` | Texto normal, formularios y botones            |
| `text-sm`   | Información secundaria y metadatos             |
| `text-xs`   | Etiquetas, chips, secciones y errores pequeños |

---

# 4. Jerarquía de texto

## Título de pantalla

Usar para el título principal de cada pantalla.

```text
text-3xl font-bold text-zu-navy
```

Ejemplos:

* Accede
* Hola, Usuario
* Mi perfil

---

## Título de tarjeta

Usar para nombres o títulos dentro de tarjetas.

```text
text-lg font-bold text-zu-navy
```

---

## Título intermedio

Usar cuando se necesite una jerarquía entre el título de pantalla y el título de tarjeta.

```text
text-2xl font-bold text-zu-navy
```

---

## Texto de apoyo

Usar para descripciones y contenido secundario.

```text
text-base text-zu-slate
```

o:

```text
text-sm text-zu-slate
```

---

## Etiqueta de campo

Usar para labels de formularios.

```text
text-xs font-medium text-zu-slate
```

---

## Etiqueta de sección

Usar para separar grupos de contenido.

```text
text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50
```

---

## Texto de marca

Usar para elementos como:

* ZoneUp
* Registro
* Inicio de sesión

```text
text-xs font-semibold uppercase tracking-[3px] text-zu-slogan
```

---

## Botón

Los botones utilizan el tamaño de texto normal.

```text
text-base font-semibold text-white
```

El color de fondo dependerá del tipo de botón.

### Botón principal

```text
bg-zu-navy text-white font-semibold
```

### Botón secundario

`Button` usa borde claro y texto oscuro cuando `secondary` está activo.

```text
border border-neutral-300 text-neutral-700 font-semibold
```

---

## Enlace

```text
text-base font-bold text-zu-navy
```

---

## Error

Para errores de validación se utilizan tonos rojos del sistema de Tailwind.

```text
text-base text-red-700
```

Para mensajes pequeños:

```text
text-xs text-red-600
```

---

# 5. Estados

Los componentes interactivos deben diferenciar visualmente sus estados.

## Default

Estado normal del componente.

## Focus

Los campos usan `zu-sky-top` cuando están seleccionados.
En `Field` se aplica por estado, no con el prefijo `focus:`.

```text
border-zu-sky-top
```

## Disabled

Los elementos deshabilitados reducen su contraste.

```text
disabled:opacity-50
```

## Error

Los campos con error usan `border-red-400`.
Los mensajes usan `text-red-600` o `text-red-700`.

```text
border-red-400
text-red-600
```

## Selected / Active

Las opciones seleccionadas resaltan con `zu-navy`.
No siempre llenan el fondo: a veces solo cambian borde y texto.

```text
border-zu-navy bg-zu-navy/10 text-zu-navy
```

---

# 6. Espaciado

Usar la escala de Tailwind. Estos son los valores que ya se repiten en la app.

### Separación entre elementos (`gap`)

| Clase      | Uso actual |
| ---------- | ---------- |
| `gap-1.5`  | Etiqueta y campo en `Field` y `Select`. |
| `gap-2`    | Título con subtítulo, chips y acciones cercanas. |
| `gap-3`    | Campos dentro de una tarjeta y filas de estadísticas. |
| `gap-4`    | Contenido de algunos formularios con scroll. |
| `gap-5`    | Bloques de perfil y formulario de registro. |
| `gap-6`    | Bloques internos del login. |

### Padding interno (`p`, `px`, `py`)

| Clase            | Uso actual |
| ---------------- | ---------- |
| `px-4 py-3`      | Inputs de `Field`. |
| `p-4`            | Tarjetas de listado, estadísticas y navegación. |
| `p-5`            | Tarjetas de detalle y formularios. |
| `p-6`            | Padding de pantallas y tarjeta de login. |
| `px-5 pb-8 pt-3` | Scroll de listados administrativos. |

### Separación entre bloques (`mt`)

| Clase   | Uso actual |
| ------- | ---------- |
| `mt-3`  | Ítems de una lista. |
| `mt-5`  | Botón principal y siguiente bloque. |
| `mt-6`  | Buscador o grupo de estadísticas. |
| `mt-8`  | Etiqueta de sección tipo “Listado”. |

Evitar valores arbitrarios si existe una utilidad estándar equivalente.

---

# 7. Bordes y radios

## Radios

| Clase         | Uso actual |
| ------------- | ---------- |
| `rounded-xl`  | Botones (`Button`) y mensajes de error. |
| `rounded-2xl` | Inputs, tarjetas, buscadores y estados vacíos. |
| `rounded-3xl` | Tarjeta grande de login y registro. |
| `rounded-full`| Chips, badges e indicadores circulares. |

`rounded-lg` casi no se usa. El radio estándar de ZoneUp es `rounded-2xl`.

## Bordes

| Clase                 | Uso actual |
| --------------------- | ---------- |
| `border-zu-border`    | Inputs, buscadores y opciones no seleccionadas. |
| `border-zu-white/70`  | Tarjetas sobre fondo claro. |
| `border-zu-sky-top`   | Campo enfocado. |
| `border-zu-navy`      | Opción seleccionada. |
| `border-red-400`      | Campo con error. |

Las tarjetas suelen combinarse así:

```text
rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm
```

Los inputs de `Field` así:

```text
rounded-2xl border border-zu-border bg-zu-white/95 px-4 py-3
```

Los botones así:

```text
rounded-xl p-4
```

---

# 8. Clases que deben evitarse

Evitar definir colores directamente en los componentes:

```text
text-[#1E3A5F]
bg-[#D4ECF8]
border-[#C5D5E0]
```

Preferir:

```text
text-zu-navy
bg-zu-sky-bottom
border-zu-border
```

Esto permite modificar la identidad visual de ZoneUp desde `global.css` sin tener que buscar colores dentro de múltiples componentes.