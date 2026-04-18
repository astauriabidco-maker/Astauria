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
        currentStepNum.innerText = currentStep;

        // Update Expert Insight based on selection
        if (currentStep === 2) {
            const sector = form.querySelector('input[name="sector"]:checked')?.value;
            if (sector && insights.sector[sector]) {
                expertInsight.innerText = insights.sector[sector];
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
            expertInsight.innerText = "Excellent choix. Ces points sont les plus porteurs de ROI immédiat.";
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
            maturityFeedback.innerText = insights.maturity[val - 1];
        });
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Audit Request Data:', data);
        
        // Final UI feedback
        wizard.innerHTML = `
            <div class="wizard-completion" style="text-align: center; padding: var(--space-3xl);">
                <i data-lucide="check-circle" style="width: 80px; height: 80px; color: var(--color-gold); margin-bottom: 20px;"></i>
                <h2 style="color: #fff; margin-bottom: 10px;">Diagnostic IA Initié !</h2>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">Merci ${data.name}. Nous analysons vos réponses. Un expert Astauria reviendra vers vous sous 24h avec une pré-analyse.</p>
                <a href="index.html" class="btn btn--primary">Retour à l'accueil</a>
            </div>
        `;
        lucide.createIcons({ root: wizard });
    });
});
