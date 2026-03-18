const searchBtn = document.getElementById('searchBtn');
const countryInput = document.getElementById('countryInput');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');
const resultsContainer = document.getElementById('resultsContainer');
const countryDataContainer = document.getElementById('countryData');
const weatherDataContainer = document.getElementById('weatherData');

// Weather Code mapping for Open-Meteo
const weatherCodes = {
    0: 'Clear sky ☀️',
    1: 'Mainly clear 🌤️',
    2: 'Partly cloudy ⛅',
    3: 'Overcast ☁️',
    45: 'Fog 🌫️',
    48: 'Depositing rime fog 🌫️',
    51: 'Light drizzle 🌧️',
    53: 'Moderate drizzle 🌧️',
    55: 'Dense drizzle 🌧️',
    56: 'Light freezing drizzle 🌧️❄️',
    57: 'Dense freezing drizzle 🌧️❄️',
    61: 'Slight rain 🌧️',
    63: 'Moderate rain 🌧️',
    65: 'Heavy rain 🌧️',
    66: 'Light freezing rain 🌧️❄️',
    67: 'Heavy freezing rain 🌧️❄️',
    71: 'Slight snow fall ❄️',
    73: 'Moderate snow fall ❄️',
    75: 'Heavy snow fall ❄️',
    77: 'Snow grains ❄️',
    80: 'Slight rain showers 🌦️',
    81: 'Moderate rain showers 🌦️',
    82: 'Violent rain showers 🌦️',
    85: 'Slight snow showers ❄️',
    86: 'Heavy snow showers ❄️',
    95: 'Thunderstorm ⛈️',
    96: 'Thunderstorm with slight hail ⛈️',
    99: 'Thunderstorm with heavy hail ⛈️'
};

searchBtn.addEventListener('click', handleSearch);
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const query = countryInput.value.trim();
    if (!query) return;

    // Reset UI state
    resultsContainer.classList.add('hidden');
    errorMsg.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // 1. Fetch Country Data
        const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
        if (!countryRes.ok) {
            throw new Error(`Country not found. Please try another name.`);
        }
        const countryData = await countryRes.json();
        const country = countryData[0]; // Take the first result matching the name

        const name = country.name.common;
        const capital = country.capital ? country.capital[0] : 'N/A';
        const population = country.population.toLocaleString();
        const region = country.region;
        const flagSrc = country.flags.svg;
        const [lat, lng] = country.latlng;

        // 2. Fetch Weather Data based on country's coordinates
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&windspeed_unit=kmh`);
        if (!weatherRes.ok) {
            throw new Error('Weather data unavailable for this location.');
        }
        const weatherDataObj = await weatherRes.json();
        const weather = weatherDataObj.current_weather;

        // Update UI with Data
        populateCountryUI({ name, capital, population, region, flagSrc });
        populateWeatherUI({
            temp: weather.temperature,
            windspeed: weather.windspeed,
            time: weather.time,
            code: weather.weathercode
        });

        // Show results
        loader.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

    } catch (err) {
        loader.classList.add('hidden');
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
    }
}

function populateCountryUI({ name, capital, population, region, flagSrc }) {
    countryDataContainer.innerHTML = `
        <div class="data-row">
            <span class="data-label">Name</span>
            <span class="data-value">${name}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Capital</span>
            <span class="data-value">${capital}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Region</span>
            <span class="data-value">${region}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Population</span>
            <span class="data-value">${population}</span>
        </div>
        <div class="data-row" style="margin-top: 1.5rem; justify-content: center;">
            <img src="${flagSrc}" alt="Flag of ${name}" width="160" />
        </div>
    `;
}

function populateWeatherUI({ temp, windspeed, time, code }) {
    const desc = weatherCodes[code] || 'Unknown weather';
    // Format the simple ISO time to local time representation roughly
    const timeFormatted = new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    weatherDataContainer.innerHTML = `
        <div class="temp-large">${temp}°C</div>
        <div class="weather-desc">${desc}</div>
        <div class="data-row">
            <span class="data-label">Wind Speed</span>
            <span class="data-value">${windspeed} km/h</span>
        </div>
        <div class="data-row">
            <span class="data-label">Observation Date</span>
            <span class="data-value">${time.replace('T', ' ')}</span>
        </div>
    `;
}
