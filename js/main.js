var map1;
var donut1;

d3.csv("data/Swedish_Election.csv", function(data) {


    // Global colors
    color = new Map();
    color.set("Moderaterna", "#52BDEC");
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

});

function parseData(electionData) {

    electionData.forEach(function(data) {

        data.region = data.region.slice(5);
        for (var i = 0; i < yearArr.length; ++i) {

            if (data[yearArr[i]] != "..") {
                data[yearArr[i]] = +data[yearArr[i]];
            }

        }
    });

}

yearArr = ["1973", "1976", "1979", "1982", "1985",
    "1988", "1991", "1994", "1998", "2002",
    "2006", "2010", "2014"
];