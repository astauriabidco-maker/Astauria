document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('hero-slides-container');
    const controls = document.getElementById('hero-controls');
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/hero-slides' 
        : '/api/hero-slides';

    try {
        const response = await fetch(API_URL);
        const allSlides = await response.json();
        
        // Garder seulement les slides actives
        const activeSlides = (allSlides || []).filter(s => s.isActive);
        
        if (activeSlides.length > 0) {
            let currentSlide = 0;
            let sliderInterval;

            const renderSlides = () => {
                container.innerHTML = activeSlides.map((slide, index) => `
                    <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <div class="container hero__container">
                            <div class="hero__content slide-content-anim">
                                ${slide.surtitle ? `<span class="hero__badge">${slide.surtitle}</span>` : ''}
                                <h1 class="hero__title">${slide.title}</h1>
                                ${slide.subtitle ? `<p class="hero__subtitle">${slide.subtitle}</p>` : ''}
                                ${slide.buttonText ? `
                                <a href="${slide.buttonLink || 'audit-ia.html'}" class="btn btn--primary btn--large hero__cta">
                                    <span>${slide.buttonText}</span>
                                </a>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');

                // Génération des puces (bullets)
                controls.innerHTML = activeSlides.map((_, index) => `
                    <button class="hero-bullet ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>
                `).join('');
                
                bindControls();
                startAutoplay();
            };

            const goToSlide = (index) => {
                const slides = document.querySelectorAll('.hero-slide');
                const bullets = document.querySelectorAll('.hero-bullet');
                
                slides.forEach(s => s.classList.remove('active'));
                bullets.forEach(b => b.classList.remove('active'));
                
                slides[index].classList.add('active');
                bullets[index].classList.add('active');
                currentSlide = index;
            };

            const nextSlide = () => {
                let nextId = (currentSlide + 1) % activeSlides.length;
                goToSlide(nextId);
            };

            const bindControls = () => {
                document.querySelectorAll('.hero-bullet').forEach(bullet => {
                    bullet.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.getAttribute('data-index'));
                        goToSlide(idx);
                        resetAutoplay();
                    });
                });
            };

            const startAutoplay = () => {
                if(activeSlides.length > 1) {
                    sliderInterval = setInterval(nextSlide, 6000); // 6 sec per slide
                }
            };

            const resetAutoplay = () => {
                clearInterval(sliderInterval);
                startAutoplay();
            };

            renderSlides();
        }
    } catch (e) {
        console.error('Impossible de charger le slider métier', e);
    }
});
