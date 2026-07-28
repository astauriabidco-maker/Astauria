// Newsletter forms and guide popup
const NewsletterPopup = {
    popup: null,
    overlay: null,
    closeBtn: null,
    form: null,
    hasShown: false,
    lastFocusedElement: null,
    apiClientPromise: null,
    STORAGE_KEY: 'astauria_newsletter_shown',
    SUBSCRIBED_KEY: 'astauria_newsletter_subscribed',

    init: function () {
        this.popup = document.getElementById('newsletter-popup');
        this.bindInlineForms();

        if (!this.popup) return;

        this.overlay = this.popup.querySelector('.newsletter-popup__overlay');
        this.closeBtn = document.getElementById('newsletter-close');
        this.form = document.getElementById('newsletter-form');
        this.popup.setAttribute('aria-hidden', 'true');

        if (this.hasSubscribed() || this.wasRecentlyShown()) return;

        this.bindPopupEvents();
        this.startTriggers();
    },

    hasSubscribed: function () {
        return localStorage.getItem(this.SUBSCRIBED_KEY) === 'true';
    },

    wasRecentlyShown: function () {
        const lastShown = localStorage.getItem(this.STORAGE_KEY);
        if (!lastShown) return false;

        const daysSince = (Date.now() - Number.parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
        return daysSince < 7;
    },

    bindPopupEvents: function () {
        this.closeBtn?.addEventListener('click', () => this.hide());
        this.overlay?.addEventListener('click', () => this.hide());
        this.form?.addEventListener('submit', event => this.handleSubmit(event, 'newsletter_popup'));

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this.isVisible()) this.hide();
        });
    },

    bindInlineForms: function () {
        document.querySelectorAll('.newsletter-form').forEach(form => {
            form.addEventListener('submit', event => this.handleSubmit(event, 'newsletter_blog'));
        });
    },

    startTriggers: function () {
        setTimeout(() => {
            if (!this.hasShown) this.show();
        }, 15000);

        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            if (scrollTriggered || this.hasShown) return;

            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 100;
            if (scrollPercent >= 50) {
                scrollTriggered = true;
                this.show();
            }
        }, { passive: true });

        document.addEventListener('mouseleave', event => {
            if (event.clientY < 10 && !this.hasShown) this.show();
        });
    },

    show: function () {
        if (this.hasShown || !this.popup) return;

        this.hasShown = true;
        this.lastFocusedElement = document.activeElement;
        this.popup.classList.add('active');
        this.popup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        localStorage.setItem(this.STORAGE_KEY, Date.now().toString());

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: this.popup });
        this.closeBtn?.focus();

        if (typeof AstauriaAnalytics !== 'undefined') {
            AstauriaAnalytics.trackCTAClick('newsletter_popup_shown', 'popup');
        }
    },

    hide: function () {
        if (!this.popup) return;

        this.popup.classList.remove('active');
        this.popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.lastFocusedElement?.focus();
    },

    isVisible: function () {
        return this.popup?.classList.contains('active');
    },

    handleSubmit: async function (event, source) {
        event.preventDefault();

        const form = event.currentTarget;
        const input = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        const email = input.value.trim();

        if (!input.checkValidity()) {
            input.reportValidity();
            return;
        }

        let status = form.querySelector('[data-newsletter-status]');
        if (!status) {
            status = document.createElement('p');
            status.dataset.newsletterStatus = '';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            form.appendChild(status);
        }

        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.textContent = 'Envoi en cours…';
        status.textContent = '';

        try {
            await this.storeLead(email, source);
            localStorage.setItem(this.SUBSCRIBED_KEY, 'true');

            if (typeof AstauriaAnalytics !== 'undefined') {
                AstauriaAnalytics.trackFormSubmit(source);
            }

            if (source === 'newsletter_popup') {
                this.showSuccess();
            } else {
                form.reset();
                status.innerHTML = 'Inscription enregistrée. <a href="assets/guide-7-questions-ia.html">Consulter le guide gratuit</a>.';
                submitButton.innerHTML = originalButtonContent;
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
                if (typeof lucide !== 'undefined') lucide.createIcons({ root: submitButton });
            }
        } catch (_) {
            status.textContent = 'L’inscription a échoué. Vérifiez votre connexion puis réessayez.';
            submitButton.innerHTML = originalButtonContent;
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            if (typeof lucide !== 'undefined') lucide.createIcons({ root: submitButton });
        }
    },

    storeLead: async function (email, source) {
        const api = await this.getApiClient();

        return api.createLead({
            email,
            source,
            message: source === 'newsletter_popup'
                ? 'Inscription à la newsletter depuis la fenêtre du guide.'
                : 'Inscription à la newsletter depuis la page blog.'
        });
    },

    getApiClient: function () {
        if (window.AstauriaApi) return Promise.resolve(window.AstauriaApi);
        if (this.apiClientPromise) return this.apiClientPromise;

        this.apiClientPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'assets/js/api-client.js';
            script.addEventListener('load', () => {
                if (window.AstauriaApi) {
                    resolve(window.AstauriaApi);
                } else {
                    reject(new Error('API client unavailable'));
                }
            });
            script.addEventListener('error', () => reject(new Error('API client unavailable')));
            document.head.appendChild(script);
        });

        return this.apiClientPromise;
    },

    showSuccess: function () {
        const content = this.popup.querySelector('.newsletter-popup__content');
        content.innerHTML = `
            <div class="newsletter-popup__success" role="status" tabindex="-1">
                <div class="newsletter-popup__success-icon">
                    <i data-lucide="check-circle" aria-hidden="true"></i>
                </div>
                <h3 class="newsletter-popup__title">Inscription enregistrée</h3>
                <p class="newsletter-popup__subtitle">
                    Merci. Vous pouvez consulter le guide dès maintenant.
                </p>
                <a href="assets/guide-7-questions-ia.html" class="btn btn--primary">
                    <i data-lucide="book-open" aria-hidden="true"></i>
                    <span>Consulter le guide</span>
                </a>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: content });
        content.querySelector('.newsletter-popup__success').focus();
    }
};

document.addEventListener('DOMContentLoaded', () => NewsletterPopup.init());
