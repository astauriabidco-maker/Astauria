/* ================================================
   ASTAURIA — JavaScript Interactions
   Premium B2B Corporate Website
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('header');
    let lastScroll = 0;

    const handleScroll = () => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;

        // Apply visual scrolled state (glassmorphism/shadow)
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        // Hide/show logic mapping reading direction
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down -> hide header
            header.classList.add('header--hidden');
        } else {
            // Scrolling up -> show header
            header.classList.remove('header--hidden');
        }

        lastScroll = currentScroll <= 0 ? 0 : currentScroll; // Avoid negative scroll in Safari bounce
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========== MOBILE MENU TOGGLE ==========
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');

            // Toggle icon (Lucide replaces the i tag with svg, so we re-create it)
            if (nav.classList.contains('active')) {
                menuToggle.innerHTML = '<i data-lucide="x"></i>';
            } else {
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
            }
            lucide.createIcons({ root: menuToggle });
        });

        // Close mobile menu when clicking a link
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons({ root: menuToggle });
            });
        });
    }

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

    // ========== NUMBER COUNTER ANIMATION ==========
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.innerText;
                // Match prefix (+ or -), number, and suffix (k€, %, +, x)
                const match = text.match(/^([-+]?)(\d+)(.*)$/);
                
                if (match) {
                    const prefix = match[1];
                    const num = parseInt(match[2], 10);
                    const suffix = match[3];
                    
                    let current = 0;
                    const duration = 1500; // 1.5s
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = num / steps;

                    // Set initial to zero based on visual content
                    target.innerText = prefix + "0" + suffix;

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= num) {
                            target.innerText = prefix + num + suffix;
                            clearInterval(timer);
                        } else {
                            target.innerText = prefix + Math.floor(current) + suffix;
                        }
                    }, stepTime);
                }
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    const statElements = document.querySelectorAll('.hero__stat-value, .case-study-card__metric-value, .stat-card__number');
    statElements.forEach(el => counterObserver.observe(el));

    // ========== 3D TILT EFFECT ==========
    const tiltElements = document.querySelectorAll('.challenge-card, .product-card, .case-study-card');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Get position of cursor relative to element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation (max 10 degrees)
            const xRotation = ((y - rect.height / 2) / rect.height) * -10;
            const yRotation = ((x - rect.width / 2) / rect.width) * 10;
            
            el.style.transform = `perspective(1000px) scale(1.02) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
            el.style.transition = 'transform 0.1s ease-out';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)';
            el.style.transition = 'transform 0.5s ease-out';
        });
    });

});
