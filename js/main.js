// ============================================
// Mr.Mora Software & AI - Main JavaScript
// ============================================

/**
 * Navegación entre páginas
 * Muestra la sección seleccionada y oculta las demás
 */
function showPage(pageId) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });

    // Mostrar página seleccionada
    document.getElementById(pageId).classList.add('active');

    // Actualizar link activo en navegación
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // Encontrar y activar el link clickeado
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('onclick').includes(pageId)) {
            link.classList.add('active');
        }
    });

    // Cerrar menú móvil
    document.getElementById('navLinks').classList.remove('active');

    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-activar animaciones de scroll
    setTimeout(checkScroll, 100);
}

/**
 * Toggle del menú móvil
 */
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

/**
 * Acordeón de FAQ
 * Abre/cierra las respuestas al hacer clic
 */
function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    // Cerrar todos los items FAQ
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
    });

    // Abrir el item clickeado si no estaba activo
    if (!isActive) {
        item.classList.add('active');
    }
}

/**
 * Animación de revelado al hacer scroll
 * Los elementos con clase .scroll-reveal se animan al entrar en viewport
 */
function checkScroll() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.classList.add('revealed');
        }
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Detectar scroll para animaciones
window.addEventListener('scroll', checkScroll);

// Inicializar animaciones al cargar
window.addEventListener('load', checkScroll);

// Cerrar menú móvil al hacer clic fuera
document.addEventListener('click', function(e) {
    const nav = document.querySelector('nav');
    const menu = document.getElementById('navLinks');
    if (!nav.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// ============================================
// UTILIDADES ADICIONALES
// ============================================

/**
 * Smooth scroll para enlaces internos
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

/**
 * Lazy loading para imágenes (futuro)
 * Descomenta cuando agregues imágenes reales
 */
/*
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
*/