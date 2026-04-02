// Google Analytics 4 Configuration for Astauria
// Measurement ID: G-QZF5RYSS4V

// GA4 Event tracking functions
const AstauriaAnalytics = {
    // Track CTA clicks (Audit IA buttons)
    trackCTAClick: function (ctaName, ctaLocation) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_click', {
                'event_category': 'engagement',
                'event_label': ctaName,
                'cta_location': ctaLocation
            });
        }
    },

    // Track form submissions
    trackFormSubmit: function (formName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'conversion',
                'event_label': formName
            });
        }
    },

    // Track contact page visit (high intent)
    trackContactPageView: function () {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                'page_title': 'Contact',
                'page_location': window.location.href,
                'content_group': 'conversion_intent'
            });
        }
    },

    // Track blog article reads
    trackArticleRead: function (articleTitle, readPercentage) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'article_read', {
                'event_category': 'engagement',
                'article_title': articleTitle,
                'read_percentage': readPercentage
            });
        }
    },

    // Track case study views
    trackCaseStudyView: function (caseStudyName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'case_study_view', {
                'event_category': 'engagement',
                'case_study_name': caseStudyName
            });
        }
    },

    // Track audit page conversion (high value)
    trackAuditPageConversion: function () {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'audit_page_view', {
                'event_category': 'conversion',
                'value': 1
            });
        }
    }
};

// Auto-track CTA button clicks
document.addEventListener('DOMContentLoaded', function () {
    // Track all primary CTA buttons
    const ctaButtons = document.querySelectorAll('.btn--primary, .hero__cta, .cta__btn');
    ctaButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const buttonText = this.textContent.trim();
            const section = this.closest('section');
            const sectionId = section ? section.id || section.className : 'unknown';
            AstauriaAnalytics.trackCTAClick(buttonText, sectionId);
        });
    });

    // Track contact form submission
    const contactForm = document.querySelector('#contact-form, .contact__form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function () {
            AstauriaAnalytics.trackFormSubmit('contact_form');
        });
    }

    // Track if on contact page
    if (window.location.pathname.includes('contact')) {
        AstauriaAnalytics.trackContactPageView();
    }

    // Track if on audit page
    if (window.location.pathname.includes('audit')) {
        AstauriaAnalytics.trackAuditPageConversion();
    }

    // Track case study page views
    if (window.location.pathname.includes('cas-')) {
        const pageTitle = document.title || 'Unknown Case Study';
        AstauriaAnalytics.trackCaseStudyView(pageTitle);
    }
});

// Track scroll depth for articles
if (window.location.pathname.includes('article-')) {
    let scrollMarks = { 25: false, 50: false, 75: false, 100: false };

    window.addEventListener('scroll', function () {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        const articleTitle = document.title || 'Unknown Article';

        Object.keys(scrollMarks).forEach(function (mark) {
            if (scrollPercent >= parseInt(mark) && !scrollMarks[mark]) {
                scrollMarks[mark] = true;
                AstauriaAnalytics.trackArticleRead(articleTitle, parseInt(mark));
            }
        });
    });
}
