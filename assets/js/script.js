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


//create a function to render storage data

function renderStorage(city) {


    let storage = localStorage.getItem("weatherForecast");
    let storageArr = JSON.parse(storage);

    if (storageArr != null) {

        $("#main-body").remove();

        storageArr.forEach(arr => {

            if (arr.city == city) {

                    let today = $("#main-body");

                    // $("#city").text(`${arr.city} (${arr.currentDate})`);

                    // let iconUrl = `http://openweathermap.org/img/wn/${arr.forecast[0].icon}@2x.png`;
                    // $("#icon").attr("src",iconUrl)
         
                    // $("#temp").text(`Temp : ${arr.forecast[0].temp} °C`);

                    // $("#wind").text(`Wind : ${arr.forecast[0].wind} kph`);

                    // $("#hum").text(`Wind : ${arr.forecast[0].humidity} %`);

                    // let forecastArr = arr.forecast;

                    let h1 = $("<h1>");
                    h1.text(`${arr.city} (${arr.currentDate})`);
                    today.append(h1);

                    let iconUrl = `http://openweathermap.org/img/wn/${arr.forecast[0].icon}@2x.png`;
                    let icon = $("<img>");
                    icon.attr("src", iconUrl);
                    today.append(icon);

                    let temp = $("<p>");
                    temp.text(`Temp : ${arr.forecast[0].temp} °C`);
                    today.append(temp);

                    let wind = $("<p>");
                    wind.text(`Wind : ${arr.forecast[0].wind} kph`);
                    today.append(wind);

                    let hum = $("<p>");
                    hum.text(`Wind : ${arr.forecast[0].humidity} %`);
                    today.append(hum);

                    let forecastArr = arr.forecast;
                    $("#forecast-section").empty(); 



                    forecastArr.forEach((arr, index) => {

                        // $(`#city-${index}`).text(`${arr.date}`);
    
                        // let iconUrl = `http://openweathermap.org/img/wn/${arr.icon}@2x.png`;
                        // $(`#icon-${index}`).attr("src", iconUrl);
    
                        // $(`#temp-${index}`).text(`Temp : ${arr.temp} °C`);
    
                        // $(`#wind-${index}`).text(`Wind : ${arr.wind} kph`);
    
                        // $(`#hum-${index}`).text(`Wind : ${arr.humidity} %`);

                        let forecast = $("#forecast-section");

                        let div1 = $("<div>");
                        div1.attr("class",'col-md mb-3');
                        let div2 = $("<div>");
                        div2.attr("class",'card bg-dark text-light');
                        let div3 = $("<div>");
                        div3.attr("class",'card-body');
    
                        forecast.append(div1)
                        div1.append(div2);
                        div2.append(div3);
    
                            let h5 = $("<h5>");
                            h5.text(`${arr.date}`);
                            div3.append(h5);
        
                            let iconUrl = `http://openweathermap.org/img/wn/${arr.icon}@2x.png`;
                            let icon = $("<img>");
                            icon.attr("src", iconUrl);
                            div3.append(icon);
        
                            let temp = $("<p>");
                            temp.text(`Temp : ${arr.temp} °C`);
                            div3.append(temp);
        
                            let wind = $("<p>");
                            wind.text(`Wind : ${arr.wind} kph`);
                            div3.append(wind);
        
                            let hum = $("<p>");
                            hum.text(`Wind : ${arr.humidity} %`);
                            div3.append(hum);     

                    })

            } else {

                return;

            }

        })

    }

};


//create a function to get results based on the search term
//use local storage if data up to date or call api for new or outdated data

function getResults(searchTerm){

    let date = moment().format('DD/MM/YYYY');

    if (cityArray.some(arr => arr['searchTerm'] == searchTerm) && cityArray) {

        cityArray.forEach(arr => {

            if (arr.searchTerm == searchTerm && arr.currentDate == date) {

                renderStorage(arr.city)

            } else {

                return

            }
        })

    } else {


    weatherApiCall(searchTerm == '' ? geoCityDefault : searchTerm);

    setTimeout(()=>{cityHistory()},4000);

    clearTimeout();

    setTimeout(()=> {

    if (cityArray.some(arr => arr['searchTerm'] == searchTerm)) {

        cityArray.forEach(arr => {

            if (arr.searchTerm == searchTerm) {

                renderStorage(arr.city)

            } else {

                return

            }
        })
        

    } 


if ($(`[data-set="${searchTerm}"]`).length === 0 && rejected.includes(searchTerm) === false) {
        
    let div = $('#history');
    let button = $("<button>");
    button.addClass('btn search-button search-history btn-secondary m-2');
    button.attr("data-set", searchTerm)
    button.text(searchTerm);
    div.append(button);
    
}

},8000)

clearTimeout();

    }

};


// on document load function

$(document).ready(function(){


//immediately invoked function to set up initial page rendering and update the default local area

/* IIFE */
(function initialise() {

    weatherApiCall();
    setTimeout(function(){ renderStorage('London');
    cityHistory();
    loadCityHistory();
},3000)

})();


//create a on click event to trigger get results function if search button pressed

$("#search-button").on('click',function(event){

    event.preventDefault();
    
    //capture the search input
    let searchTerm = $("#search-input").val();
    searchTerm = capitalise(searchTerm);

    //clear searchTerm from input element
    $("#search-input").val('');

    getResults(searchTerm);

})


//create a on click event to trigger get results function if history button pressed

$(document).on('click','.search-history',function(event){

    event.preventDefault();
    event.stopPropagation();

    searchTerm = event.target.dataset.set;

    getResults(searchTerm);

})


});






