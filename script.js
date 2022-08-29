var apiKey = "d31373940f7f8b59573632e5332e9f3f";
var today = moment().format('L');
var searchHistoryList = [];

function weather(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;


    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(weatherResponse) {
        console.log(weatherResponse);

        $("#currentWeather").css("display", "block");
        $("#cityDisplay").empty();
// icons
        var iconCode = weatherResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        // appending current weather details
        var currentCity = $(`
            <h2 id="currentCity">
                ${weatherResponse.name} ${today} <img src="${iconURL}" alt="${weatherResponse.weather[0].description}" />
            </h2>
            <p>Temperature: ${weatherResponse.main.temp} °F</p>
            <p>Humidity: ${weatherResponse.main.humidity}\%</p>
            <p>Wind Speed: ${weatherResponse.wind.speed} MPH</p>
        `);

        $("#cityDisplay").append(currentCity);
    // latitude and longitude
        var lat = weatherResponse.coord.lat;
        var lon = weatherResponse.coord.lon;
        var uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: uvQueryURL,
            method: "GET"
        }).then(function(uvResponse) {
            console.log(uvResponse)

            var uvIndex = uvResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);

            $("#cityDisplay").append(uvIndexP);

            futureCondition(lat, lon);
// uv color changes
// green
            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
                // yellow
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $("#uvIndexColor").css("background-color", "#FFF300");
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                // orange
                $("#uvIndexColor").css("background-color", "#F18B00");
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                // red
                $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
            } else {
                // violet
                $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white"); 
            };  

        });

    });
}

function futureCondition(lat, lon) {

    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function(futureResponse) {
        console.log(futureResponse);
        $("#fiveForecast").empty();
        
        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                humidity: futureResponse.daily[i].humidity
            };

            var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

// date, icon, temp, humidity
            var futureCard = $(`
                    <div class="card pl-3 pt-3 mb-3" id="fiveCard">
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
            `);

            $("#fiveForecast").append(futureCard);
        }
    }); 
}

// search button click event listener 
$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    weather(city);
    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var searchedCity = $(`
            <li class="list-group-item">${city}</li>
            `);
        $("#searchHistory").append(searchedCity);
    };
    
    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    console.log(searchHistoryList);
});

// search history li 
$(document).on("click", ".list-group-item", function() {
    var listCity = $(this).text();
    weather(listCity);
});


$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        weather(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
    }
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});