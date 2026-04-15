/**
 * ========================================
 * COMPONENTES REUTILIZABLES EN JAVASCRIPT
 * ========================================
 * Inyecta navbar y footer dinámicamente en todas las páginas
 *
 * Uso: Incluir este script al final del <body>
 * <script src="js/components.js"></script>
 */

// ========================================
// NAVBAR COMPONENTE
// ========================================
const NavbarComponent = `
<nav class="navbar">
    <div class="container nav-container">
        <div class="logo">
            <img src="images/logo1.png" alt="CorreSeguro" style="height: 70px; width: auto; margin-left: -20px;">
            <!-- Badge influencer: visible solo cuando ?influencer=nombre está activo -->
            <div id="influencer-badge"></div>
            <span>CorreSeguro</span>
            <span style="font-size: 0.7em; opacity: 0.8;"><a href="https://www.belsue.es/" class="enlaceWeb" target="_blank" rel="noopener noreferrer">by Belsué</a></span>
        </div>
        <button class="hamburger" id="hamburger" aria-label="Abrir menú" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <ul class="nav-menu" id="nav-menu">
            <li><a href="index.html#inicio">Inicio</a></li>
            <li><a href="index.html#coberturas">Coberturas</a></li>
            <li><a href="index.html#formulario">Contratar</a></li>
            <li><a href="index.html#contacto">Contacto</a></li>
            <li><a href="contorg.html">Organizadores-Pruebas Deportivas</a></li>
        </ul>
    </div>
</nav>
`;

// ========================================
// FOOTER COMPONENTE
// ========================================
const FooterComponent = `
<footer class="footer">
    <div class="container">
        <!-- Enlaces legales -->
        <div class="footer-legal">
            <a href="aviso-legal.html">Aviso Legal</a>
            <a href="politica-privacidad.html">Política de Privacidad</a>
            <a href="politica-transparencia.html">Transparencia</a>
        </div>

        <!-- Copyright y notas -->
        <div class="footer-info">
            <p>&copy; 2026 Belsué Seguros. Todos los derechos reservados.</p>
            <p class="footer-note">Una iniciativa de Belsué Mediación de Seguros</p>
        </div>

        <!-- Datos de contacto rápidos -->
        <div class="footer-contacto">
            <a href="https://maps.app.goo.gl/EkF1AN9heUcen4e46" target="_blank"><i class="fas fa-map-marker-alt"></i> Gran Vía 33, Zaragoza</a>
            <a href="tel:+34976221423"><i class="fas fa-phone"></i> 976 221 423</a>
            <a href="mailto:info@correseguro.es"><i class="fas fa-envelope"></i> info@correseguro.es</a>
        </div>
    </div>
</footer>
`;

// ========================================
// FUNCIONES DE INYECCIÓN
// ========================================

/**
 * Inserta el navbar en el primer <nav class="navbar"> encontrado
 * o al inicio del <body> si no existe
 */
function insertNavbar() {
    const existingNav = document.querySelector('nav.navbar');

    if (existingNav) {
        // Si existe un navbar, reemplazarlo
        existingNav.outerHTML = NavbarComponent;
    } else {
        // Si no existe, insertarlo al inicio del body
        document.body.insertAdjacentHTML('afterbegin', NavbarComponent);
    }
}

/**
 * Inserta el footer antes del cierre del </body>
 * o reemplaza el footer existente
 */
function insertFooter() {
    const existingFooter = document.querySelector('footer.footer');

    if (existingFooter) {
        // Si existe un footer, reemplazarlo
        existingFooter.outerHTML = FooterComponent;
    } else {
        // Si no existe, insertarlo antes del cierre de body
        document.body.insertAdjacentHTML('beforeend', FooterComponent);
    }
}

/**
 * Enlaza los eventos del menú hamburguesa
 */
function initHamburger() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('nav-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.remove('open');
            btn.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
}

/**
 * Inicializa todos los componentes
 * Se ejecuta cuando el DOM está listo
 */
function initComponents() {
    insertNavbar();
    insertFooter();
    initHamburger();
}

// ========================================
// EJECUCIÓN AUTOMÁTICA
// ========================================

// Ejecutar cuando el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    // Si el script se carga después de que el DOM ya esté listo
    initComponents();
}
