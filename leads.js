document.addEventListener('DOMContentLoaded', () => {
    const contactForms = document.querySelectorAll('.contact-form');
    
    // API URL based on environment (Coolify will likely serve API on same domain or /api proxy)
    // If it's a separate domain, this should be an absolute URL like 'https://api.astauria.com/api/leads'
    // By default we use relative path assuming Nginx proxies /api/
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/leads' 
        : '/api/leads';

    contactForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Loading state
            submitBtn.innerHTML = '<span>Envoi en cours...</span>';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(form);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    phone: formData.get('phone') || '',
                    message: formData.get('problem') || formData.get('message') || '',
                    source: window.location.pathname.includes('audit') ? 'audit_ia' : 'contact_form'
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de l\'envoi');
                }

                // Success
                submitBtn.innerHTML = '<span>Demande envoyée !</span> <i data-lucide="check-circle" class="text-green-500"></i>';
                lucide.createIcons({ root: submitBtn });
                submitBtn.classList.add('btn--success');
                form.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn--success');
                    lucide.createIcons({ root: submitBtn });
                }, 4000);

            } catch (error) {
                console.error('Erreur API Leads:', error);
                submitBtn.innerHTML = '<span>Erreur. Réessayez.</span> <i data-lucide="alert-circle" class="text-red-500"></i>';
                lucide.createIcons({ root: submitBtn });
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    lucide.createIcons({ root: submitBtn });
                }, 4000);
            }
        });
    });
});
