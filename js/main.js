var map1;
var donut1;

d3.csv("data/Swedish_Election.csv", function(data) {

    // Global colors
    color = new Map();
    color.set("Moderaterna", "blue");
    color.set("Centerpartiet", "#016A3A");
    color.set("Folkpartiet", "#0094D7");
    color.set("Kristdemokraterna", "#231977");
    color.set("Miljöpartiet", "#53A045");
    color.set("Socialdemokraterna", "#ED1B34");
    color.set("Vänsterpartiet", "#DA291C");
    color.set("Sverigedemokraterna", "#DDDD00");
    color.set("övriga partier", "gray");
    color.set("Odefinierad", "black");

    parseData(data);

    map1 = new map(data);
    donut1 = new donut(data);

    regionArray(data);

});

function parseData(electionData) {

    var yearArr = ["1973", "1976", "1979", "1982", "1985",
        "1988", "1991", "1994", "1998", "2002",
        "2006", "2010", "2014"
    ];

    electionData.forEach(function(data) {

        data.region = data.region.slice(5);
        for (var i = 0; i < yearArr.length; ++i) {

            if (data[yearArr[i]] != "..") {
                data[yearArr[i]] = +data[yearArr[i]];
            };

        };
    });

};

// Array for autocomplete
this.regionArray = function(data) {

    var nested_data = d3.nest()
        .key(function(d) {
            return d.region;
        })
        .entries(data);

    var regArr = [];

    nested_data.forEach(function(d) {
        regArr.push(d.values[0].region);
    });

    console.log(regArr);

};