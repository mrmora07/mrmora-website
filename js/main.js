// Mr.Mora Software & AI - Navegación y formularios

const MONTHLY_AVAILABLE_SLOTS = null;
const CALENDAR_URL = '';
const WHATSAPP_NUMBER = '';

const FORM_MESSAGES = {
    success: '¡Listo! Recibimos tus datos. Te contactaremos muy pronto para agendar tu llamada.',
    error: 'Algo salió mal al enviar el formulario. Por favor, inténtalo de nuevo en unos minutos.',
    required: 'Este campo es obligatorio.',
    email: 'Escribe un email válido.',
    phone: 'Escribe un número de teléfono válido.'
};

const HERO_NOTES = [
    { icon: '⭐', text: 'Nueva reseña de 5 estrellas', area: 'growth' },
    { icon: '📞', text: 'Llamada perdida → SMS enviado al instante', area: 'automation' },
    { icon: '🔗', text: 'CRM y calendario sincronizados', area: 'software' },
    { icon: '📄', text: 'Cotización enviada automáticamente', area: 'automation' },
    { icon: '📍', text: 'Nuevo contacto desde Google', area: 'growth' },
    { icon: '📅', text: 'Cita agendada para mañana', area: 'automation' },
    { icon: '💻', text: 'Nueva función publicada en tu sistema', area: 'software' },
    { icon: '🔁', text: 'Seguimiento automático enviado', area: 'automation' },
    { icon: '🎯', text: 'Tu anuncio trajo un nuevo interesado', area: 'growth' },
    { icon: '📊', text: 'Reporte semanal listo en tu correo', area: 'automation' },
    { icon: '🧾', text: 'Factura creada automáticamente', area: 'automation' },
    { icon: '🤖', text: 'Interesado calificado automáticamente', area: 'automation' }
];

const HERO_SLOT_SETS = {
    desktop: [0, 1, 3, 4],
    mobile: [0, 1]
};

let heroRotationTimer = null;
let heroTransitionTimer = null;
let heroIntersectionObserver = null;
let heroIsInView = false;
let heroNextNoteIndex = 4;
let heroActiveSlotIndexes = [];
let heroSetupMedia = null;
let heroLayoutMode = '';
let heroResizeListenerAdded = false;

function renderHeroNote(slot, note) {
    const card = slot.querySelector('.hero-note-card');
    const icon = document.createElement('span');
    const text = document.createElement('span');
    icon.className = 'note-icon';
    icon.textContent = note.icon;
    text.textContent = note.text;
    card.replaceChildren(icon, text);
    slot.dataset.area = note.area;
}

function stopHeroRotation() {
    if (heroRotationTimer) {
        window.clearTimeout(heroRotationTimer);
        heroRotationTimer = null;
    }
}

function startHeroRotation() {
    stopHeroRotation();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heroRect = document.getElementById('inicio').getBoundingClientRect();
    heroIsInView = heroRect.bottom > 0 && heroRect.top < window.innerHeight && heroRect.right > 0 && heroRect.left < window.innerWidth;
    if (reducedMotion || !heroIsInView || document.hidden) return;

    heroRotationTimer = window.setTimeout(rotateHeroNote, 2800);
}

function updateHeroVisibility() {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
    heroIsInView = isVisible;
    if (isVisible) {
        if (!heroRotationTimer) startHeroRotation();
    } else {
        stopHeroRotation();
    }
}

function rotateHeroNote() {
    heroRotationTimer = null;
    const slots = [...document.querySelectorAll('.hero-note-slot')];
    const activeSlots = heroActiveSlotIndexes
        .map(index => slots[index])
        .filter(slot => slot.classList.contains('is-visible'));
    if (!activeSlots.length) return;

    const outgoing = activeSlots[Math.floor(Math.random() * activeSlots.length)];
    const outgoingIndex = Number(outgoing.dataset.slot);
    outgoing.classList.remove('is-visible');
    outgoing.classList.add('is-leaving');

    heroTransitionTimer = window.setTimeout(() => {
        heroTransitionTimer = null;
        outgoing.classList.remove('is-leaving');
        const freeSlots = slots.filter(slot => !slot.classList.contains('is-visible'));
        const availableSlots = freeSlots.filter(slot => Number(slot.dataset.slot) !== outgoingIndex);
        const entering = availableSlots[Math.floor(Math.random() * availableSlots.length)] || outgoing;
        const enteringIndex = Number(entering.dataset.slot);
        heroActiveSlotIndexes = heroActiveSlotIndexes.filter(index => index !== outgoingIndex);
        heroActiveSlotIndexes.push(enteringIndex);
        renderHeroNote(entering, HERO_NOTES[heroNextNoteIndex % HERO_NOTES.length]);
        heroNextNoteIndex += 1;
        window.requestAnimationFrame(() => entering.classList.add('is-visible'));
        startHeroRotation();
    }, 500);
}

function initializeHeroNotes() {
    const hero = document.getElementById('inicio');
    const visual = document.getElementById('hero-visual');
    if (!hero || !visual) return;

    if (heroIntersectionObserver) heroIntersectionObserver.disconnect();
    stopHeroRotation();
    if (heroTransitionTimer) {
        window.clearTimeout(heroTransitionTimer);
        heroTransitionTimer = null;
    }

    const mobile = window.matchMedia('(max-width: 850px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heroLayoutMode = `${mobile}-${reducedMotion}`;
    const slots = [...visual.querySelectorAll('.hero-note-slot')];
    const selectedSlots = reducedMotion ? HERO_SLOT_SETS.desktop : (mobile ? HERO_SLOT_SETS.mobile : HERO_SLOT_SETS.desktop);
    const fixedReducedMotionNotes = [0, 1, 2, 3];

    slots.forEach(slot => slot.classList.remove('is-visible', 'is-leaving'));
    heroActiveSlotIndexes = selectedSlots;
    selectedSlots.forEach((slotIndex, itemIndex) => {
        const noteIndex = reducedMotion ? fixedReducedMotionNotes[itemIndex] : itemIndex;
        renderHeroNote(slots[slotIndex], HERO_NOTES[noteIndex]);
        slots[slotIndex].classList.add('is-visible');
    });
    heroNextNoteIndex = reducedMotion ? HERO_NOTES.length : selectedSlots.length;

    if (!heroSetupMedia) {
        heroSetupMedia = window.matchMedia('(max-width: 850px)');
        heroSetupMedia.addEventListener('change', initializeHeroNotes);
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', initializeHeroNotes);
    }

    if (!heroResizeListenerAdded) {
        window.addEventListener('resize', () => {
            const currentMode = `${window.matchMedia('(max-width: 850px)').matches}-${window.matchMedia('(prefers-reduced-motion: reduce)').matches}`;
            if (currentMode !== heroLayoutMode) initializeHeroNotes();
            else updateHeroVisibility();
        }, { passive: true });
        heroResizeListenerAdded = true;
    }

    heroIntersectionObserver = new IntersectionObserver(() => {
        updateHeroVisibility();
    }, { threshold: 0 });
    heroIntersectionObserver.observe(hero);
    updateHeroVisibility();
    startHeroRotation();
}

function initializeSolutionsToggle() {
    const toggle = document.getElementById('solutions-toggle');
    const extra = document.getElementById('solutions-extra');
    if (!toggle || !extra) return;

    document.documentElement.classList.add('js-enabled');
    extra.hidden = true;
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));

        if (isExpanded) {
            extra.classList.remove('is-opening');
            extra.hidden = true;
            toggle.textContent = 'Ver 4 soluciones más ↓';
        } else {
            extra.hidden = false;
            extra.classList.remove('is-opening');
            window.requestAnimationFrame(() => extra.classList.add('is-opening'));
            toggle.textContent = 'Ver menos ↑';
        }
    });
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroRotation();
    else startHeroRotation();
});

function getOwningPage(target) {
    if (target.classList.contains('page-section')) return target;
    return target.closest('.page-section');
}

function activatePage(page) {
    if (!page) return;

    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.toggle('active', section === page);
    });

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        const linkTarget = document.getElementById(link.getAttribute('href').slice(1));
        link.classList.toggle('active', Boolean(linkTarget && getOwningPage(linkTarget) === page && !link.classList.contains('nav-cta')));
    });

    closeMobileMenu();
    window.setTimeout(checkScroll, 50);
}

function closeMobileMenu() {
    const menu = document.getElementById('navLinks');
    const button = document.getElementById('mobileMenu');
    menu.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menú');
}

function navigateToHash(hash, options = {}) {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    const target = document.getElementById(id);
    if (!target) return false;

    activatePage(getOwningPage(target));
    if (options.updateHistory !== false) window.history.pushState(null, '', `#${id}`);

    window.requestAnimationFrame(() => {
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
        updateHeroVisibility();
    });

    return true;
}

function toggleFaq(button) {
    const item = button.closest('.faq-item');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach(question => {
        question.setAttribute('aria-expanded', 'false');
        question.closest('.faq-item').classList.remove('active');
    });

    if (!isExpanded) {
        button.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
    }
}

function checkScroll() {
    document.querySelectorAll('.page-section.active .scroll-reveal').forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight - 80) {
            element.classList.add('revealed');
        }
    });
}

function configureOptionalContactLinks() {
    const slots = document.getElementById('contact-availability');
    if (Number.isInteger(MONTHLY_AVAILABLE_SLOTS) && MONTHLY_AVAILABLE_SLOTS >= 0) {
        slots.textContent = `Para mantener la calidad de los resultados, incorporamos un número limitado de negocios nuevos cada mes. Cupos disponibles este mes: ${MONTHLY_AVAILABLE_SLOTS}`;
        slots.hidden = false;
    }

    const calendarLink = document.getElementById('calendar-link');
    if (CALENDAR_URL) {
        try {
            const calendar = new URL(CALENDAR_URL);
            if (calendar.protocol === 'https:' || calendar.protocol === 'http:') {
                calendarLink.href = calendar.href;
                calendarLink.hidden = false;
            }
        } catch {
            // Keep the calendar link hidden until a valid URL is configured.
        }
    }

    const whatsappLink = document.getElementById('whatsapp-float');
    if (/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
        whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20un%20diagn%C3%B3stico%20gratis`;
        whatsappLink.hidden = false;
        document.body.classList.add('has-whatsapp');
    }
}

function showContactFormResult(success) {
    const message = document.getElementById('contact-form-message');
    message.textContent = success ? FORM_MESSAGES.success : FORM_MESSAGES.error;
    message.setAttribute('role', success ? 'status' : 'alert');
    if (success) document.getElementById('contact-form').reset();
}

function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const fields = [
        { input: form.elements.name, error: document.getElementById('contact-name-error') },
        { input: form.elements.email, error: document.getElementById('contact-email-error') },
        { input: form.elements.phone, error: document.getElementById('contact-phone-error') },
        { input: form.elements.business, error: document.getElementById('contact-business-error') },
        { input: form.elements.interest, error: document.getElementById('contact-interest-error') }
    ];

    form.addEventListener('submit', event => {
        event.preventDefault();
        const message = document.getElementById('contact-form-message');
        let firstInvalid = null;

        fields.forEach(({ input, error }) => {
            const value = input.value.trim();
            let errorMessage = '';

            if (!value) {
                errorMessage = FORM_MESSAGES.required;
            } else if (input.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = FORM_MESSAGES.email;
            } else if (input.name === 'phone') {
                const digits = value.replace(/\D/g, '');
                if (!/^\+?[\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
                    errorMessage = FORM_MESSAGES.phone;
                }
            }

            error.textContent = errorMessage;
            input.setAttribute('aria-invalid', String(Boolean(errorMessage)));
            if (errorMessage && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
            message.textContent = '';
            firstInvalid.focus();
            return;
        }

        // TODO: conectar el servicio de envío y llamar showContactFormResult(true) solo tras confirmar la recepción.
        showContactFormResult(false);
    });

    fields.forEach(({ input, error }) => {
        input.addEventListener('input', () => {
            error.textContent = '';
            input.removeAttribute('aria-invalid');
        });
        input.addEventListener('change', () => {
            error.textContent = '';
            input.removeAttribute('aria-invalid');
        });
    });
}

document.getElementById('mobileMenu').addEventListener('click', event => {
    const menu = document.getElementById('navLinks');
    const isExpanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    menu.classList.toggle('active', !isExpanded);
    event.currentTarget.setAttribute('aria-expanded', String(!isExpanded));
    event.currentTarget.setAttribute('aria-label', isExpanded ? 'Abrir menú' : 'Cerrar menú');
});

document.addEventListener('click', event => {
    const nav = document.querySelector('nav');
    if (!nav.contains(event.target)) closeMobileMenu();

    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    const interest = anchor.dataset.interest;
    navigateToHash(hash);
    if (interest) document.getElementById('contact-interest').value = interest;
});

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => toggleFaq(button));
});

window.addEventListener('scroll', () => {
    checkScroll();
    updateHeroVisibility();
}, { passive: true });
window.addEventListener('load', checkScroll);
window.addEventListener('hashchange', () => navigateToHash(window.location.hash, { updateHistory: false }));
window.addEventListener('popstate', () => navigateToHash(window.location.hash, { updateHistory: false }));

configureOptionalContactLinks();
initializeContactForm();
initializeHeroNotes();
initializeSolutionsToggle();

if (window.location.hash) {
    navigateToHash(window.location.hash, { updateHistory: false });
} else {
    activatePage(document.getElementById('home'));
}
