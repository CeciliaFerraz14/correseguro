# Guía de Componentes Reutilizables (JavaScript)

## ✅ Estado Actual

Los componentes navbar y footer se inyectan automáticamente mediante **JavaScript** en todos los archivos HTML.

### Archivos ya actualizados:
- ✅ **index.html** - Carga `js/components.js`
- ✅ **contorg.html** - Carga `js/components.js`
- ✅ **eventos.html** - Carga `js/components.js`
- ✅ **gracias.html** - (página especial sin navbar/footer)

---

## 🎯 Cómo Funciona

### Componente Principal: `js/components.js`

Este archivo contiene:
1. **NavbarComponent** - HTML del navbar
2. **FooterComponent** - HTML del footer
3. **insertNavbar()** - Inyecta o reemplaza el navbar
4. **insertFooter()** - Inyecta o reemplaza el footer
5. **initComponents()** - Ejecuta ambas funciones

El script se ejecuta automáticamente cuando el DOM está listo.

---

## 📝 Cómo Agregar a Otros Archivos HTML

### Para cualquier archivo HTML que tenga navbar/footer:

1. Abre el archivo `.html`

2. Encuentra el cierre de `</body>` (última línea antes de `</html>`)

3. Agrega esta línea antes del cierre de `</body>`:
   ```html
   <script src="js/components.js"></script>
   ```

4. Ejemplo:
   ```html
   <!-- Otros scripts -->
   <script src="js/otroScript.js"></script>
   
   <!-- Componentes reutilizables -->
   <script src="js/components.js"></script>
   </body>
   </html>
   ```

---

## 🔧 Cómo Editar los Componentes

Si necesitas cambiar el navbar o footer:

1. Abre `js/components.js`

2. Busca:
   - `const NavbarComponent = \`` para editar el navbar
   - `const FooterComponent = \`` para editar el footer

3. Realiza tus cambios

4. **Automáticamente se actualizan en TODOS los archivos HTML**

---

## ✨ Ventajas

✅ **Un único lugar de edición** - Cambia navbar/footer en `js/components.js` y se aplica globalmente

✅ **Compatibilidad total** - Funciona con archivos `.html` estáticos, sin necesidad de `.php`

✅ **Sin duplicación** - No hay código repetido en múltiples archivos

✅ **Fácil de mantener** - Solo un archivo JavaScript para manejar ambos componentes

✅ **Escalable** - Puedes agregar más componentes (header, sidebar, etc.) siguiendo el mismo patrón

---

## 📋 Ejemplo Práctico

### Antes (sin componentes):
```html
<body>
    <!-- HTML navbar duplicado en cada página -->
    <nav class="navbar">
        <div class="container">
            <!-- mucho HTML... -->
        </div>
    </nav>
    
    <!-- Contenido específico de la página -->
    <main>...</main>
    
    <!-- HTML footer duplicado en cada página -->
    <footer class="footer">
        <div class="container">
            <!-- mucho HTML... -->
        </div>
    </footer>
</body>
```

### Después (con componentes):
```html
<body>
    <!-- Los scripts inyectarán navbar y footer automáticamente -->
    
    <!-- Contenido específico de la página -->
    <main>...</main>
    
    <!-- Carga el componente al final -->
    <script src="js/components.js"></script>
</body>
```

---

## 🚀 Lista de Archivos a Actualizar

Verifica estos archivos y agrega `<script src="js/components.js"></script>` antes de `</body>`:

- [ ] eventos.html ✅ (ya hecho)
- [ ] politica-privacidad.html
- [ ] politica-cookies.html
- [ ] aviso-legal.html
- [ ] terminos-condiciones.html
- [ ] politica-transparencia.html

---

## 💡 Estructura del Archivo

```
js/
├── components.js          ← Navbar y Footer reutilizables
├── formulario.js
├── chatbot.js
└── ... otros scripts
```

---

## ⚠️ Notas Importantes

1. **Orden de scripts** - `components.js` debe cargarse después que el DOM esté listo (al final del `<body>`)

2. **Reemplazo automático** - Si el HTML ya tiene `<nav class="navbar">`, será reemplazado automáticamente

3. **Inyección dinámica** - Si no existe navbar/footer, el script los inyectará al inicio/final del body

4. **Sin dependencias externas** - Solo usa JavaScript vanilla, sin jQuery u otras librerías

---

## 🔍 Solución de Problemas

### Si el navbar/footer no aparece:
1. Verifica que `js/components.js` esté en la carpeta correcta
2. Abre la consola del navegador (F12) y busca errores
3. Asegúrate de que el script está al final del `<body>`

### Si los estilos no se aplican:
1. Verifica que `css/styles.css` esté cargado antes de los scripts
2. Comprueba que las clases CSS coinciden con los nombres en `components.js`

---

**¿Necesitas agregar otro componente? Solo sigue el mismo patrón en `js/components.js`**
