/* ================================================
   ASTAURIA — JavaScript Interactions
   Premium B2B Corporate Website
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('header');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========== MOBILE MENU TOGGLE ==========
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');

        // Toggle icon
        const icon = menuToggle.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // ========== SCROLL ANIMATIONS ==========
    const animatedElements = document.querySelectorAll('[data-animate]');
    const staggerGroups = document.querySelectorAll('[data-animate-stagger]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Stagger group observer - animates children with delay
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.children;
                Array.from(children).forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { ...observerOptions, threshold: 0.1 });

    staggerGroups.forEach(group => {
        // Prepare children for animation
        Array.from(group.children).forEach(child => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            child.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        staggerObserver.observe(group);
    });

    // Add visible styles for stagger children
    const staggerStyle = document.createElement('style');
    staggerStyle.textContent = `
        [data-animate-stagger] > *.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(staggerStyle);

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========== TESTIMONIALS CAROUSEL ==========
    const carousel = document.querySelector('.testimonials__carousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel__track');
        const cards = track.querySelectorAll('.testimonial-card');
        const prevBtn = carousel.querySelector('.carousel__btn--prev');
        const nextBtn = carousel.querySelector('.carousel__btn--next');
        const dotsContainer = document.querySelector('.carousel__dots');

        let currentIndex = 0;
        const totalCards = cards.length;
        const cardsPerView = 2;
        const totalSlides = Math.ceil(totalCards / cardsPerView);
        let autoScrollInterval;

        // Create dots for pairs
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel__dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Témoignages ${i * cardsPerView + 1}-${Math.min((i + 1) * cardsPerView, totalCards)}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        const dots = dotsContainer.querySelectorAll('.carousel__dot');
        const trackContainer = carousel.querySelector('.carousel__track-container');

        function updateCarousel() {
            // Calculate the width of the visible area
            const containerWidth = trackContainer.offsetWidth;
            // Each slide moves by the container width (shows 2 new cards)
            const translatePx = currentIndex * containerWidth;
            track.style.transform = `translateX(-${translatePx}px)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetAutoScroll();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        function startAutoScroll() {
            autoScrollInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoScroll() {
            clearInterval(autoScrollInterval);
            startAutoScroll();
        }

        // Event listeners
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoScroll();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoScroll();
        });

        // Pause on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        carousel.addEventListener('mouseleave', startAutoScroll);

        // Handle resize
        window.addEventListener('resize', updateCarousel);

        // Start auto-scroll
        startAutoScroll();
    }

    // ========== FAQ ACCORDION ========== 
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    });

    // ========== FLOATING CONTACT BUTTON ========== 
    const floatingContact = document.getElementById('floating-contact');
    const floatingContactBtn = document.getElementById('floating-contact-btn');

    if (floatingContactBtn && floatingContact) {
        floatingContactBtn.addEventListener('click', () => {
            floatingContact.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!floatingContact.contains(e.target)) {
                floatingContact.classList.remove('active');
            }
        });

        // Track in GA
        floatingContact.querySelectorAll('.floating-contact__option').forEach(option => {
            option.addEventListener('click', () => {
                if (typeof AstauriaAnalytics !== 'undefined') {
                    AstauriaAnalytics.trackCTAClick('floating_contact', option.href);
                }
            });
        });
    }
});
