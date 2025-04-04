// Charger la liste depuis localStorage ou initialiser avec des villes par défaut
let cities = JSON.parse(localStorage.getItem("cities")) || ["Paris"];

// Sauvegarde dans localStorage
function saveCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
}

// Créer ou mettre à jour un widget météo pour une ville
async function createWeatherWidget(city, index) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();
        const place = geoData.results?.[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude, name } = place;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        const temperature = Math.round(current.temperature);
        const weatherCode = current.weathercode;
        const hour = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const weatherMap = {
            0: { label: "Ensoleillé", icon: "sun_sunny.svg", class: "sunny" },
            1: { label: "Peu nuageux", icon: "sun_cloudy.svg", class: "cloudy" },
            2: { label: "Nuageux", icon: "cloud.svg", class: "cloudy" },
            3: { label: "Très nuageux", icon: "cloud.svg", class: "cloudy" },
            45: { label: "Brouillard", icon: "fog.svg", class: "foggy" },
            51: { label: "Bruine", icon: "rain.svg", class: "rainy" },
            61: { label: "Pluie", icon: "rain.svg", class: "rainy" },
            80: { label: "Averses", icon: "rain.svg", class: "rainy" },
            95: { label: "Orage", icon: "thunder.svg", class: "stormy" }
        };

        const weatherInfo = weatherMap[weatherCode] || { label: "Inconnu", icon: "sun_sunny.svg", class: "sunny" };
        const widgetId = `widget-${name.toLowerCase().replace(/\s+/g, '-')}`;
        const panel = document.querySelector('.left-panel');
        const existingWidget = document.getElementById(widgetId);

        const widgetHTML = `
        <div id="${widgetId}" class="weatherwidget ${weatherInfo.class}" data-city="${name}" draggable="true">
          <img class="icon" src="./assets/img/icons/svg/${weatherInfo.icon}" alt="${weatherInfo.label}">
          <div class="info">
            <div><strong>${name}</strong></div>
            <div>${weatherInfo.label}</div>
            <div class="time">${hour}</div>
          </div>
          <div class="temperature">${temperature}°</div>
        </div>
        `;

        if (existingWidget) {
            existingWidget.outerHTML = widgetHTML;
        } else if (panel) {
            panel.insertAdjacentHTML('beforeend', widgetHTML);
        }

    } catch (err) {
        console.error(`Erreur météo pour ${city} :`, err.message);
    }
}

// Réordonner les widgets en fonction de l'ordre dans cities[]
async function updateAllWidgets() {
    const panel = document.querySelector('.left-panel');
    if (!panel) return;
    panel.innerHTML = "";

    for (let i = 0; i < cities.length; i++) {
        await createWeatherWidget(cities[i], i);
    }

    enableDragAndDrop();
}


// Ajouter une ville
function addCity(newCity) {
    if (!cities.includes(newCity)) {
        cities.push(newCity);
        saveCities();
        updateAllWidgets();
    }
}

// Supprimer une ville
function delCity(city) {
    cities = cities.filter(v => v !== city);
    saveCities();
    updateAllWidgets();
}

// Activer le drag & drop
function enableDragAndDrop() {
    const panel = document.querySelector('.left-panel');
    let draggedElement = null;

    panel.querySelectorAll('.weatherwidget').forEach(widget => {
        widget.addEventListener('dragstart', (e) => {
            draggedElement = widget;
            widget.classList.add('dragging');
        });

        widget.addEventListener('dragend', () => {
            draggedElement = null;
            widget.classList.remove('dragging');
        });

        widget.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingOver = e.currentTarget;
            if (draggedElement && draggingOver !== draggedElement) {
                const rect = draggingOver.getBoundingClientRect();
                const isAbove = e.clientY < rect.top + rect.height / 2;
                panel.insertBefore(draggedElement, isAbove ? draggingOver : draggingOver.nextSibling);
            }
        });

        widget.addEventListener('drop', () => {
            updateCitiesOrderFromDOM();
        });
    });
}

// Mettre à jour l'ordre des villes selon les widgets dans le DOM
function updateCitiesOrderFromDOM() {
    const panel = document.querySelector('.left-panel');
    const widgets = panel.querySelectorAll('.weatherwidget');
    cities = Array.from(widgets).map(widget => widget.dataset.city);
    saveCities();
}

// Lancer à la fin du chargement
document.addEventListener("DOMContentLoaded", () => {
    updateAllWidgets();
});
