// This is our API key
var APIKey = "a1e5fb505551b7deabf3f739d4d4fa9e";
var uvIndex = "";
//showing current day

moment().add(7, "days");

getWeatherForecast.onclick = function () {
  var today = moment();
  $("#currentDay").text(today.format("dddd, MMMM Do YYYY"));
};

//Stores the city name from local storage.
$(document).ready(function () {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  $("#getWeatherForecast").on("click", function () {
    renderSearchHistory();
    var city = $("#city").val();
    getWeatherForecast(city);
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  });
  function renderSearchHistory() {
    $(".searchHistory").empty();
    searchHistory.forEach((city) => {
      $(".searchHistory").append(`
      <li>
      <button>${city}</button>
      </li>
      `);
    });
  }
  $(".searchHistory").on("click", "button", function (event) {
    getWeatherForecast($(this).text());
  });
  function getWeatherForecast(searchValue) {
    //Here we are building the URL we need to query the database
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?" +
      "q=" +
      searchValue +
      "&appid=" +
      APIKey;
    console.log(queryURL);

    //append City
    $(".city").append("City: " + searchValue);

    // run the AJAX call to the OpenWatherAPI
    $.ajax({
      url: queryURL,
      method: "GET",
    })

      // store all of the retrieved data inside of an object called "response"
      .then(function (response) {
        console.log(response);

        var tempF = Math.floor((response.main.temp - 273.15) * 1.8 + 32);

        //append data
        $(".temp").append("Temperature: " + tempF + "F°");
        $(".humidity").append("Humidity: " + response.main.humidity + "%");
        $(".wind").append("Wind: " + response.wind.speed);

        //latitude and longitude variables for UV index
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var countryId = response.sys.country;
        console.log(latitude);
        console.log(longitude);

        //uv Index call
        var uvIndexQueryUrl =
          "https://api.openweathermap.org/data/2.5/uvi?lat=" +
          latitude +
          "&lon=" +
          longitude +
          "&appid=" +
          APIKey;

        console.log(uvIndexQueryUrl);
        $.ajax({
          url: uvIndexQueryUrl,
          method: "GET",
        })

          //store retrieved UV Index data
          .then(function (response) {
            console.log(response);

            var uvIndex = response.value;
            console.log(uvIndex);

            //append UV data
            $(".uv").append("UV Index: " + uvIndex);

            //UV index rating
            $(".uv").each(function () {
              var hour = parseInt($(this).attr("id"));
              if (uvIndex <= 3) {
                $(this).addClass("favorable");
              } else if (uvIndex > 3 || uvIndex <= 7) {
                $(this).removeClass("favorable").addClass("moderate");
              }
              if (uvIndex > 7) {
                $(this)
                  .removeClass("favorable")
                  .removeClass("moderate")
                  .addClass("severe");
              }
            });

            //five Day forecast call
            var fiveDayQueryUrl =
              "https://api.openweathermap.org/data/2.5/forecast?q=" +
              searchValue +
              "," +
              countryId +
              "mode=xml&appid=" +
              APIKey;
            console.log(response);

            $.ajax({
              url: fiveDayQueryUrl,
              method: "GET",
            })

              //stored retrieved Forecast Data
              .then(function (response) {
                console.log(response.list);

                for (var i = 0; i < 5; i++) {
                  var fiveDayForecast = response.list[i];
                  console.log(fiveDayForecast);

                  var forecastWeather = fiveDayForecast.weather[0].main;
                  console.log(forecastWeather);
                  if (forecastWeather === "clear") {
                    $(this).addClass("clear");
                  }

                  var forecastTemp = Math.floor(
                    (fiveDayForecast.main.temp - 273.15) * 1.8 + 32
                  );
                  console.log(forecastTemp);

                  var forecastHumidity = fiveDayForecast.main.humidity;
                  console.log(forecastHumidity);

                  // var nextFiveDays = moment().add(7, "days");
                  // $("#currentDay").text(today.format("dddd, MMMM Do YYYY"));

                  $(".row").append(
                    "<div class='col-sm'> Forecast: " +
                      forecastWeather +
                      // "<br><br>" +
                      // "Date: " +
                      // nextFiveDays +
                      "<br><br>" +
                      "Temperature: " +
                      forecastTemp +
                      " F° <br><br>" +
                      "Humidity: " +
                      forecastHumidity +
                      "</div></br></br>"
                  );

                  //   $(".row").append("Temperature: " + forecastTemp);
                  //   $(".row").append("Humidity: " + forecastHumidity + "</div><br><br><br> ");
                }

                return;

                //   $(".row").append("Forecast: " + forecastWeather + "</br> "
                //   + "<br>" + "Temperature: " + forecastTemp + "</br> "
                //   + "<br>" + "Humidity: " + forecastHumidity + "</br>");
              });
            //   $(".card-text").append("Forecast: " + forecastWeather + "</br> "
            //   + "<br>" + "Temperature: " + forecastTemp + "</br> "
            //   + "<br>" + "Humidity: " + forecastHumidity + "</br>");
          });
      });
  }
});
