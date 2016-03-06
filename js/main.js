var map1;
var donut1;

// Global
color = new Map();
color.set("Moderaterna", "blue");
color.set("Centerpartiet", "#016A3A");
color.set("Folkpartiet", "#0094D7");
color.set("Kristdemokraterna", "#231977");
color.set("Miljöpartiet", "#53A045");
color.set("Socialdemokraterna", "#ED1B34");
color.set("Vänsterpartiet", "#DA291C");
color.set("Sverigedemokraterna", "#DDDD00");
color.set("Övriga partier", "gray");
color.set("Odefinierad", "black");

miningMap = new Map();
miningMap.set("Vald Kommun", "orange");
miningMap.set("Mest lik", "green");
miningMap.set("Minst lik", "red");

miningArray = ["Vald Kommun", "Mest lik", "Minst lik"];

ELECTIONYEARSARRAY = [1973, 1976, 1979, 1982, 1985, 1988, 1991, 1994, 1998, 2002, 2006, 2010, 2014];

REGIONARRAY = [];

partyLegendLength = 5;

d3.csv("data/Swedish_Election.csv", function(data) {

    parseData(data);

    map1 = new map(data);
    donut1 = new donut(data);

    // Array for autocomplete
    var nested_data = d3.nest()
        .key(function(d) {
            return d.region;
        })
        .sortKeys(d3.ascending)
        .entries(data);

    nested_data.forEach(function(d) {
        REGIONARRAY.push(d.values[0].region);
    });

});


function parseData(electionData) {

    electionData.forEach(function(data) {

        data.region = data.region.slice(5);
        for (var i = 0; i < ELECTIONYEARSARRAY.length; ++i) {

            if (data[ELECTIONYEARSARRAY[i]] != "..") {
                data[ELECTIONYEARSARRAY[i]] = +data[ELECTIONYEARSARRAY[i].toString()];
            };
        };
    });
};