function map(data) {

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");
    var partyDiv = $("#party");

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = mapDiv.width() - margin.right - margin.left,
        height = partyDiv.height() - margin.top - margin.bottom;

    var legendRectSize = 18;
    var legendSpacing = 2;

    var tip = d3.tip()
        .attr('class', 'd3-map-tip')
        .offset([2, 0]);

    var projection = d3.geo.mercator()
        .center([40, 62])
        .scale(850);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "1px solid black")
        .append("g")
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");
    svg.call(tip);

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

        var trueVal = $("#year").slider("value");
        var year = ELECTIONYEARSARRAY[trueVal];

        var mun = g.selectAll(".swe_mun").data(mun);
        var colorOfParty = partyColor(electionData, year);

        mun.enter().insert("path")
            .attr("class", "mun")
            .attr("d", path)

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


        .on("mouseover", function(d) {

            var trueVal = $("#year").slider("value");
            var year = ELECTIONYEARSARRAY[trueVal];

            for (var r in regiondData) {
                if (d.properties.name == regiondData[r].key) {
                    var regObj = regiondData[r];
                    break;
                }
            };
            var regArr = [];
            regObj.values.forEach(function(r) {
                regArr.push({ parti: r.parti, procent: r[year] });
            });

            tip.html(function(x) {

                var res = "<span style='color:white'>" + "<h3> <b>" + d.properties.name + "</b> </h3>";

                for (var i = 0; i < regArr.length; ++i) {
                    if (!isNaN(regArr[i].procent)) {
                        res += "<p>" + "<span style='color:" + color.get(regArr[i].parti) + "'>" + regArr[i].parti + "<span style='color:white'>" + " : " + regArr[i].procent + " %" + "</p>";
                    }
                }

                res += "</span>";
                return res;
            });
            tip.show();
        })

        .on("mouseout", function(d) {
            tip.hide();
        })

        .on("click", function(d) {
            d3.selectAll(".mun")
                .style("stroke-width", .1)

            d3.select(this)
                .style("stroke-width", 1)

            selectedMun(d.properties.name);
            $("#searchfield").attr("placeholder", d.properties.name).val("").focus().blur();

        });

        var legend = g.selectAll(".legend")
            .data(miningArray)
            .enter()
            .append("g")
            .attr("class", "legend");
        legend.attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * miningArray.length / 2;
            var horz = 1 * legendRectSize;
            var vert = i * height - offset + 50;
            return 'translate(' + horz + ',' + vert + ')';
        });

        legend.append('rect')
            .attr('class', 'legendRect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style("opacity", 0)
            .style('fill', function(d, i) {

                return miningMap.get(d);
            })
            .style('stroke', function(d) {
                return miningMap.get(d);
            });

        legend.append('text')
            .attr('class', 'legendText')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .style("opacity", 0)
            .text(function(d) {
                return d;
            });
    }

    this.colorByYear = function(electionYear) {

        g.selectAll("text.legendText")
            .style("opacity", 0);
        g.selectAll("rect.legendRect")
            .style("opacity", 0);

        year = electionYear;

        var mun;
        if ($("#searchfield").attr("placeholder") == "Municipality") {
            mun = "Upplands Väsby";
        } else {
            mun = $("#searchfield").attr("placeholder");
        }

        donut1.drawMun(mun, year);

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

        g.selectAll("text.legendText")
            .style("opacity", 0);
        g.selectAll("rect.legendRect")
            .style("opacity", 0);

        year = electionYear;

        var mun;
        if ($("#searchfield").attr("placeholder") == "Municipality") {
            mun = "Upplands Väsby";
        } else {
            mun = $("#searchfield").attr("placeholder");
        }

        donut1.drawMun(mun, electionYear);

        // TEMP
        if (!party) {
            var party = CURRMUN;
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
        });

    }

    this.munBorder = function(mun) {

        d3.selectAll(".mun")
            .style("stroke-width", function(b) {
                return (b.properties.name == mun) ? 1 : 0.1;
            });
    };

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

        function compare(a, b) {

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

        var trueVal = $("#year").slider("value");
        var year = ELECTIONYEARSARRAY[trueVal];

        if ($("#searchfield").attr("placeholder") == "Municipality") {
            mun = "Upplands Väsby";
        }

        donut1.drawMun(mun, year);
    }


    this.regionsimilarities = function(electionYear, mun) {

        //sortera efter regioner
        var nested_data = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(electionData);

        //beräkna för vald region spara object i variable
        var vald;
        nested_data.forEach(function(m) {
            if (m.key == mun) {
                vald = m;
            };
        });

        //beräkna för övriga regioner och jämför med vald
        //lägg in i en array
        var simmun = [];
        nested_data.forEach(function(m) {
            if (m.key != mun) {
                var mu, dif = 0;
                mu = m.key;
                m.values.forEach(function(y, i) {
                    if (!isNaN(vald.values[i][electionYear]) || !isNaN(y[electionYear])) {
                        dif += Math.sqrt(Math.pow(vald.values[i][electionYear] - y[electionYear], 2));
                    }
                });
                simmun.push({ reg: mu, value: dif });
            }
        });

        simmun.sort(function(a, b) {
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
            //OPTIMERA
            point.style("fill", function(d) {
                if (d.properties.name == vald.key) {
                    return "orange"
                }

                for (var i = 0; i < 30; ++i) {
                    var region = simmun[i];

                    if (d.properties.name == region.reg) {
                        return "green";
                    }
                };

                for (var i = len - 1; i > (len - 30); --i) {

                    var region = simmun[i];
                    if (d.properties.name == region.reg) {
                        return "red";
                    }
                }
            })
            point.style("fill-opacity", 1)
        });

        g.selectAll("rect.legendRect")
            .style("opacity", 1);
        g.selectAll("text.legendText")
            .style("opacity", 1);


    };
}