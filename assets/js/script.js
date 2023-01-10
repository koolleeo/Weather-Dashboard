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