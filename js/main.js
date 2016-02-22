var map1;

d3.csv("data/Swedish_Election.csv", function (data) {

	map1 = new map(data);

});