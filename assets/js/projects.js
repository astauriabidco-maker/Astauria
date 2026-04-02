// Chargement dynamique des produits
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/projects' 
        : '/api/projects';

    try {
        const response = await fetch(API_URL);
        const projects = await response.json();
        
        if (projects && projects.length > 0) {
            const activeProjects = projects.filter(p => p.isActive);
            container.innerHTML = activeProjects.map(project => {
                // Parser les tags s'ils sont en JSON
                let tags = [];
                try {
                    tags = JSON.parse(project.tags);
                } catch (e) {
                    tags = project.tags.split(',').map(t => t.trim());
                }
                
                const tagsHtml = tags.map(tag => `<span>${tag}</span>`).join('');
                
                return `
                    <div class="product-card" data-animate>
                        <div class="product-card__header">
                            <i data-lucide="${project.icon || 'layout-dashboard'}"></i>
                            <h3>${project.name}</h3>
                        </div>
                        <p class="product-card__desc">
                            ${project.description}
                        </p>
                        <div class="product-card__tags">
                            ${tagsHtml}
                        </div>
                        ${project.url ? `<a href="${project.url}" target="_blank" class="case-study-card__link" style="margin-top: 1rem; display: inline-block;">Voir le projet <i data-lucide="external-link"></i></a>` : ''}
                    </div>
                `;
            }).join('');
            
            // Re-init lucide icons for dynamic content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            container.innerHTML = '<p class="text-center" style="color: rgba(255,255,255,0.5);">Aucun projet en production pour le moment.</p>';
        }
    } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
    }
});
