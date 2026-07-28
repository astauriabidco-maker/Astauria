/* ========== DIAGNOSTIC WIZARD LOGIC ========== */
document.addEventListener('DOMContentLoaded', () => {
    const wizard = document.getElementById('diagnostic-wizard');
    if (!wizard) return;

    const form = document.getElementById('audit-wizard-form');
    const steps = wizard.querySelectorAll('.step-content');
    const stepIndicators = wizard.querySelectorAll('.wizard-step');
    const currentStepNum = document.getElementById('current-step-num');
    const expertInsight = document.getElementById('insight-text');
    const maturityRange = document.getElementById('maturity-range');
    const maturityFeedback = document.getElementById('maturity-feedback');

    let currentStep = 1;

    // Expert insights mapping
    const insights = {
        sector: {
            industry: "Dans l'industrie, le ROI se cache souvent dans la maintenance prédictive. L'audit ciblera vos arrêts machines.",
            logistics: "Pour la logistique, l'IA d'Astauria optimise les tournées et réduit les coûts de transport de 15%.",
            services: "En services, nos agents NLP classent 90% des documents entrants sans intervention humaine.",
            retail: "L'IA prédictive réduit les ruptures de stock de 60% pour nos clients e-commerce."
        },
        maturity: [
            "Étape 1 : Nous allons poser des bases solides avec une acculturation IA.",
            "Étape 2 : Vos premiers tests ouvrent la voie à une industrialisation rapide.",
            "Étape 3 : On passe au niveau supérieur en intégrant l'IA au cœur de vos processus.",
            "Étape 4 : Optimisons vos modèles actuels pour gratter les derniers points de ROI.",
            "Étape 5 : Vous êtes à la pointe. Explorons les agents IA autonomes de demain."
        ]
    };

    function updateWizard(dir = 1) {
        // Validate current step if going forward
        if (dir === 1 && !validateStep(currentStep)) return;

        // Update step
        steps[currentStep - 1].classList.remove('active');
        stepIndicators[currentStep - 1].classList.remove('active');
        
        currentStep += dir;
        
        steps[currentStep - 1].classList.add('active');
        stepIndicators[currentStep - 1].classList.add('active');
        currentStepNum.textContent = currentStep;

        // Update Expert Insight based on selection
        if (currentStep === 2) {
            const sector = form.querySelector('input[name="sector"]:checked')?.value;
            if (sector && insights.sector[sector]) {
                expertInsight.textContent = insights.sector[sector];
            }
        }
    }

    function validateStep(step) {
        if (step === 1) {
            const checked = form.querySelector('input[name="sector"]:checked');
            if (!checked) {
                alert("Veuillez choisir un secteur.");
                return false;
            }
        }
        if (step === 2) {
            const checked = form.querySelectorAll('input[name="pain_points"]:checked');
            if (checked.length === 0) {
                alert("Sélectionnez au moins une priorité.");
                return false;
            }
            expertInsight.textContent = "Excellent choix. Ces points sont les plus porteurs de ROI immédiat.";
        }
        return true;
    }

    // Navigation buttons
    wizard.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.type === 'submit') return; // Let form handling take over
            updateWizard(1);
        });
    });

    wizard.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', () => updateWizard(-1));
    });

    // Maturity Slider Feedback
    if (maturityRange) {
        maturityRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            maturityFeedback.textContent = insights.maturity[val - 1];
        });
    }

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.reportValidity()) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        const formData = new FormData(form);
        const painPoints = formData.getAll('pain_points');
        const sectorLabels = {
            industry: 'Industrie & BTP',
            logistics: 'Logistique & Transport',
            services: 'Services & Conseil',
            retail: 'E-commerce & Retail'
        };
        const painPointLabels = {
            docs: 'Traitement de documents',
            hr_payroll: 'RH & Paie',
            erp_data: 'Synchronisation de données'
        };
        const sector = formData.get('sector');
        const maturity = formData.get('maturity');
        const name = formData.get('name');

        const payload = {
            name,
            email: formData.get('email'),
            company: formData.get('company'),
            phone: formData.get('phone') || '',
            source: 'audit_ia_wizard',
            message: [
                `Secteur : ${sectorLabels[sector] || sector}`,
                `Priorités : ${painPoints.map(point => painPointLabels[point] || point).join(', ')}`,
                `Maturité IA : ${maturity}/5`
            ].join('\n')
        };

        let status = form.querySelector('.wizard-submit-status');
        if (!status) {
            status = document.createElement('p');
            status.className = 'wizard-submit-status';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            submitButton.closest('.wizard-footer').insertAdjacentElement('beforebegin', status);
        }

        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.textContent = 'Envoi en cours…';
        status.textContent = '';

        try {
            if (!window.AstauriaApi) {
                throw new Error('Le service est momentanément indisponible.');
            }

            await window.AstauriaApi.createLead(payload);

            if (typeof AstauriaAnalytics !== 'undefined') {
                AstauriaAnalytics.trackFormSubmit('audit_ia_wizard');
            }

            wizard.innerHTML = `
                <div class="wizard-completion" role="status" tabindex="-1" style="text-align: center; padding: var(--space-3xl);">
                    <i data-lucide="check-circle" aria-hidden="true" style="width: 80px; height: 80px; color: var(--color-gold); margin-bottom: 20px;"></i>
                    <h2 style="color: #fff; margin-bottom: 10px;">Demande de diagnostic envoyée</h2>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">Merci ${escapeHtml(String(name))}. Votre demande et vos réponses ont bien été transmises à l’équipe Astauria.</p>
                    <a href="index.html" class="btn btn--primary">Retour à l'accueil</a>
                </div>
            `;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ root: wizard });
            }
            wizard.querySelector('.wizard-completion').focus();
        } catch (_) {
            status.textContent = 'L’envoi a échoué. Vérifiez votre connexion puis réessayez.';
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.innerHTML = originalButtonContent;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ root: submitButton });
            }
        }
    });

    function escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = value;
        return element.innerHTML;
    }
});
