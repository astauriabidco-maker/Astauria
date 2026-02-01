// Cookie Consent Banner - RGPD Compliant
// Manages user consent for analytics and marketing cookies

const CookieConsent = {
    STORAGE_KEY: 'astauria_cookie_consent',
    banner: null,

    init: function () {
        // Check if consent already given
        const consent = this.getConsent();

        if (consent === null) {
            // No consent yet - show banner
            this.createBanner();
            this.showBanner();
        } else if (consent.analytics) {
            // Consent given - enable GA
            this.enableAnalytics();
        }
    },

    getConsent: function () {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    },

    saveConsent: function (analytics, marketing) {
        const consent = {
            analytics: analytics,
            marketing: marketing,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
        return consent;
    },

    createBanner: function () {
        const bannerHTML = `
            <div class="cookie-banner" id="cookie-banner">
                <div class="cookie-banner__content">
                    <div class="cookie-banner__text">
                        <h4 class="cookie-banner__title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="8" cy="9" r="1" fill="currentColor"/>
                                <circle cx="15" cy="8" r="1" fill="currentColor"/>
                                <circle cx="10" cy="14" r="1" fill="currentColor"/>
                                <circle cx="16" cy="13" r="1" fill="currentColor"/>
                            </svg>
                            Ce site utilise des cookies
                        </h4>
                        <p class="cookie-banner__description">
                            Nous utilisons des cookies pour analyser notre trafic et améliorer votre expérience. 
                            Vous pouvez accepter tous les cookies ou personnaliser vos préférences.
                            <a href="politique-confidentialite.html" class="cookie-banner__link">En savoir plus</a>
                        </p>
                    </div>
                    <div class="cookie-banner__actions">
                        <button class="cookie-banner__btn cookie-banner__btn--settings" id="cookie-settings-btn">
                            Personnaliser
                        </button>
                        <button class="cookie-banner__btn cookie-banner__btn--reject" id="cookie-reject-btn">
                            Refuser
                        </button>
                        <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookie-accept-btn">
                            Tout accepter
                        </button>
                    </div>
                </div>
                
                <!-- Settings Panel -->
                <div class="cookie-banner__settings" id="cookie-settings-panel">
                    <div class="cookie-banner__settings-header">
                        <h4>Paramètres des cookies</h4>
                        <button class="cookie-banner__settings-close" id="cookie-settings-close">×</button>
                    </div>
                    <div class="cookie-banner__settings-body">
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <span class="cookie-option__name">Cookies essentiels</span>
                                <span class="cookie-option__desc">Nécessaires au fonctionnement du site</span>
                            </div>
                            <label class="cookie-toggle cookie-toggle--disabled">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-toggle__slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <span class="cookie-option__name">Cookies analytiques</span>
                                <span class="cookie-option__desc">Google Analytics - mesure d'audience</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-analytics">
                                <span class="cookie-toggle__slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <span class="cookie-option__name">Cookies marketing</span>
                                <span class="cookie-option__desc">Publicité ciblée et remarketing</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookie-marketing">
                                <span class="cookie-toggle__slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="cookie-banner__settings-footer">
                        <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookie-save-btn">
                            Enregistrer mes choix
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        this.banner = document.getElementById('cookie-banner');
        this.bindEvents();
    },

    bindEvents: function () {
        // Accept all
        document.getElementById('cookie-accept-btn').addEventListener('click', () => {
            this.acceptAll();
        });

        // Reject all
        document.getElementById('cookie-reject-btn').addEventListener('click', () => {
            this.rejectAll();
        });

        // Show settings
        document.getElementById('cookie-settings-btn').addEventListener('click', () => {
            this.showSettings();
        });

        // Close settings
        document.getElementById('cookie-settings-close').addEventListener('click', () => {
            this.hideSettings();
        });

        // Save preferences
        document.getElementById('cookie-save-btn').addEventListener('click', () => {
            this.savePreferences();
        });
    },

    showBanner: function () {
        if (this.banner) {
            setTimeout(() => {
                this.banner.classList.add('active');
            }, 1000);
        }
    },

    hideBanner: function () {
        if (this.banner) {
            this.banner.classList.remove('active');
            setTimeout(() => {
                this.banner.remove();
            }, 300);
        }
    },

    showSettings: function () {
        document.getElementById('cookie-settings-panel').classList.add('active');
    },

    hideSettings: function () {
        document.getElementById('cookie-settings-panel').classList.remove('active');
    },

    acceptAll: function () {
        this.saveConsent(true, true);
        this.enableAnalytics();
        this.hideBanner();

        // Track consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted'
            });
        }
    },

    rejectAll: function () {
        this.saveConsent(false, false);
        this.disableAnalytics();
        this.hideBanner();

        // Update consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
            });
        }
    },

    savePreferences: function () {
        const analytics = document.getElementById('cookie-analytics').checked;
        const marketing = document.getElementById('cookie-marketing').checked;

        this.saveConsent(analytics, marketing);

        if (analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Update consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': analytics ? 'granted' : 'denied',
                'ad_storage': marketing ? 'granted' : 'denied'
            });
        }

        this.hideBanner();
    },

    enableAnalytics: function () {
        // GA is already loaded, just update consent
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    },

    disableAnalytics: function () {
        // Disable GA tracking
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }

        // Clear existing GA cookies
        document.cookie.split(';').forEach(function (c) {
            if (c.trim().startsWith('_ga')) {
                document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            }
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    CookieConsent.init();
});
