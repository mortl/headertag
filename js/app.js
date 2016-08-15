(function() {


    var urlToImg = "";
    var urlToArticle = "";
    var htImg = $('.wiki');
    var htPostUrl = $('#ht--posturl');
    var htPostDate = $('#ht--postdate');
    var htPostTitle = $('#ht--title')
    var x2js = new X2JS();

    var timeInfo = {};
    var isDay = true;
    timeInfo.debug = true;
    $(function() {

        geoip2.insights(onSuccess, onError);

        // calls the json to refresh the page data. Every 5 seconds
        //setInterval(getLocation,5000);
        if(!timeInfo.debug){
            $('#mainForm').hide();
        }else {
            $('#mainForm').show();
        }
        setRadioValues();
        loadBlog("js/hello.php");

    });


    function loadBlog(url) {
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {

                var jsonObj = x2js.xml_str2json(data.htblog);
                getBlog(jsonObj);



            }

        });
    }



    function getBlog(data) {
        var entry_id = 0;

        if (data === null || data === undefined) {
            console.log("Error processing data");

        } else {
            var entry = data.rss.channel.item[entry_id];

            var wpimg = entry.thumbnail._url;
            if (stringContains(wpimg, '?') === false) {
                urlToImg = wpimg;
            } else {
                urlToImg = removeCharacters(wpimg);
            }

            urlToArticle = entry.link;

            var date = "Posted on " + toSimpleDate(entry.pubDate);
            htPostDate.text(date);
            htPostUrl.attr('href', entry.link);

            htPostTitle.text(entry.title);

            htImg.css('background-image', 'url(' + urlToImg + '?h=950)');
        }


    }

    function toSimpleDate(date) {
        return moment(new Date(date)).format("MMMM Do. YYYY");
    }

    function removeCharacters(string) {
        return string.substring(0, string.indexOf('?'));
    }

    function stringContains(str, ch) {
        //if string doesnt have the char, it returns -1
        if (str.lastIndexOf(ch) == -1) {
            return false;
        } else {
            //string contains the character
            return true;
        }
    }

    var onSuccess = function(data) {

        var Geo = {};
        Geo.lat = data.location.latitude;
        Geo.lon = data.location.longitude;
        getWeather(Geo);
       
            getTimeOfDay(Geo);

        
    }
    var onError = function(error) {
        log(error.description);
    }

    function getTimeOfDay(geo) {

        var postfix = false;


        var currentDate = new Date();
        


        //timeInfo.currentTimeEpoch = epochTime(currentDate.getTime());
        var times = SunCalc2.getDayInfo(currentDate, geo.lat, geo.lon, true);


        timeInfo.morningStart = times.morningTwilight.astronomical.start.getHours();

        timeInfo.morningStartEpoch = epochTime(times.morningTwilight.astronomical.start.getTime())
        timeInfo.morningEnd = times.morningTwilight.astronomical.end.getHours();
        timeInfo.morningEndEpoch = epochTime(times.morningTwilight.astronomical.end.getTime());
        timeInfo.noonEpoch = epochTime(times.transit.getTime());
        timeInfo.noon = times.transit.getHours();
        timeInfo.sunsetEpoch = epochTime(times.sunset.end.getTime());
        timeInfo.sunset = times.sunset.end.getHours();
        timeInfo.duskEpoch = epochTime(times.dusk.getTime());
        timeInfo.dusk = times.dusk.getHours();
        timeInfo.midnightEpoch = epochTime(times.nightTwilight.astronomical.end.getTime()) + 6100;
        timeInfo.midnight = times.nightTwilight.astronomical.end.getHours() + 2;


        setRadioValues();
        console.log(timeInfo);

        if (timeInfo.debug) {


            $('.radio').change(function() {



                var val = $('.radio:checked').val();
                console.log(val);
                timeInfo.currentTimeEpoch = parseInt(val);
                
                display(timeInfo)



            });

        } else {
            timeInfo.currentTimeEpoch = epochTime(currentDate.getTime());
            display(timeInfo);
        }

    }
     function setRadioValues(){
        document.getElementById('earlyMorning').value = timeInfo.midnightEpoch;
        document.getElementById('morning').value = timeInfo.morningStartEpoch;
        document.getElementById('noon').value = timeInfo.noonEpoch;
        document.getElementById('night').value = timeInfo.midnightEpoch;
    }
   
    function display(timeInfo) {

        var socialIcons = ['socialnew_01-night.png','socialnew_02-night.png','socialnew_03-night.png', 'socialnew_04-night.png','socialnew_05-night.png'];
        var body = $('#test_body');
        var cloudDiv = $('#cloudDiv_test');

        //console.log(timeInfo.currentTime);
       

                if (timeInfo.midnightEpoch <= timeInfo.currentTimeEpoch && timeInfo.currentTimeEpoch <= timeInfo.morningStart) {
                    body.css('background-image', 'url(images/bg10-night-darker.png)');

                    cloudDiv.removeClass('clouds-day');
                    cloudDiv.addClass('clouds-night');
                    isDay = false;
                    console.log('its early morning');
                    console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
                }

                if (timeInfo.morningStartEpoch <= timeInfo.currentTimeEpoch && timeInfo.currentTimeEpoch <= timeInfo.noonEpoch) {
                    body.css('background-image', 'url(images/bg10.png)');
                    cloudDiv.removeClass('clouds-night');
                    cloudDiv.addClass('clouds-day');
                    isDay = true;
                     console.log('its day time');
                     console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
                }

                if (timeInfo.duskEpoch <= timeInfo.currentTimeEpoch && timeInfo.currentTimeEpoch >= timeInfo.midnightEpoch) {
                    body.css('background-image', 'url(images/bg10-night-darker.png)');
                    cloudDiv.removeClass('clouds-day');
                    cloudDiv.addClass('clouds-night');
                    isDay = false;

                     console.log('its night time');
                     console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
                }
    }

    function getWeather(geo) {
        //console.log(geo.lat + " " + geo.lon);
        var apiKey = '2a3f331056f37d87';

        var urlToWU =
            "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/q/" + geo.lat + "," + geo.lon + ".json";

        var currWeatherImg = document.getElementById("currWeatherImg");
        var currWeatherLoc = document.getElementById("currWeatherLoc");
        var currTemp = document.getElementById("currTemp");
        var currDesc = document.getElementById("currDesc");
        $.ajax({
            url: urlToWU,
            dataType: "jsonp",
            success: function(parsed_json) {


                var temp_c = parsed_json.current_observation.temp_c;
                var temp_f = parsed_json.current_observation.temp_f;

                var iconset = 'c';
                var countryCode = parsed_json.current_observation.display_location.country;
                countryCode = countryCode.toUpperCase();
                var icon = parsed_json.current_observation.icon;
                var currCity = parsed_json.current_observation.display_location.full;
                var feelslike = parsed_json.current_observation.feelslike_string;
                var desc = parsed_json.current_observation.weather;
                var icon_url = "http://icons.wxug.com/i/c/" + iconset + "/" + icon + ".gif";

                if (countryCode === 'US') {
                    currTemp.innerHTML = temp_f + " F";
                } else {
                    currTemp.innerHTML = temp_c + " C";
                }
                //currWeatherImg.src = icon_url;
                //currWeatherImg.src = icon_url ;
                currDesc.innerHTML = desc;
                checkWeatherConditions(desc);


                currWeatherLoc.innerHTML = currCity;

            }
        });

    }

    function checkWeatherConditions(condition) {
        var cloudDiv = $('#cloudDiv_test');
        
        if (isDay) {
            if (condition === "Clear") {
                cloudDiv.removeClass('clouds-day');
                cloudDiv.removeClass('clouds');
            } else {
                cloudDiv.addClass('clouds-day');
                cloudDiv.addClass('clouds');
            }
        } else {
            if (condition === "Clear") {
                cloudDiv.removeClass('clouds-night');
                cloudDiv.removeClass('clouds');
            } else {
                cloudDiv.addClass('clouds-night');
                cloudDiv.addClass('clouds');
            }
        }

    }




    function epochTime(time) {
        return Math.floor(time / 1000);
    }

    function formatTime(date, postfix) {
        if (isNaN(date)) {
            return '&nbsp;&nbsp;n/a&nbsp;&nbsp;';
        }

        var hours = date.getHours(),
            minutes = date.getMinutes(),
            ap;

        if (postfix) {
            ap = (hours < 12 ? 'am' : 'pm');
            if (hours === 0) {
                hours = 12;
            }
            if (hours > 12) {
                hours -= 12;
            }
        } else {
            hours = (hours < 10 ? '0' + hours : '' + hours);
        }

        minutes = (minutes < 10 ? '0' + minutes : '' + minutes);

        return hours + ':' + minutes + (postfix ? ' ' + ap : '');
    }


   
})();
