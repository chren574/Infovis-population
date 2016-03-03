function map(data) {

    // Global variable
    CURRMUN = "Upplands Väsby";

    var scaleDiv = 0.80;

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");

    var margin = { top: 10, right: 0, bottom: 10, left: 0 },
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    //initialize tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var projection = d3.geo.mercator()
        .center([40, 62])
        .scale(850);

    var svg = d3.select("#map").append("svg")
        .attr("width", width * scaleDiv)
        .attr("height", height * scaleDiv)
        .style("border", "1px solid black")
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");

    // load data and draw the map
    d3.json("data/sweden_mun.topojson", function(error, sweden) {

        var mun = topojson.feature(sweden, sweden.objects.swe_mun).features;
        
        draw(mun, data);
    });

    function draw(mun, electionData) {

        regiondData = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(electionData);
        self.electionData = electionData;
        //var year = document.getElementById("year").value;
        var year = 1973;
        //var arrayIndex = $( "#year" ).slider( "value" );  

        var mun = g.selectAll(".swe_mun").data(mun);
        var colorOfParty = partyColor(electionData, year);

        mun.enter().insert("path")
            .attr("class", "mun")
            .attr("d", path)
            /*
            .attr("title", function(d) {
                var regionString = "";
                for (var r = 0; r < regiondData.length; ++r) {
                    if (regiondData[r].key == d.properties.name) {
                        regionString = regiondData[r].key;
                        regiondData[r].values.forEach(function(e) {
                            if (!isNaN(e[year])) {
                                regionString = regionString + "\n" + e.parti + ": " + e[year];
                            }
                        })
                    }
                    continue;
                };
                return regionString;
            })
*/
            .style("fill", function(d, i) {
                var index = 0;
                for (var l = 0; l < colorOfParty.length; ++l) {
                    // Compare region-name
                    if (d.properties.name == colorOfParty[l].reg) {
                        index = l;
                        break;
                    }

                };
                return color.get(colorOfParty[index].par);
            })
            .attr("stroke-width", 0.1)
            .attr("stroke", "black")

        // Fungerar inte, css krånglar
    // Tooltip stuff after this
        .on("mouseover", function(d) { 
            tooltip.transition()
                .duration(500)  
                .style("opacity", 0);
            tooltip.transition()
                .duration(200)  
                .style("opacity", .9);  
            tooltip .html(
                "<span style='color:" + color.get("Moderaterna") + "'>" +
                 "<strong>" + d.properties.name + "</strong>")
                .style("left", (d3.event.pageX) + "px")          
                .style("top", (d3.event.pageY - 28) + "px");
            })

          
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })

        .on("click", function(d) {
            
                        d3.selectAll(".mun")
                            .style("stroke-width", .1)

                        d3.select(this)
                            .style("stroke-width", 1)
            
            selectedMun(d.properties.name);
            $("#searchfield").attr("placeholder", d.properties.name).val("").focus().blur();

        })
    }

    this.colorByYear = function(electionYear) {

        //var year = document.getElementById("year").value;
        //console.log(electionYear);
        year = electionYear;

        donut1.drawMun(currentMun(CURRMUN), electionYear);

        var colorOfParty = partyColor(electionData, year);

        g.selectAll(".mun").each(function(p) {

            var point = d3.select(this);
            point.style("fill-opacity", 1)

            point.style("fill", function(d) {

                var index = NaN;
                for (var l = 0; l < colorOfParty.length; ++l) {
                    // Compare region-name
                    if (d.properties.name == colorOfParty[l].reg) {
                        index = l;
                        break;
                    }
                };
                //console.log(index)
                if (!isNaN(index)) {
                    return color.get(colorOfParty[index].par);
                } else {
                    return color.get("Odefinierad");
                }

            });
            point.attr("title", function(d) {
                var regionString = "";
                for (var r = 0; r < regiondData.length; ++r) {
                    if (regiondData[r].key == d.properties.name) {
                        regionString = regiondData[r].key;
                        regiondData[r].values.forEach(function(e) {
                            if (!isNaN(e[year])) {
                                regionString = regionString + "\n" + e.parti + ": " + e[year];
                            }
                        })
                    }
                    continue;
                };
                return regionString;
            })
        });
    }

    this.colorByParty = function(electionYear, party) {

        year = electionYear;

        donut1.drawMun(currentMun(CURRMUN), electionYear);

        // TEMP
        if (!party) {
            var party = CURRMUN
        };

        var nested_data = d3.nest()
            .key(function(d) {
                return d.parti;
            })
            .sortValues(function(a, b) {
                return b[year] - a[year];
            })
            .entries(electionData);

        nested_data = nested_data.filter(function(d) {
            return d.key == party;
        })

        var len = nested_data[0].values.length;

        var max, min;
        max = parseFloat(nested_data[0].values[0][year]);
        min = parseFloat(nested_data[0].values[len - 1][year]);

        g.selectAll(".mun").each(function(p) {

            var point = d3.select(this);

            point.style("fill", function(d) {
                for (var i = 0; i < len; ++i) {

                    var region = nested_data[0].values[i];

                    if (d.properties.name == region.region) {
                        return !(isNaN(region[year])) ? color.get(party) : "white";
                    }
                };
            })
            point.style("fill-opacity", function(d) {
                var opac = 0;
                for (var i = 0; i < len; ++i) {
                    var region = nested_data[0].values[i];
                    // Compare region-name
                    if (d.properties.name == region.region) {
                        opac = (parseFloat(region[year]) - min) / (max - min);
                        break;
                    }
                };
                return opac;
            });
            point.attr("title", function(d) {
                var regionString = "";
                for (var r = 0; r < regiondData.length; ++r) {
                    if (regiondData[r].key == d.properties.name) {
                        regionString = regiondData[r].key;
                        regiondData[r].values.forEach(function(e) {
                            if (!isNaN(e[year])) {
                                regionString = regionString + "\n" + e.parti + ": " + e[year];
                            }
                        })
                    }
                    continue;
                };
                return regionString;
            })
        });

    }

    this.munBorder = function(mun) {

        d3.selectAll(".mun")
            .style("stroke-width", function(b) {
                return (b.properties.name == mun) ? 1 : 0.1;
            });


    };

    function currentMun(mun) {

        if (mun) {
            CURRMUN = mun;
            return CURRMUN;
        } else {
            return CURRMUN;
        }

    }

    function partyColor(electionData, year) {

        var nested_data = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(electionData);

        var colorOfParty = [];

        nested_data.forEach(function(d) {

            d.values.sort(compare);

            colorOfParty.push({ reg: d.values[0].region, par: d.values[0].parti });
        });
        return colorOfParty;
    }

    function compare(a, b) {
        //var year = document.getElementById("year").value;
        //var year = $('#year').slider('getValue')

        var trueVal = $( "#year" ).slider( "value" );  
        //var closestYear = closest(electionYearsArray, sliderYear);
        var year = ELECTIONYEARSARRAY[trueVal];

        var year = closest(ELECTIONYEARSARRAY, year);

        if (isNaN(a[year]) && isNaN(b[year]))
            return 0;
        else if (isNaN(a[year]) && !(isNaN(b[year])))
            return 1;
        else if (!(isNaN(a[year])) && isNaN(b[year]))
            return -1;
        else if (a[year] < b[year])
            return 1;
        else if (a[year] > b[year])
            return -1;
        else
            return 0;
    }

    function getYear(year) {
        return year;
    }

    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }

    // Sends the name of the mun to other .js-files
    function selectedMun(mun) {

        var trueVal = $( "#year" ).slider( "value" );  
        var year = ELECTIONYEARSARRAY[trueVal];

        var electionYear = closest(ELECTIONYEARSARRAY, year);

        donut1.drawMun(currentMun(mun), electionYear);
    }

    // Finds the closest value in an array
    function closest(array, num) {
        var i = 0;
        var minDiff = 1000;
        var ans;
        for (i in array) {
            var m = Math.abs(num - array[i]);
            if (m < minDiff) {
                minDiff = m;
                ans = array[i];
            }
        }
        return ans;
    }


    this.regionsimilarities = function(electionYear, mun) {

        //hämta från sökfältet

        //sortera efter regioner
        var nested_data = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(electionData);

        //beräkna för vald region spara object i variable

        var vald;
        nested_data.forEach(function(m) {
            if(m.key == mun) {
                var mu, cal = 0;
                mu = m.key;
                m.values.forEach(function(y) {
                    if(!isNaN(y[electionYear])){
                        cal += Math.pow(y[electionYear], 2);
                    }
                })
            vald = { reg: mu, value: Math.sqrt(cal) };
            };

        });

        //beräkna för övriga regioner och jämför med vald
        //lägg in i en array
        var simmun = [];
        nested_data.forEach(function(m) {
            if(m.key != mun) {
            var mu, cal = 0;
            mu = m.key;
            m.values.forEach(function(y) {
                if(!isNaN(y[electionYear])){
                        cal += Math.pow(y[electionYear], 2);
                    }
                });
            simmun.push({reg: mu, value: Math.sqrt(cal)});
            }

        });

        simmun.forEach(function(m) {
            if(!isNaN(m.value)){
                m.value = Math.abs( vald.value - m.value );
            }

        })

        simmun.sort(function (a, b) {
            if (a.value > b.value) {
                return 1;
            }
            if (a.value < b.value) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });

        var len = simmun.length;

        g.selectAll(".mun").each(function(p) {

            var point = d3.select(this);

            point.style("fill", function(d) {

                if(d.properties.name == vald.reg) {
                    return "white"
                }

                for (var i = 0; i < 30; ++i) {

                    var region = simmun[i];

                    if (d.properties.name == region.reg) {
                        return "green";
                    }
                };

                for (var i = len-1; i > (len -30);  --i) {

                    var region = simmun[i];
                    if (d.properties.name == region.reg) {
                        return "red";
                    }

                }
            })
        });

    };


}