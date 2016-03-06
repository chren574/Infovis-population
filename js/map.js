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
        .direction('e')
        .offset([2, 0]);

    var projection = d3.geo.mercator()
        .center([40, 62])
        .scale(850);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    mapGraficsRoot = svg.append("g");
    miningLegendRoot = svg.append("g");
    partyLegendRoot = svg.append("g");
    undefinedLegendRoot = svg.append("g");

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

        var mun = mapGraficsRoot.selectAll(".swe_mun").data(mun);
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

            map1.selectedMun(d.properties.name);

        });

        var legend = miningLegendRoot.selectAll(".legend")
            .data(miningArray)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr('transform', function(d, i) {
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
            .style('stroke', "black");

        legend.append('text')
            .attr('class', 'legendText')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .style("opacity", 0)
            .text(function(d) {
                return d;
            });

        // Party selection legend
        var partyLegend = partyLegendRoot.selectAll(".legend")
            .data(new Array(partyLegendLength))
            .enter()
            .append("g")
            .attr("class", "partylegend");

        partyLegend.append('rect')
            .attr('class', 'partyLegendRect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style("opacity", 0)
            .style('stroke', "black");

        partyLegend.append('text')
            .attr('class', 'partyLegendText')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .style("opacity", 0);

        // For undefined muns
        var undefinedLegend = undefinedLegendRoot.selectAll(".legend")
            .data(["Data saknas"])
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr('transform', function(d) {
                var height = legendRectSize + legendSpacing;
                var offset = height / 2;
                var horz = legendRectSize;
                var vert = height - offset + 10;
                return 'translate(' + horz + ',' + vert + ')';
            });

        undefinedLegend.append('rect')
            .attr('class', 'undefinedLegendRect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style("opacity", 0)
            .style('stroke', "black");

        undefinedLegend.append('text')
            .attr('class', 'undefinedLegendText')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .style("opacity", 0)
            .text("Data saknas");
    }

    this.colorByYear = function(year) {

        if (year < 1991) {
            showUndefinedLegend();
        } else {
            hideUndefinedLegend();
        }

        hidePartyLegend();

        map1.selectedMun(mun);

        var mun = $("#searchfield").attr("placeholder");

        var isUndefined = [mun, false];

        var colorOfParty = partyColor(electionData, year);

        d3.selectAll(".mun").each(function(p) {

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
                    isUndefined[1] = true;
                    return color.get("Odefinierad");
                }

            });

        });

    }

    this.colorByParty = function(year, party) {

        showPartyLegend();
        hideSimLegend();
        hideUndefinedLegend();

        var mun = $("#searchfield").attr("placeholder");

        map1.selectedMun(mun);

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

        d3.selectAll(".mun").each(function(p) {

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

        updatePartyLegend(min, max, color.get(party));
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

            if (!isNaN(d.values[0][year])) {
                colorOfParty.push({ reg: d.values[0].region, par: d.values[0].parti });
            }
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

    function hasData(mun) {

        var totalProcent = 0;
        for (var r in regiondData) {
            if (mun == regiondData[r].key) {
                var regObj = regiondData[r];
                regObj.values.forEach(function(e) {
                    if (!isNaN(e[ELECTIONYEARSARRAY[$("#year").slider("value")]])) {
                        totalProcent += e[ELECTIONYEARSARRAY[$("#year").slider("value")]];
                    }
                })
                break;
            }
        };

        return totalProcent ? true : false;
    }

    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        mapGraficsRoot.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    // Sends the name of the mun to other .js-files
    this.selectedMun = function(mun) {

        var validRegion = hasData(mun);

        if (validRegion) {
            var year = ELECTIONYEARSARRAY[$("#year").slider("value")];
            donut1.drawMun(mun, year);
            $("#searchfield").attr("placeholder", mun).val("").focus().blur();
        }
        

        d3.selectAll(".mun")            
            .style("stroke-width", function(d) {
                return (d.properties.name == mun) ? 1 : .1;
            })

    }

    this.regionsimilarities = function(year, mun) {

        showSimLegend();
        hideUndefinedLegend();
        hidePartyLegend();

        //sortera efter regioner
        var nested_data = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(electionData);

        //beräkna för vald region spara object i variabel
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
                    if (!isNaN(vald.values[i][year]) || !isNaN(y[year])) {
                        dif += Math.sqrt(Math.pow(vald.values[i][year] - y[year], 2));
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

        d3.selectAll(".mun").each(function(p) {

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

        

        map1.selectedMun(mun);
    };


    function showSimLegend() {
        d3.selectAll("rect.legendRect")
            .style("opacity", 1);
        d3.selectAll("text.legendText")
            .style("opacity", 1);
    };

    function hideSimLegend() {
        d3.selectAll("rect.legendRect")
            .style("opacity", 0);
        d3.selectAll("text.legendText")
            .style("opacity", 0);
    };

    function showPartyLegend() {
        d3.selectAll("rect.partyLegendRect")
            .style("opacity", 1);
        d3.selectAll("text.partyLegendText")
            .style("opacity", 1);
    };

    function hidePartyLegend() {
        d3.selectAll("rect.partyLegendRect")
            .style("opacity", 0);
        d3.selectAll("text.partyLegendText")
            .style("opacity", 0);
    };

    function showUndefinedLegend() {
        d3.selectAll("rect.undefinedLegendRect")
            .style("opacity", 1);
        d3.selectAll("text.undefinedLegendText")
            .style("opacity", 1);
    };

    function hideUndefinedLegend() {
        d3.selectAll("rect.undefinedLegendRect")
            .style("opacity", 0);
        d3.selectAll("text.undefinedLegendText")
            .style("opacity", 0);
    };

    function updatePartyLegend(min, max, color) {
        var len = partyLegendLength;
        len--;

        if(isNaN(max)) {
            hidePartyLegend();
        }

        d3.selectAll(".partylegend")
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * partyLegendLength / 2;
                var horz = 1 * legendRectSize;
                var vert = i * height - offset + 70;
                return 'translate(' + horz + ',' + vert + ')';
            })

        d3.selectAll("rect.partyLegendRect")
            .style("fill", color)
            .style("fill-opacity", function(d, i) {
                return 1 - i / len;
            })

        d3.selectAll("text.partyLegendText")
            .text(function(d, i) {
                // Linear interpolation from max to min in decending order
                var val = (min - max) / len * i + max;
                return val.toFixed(1) + " %";
            });

    };


}