// ============================================
// Mr.Mora Software & AI - Main JavaScript
// ============================================

const GROWTH_AVAILABLE_SLOTS = null;
const DEFAULT_PAGE_TITLE = document.title;
const DEFAULT_META_DESCRIPTION = document.querySelector('meta[name="description"]')?.content || '';
const GROWTH_FORM_MESSAGES = {
    success: '¡Listo! Recibimos tus datos. Te contactaremos muy pronto para agendar tu llamada.',
    error: 'Algo salió mal al enviar el formulario. Por favor, inténtalo de nuevo en unos minutos.',
    required: 'Este campo es obligatorio.',
    email: 'Escribe un email válido.',
    phone: 'Escribe un número de teléfono válido.'
};

/**
 * Navegación entre páginas
 * Muestra la sección seleccionada y oculta las demás
 */
function showPage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    // Ocultar todas las páginas
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });

    // Mostrar página seleccionada
    page.classList.add('active');

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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });

    const isGrowthPage = pageId === 'growth';
    document.title = isGrowthPage
        ? 'Marketing y Growth para pequeñas empresas | Atrae más clientes en automático'
        : DEFAULT_PAGE_TITLE;
    document.querySelector('meta[name="description"]').content = isGrowthPage
        ? 'Sistema completo de atracción de clientes para pequeñas empresas: SEO local, anuncios y automatizaciones con IA en una membresía mensual. Agenda tu auditoría gratis.'
        : DEFAULT_META_DESCRIPTION;

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
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            const ownerPage = target.closest('.page-section');
            if (ownerPage && !ownerPage.classList.contains('active')) {
                showPage(ownerPage.id);
            }
            target.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        }
    });
});

function initializeGrowthForm() {
    const form = document.getElementById('growth-form');
    if (!form) return;

    const availability = document.getElementById('growth-availability');
    if (Number.isInteger(GROWTH_AVAILABLE_SLOTS) && GROWTH_AVAILABLE_SLOTS >= 0) {
        availability.textContent = `Solo incorporamos 5 negocios nuevos al mes para mantener la calidad de los resultados. Cupos disponibles este mes: ${GROWTH_AVAILABLE_SLOTS}`;
        availability.hidden = false;
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        const message = document.getElementById('growth-form-message');
        const fields = [
            { input: form.elements.name, error: document.getElementById('growth-name-error') },
            { input: form.elements.email, error: document.getElementById('growth-email-error') },
            { input: form.elements.phone, error: document.getElementById('growth-phone-error') },
            { input: form.elements.businessType, error: document.getElementById('growth-business-error') }
        ];
        let firstInvalidField = null;

        fields.forEach(({ input, error }) => {
            const value = input.value.trim();
            let errorMessage = '';

            if (!value) {
                errorMessage = GROWTH_FORM_MESSAGES.required;
            } else if (input.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = GROWTH_FORM_MESSAGES.email;
            } else if (input.name === 'phone') {
                const digits = value.replace(/\D/g, '');
                if (!/^\+?[\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
                    errorMessage = GROWTH_FORM_MESSAGES.phone;
                }
            }

            error.textContent = errorMessage;
            input.setAttribute('aria-invalid', String(Boolean(errorMessage)));
            if (errorMessage && !firstInvalidField) firstInvalidField = input;
        });

        if (firstInvalidField) {
            message.textContent = '';
            firstInvalidField.focus();
            return;
        }

        // TODO: conectar el servicio elegido y llamar showGrowthFormResult(true) solo tras confirmar la recepción.
        showGrowthFormResult(false);
    });
}

function showGrowthFormResult(success) {
    const message = document.getElementById('growth-form-message');
    message.textContent = success ? GROWTH_FORM_MESSAGES.success : GROWTH_FORM_MESSAGES.error;
    if (success) document.getElementById('growth-form').reset();
}

initializeGrowthForm();

const initialTarget = window.location.hash && document.querySelector(window.location.hash);
if (initialTarget) {
    const ownerPage = initialTarget.closest('.page-section');
    if (ownerPage && !ownerPage.classList.contains('active')) showPage(ownerPage.id);
    initialTarget.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
}

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