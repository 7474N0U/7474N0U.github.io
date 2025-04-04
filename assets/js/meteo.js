async function createWeatherWidget(city = "Grasse") {
    try {
        // 1. Géocodage
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();
        const place = geoData.results[0];
        if (!place) throw new Error("Ville introuvable");

        const { latitude, longitude, name } = place;

        // 2. Météo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        const temperature = Math.round(current.temperature);
        const weatherCode = current.weathercode;
        const hour = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // 3. Icône et style météo
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

        // 4. Sélecteur unique basé sur le nom de ville (normalisé)
        const widgetId = `widget-${name.toLowerCase().replace(/\s+/g, '-')}`;
        const panel = document.querySelector('.left-panel');
        let existingWidget = document.getElementById(widgetId);

        const widgetHTML = `
        <div id="${widgetId}" class="weatherwidget ${weatherInfo.class}">
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
            // Mettre à jour le widget existant
            existingWidget.outerHTML = widgetHTML;
        } else {
            // Ajouter un nouveau widget
            panel.insertAdjacentHTML('beforeend', widgetHTML);
        }

    } catch (err) {
        console.error("Erreur météo :", err.message);
    }
}

createWeatherWidget("Grasse");
createWeatherWidget("Nice");
createWeatherWidget("Paris");
createWeatherWidget("Lyon");
createWeatherWidget("Marseille");
