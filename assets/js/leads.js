document.addEventListener('DOMContentLoaded', () => {
    const contactForms = document.querySelectorAll('.contact-form');
    
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
                const countrySelect = form.querySelector('[name="country"]');
                const subjectSelect = form.querySelector('[name="subject"]');
                const country = countrySelect?.selectedOptions[0]?.textContent.trim() || '';
                const subject = subjectSelect?.selectedOptions[0]?.textContent.trim() || '';
                const userMessage = formData.get('problem') || formData.get('message') || '';
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    phone: formData.get('phone') || '',
                    message: [
                        subject ? `Sujet : ${subject}` : '',
                        country ? `Pays : ${country}` : '',
                        userMessage ? `Message : ${userMessage}` : ''
                    ].filter(Boolean).join('\n'),
                    source: window.location.pathname.includes('audit') ? 'audit_ia' : 'contact_form'
                };

                if (!window.AstauriaApi) {
                    throw new Error('API client unavailable');
                }
                await window.AstauriaApi.createLead(data);

                // Success
                submitBtn.innerHTML = '<span>Demande envoyée !</span> <i data-lucide="check-circle" class="text-green-500"></i>';
                lucide.createIcons({ root: submitBtn });
                submitBtn.classList.add('btn--success');
                form.reset();

                if (typeof AstauriaAnalytics !== 'undefined') {
                    AstauriaAnalytics.trackFormSubmit('contact_form');
                }

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn--success');
                    lucide.createIcons({ root: submitBtn });
                }, 4000);

            } catch (_) {
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
