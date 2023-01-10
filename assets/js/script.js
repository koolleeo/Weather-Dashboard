// create empty arrays for city forecasts and rejected inputs

let cityArray = [];
let rejected = [];

//create a blueprint for daily weather object

class DailyWeatherObj {

    constructor(date, temp, icon, desc, wind, humidity) {
    
        this.date = date;
        this.temp = temp;
        this.icon = icon;
        this.desc = desc;
        this.wind = wind;
        this.humidity = humidity;
    
    }
};

//create a blueprint for city forecast object

class CityForecast {

    constructor(city, searchTerm, currentDate, forecast) {

        this.city = city;
        this.searchTerm = searchTerm;
        this.currentDate = currentDate;
        this.forecast = forecast;

    }

};

// API keys and URL defaults

const APIkey = '6b68ef65e88e66e99e07cd81b2c55309';
const geoCityDefault = 'London,England,GB';
const geoLimit = 1;


// create functon for weather API call

function weatherApiCall(city) {

    let cityInput = city;

    const geoURL = `https://pro.openweathermap.org/geo/1.0/direct?q=${cityInput === undefined ? geoCityDefault : cityInput}&limit=${geoLimit}&appid=${APIkey}`;

    const apiURL = `https://pro.openweathermap.org/data/2.5/forecast/daily?`

    //ajax call
   
    $.ajax({
    
        url: geoURL,
        method: "GET"
       
    },
    ).then(function(response){

        if(response.length != 0) {

            let data = response[0];
            return data;

        } else {

            throw new Error('Unable to find city co-ordinates');
        }
       

        
    }).then(function(data){

        let lat = data.lat;
        let lon = data.lon;
        let forecastDays = 6;

        $.ajax({

            url: `${apiURL}lat=${lat}&lon=${lon}&cnt=${forecastDays}&appid=${APIkey}`,
            method: "GET"

        }).then(function(response){

            //create city object based on input

            let city = response.city.name;
            let currentDate = moment().format('DD/MM/YYYY');
            let cityArray = response.list;
            let forecastArray = [];
            
           cityArray.forEach((arr,index) => {

                if(index > 0) {

                    let date = arr.dt;
                    date = moment.unix(date).format('DD/MM/YYYY');
                    
                    let temp = arr.temp.day - 273.15;
                    temp = temp.toFixed(2); 

                    let icon = arr.weather[0].icon;
                    let desc = arr.weather[0].description;
                    let wind = arr.speed;
                    let humidity = arr.humidity;

                    let forecast = new DailyWeatherObj(date, temp, icon, desc, wind, humidity);

                    forecastArray.push(forecast);

                }

           })

        //add all relevant city forecast data from the API query to an object

        let weatherOutput = new CityForecast(city, cityInput === undefined ? geoCityDefault : cityInput, currentDate, forecastArray);

        updateLocalStorage(weatherOutput);

        })

    }).catch(function(error) {

        console.log(error.message);
        rejected.push(city);
        
    });
    
};

//create a function to update local storage with input


function updateLocalStorage(object){

    //get local storage - overwrite when city, but with different date already exists
    let storage = localStorage.getItem("weatherForecast");
    let storageArr = JSON.parse(storage);

    //create an empty array and push instance of storage object
    let array = [];
    array.push(object);

    //if storage array already exists, replace existing entry if exists and recreate array of objects for current date
    if (storageArr != null) {

        storageArr.forEach(arr => {
    
            if (arr.city == object.city) {
                return;
            } else {
                array.push(arr)
            }
        })
    
        }

        localStorage.setItem("weatherForecast", JSON.stringify(array));

}

//create a function to capitalise input

function capitalise(str){

    let string = str.split('');
    let cityCapitalise = '';

    string.forEach((arr, index) => {

       if(index == 0) {

        cityCapitalise += arr.toUpperCase();

       } else if (index > 0 && string[index-1] == ' ') {

        cityCapitalise += arr.toUpperCase();

       } else {

        cityCapitalise += arr.toLowerCase();

       }
    })

    return cityCapitalise;
    
};

//create a function to load history into cityArray

function cityHistory() {

    let storage = localStorage.getItem("weatherForecast");
    let storageArr = JSON.parse(storage);

    //create an empty array and push instance of storage object
    let array = [];   

    storageArr.forEach(arr => {

        if (arr.city != 'London'){

        array.push(arr);

        } else {return};
        
    })

    cityArray = array;

};

//create a function to load City history on initial load

function loadCityHistory() {

    cityArray.forEach(arr => {

        let div = $('#history');
        let button = $("<button>");
        button.addClass('btn search-button search-history btn-secondary m-2');
        button.attr("data-set", arr.city == 'London' ? arr.city : arr.searchTerm);
        button.text(arr.city == 'London' ? arr.city : arr.searchTerm);
        div.append(button);

    })

};