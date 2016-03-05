function donut(data) {

    var donutDiv = $("#donut");
    var partyDiv = $("#party");

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = donutDiv.width() - margin.right - margin.left,
        height = partyDiv.height() - margin.top - margin.bottom;

    var radius = Math.min(width, height * 1.2) / 3;

    var legendRectSize = 18;
    var legendSpacing = 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            //console.log(d)
            return !isNaN(d.year) ? d.year : 0;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([15, -10]);

    var svg = d3.select("#donut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")");

    svg.call(tip);

    p = svg.append('g')

    draw(getMunData("Upplands Väsby", "2014"));

    function draw(data_arr) {

        var partyArray = [];
        data_arr.forEach(function(d) {
            if (!isNaN(d.year)) {
                partyArray.push(d.parti);
            }
        });

        var path = p.datum(data_arr).selectAll(".arc")
            .data(pie)
            .enter().append("path")
            .attr("class","arc")
            .style("fill", function(d,i){ return color.get(d.data.parti); })
            .attr("d", arc)
            .each(function(d){ this._current = d; })

    
        path.filter(function(d) { 
            return d.endAngle - d.startAngle > .2; })
        .append("text")
            .attr('class', 'legendPartyProcent')
            .attr("dy", ".35em")
            .attr("transform", function(d) { 
                return "translate(" + arc.centroid(d) + ")"; })
            .text(function(d) { return d.data.year; });

            path.on('mouseover', function(d) {
                var year = ELECTIONYEARSARRAY[$("#year").slider("value")];
                var mun;
                if ($("#searchfield").attr("placeholder") == "Municipality") {
                    mun = "Upplands Väsby";
                } else {
                    mun = $("#searchfield").attr("placeholder");
                }

                var munArray = getMunData(mun, year);

                var party;
                munArray.forEach(function(e) {

                    if (d.data.parti == e.parti) {
                        party = e;
                    }
                });

                tip.html(
                    "<span style='color:" + color.get(party.parti) + "'>" + party.parti + "<strong>:</strong> <span style='color:white'>" + party.year + "%" + "</span>"
                );
                tip.show();
            })
            path.on('mouseout', tip.hide);

        var legend = svg.selectAll('.legend')
            .data(partyArray)
            .enter()
            .append('g')
            .attr('class', 'legendParty')
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.size / 2;
                var horz = 10 * legendRectSize;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', function(d) {
                return color.get(d);
            })
            .style('stroke', function(d) {
                return color.get(d);
            });

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) {
                return d;
            });

        var legendMun = svg.selectAll('.legendname')
            .data([{}])
            .enter()
            .append('g')
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        legendMun.append('text')
            .attr('class', 'legendReg')
            .transition()
            .duration(500)
            .style("opacity", 0)
            .transition().duration(200)
            .style("opacity", 1)
            .attr("text-anchor", "middle")
            .text(function(d) {
                var mun;
                if ($("#searchfield").attr("placeholder") == "Municipality") {
                    mun = "Upplands Väsby";
                } else {
                    mun = $("#searchfield").attr("placeholder");
                }
                return mun;
            });

    }

    function getMunData(mun, electionYear) {

        var year = electionYear;

        var nested_data = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .sortValues(function(a, b) {
                return b.parti - a.parti;
            })
            .entries(data);
        nested_data = nested_data.filter(function(d) {
            return d.key == mun;
        })

        var munData = [];

        var obj = nested_data[0].values;

        for (var i = 0; i < obj.length; ++i) {
            munData.push({ parti: obj[i].parti, year: obj[i][year] });
        }

        return munData;
    }

    // Sends the name of the mun to other .js-files
    this.drawMun = function(mun, electionYear) {

        var filteredData = getMunData(mun, electionYear);

        p.datum(filteredData).selectAll("path").data(pie).transition().attrTween("d", arcTween);
        //path.datum(data).selectAll("path").data(pie).transition().duration(1000).attrTween("d", arcTween)
        //path.data(pie(filteredData));
        //path.attr("d", arc);
        //path.transition().duration(750).attrTween("d", arcTween);
//console.log("---------------")

//console.log(filteredData);
/*
  p.datum(filteredData).selectAll("path")
    .data(pie)
  .enter().append("path")
    .attr("class","arc")
    .attr("fill", function(d,i){ 
console.log(i)
//console.log(color.get(d.data.parti))
        return color.get(d.data.parti); })
    .attr("d", arc)
    .each(function(d){ this._current = d; })
*/
      // remove data not being used
  //p.datum(filteredData).selectAll("path")
    //.data(pie).exit().remove();

        svg.selectAll(".legendParty").remove();

        filteredData = filteredData.filter(isYearNaN);

        var legend = svg.selectAll('.legend')
            .data(filteredData)
            .enter()
            .append('g')
            .attr('class', 'legendParty')

        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.size / 2;
            var horz = 10 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });


        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', function(d) {
                return color.get(d.parti);
            })
            .style('stroke', function(d) {
                return color.get(d.parti);
            });

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) {
                return d.parti;
            });


        d3.selectAll('text.legendReg')
            .transition()
            .duration(200)
            .style("opacity", 0)
            .transition().duration(200)
            .style("opacity", 1)
            .text(mun)

    }

    function arcTween(a) {

        var i = d3.interpolate(this._current, a);
        this._current = i(0);

        return function(t) {
            return arc(i(t));
        };
    }

    function isYearNaN(element, index, array) {
        return !isNaN(element.year);
    }

}