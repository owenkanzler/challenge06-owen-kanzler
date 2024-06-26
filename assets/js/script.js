const inputEl = document.querySelector("#search");
const searchBtn = document.querySelector("#submit-btn");
const currentDayDiv = document.querySelector(".current-day");
const fiveDayDiv = document.querySelector(".five-day-grid");
const previousSearchDiv = document.querySelector(".previous-results");

const apiKey = "751f3521cc404332bc560aea5a8f58b8";
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const cityWeatherData = JSON.parse(localStorage.getItem("cityWeather"));

// function to handle the search
function handleSearch(city) {
  const coordinateUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;

  // fetch the url to get the coordniates and then with those coordninates
  // fetch the url for the cities weather data
  fetch(coordinateUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (data) {
      // create object of coordinates
      const coordinates = {
        lat: data[0].lat,
        lon: data[0].lon,
      };
      const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`;
      return fetch(weatherUrl);
    })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (weatherData) {
      if (weatherData) {
        // create object of teh weather data
        const cityWeatherData = {
          city: city,
          currentDay: weatherData.list[0],
        };
        // set the weather data to local storage
        localStorage.setItem("cityWeather", JSON.stringify(cityWeatherData));
        // set the last searched city to local storage
        localStorage.setItem("lastSearchedCity", city);

        // display the information
        displayCurrentDay(weatherData);
        displayFiveDay(weatherData);
        addToSearchHistory(city);
      }
    });
}

// function to display the current days weather
function displayCurrentDay(weatherData) {
  // check to see if there is any weather data
  if (weatherData && weatherData.list && weatherData.list.length > 0) {
    // handle all of the conversions
    const currentWeather = weatherData.list[0];
    const fahrenheit = ((weatherData.list[0].main.temp - 273.15) * 9) / 5 + 32;
    const date = new Date(weatherData.list[0].dt * 1000);

    // display the current day weather data
    currentDayDiv.innerHTML = `
                <h2>${weatherData.city.name} ${date.toLocaleDateString(
      "en-US"
    )}</h2>
                <img src="http://openweathermap.org/img/w/${
                  weatherData.list[0].weather[0].icon
                }.png" alt="Weather Icon" width="50" height="50">
                <div class="details">
                    <p><span>Temp:</span> ${
                      Math.round(100 * fahrenheit) / 100
                    } F</p>
                    <p><span>Wind:</span> ${currentWeather.wind.speed} mph</p>
                    <p><span>Humidity:</span> ${
                      currentWeather.main.humidity
                    }%</p>
                </div>
            `;
  } else {
    currentDayDiv.innerHTML = "<p>No weather data available</p>";
  }
}

// function to display the five day forecast
function displayFiveDay(weatherData) {
  fiveDayDiv.innerHTML = "";

  // create an object to see if that day has already been rendered
  const renderedDays = {};

  // Loop through each item in the weather data
  for (let i = 2; i < weatherData.list.length; i++) {
    const item = weatherData.list[i];
    const date = new Date(item.dt * 1000);
    const day = date.getDate();

    // Check if the day has already been rendered
    if (!renderedDays[day]) {
      // If the day has not been rendered, render its HTML
      renderedDays[day] = true;

      const fahrenheit = ((item.main.temp - 273.15) * 9) / 5 + 32;
      const dayHtml = `
            <div class="day">
                <h4>${date.toLocaleDateString("en-US")}</h4>
                <div class="details">
                    <img src="http://openweathermap.org/img/w/${
                      item.weather[0].icon
                    }.png" alt="Weather Icon" width="50" height="50">
                    <p><span>Temp:</span> ${
                      Math.round(100 * fahrenheit) / 100
                    } F</p>
                    <p><span>Wind:</span> ${item.wind.speed} mph</p>
                    <p><span>Humidity:</span> ${item.main.humidity}%</p>
                </div>
            </div>
        `;

      // add the days html to the five day grid
      fiveDayDiv.innerHTML += dayHtml;
    }
  }
}

// function to add city to the search history
function addToSearchHistory(city) {
  // Check if the city is already in the search history
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  // Render the search history
  renderSearchHistory(searchHistory);
}

// function to render the search history
function renderSearchHistory(searchHistory) {
  // Clear previous search history
  previousSearchDiv.innerHTML = "";

  // Render each city in the search history
  searchHistory.forEach((city) => {
    const previousResult = document.createElement("div");
    previousResult.classList.add("previous-result");
    previousResult.innerHTML = `<p>${city}</p>`;
    previousSearchDiv.appendChild(previousResult);

    previousResult.addEventListener("click", () => {
      handleSearch(city);
    });
  });
}

// listen for when they search a city
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const city = inputEl.value.trim();

  if (city) {
    handleSearch(city);
    inputEl.value = "";
  }
});

// loads the saved data when teh page is loaded
document.addEventListener("DOMContentLoaded", function () {
  const lastSearchedCity = localStorage.getItem("lastSearchedCity");
  if (lastSearchedCity) {
    // If there is a last searched city, perform the search
    handleSearch(lastSearchedCity);
  } else if (cityWeatherData) {
    // If there is cached weather data, display it
    displayCurrentDay(cityWeatherData.currentDay);
    displayFiveDay(cityWeatherData.fiveDay);
    addToSearchHistory(cityWeatherData.city);
  }
});
