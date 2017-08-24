$(function(){
	var temperature;
	var temperatureFahrenheit;
	var unitChanged = false;
	var weather;
	var lon;
	var lat;
	var location;
	var forecastData;

	function setBackgroundColor()
	{
		var col;

		//could add transition between colors
		if(temperature <= 0) col = "#0acccc";

		else if(temperature <= 15) col = "#e5e539";

		else if(temperature <= 30) col = "#ef8809";

		else if(temperature > 30) col = "#e82c2c";


		$("html").css("background-color", col);
		$("html").css("color", col);
	}

	function getWeather()
	{
		$.ajax({
			url: "https://api.apixu.com/v1/forecast.json?key=00a1f7fc1ae543bcbb395645172108",
			data:{
				q: (lat+","+lon),
				days: 2
			},

			success: function(response)
			{
				location = response.location.name;
				weather = response.current.condition.text;
				temperature = response.current.temp_c;
				temperatureFahrenheit = response.current.temp_f;
				forecastData = response.forecast.forecastday;
				setWear();
			},

			complete: function()
			{
				setCurrentWeather();
				setBackgroundColor();
			}
		});
	}

	function setWear()
	{
		var data = forecastData;
		var currentTime = new Date();
		var validTimes = [];
		var searchHours = 6;
		var avgFeelTemp = 0;
		var avgWindSpeed = 0;
		var rain = false;
		var snow = false;

		var wear = "Wear something: ";

		if($(".time").get()[0].value) searchHours = $(".time").get()[0].value;

		//first select all forecasts within n hours of current time
		for(var i = 0;i<data.length;i++)
		{
			for(var j = 0;j<data[i].hour.length;j++)
			{
				var day = data[i].hour[j].time.split(' ')[0];
				day = day.slice(day.length-2,day.length);
				var hour = data[i].hour[j].time.split(' ')[1];
				hour = hour.slice(0,2);


				if(validTimes.length >= searchHours)break;

				//if today then check if before
				if(day == currentTime.getDate())
				{
					if(hour >= currentTime.getHours())
					{
						validTimes.push(data[i].hour[j]);
					}
				}

				//else if tomorrow then add
				else if(day == (currentTime.getDate()+1))
				{
					validTimes.push(data[i].hour[j]);
				}
			}
		}


		//loop through the valid times and check data
		for(var n = 0;n<validTimes.length;n++)
		{
			avgFeelTemp += (validTimes[n].feelslike_c/searchHours);
			avgWindSpeed += (validTimes[n].wind_mph)/searchHours;

			if(validTimes[n].will_it_rain) rain = true;

			if(validTimes[n].will_it_snoq) snow = true;
		}

		//Decide on what to wear based on predicted values
		if(avgFeelTemp <= 0)wear +="extra warm";

		else if(avgFeelTemp <= 15) wear +="warm";

		else if(avgFeelTemp <= 30) wear +="light";

		else wear +="breathable";

		if(snow) wear +=", snow proof";


		if(rain)
		{
			wear +=", waterproof";

			if(avgWindSpeed >= 30) wear +=", but don't bring an umbrella "
		}


		$(".wear").text(wear);

	}

	function setCurrentWeather(){
		$(".location").text(location);
		$(".weather").text(weather);
		$(".temperature").text(temperature+"°C");
	}

	//get location
	function success(pos)
	{
		var crd = pos.coords;

		lat = crd.latitude;
		lon = crd.longitude;

		console.log(lat+" "+lon);


		getWeather();
	};

	navigator.geolocation.getCurrentPosition(success);

	$(".temperature").click(function(){

		unitChanged = !unitChanged;

		if(unitChanged) $(".temperature").text(temperature+"°C");

		else $(".temperature").text(temperatureFahrenheit+"°F");

	});

	$(".time").on("change", function() {
   		if(forecastData)setWear();
	});

});
