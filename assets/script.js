//-- Save radio button state in localStorage
const allRadios = document.querySelectorAll('.selector-container input[type="radio"]');
const groupNames = [...new Set(Array.from(allRadios).map(radio => radio.name))];

groupNames.forEach(name => {
    const savedId = localStorage.getItem(`saved_${name}`);
    if (savedId) {
        const element = document.getElementById(savedId);
        if (element) {
            element.checked = true;
        }
    }
});

allRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        localStorage.setItem(`saved_${e.target.name}`, e.target.id);
    });
});

// -- State Sync radio buttons subtitles and icons --
document.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return;

    const overlay = e.target.closest('.overlay');
    const label = document.querySelector(`label[for="${e.target.id}"]`);
    
    if (!overlay || !label) return; 

    // --- EXTRACTION DES DONNÉES ---
    const iconSrc = label.querySelector('img.icon')?.src;
    const rawText = label.textContent.trim() || label.querySelector('img')?.alt.replace(' icon', '') || e.target.id;
    const text = rawText.charAt(0).toUpperCase() + rawText.slice(1);

    // --- CIBLAGE DES PARENTS À METTRE À JOUR ---
    const targets = [
        { 
            container: document.querySelector(`.disclosure-case[data-target="${overlay.id}"]`), 
            textSel: '.disclosure-subtitle', 
            iconSel: 'img.icon' 
        },
        { 
            container: overlay, 
            textSel: '.overlay-state-text', 
            iconSel: 'img.overlay-state-icon' 
        }
    ];

    // --- APPLICATION (Boucle DRY) ---
    targets.forEach(({ container, textSel, iconSel }) => {
        if (!container) return;
        
        const textEl = container.querySelector(textSel);
        const iconEl = container.querySelector(iconSel);

        if (textEl) textEl.textContent = text;
        if (iconEl && iconSrc) iconEl.src = iconSrc;
    });
});