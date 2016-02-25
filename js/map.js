function map(data){

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    //initialize color scale
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
    color.set("Odefinierad", "white");

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

        var mun = topojson.feature(sweden, sweden.objects.swe_mun).features;
        
        draw(mun, data);  
        
    });

    function draw(mun, electionData)
    {

        self.electionData = electionData;
        var year = document.getElementById("year").value;

        var mun = g.selectAll(".swe_mun").data(mun);
        var colorOfParty = partyColor(electionData, year);


        mun.enter().insert("path")
            .attr("class", "mun")
            .attr("d", path)
            .attr("title", function(d) { return d.properties.name; })
            .style("fill", function(d, i) {
                var index = 0;
                for(var l = 0; l < colorOfParty.length; ++l) {
                    // Compare region-name
                    if(d.properties.name == colorOfParty[l].reg) {
                        index = l;
                        break;
                    }

                };
                return color.get(colorOfParty[index].par);
            })
            .attr("stroke-width", 0.1)
            .attr("stroke", "black")
            
/*          // Fungerar inte, css krånglar
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
            .on("click", function(d) {
                donut1.drawMun(d.properties.name);
            })
            
            .on('mouseover', function(d) {
                d3.select(this)
                    .style('stroke-width', .5);
            })
            .on('mouseout', function(d) {
                d3.selectAll('path')
                    .style( 'stroke-width', 0.1 );
            });
    }

    this.colorByYear = function () {

        var year = document.getElementById("year").value;

        var colorOfParty = partyColor(electionData, year);

        g.selectAll(".mun").each(function(p) {

            var point = d3.select(this);
            point.style("fill-opacity", 1 )

            point.style("fill", function(d) {
            
            var index = NaN;
            for(var l = 0; l < colorOfParty.length; ++l) {
                // Compare region-name
                if(d.properties.name == colorOfParty[l].reg) {
                    index = l;
                    break;
                }
            };
            //console.log(index)
            if(!isNaN(index)) {
                return color.get(colorOfParty[index].par);
            } else {
                console.log("LOG")
                return color.get("Odefinierad");
            }
            
            });

        });
    }

    this.colorByParty = function() {

        var party = document.getElementById("party").value;
        var year = document.getElementById("year").value;

        var nested_data = d3.nest()
            .key(function(d) { return d.parti; })
            .sortValues(function(a, b) { return b[year] - a[year]; })
            .entries(electionData);

        nested_data = nested_data.filter(function(d) {
            return d.key == party;
        })

        var len = nested_data[0].values.length;

        var max, min;
        max = parseFloat(nested_data[0].values[0][year]);
        min = parseFloat(nested_data[0].values[len-1][year]);

        g.selectAll(".mun").each(function(p) {

            var point = d3.select(this);

            point.style("fill", function(d) {
                for(var i = 0; i < len; ++i) {
                    
                    var region = nested_data[0].values[i];
                    
                    if(d.properties.name == region.region) {

                        return !(isNaN(region[year])) ? color.get(party) : "white";
                    
                    }
                };
            })

            point.style("fill-opacity", function(d) {
            
            var opac = 0;
            for(var i = 0; i < len; ++i) {
                
                var region = nested_data[0].values[i];
                // Compare region-name
                if(d.properties.name == region.region) {
                    
                    opac = (parseFloat(region[year]) - min)/(max - min);
                    break;
                }
            };
            
            return opac;
            });
        });

    }

    function partyColor(electionData, year) {
        
        var nested_data = d3.nest()
            .key(function(d) { return d.region; })
            .sortValues(function(a, b) { return b[year] - a[year]; })
            .entries(electionData);

        var colorOfParty = [];

        nested_data.forEach(function(d, i) {
            colorOfParty.push({reg: d.values[0].region, par: d.values[0].parti });
        });
        return colorOfParty;
    }

    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }

    // Sends the name of the mun to other .js-files
    this.selectMun = function (mun) {

        //console.log(mun);

    }
}