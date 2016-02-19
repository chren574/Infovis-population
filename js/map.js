function map(){

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    //initialize color scale
    //var color = d3.scale.category20();

    var color = [];
    color.push("Moderaterna", "#52BDEC");
    color.push("Centerpartiet", "#016A3A");
    color.push("Folkpartiet", "#0094D7");
    color.push("Kristdemokraterna", "blue");
    color.push("Miljöpartiet", "#53A045");
    color.push("Socialdemokraterna", "#ED1B34");
    color.push("Vänsterpartiet", "#DA291C");
    color.push("Sverigedemokraterna", "purple");
    color.push("övriga partier", "gray");

    //initialize tooltip
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    var projection = d3.geo.mercator()
        .center([50, 60 ])
        .scale(600);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");

    // load data and draw the map
    d3.json("data/sweden_mun.topojson", function(error, sweden) {

        var electionData = [];
        var mun = topojson.feature(sweden, sweden.objects.swe_mun).features;
        
        //load summary data
        d3.csv("data/Swedish_Election.csv", function(error, data) {  
            draw(mun, data);  
        });
    });

    function draw(mun, electionData)
    {
        var mun = g.selectAll(".swe_mun").data(mun);

        mun.enter().insert("path")
            .attr("class", "mun")
            .attr("d", path)
            .attr("title", function(d) { return d.properties.name; })
            .style("fill", "blue")
            .attr("stroke-width", 0.5)
            .attr("stroke", "black")
            
/*          // Fungerar inte
            //tooltip
            .on("mousemove", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", 0); 
            }) 
*/
            .on('mouseover', function(d, i) {
                d3.select(this)
                    .style('fill-opacity', .5);
            })
            .on('mouseout', function(d, i) {
                d3.selectAll('path')
                    .style( 'fill-opacity', 1 );
            });
    }

    function strongestParty() {

        return party;
    }

    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }
}