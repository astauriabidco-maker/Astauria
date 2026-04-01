// Newsletter Popup Logic
// Shows after 15 seconds or 50% scroll, with localStorage tracking

const NewsletterPopup = {
    popup: null,
    overlay: null,
    closeBtn: null,
    form: null,
    hasShown: false,
    STORAGE_KEY: 'astauria_newsletter_shown',
    LEAD_STORAGE_KEY: 'astauria_lead_captured',

    init: function () {
        this.popup = document.getElementById('newsletter-popup');
        if (!this.popup) return;

        this.overlay = this.popup.querySelector('.newsletter-popup__overlay');
        this.closeBtn = document.getElementById('newsletter-close');
        this.form = document.getElementById('newsletter-form');

        // Check if already subscribed or recently shown
        if (this.hasSubscribed() || this.wasRecentlyShown()) {
            return;
        }

        this.bindEvents();
        this.startTriggers();
    },

    hasSubscribed: function () {
        return localStorage.getItem(this.LEAD_STORAGE_KEY) === 'true';
    },

    wasRecentlyShown: function () {
        const lastShown = localStorage.getItem(this.STORAGE_KEY);
        if (!lastShown) return false;

        const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        return daysSince < 7; // Don't show again for 7 days
    },

    bindEvents: function () {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.hide());
        }

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });

        // Form submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    startTriggers: function () {
        // Trigger 1: After 15 seconds on page
        setTimeout(() => {
            if (!this.hasShown) this.show();
        }, 15000);

        // Trigger 2: After 50% scroll
        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            if (scrollTriggered || this.hasShown) return;

            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= 50) {
                scrollTriggered = true;
                this.show();
            }
        });

        // Trigger 3: Exit intent (mouse leaves viewport)
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 10 && !this.hasShown) {
                this.show();
            }
        });
    },

    show: function () {
        if (this.hasShown || !this.popup) return;

        this.hasShown = true;
        this.popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Re-initialize Lucide icons in popup
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Mark as shown
        localStorage.setItem(this.STORAGE_KEY, Date.now().toString());

        // Track in GA
        if (typeof AstauriaAnalytics !== 'undefined') {
            AstauriaAnalytics.trackCTAClick('newsletter_popup_shown', 'popup');
        }
    },

    hide: function () {
        if (!this.popup) return;

        this.popup.classList.remove('active');
        document.body.style.overflow = '';
    },

    isVisible: function () {
        return this.popup && this.popup.classList.contains('active');
    },

    handleSubmit: function (e) {
        e.preventDefault();

        const email = this.form.querySelector('input[name="email"]').value;

        // Store the lead (in production, send to backend/email service)
        this.storeLead(email);

        // Track conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'lead_captured', {
                'event_category': 'conversion',
                'event_label': 'newsletter_signup',
                'value': 10
            });
        }

        // Show success state
        this.showSuccess();
    },

    storeLead: async function (email) {
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000/api/leads' 
            : '/api/leads';

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    source: 'newsletter_popup',
                    message: 'Inscription Newsletter et demande du guide.'
                })
            });
        } catch (e) {
            console.error('Erreur Newsletter:', e);
        }

        // Store locally
        localStorage.setItem(this.LEAD_STORAGE_KEY, 'true');

        // Store email for potential sync
        const leads = JSON.parse(localStorage.getItem('astauria_leads') || '[]');
        leads.push({
            email: email,
            source: 'newsletter_popup',
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        localStorage.setItem('astauria_leads', JSON.stringify(leads));

        console.log('Lead captured:', email);
    },

    showSuccess: function () {
        const content = this.popup.querySelector('.newsletter-popup__content');
        content.innerHTML = `
            <div class="newsletter-popup__success">
                <div class="newsletter-popup__success-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <h3 class="newsletter-popup__title">Merci !</h3>
                <p class="newsletter-popup__subtitle">
                    Votre guide est en route vers votre boîte mail. 
                    <br>Vérifiez vos spams si vous ne le voyez pas.
                </p>
                <a href="assets/guide-7-questions-ia.pdf" download class="btn btn--primary">
                    <i data-lucide="download"></i>
                    <span>Télécharger maintenant</span>
                </a>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-close after 5 seconds
        setTimeout(() => this.hide(), 5000);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    NewsletterPopup.init();
});
