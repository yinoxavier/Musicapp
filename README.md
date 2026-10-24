# Músicapp

Aplicación web para el ministerio de música: canciones, repertorio, calendario, escalas y respaldo de datos. Usa Firebase (Firestore) para guardar la información.

## Archivos

- `index.html`: página principal
- `login.js`: pantalla de inicio de sesión (usuario y contraseña están al inicio del archivo)
- `estilos.css`: estilos generales. Los colores, radios y sombras están como variables al inicio (`--azul`, `--oro`, `--fondo`...); cámbialos ahí para ajustar toda la app
- `base.js`: conexión a Firebase, funciones comunes y navegación
- `canciones.js`, `editor.js`, `formato.js`, `etiquetas.js`, `musica.js`: canciones y su editor
- `repertorio.js`, `calendario.js`, `escalas.js`, `respaldo.js`, `estado.js`: resto de secciones
- `hoja.js`: cómo se dibuja cada canción en la hoja (lo usan la vista previa y la ventana Compartir)
- `ver.js`: ventana Compartir de un repertorio (`#ver/ID`)
- `musica.js`: tonos y transposición (la usan el editor y la ventana Compartir)
- `firebase-config.js`: configuración del proyecto de Firebase

## Inicio de sesión

Usuario `admin`, contraseña `admin`. Para cambiarlos, edita `USUARIO` y `CLAVE` al inicio de `login.js`.

Es solo una pantalla de acceso: como el código es público, no protege los datos guardados en Firebase.

## Compartir un repertorio

En Repertorio, el botón de compartir (ícono) abre el menú de compartir del celular, o en la computadora abre la ventana en una pestaña nueva y copia el enlace. Ese enlace se abre **sin usuario ni contraseña** y es solo para ver.

En esa ventana cada persona puede mostrar u ocultar los acordes y tocar «Tono» en cada canción para transponerla. Esos cambios son solo de su pantalla: no se guardan, no cambian la canción y se pierden al recargar.

## Cómo ejecutarla

Los scripts son módulos de JavaScript, así que hay que abrirla desde un servidor (no con doble clic en `index.html`). Por ejemplo:

```
npx serve .
```

También funciona publicada en GitHub Pages o en Firebase Hosting.
