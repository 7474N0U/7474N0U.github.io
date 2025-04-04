// Charger la liste depuis localStorage ou initialiser avec des villes par défaut
let cities = JSON.parse(localStorage.getItem("cities")) || ["Paris"];

// Sauvegarde dans localStorage
function saveCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
}

// Mettre à jour le panneau central et droit avec les infos de la ville sélectionnée
function updateMainPanel(city, temperature, weatherLabel, iconSrc) {
    document.querySelector('.city-title').textContent = city;
    document.querySelector('.main-temp').textContent = `${temperature}°`;
    document.querySelector('.feels-like').textContent = `Ressenti ${temperature + 3}°`; // Exemple de ressenti
    document.querySelector('.main-icon img').src = iconSrc;
    document.querySelector('.brief-content').textContent = `Météo actuelle : ${weatherLabel}`;

    // Mettre à jour les prévisions horaires
    updateForecast(city);
}

// Mettre à jour les prévisions horaires pour une ville sélectionnée
async function updateForecast(city) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();
        const place = geoData.results?.[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude } = place;

        const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=auto`);
        const forecastData = await forecastRes.json();

        const hourlyTemps = forecastData.hourly.temperature_2m;
        const hourlyCodes = forecastData.hourly.weathercode;
        const hours = forecastData.hourly.time.map(time => new Date(time).getHours());

        const forecastContainer = document.querySelector('.forecast');
        forecastContainer.innerHTML = ""; // Vider l'ancien contenu

        const weatherMap = {
            0: "sun_sunny.svg",
            1: "sun_cloudy.svg",
            2: "cloud.svg",
            3: "cloud.svg",
            45: "fog.svg",
            51: "rain.svg",
            61: "rain.svg",
            80: "rain.svg",
            95: "thunder.svg"
        };

        for (let i = 0; i < 6; i++) {
            const temp = Math.round(hourlyTemps[i]);
            const weatherIcon = weatherMap[hourlyCodes[i]] || "sun_sunny.svg";
            const hourLabel = i === 0 ? "Maintenant" : `${hours[i]}:00`;

            forecastContainer.innerHTML += `
                <div class="hourly">
                    <div class="temperature">${temp}°</div>
                    <img src="./assets/img/icons/svg/${weatherIcon}" alt="Weather Icon">
                    <div>${hourLabel}</div>
                </div>
            `;
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour des prévisions :", error.message);
    }
}

// Sélectionner la première ville au chargement
function selectFirstCity() {
    const firstWidget = document.querySelector('.left-panel .weatherwidget');
    if (firstWidget) {
        firstWidget.click();
    }
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
        const hour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

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
        <div id="${widgetId}" class="weatherwidget ${weatherInfo.class}" data-city="${name}" data-temp="${temperature}" data-label="${weatherInfo.label}" data-icon="./assets/img/icons/svg/${weatherInfo.icon}" draggable="true">
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

        setTimeout(() => {
            document.getElementById(widgetId).addEventListener("click", function () {
                updateMainPanel(name, temperature, weatherInfo.label, `./assets/img/icons/svg/${weatherInfo.icon}`);
            });
        }, 100);

    } catch (err) {
        console.error(`Erreur météo pour ${city} :`, err.message);
    }
}

// Mettre à jour tous les widgets
async function updateAllWidgets() {
    const panel = document.querySelector('.left-panel');
    if (!panel) return;
    panel.innerHTML = "";

    for (let i = 0; i < cities.length; i++) {
        await createWeatherWidget(cities[i], i);
    }

    enableDragAndDrop();
    setTimeout(selectFirstCity, 200);
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

// Lancer à la fin du chargement
document.addEventListener("DOMContentLoaded", () => {
    updateAllWidgets();
});
