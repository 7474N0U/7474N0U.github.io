// Définition unique de la weatherMap
const weatherMap = {
    0: { label: "Ensoleillé", icon: "sun_sunny.svg", class: "sunny" },
    1: { label: "Peu nuageux", icon: "sun_cloudy.svg", class: "cloudy" },
    2: { label: "Nuageux", icon: "sun_cloudy.svg", class: "cloudy" },
    3: { label: "Très nuageux", icon: "sun_very_cloudy.svg", class: "cloudy" },
    45: { label: "Brouillard", icon: "sun_foggy.svg", class: "foggy" },
    51: { label: "Bruine", icon: "sun_misty.svg", class: "rainy" },
    61: { label: "Pluie", icon: "sun_rainy.svg", class: "rainy" },
    80: { label: "Averses", icon: "sun_rainy.svg", class: "rainy" },
    95: { label: "Orage", icon: "sun_stormy.svg", class: "stormy" }
};

let cities = JSON.parse(localStorage.getItem("cities")) || ["Paris"];

function saveCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return response.json();
}

async function updateMainPanel(city, temperature, weatherLabel, iconSrc) {
    document.querySelector('.city-title').textContent = city;
    document.querySelector('.main-temp').textContent = `${temperature}°`;
    document.querySelector('.feels-like').textContent = `Ressenti ${temperature + 3}°`;
    document.querySelector('.main-icon img').src = iconSrc;
    document.querySelector('.brief-content').textContent = `Météo actuelle : ${weatherLabel}`;
    await updateWindInfo(city);
    updateForecast(city);
}

async function updateWindInfo(city) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();
        const place = geoData.results?.[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude } = place;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        const windSpeed = current.windspeed;
        const windDirection = current.winddirection;
        const windDirectionText = getWindDirectionText(windDirection);

        document.querySelector('.wind-info').innerHTML = `
            <i class="fas fa-wind"></i> ${windDirectionText} ↑ ${windSpeed} km/h
        `;
    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations du vent :", error.message);
    }
}

function getWindDirectionText(degrees) {
    if (degrees >= 0 && degrees < 45) return "Nord-Est";
    if (degrees >= 45 && degrees < 90) return "Est";
    if (degrees >= 90 && degrees < 135) return "Sud-Est";
    if (degrees >= 135 && degrees < 180) return "Sud";
    if (degrees >= 180 && degrees < 225) return "Sud-Ouest";
    if (degrees >= 225 && degrees < 270) return "Ouest";
    if (degrees >= 270 && degrees < 315) return "Nord-Ouest";
    return "Nord";
}

async function updateForecast(city) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`;
        const geoData = await fetchJson(geoUrl);
        const place = geoData.results?.[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude } = place;
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=auto`;
        const forecastData = await fetchJson(forecastUrl);

        const hourlyTemps = forecastData.hourly?.temperature_2m;
        const hourlyCodes = forecastData.hourly?.weathercode;
        const times = forecastData.hourly?.time;
        if (!hourlyTemps || !hourlyCodes || !times) {
            throw new Error("Données de prévisions incomplètes");
        }

        const hours = times.map(time => new Date(time).getHours());

        const forecastContainer = document.querySelector('.forecast');
        forecastContainer.innerHTML = "";

        for (let i = 0; i < 12 && i < hourlyTemps.length && i < hourlyCodes.length && i < hours.length; i++) {
            const temp = Math.round(hourlyTemps[i]);
            const weatherInfo = weatherMap[hourlyCodes[i]] || { icon: "sun_sunny.svg" };
            const weatherIcon = weatherInfo.icon;
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

function selectFirstCity() {
    const firstWidget = document.querySelector('.left-panel .weatherwidget');
    if (firstWidget) {
        firstWidget.classList.add('selected');
        const city = firstWidget.getAttribute('data-city');
        const temperature = parseInt(firstWidget.getAttribute('data-temp'), 10);
        const weatherLabel = firstWidget.getAttribute('data-label');
        const iconSrc = firstWidget.getAttribute('data-icon');
        updateMainPanel(city, temperature, weatherLabel, iconSrc);
    }
}

async function createWeatherWidget(city) {
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`;
        const geoData = await fetchJson(geoUrl);
        const place = geoData.results?.[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude, name } = place;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
        const weatherData = await fetchJson(weatherUrl);
        const current = weatherData.current_weather;

        const temperature = Math.round(current.temperature);
        const weatherCode = current.weathercode;
        const hour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const weatherInfo = weatherMap[weatherCode] || { label: "Inconnu", icon: "sun_sunny.svg", class: "sunny" };
        const widgetId = `widget-${name.toLowerCase().replace(/\s+/g, '-')}`;
        const panel = document.querySelector('.left-panel');
        let widgetElement = document.getElementById(widgetId);

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

        if (widgetElement) {
            widgetElement.outerHTML = widgetHTML;
        } else if (panel) {
            panel.insertAdjacentHTML('beforeend', widgetHTML);
        }

        widgetElement = document.getElementById(widgetId);
        widgetElement.addEventListener("click", function () {
            document.querySelectorAll('.weatherwidget').forEach(widget => widget.classList.remove('selected'));
            widgetElement.classList.add('selected');
            updateMainPanel(name, temperature, weatherInfo.label, `./assets/img/icons/svg/${weatherInfo.icon}`);
        });
    } catch (err) {
        console.error(`Erreur météo pour ${city} :`, err.message);
    }
}

function enableDragAndDrop() {
    const widgets = document.querySelectorAll('.weatherwidget');
    const panel = document.querySelector('.left-panel');

    widgets.forEach(widget => {
        widget.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', widget.id);
            widget.classList.add('dragging');
        });

        widget.addEventListener('dragend', () => {
            widget.classList.remove('dragging');
        });
    });

    panel.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(panel, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            if (afterElement == null) {
                panel.appendChild(dragging); // Ajoute à la fin si aucun élément après n'est trouvé
            } else {
                panel.insertBefore(dragging, afterElement); // Insère avant l'élément trouvé
            }
        }
    });

    panel.addEventListener('drop', () => {
        const newOrder = Array.from(panel.querySelectorAll('.weatherwidget'))
            .map(widget => widget.getAttribute('data-city'));
        cities = newOrder;
        saveCities();

        const dragging = document.querySelector('.dragging');
        if (dragging) {
            document.querySelectorAll('.weatherwidget').forEach(widget => widget.classList.remove('selected'));
            dragging.classList.add('selected');
            const city = dragging.getAttribute('data-city');
            const temperature = parseInt(dragging.getAttribute('data-temp'), 10);
            const weatherLabel = dragging.getAttribute('data-label');
            const iconSrc = dragging.getAttribute('data-icon');
            updateMainPanel(city, temperature, weatherLabel, iconSrc);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.weatherwidget:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updateAllWidgets() {
    const panel = document.querySelector('.left-panel');
    if (!panel) return;

    // Sauvegarder la barre de recherche
    const searchBar = document.querySelector('.search-bar-container');
    const searchBarHTML = searchBar ? searchBar.outerHTML : '';

    // Vider le panneau gauche
    panel.innerHTML = "";

    // Réinsérer la barre de recherche
    if (searchBarHTML) {
        panel.insertAdjacentHTML('afterbegin', searchBarHTML);
    }

    // Ajouter les widgets météo
    for (const city of cities) {
        await createWeatherWidget(city);
    }

    enableDragAndDrop();
    setTimeout(selectFirstCity, 200);
}

function addCity(newCity) {
    if (!cities.includes(newCity)) {
        cities.push(newCity);
        saveCities();
        updateAllWidgets();
    }
}

function delCity(city) {
    cities = cities.filter(v => v !== city);
    saveCities();
    updateAllWidgets();
}

document.addEventListener("DOMContentLoaded", () => {
    updateAllWidgets();
    setTimeout(selectFirstCity, 300);

    async function fetchSuggestions(query) {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=fr&format=json`);
            const data = await res.json();

            // Trier les résultats pour afficher d'abord les villes en France
            const sortedResults = (data.results || []).sort((a, b) => {
                if (a.country === "France" && b.country !== "France") return -1;
                if (a.country !== "France" && b.country === "France") return 1;
                return 0;
            });

            return sortedResults;
        } catch (error) {
            console.error("Erreur de suggestion :", error);
            return [];
        }
    }

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(null, args);
            }, delay);
        };
    }

    async function createSuggestionWidget(place) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${place.name}&count=1&language=fr&format=json`;
        const geoData = await fetchJson(geoUrl);
        const location = geoData.results?.[0];
        if (!location) return;

        const { latitude, longitude, name } = location;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
        const weatherData = await fetchJson(weatherUrl);
        const current = weatherData.current_weather;

        const temperature = Math.round(current.temperature);
        const weatherCode = current.weathercode;
        const weatherInfo = weatherMap[weatherCode] || { label: "Inconnu", icon: "sun_sunny.svg", class: "sunny" };

        const panel = document.querySelector('.left-panel');

        // Vérifier si un widget pour cette ville existe déjà
        const existingWidget = Array.from(panel.querySelectorAll('.weatherwidget.suggestion'))
            .find(widget => widget.getAttribute('data-city') === name);

        if (existingWidget) return; // Ne pas ajouter de doublon

        const suggestionHTML = `
            <div class="weatherwidget ${weatherInfo.class} suggestion" data-city="${name}" data-temp="${temperature}" data-label="${weatherInfo.label}" data-icon="./assets/img/icons/svg/${weatherInfo.icon}" draggable="true">
                <img class="icon" src="./assets/img/icons/svg/${weatherInfo.icon}" alt="${weatherInfo.label}">
                <div class="info">
                    <div><strong>${name}</strong></div>
                    <div>${weatherInfo.label}</div>
                    <div class="temperature">${temperature}°</div>
                </div>
            </div>
        `;

        const searchBar = panel.querySelector('.search-bar-container');
        if (searchBar) {
            searchBar.insertAdjacentHTML('afterend', suggestionHTML);
        } else {
            panel.insertAdjacentHTML('afterbegin', suggestionHTML);
        }

        // Rechercher l'élément nouvellement ajouté
        const widgetElement = panel.querySelector(`.weatherwidget.suggestion[data-city="${name}"]`);
        if (widgetElement) {
            widgetElement.addEventListener('click', () => {
                addCity(name);
                document.getElementById('city-search').value = '';
                panel.querySelectorAll('.weatherwidget.suggestion').forEach(el => el.remove());
                panel.querySelectorAll('.weatherwidget').forEach(el => el.style.display = '');
            });
        } else {
            console.error("Erreur : l'élément suggestion n'a pas été trouvé après l'insertion.");
        }
    }

    document.getElementById('city-search').addEventListener('input', debounce(async function(e) {
        const searchValue = e.target.value.trim();
        const panel = document.querySelector('.left-panel');

        // Masquer les widgets existants
        panel.querySelectorAll('.weatherwidget:not(.suggestion)').forEach(el => el.style.display = 'none');

        // Supprimer les suggestions précédentes
        panel.querySelectorAll('.weatherwidget.suggestion').forEach(el => el.remove());

        if (!searchValue) {
            // Réafficher les widgets existants si le champ est vide
            panel.querySelectorAll('.weatherwidget').forEach(el => el.style.display = '');
            return;
        }

        // Récupérer les suggestions
        const suggestions = await fetchSuggestions(searchValue);

        // Si on a des résultats, les afficher comme widgets météo
        if (suggestions.length > 0) {
            for (const place of suggestions) {
                await createSuggestionWidget(place);
            }
        } else {
            const noResultHTML = `<div class="weatherwidget suggestion">Aucune ville trouvée</div>`;
            const searchBar = panel.querySelector('.search-bar-container');
            if (searchBar) {
                searchBar.insertAdjacentHTML('afterend', noResultHTML);
            } else {
                panel.insertAdjacentHTML('afterbegin', noResultHTML);
            }
        }
    }, 300));
});
