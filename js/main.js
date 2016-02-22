var map1;

d3.csv("data/Swedish_Election.csv", function (data) {

	map1 = new map(data);

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
});