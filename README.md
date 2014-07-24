# Kokusai

**Kokusai** es un módulo de internacionalización para Kraken, que maneja las
traducciones y configuraciones del sitio para cada país e idioma.

En un futuro se espera que sea manejado como un módulo completamente
independiente, pudiendo utilizarse en cualquier sitio.

### Estructura del módulo

`/lib/locale` maneja la funcionalidad principal, que consiste en obtener el
pais e idioma, y dependiendo de ello cargar el contenido correspondiente. Posee
diferentes funciones para cada tipo de contenido (traducciones, configuraciones,
etc).

`/lib/translation` se encarga de generar el objeto de localizaciones y
traducciones, partiendo desde los parámetros generales y refinando hasta
el grado de internacionalización especificado.

`/lib/dust-helpers` contiene un helper denominado `tr`, que a partir de una
clave (y un texto opcional de fallback) obtiene el texto adaptado al país e
idioma utilizados en la página actual.

### Uso del helper *tr*

La sintaxis en las plantillas *dust* es la siguiente:

`{@tr key="elemento"}Texto de fallback{/tr}`

En caso que no se encuentren traducciones para la clave `elemento` en el pais o
el idioma, `Texto de fallback` seria mostrado en este caso.

El parametro `key` recibe una ruta que soporta múltiples grados de profundidad,
por lo que si tuvieramos un arbol de traducciones de la forma:

```json
{
  "padre": {
    "nombre": "Kokusai",
    "hijo": {
      "nombre": "Jadorcha",
    }
  }
}
```
Definiendo `{@tr key="padre.nombre"}Texto de fallback{/tr}` obtendríamos
`Kokusai` como resultado, mientras que
`{@tr key="padre.hijo.nombre"}Texto de fallback{/tr}` devolvería `Jadorcha`.

### Estructura de archivos de localización

De la misma forma que con Makara (el módulo de internacionalización por defecto
de Kraken), los archivos de localización serán incluidos en el directorio
`locale`, el cual contiene una estructura interna similar a la siguiente:
```
.
├── US
|   ├── en
|   |   └── localization.js
|   ├── es
|   |   └── localization.js
|   └── localization.js
├── UY
|   ├── es
|   |   └── localization.js
|   └── localization.js
└── default
    ├── es
    |   └── localization.js
    └── en
        └── localization.js
```

Existirá un subdirectorio para cada país, que deberá contener:

* Un subdirectorio por idioma, que contenga el archivo de localización
  correspondiente a las traducciones locales del idioma para el país.
* Un archivo de localización genérico, que únicamente se encarga de definir el
  idioma por defecto de un pais y redirigir a su archivo de traducción
  correspondiente.

Además de esto, existe un subdirectorio `default`, que contendrá las
traducciones generales para cada idioma. Kokusai se encargará en cada caso de
reemplazar estas traducciones por las traducciones locales, en caso que estén
especificadas.
