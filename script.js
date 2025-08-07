
const API_KEY = '188ac5f2f74140ffab324609250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherContainer = document.getElementById('weatherContainer');

// DOM elements for current weather
const locationName = document.getElementById('locationName');
const currentTime = document.getElementById('currentTime');
const currentTemp = document.getElementById('currentTemp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Initialize with Seoul weather
window.addEventListener('load', () => {
    getWeatherData('Seoul');
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('도시명을 입력해주세요.');
        return;
    }
    
    await getWeatherData(city);
}

async function getWeatherData(city) {
    showLoading(true);
    hideError();
    
    try {
        // Get current weather and forecast
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`),
            fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('도시를 찾을 수 없습니다.');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData.forecast.forecastday);
        
        showWeatherContainer(true);
    } catch (err) {
        showError(err.message || '날씨 정보를 가져오는데 실패했습니다.');
        showWeatherContainer(false);
    } finally {
        showLoading(false);
    }
}

function displayCurrentWeather(data) {
    const { location, current } = data;
    
    // Update location and time
    locationName.textContent = `${location.name}, ${location.country}`;
    currentTime.textContent = `현지시간: ${new Date(location.localtime).toLocaleString('ko-KR')}`;
    
    // Update main weather info
    currentTemp.textContent = `${Math.round(current.temp_c)}°C`;
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    weatherCondition.textContent = current.condition.text;
    feelsLike.textContent = Math.round(current.feelslike_c);
    
    // Update weather details
    humidity.textContent = `${current.humidity}%`;
    wind.textContent = `${current.wind_kph} km/h ${current.wind_dir}`;
    visibility.textContent = `${current.vis_km} km`;
    pressure.textContent = `${current.pressure_mb} mb`;
}

function displayForecast(forecastDays) {
    forecastContainer.innerHTML = '';
    
    forecastDays.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short', month: 'short', day: 'numeric' });
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="forecast-temps">
                <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
            </div>
            <div class="forecast-condition">${day.day.condition.text}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showWeatherContainer(show) {
    weatherContainer.classList.toggle('hidden', !show);
}
