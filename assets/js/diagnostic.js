/* ========== DIAGNOSTIC AUTOMATISATION, DATA & IA ========== */
document.addEventListener('DOMContentLoaded', () => {
    const wizard = document.getElementById('diagnostic-wizard');
    const form = document.getElementById('audit-wizard-form');
    if (!wizard || !form) return;

    const steps = Array.from(wizard.querySelectorAll('.step-content'));
    const stepIndicators = Array.from(wizard.querySelectorAll('.wizard-step'));
    const progress = wizard.querySelector('.wizard-steps');
    const currentStepNum = document.getElementById('current-step-num');
    const expertInsight = document.getElementById('insight-text');
    const maturityRange = document.getElementById('maturity-range');
    const maturityFeedback = document.getElementById('maturity-feedback');

    const labels = {
        objectives: {
            automate_tasks: 'Automatiser des tâches',
            connect_tools: 'Connecter mes outils',
            improve_reporting: 'Améliorer mon reporting',
            use_data: 'Exploiter mes données',
            explore_ai: 'Étudier une opportunité IA',
            unsure: 'Je ne sais pas encore'
        },
        painPoints: {
            manual_admin: 'Tâches administratives et documents',
            disconnected_tools: 'Outils et données déconnectés',
            slow_reporting: 'Reporting lent ou peu fiable',
            customer_operations: 'Relation client et opérations',
            data_quality: 'Données difficiles à exploiter'
        },
        constraints: {
            time: 'Temps disponible',
            budget: 'Budget',
            skills: 'Compétences internes',
            data: 'Qualité des données',
            security: 'Sécurité / conformité',
            none_identified: 'Aucune identifiée'
        },
        horizons: {
            under_3_months: 'Moins de 3 mois',
            '3_to_6_months': '3 à 6 mois',
            '6_to_12_months': '6 à 12 mois',
            exploration: 'En réflexion, sans échéance'
        }
    };

    const objectiveInsights = {
        automate_tasks: 'Nous rechercherons d’abord les tâches répétitives, volumineuses et propices à des gains rapides.',
        connect_tools: 'Nous cartographierons les échanges entre vos outils pour supprimer les doubles saisies et les ruptures de flux.',
        improve_reporting: 'Nous identifierons les sources à consolider pour produire des indicateurs fiables au bon moment.',
        use_data: 'Nous évaluerons la qualité et l’accessibilité de vos données avant de définir les usages les plus utiles.',
        explore_ai: 'Nous vérifierons que l’IA répond à un besoin mesurable et qu’une solution plus simple ne serait pas préférable.',
        unsure: 'Nous vous aiderons à repérer le meilleur point de départ à partir de vos irritants opérationnels.'
    };

    const maturityInsights = [
        'Vos opérations sont encore majoritairement manuelles : commençons par des gains simples et mesurables.',
        'Quelques outils sont en place : l’enjeu est de réduire les ruptures et doubles saisies.',
        'Vos processus commencent à être structurés : nous pouvons prioriser les intégrations et le pilotage.',
        'Votre socle est solide : la data et l’automatisation avancée peuvent accélérer vos opérations.',
        'Vos processus sont déjà intégrés : ciblons les optimisations data et IA à forte valeur.'
    ];

    let currentStep = 0;
    let hasTrackedStart = false;

    function track(eventName, parameters = {}) {
        if (typeof AstauriaAnalytics !== 'undefined' &&
            typeof AstauriaAnalytics.sendEvent === 'function') {
            AstauriaAnalytics.sendEvent(eventName, {
                event_category: 'conversion',
                form_name: 'diagnostic_automation_data_ai',
                ...parameters
            });
        }
    }

    function setStep(nextStep) {
        if (nextStep < 0 || nextStep >= steps.length) return;

        currentStep = nextStep;
        steps.forEach((step, index) => {
            const isActive = index === currentStep;
            step.classList.toggle('active', isActive);
            step.hidden = !isActive;
            step.setAttribute('aria-hidden', String(!isActive));
        });
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index <= currentStep);
        });

        const displayedStep = currentStep + 1;
        currentStepNum.textContent = displayedStep;
        progress?.setAttribute('aria-valuenow', String(displayedStep));

        const title = steps[currentStep].querySelector('.step-title');
        if (title) {
            title.setAttribute('tabindex', '-1');
            title.focus({ preventScroll: true });
        }
    }

    function selectedValues(name) {
        return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
            .map((input) => input.value);
    }

    function showStepError(name, message) {
        const error = form.querySelector(`[data-error-for="${name}"]`);
        if (error) error.textContent = message;
    }

    function clearStepError(name) {
        showStepError(name, '');
    }

    function validateStep(stepIndex) {
        if (stepIndex === 0) {
            const choices = selectedValues('objectives');
            if (choices.length === 0) {
                showStepError('objectives', 'Sélectionnez au moins un objectif pour continuer.');
                form.querySelector('input[name="objectives"]')?.focus();
                return false;
            }
            clearStepError('objectives');
        }

        if (stepIndex === 1) {
            const choices = selectedValues('pain_points');
            if (choices.length === 0) {
                showStepError('pain_points', 'Sélectionnez au moins une difficulté pour continuer.');
                form.querySelector('input[name="pain_points"]')?.focus();
                return false;
            }
            clearStepError('pain_points');
        }

        if (stepIndex === 2) {
            const constraints = selectedValues('constraints');
            const horizon = form.elements.horizon;
            let valid = true;

            if (constraints.length === 0) {
                showStepError('constraints', 'Sélectionnez au moins une contrainte, ou « Aucune identifiée ».');
                form.querySelector('input[name="constraints"]')?.focus();
                valid = false;
            } else {
                clearStepError('constraints');
            }

            if (!horizon.value) {
                horizon.setCustomValidity('Sélectionnez un horizon pour continuer.');
                if (valid) horizon.reportValidity();
                valid = false;
            } else {
                horizon.setCustomValidity('');
            }

            return valid;
        }

        return true;
    }

    function moveForward() {
        if (!validateStep(currentStep)) return;
        track('diagnostic_step_complete', {
            step_number: currentStep + 1,
            step_name: ['objectives', 'pain_points', 'maturity_constraints'][currentStep]
        });
        setStep(currentStep + 1);

        if (currentStep === 1) {
            const firstObjective = selectedValues('objectives')[0];
            expertInsight.textContent = objectiveInsights[firstObjective] || expertInsight.textContent;
        }
    }

    form.addEventListener('change', (event) => {
        if (!hasTrackedStart) {
            hasTrackedStart = true;
            track('diagnostic_start');
        }

        const input = event.target;
        if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox') return;

        const group = Array.from(form.querySelectorAll(`input[name="${input.name}"]`));
        const isExclusive = input.dataset.exclusive === 'true' || input.value === 'none_identified';

        if (input.checked && isExclusive) {
            group.forEach((choice) => {
                if (choice !== input) choice.checked = false;
            });
        } else if (input.checked) {
            group.forEach((choice) => {
                const choiceIsExclusive =
                    choice.dataset.exclusive === 'true' || choice.value === 'none_identified';
                if (choiceIsExclusive) choice.checked = false;
            });
        }

        if (input.name === 'objectives') clearStepError('objectives');
        if (input.name === 'pain_points') clearStepError('pain_points');
        if (input.name === 'constraints') clearStepError('constraints');
    });

    wizard.querySelectorAll('.next-step').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.type !== 'submit') moveForward();
        });
    });

    wizard.querySelectorAll('.prev-step').forEach((button) => {
        button.addEventListener('click', () => setStep(currentStep - 1));
    });

    if (maturityRange && maturityFeedback) {
        maturityRange.addEventListener('input', (event) => {
            const value = Number.parseInt(event.target.value, 10);
            maturityFeedback.textContent = maturityInsights[value - 1];
            maturityRange.setAttribute('aria-valuetext', `${value} sur 5. ${maturityInsights[value - 1]}`);
        });
        maturityRange.setAttribute('aria-valuetext', `1 sur 5. ${maturityInsights[0]}`);
    }

    const horizon = form.elements.horizon;
    horizon?.addEventListener('change', () => horizon.setCustomValidity(''));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (currentStep !== steps.length - 1 || !form.reportValidity()) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        const formData = new FormData(form);
        const objectives = formData.getAll('objectives');
        const painPoints = formData.getAll('pain_points');
        const constraints = formData.getAll('constraints');
        const name = String(formData.get('name') || '').trim();
        const details = String(formData.get('details') || '').trim();

        const payload = {
            name,
            email: String(formData.get('email') || '').trim(),
            company: String(formData.get('company') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            source: 'diagnostic_automation_data_ai',
            message: [
                'Diagnostic Automatisation, Data & IA',
                `Objectifs : ${objectives.map((value) => labels.objectives[value] || value).join(', ')}`,
                `Difficultés : ${painPoints.map((value) => labels.painPoints[value] || value).join(', ')}`,
                `Maturité numérique : ${formData.get('maturity')}/5`,
                `Contraintes : ${constraints.map((value) => labels.constraints[value] || value).join(', ')}`,
                `Horizon : ${labels.horizons[formData.get('horizon')] || formData.get('horizon')}`,
                `Secteur : ${String(formData.get('sector') || '').trim()}`,
                `Précisions : ${details || 'Aucune précision fournie'}`
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
                throw new Error('API unavailable');
            }

            await window.AstauriaApi.createLead(payload);
            track('diagnostic_complete', {
                objective_count: objectives.length,
                pain_point_count: painPoints.length
            });

            wizard.innerHTML = `
                <div class="wizard-completion" role="status" tabindex="-1">
                    <i data-lucide="check-circle" aria-hidden="true"></i>
                    <h2>Diagnostic envoyé</h2>
                    <p>Merci ${escapeHtml(name)}. Vos réponses ont bien été transmises à l’équipe Astauria. Nous vous recontacterons pour qualifier les prochaines étapes.</p>
                    <a href="index.html" class="btn btn--primary">Retour à l'accueil</a>
                </div>
            `;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ root: wizard });
            }
            wizard.querySelector('.wizard-completion')?.focus();
        } catch (_) {
            status.textContent = 'L’envoi a échoué. Vérifiez votre connexion puis réessayez.';
            status.setAttribute('role', 'alert');
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

    setStep(0);
});
