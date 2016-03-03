function donut(data) {

    var donutDiv = $("#donut");
    var partyDiv = $("#party");
    var scaleDiv = 1;

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = donutDiv.width() - margin.right - margin.left,
        height = partyDiv.height() - margin.top - margin.bottom;

    width = width * scaleDiv;
    height = height * scaleDiv;

    var radius = Math.min(width, height) / 3;

    var legendRectSize = 18;
    var legendSpacing = 2;
    var color1 = d3.scale.category20b();

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return !isNaN(d.year) ? d.year : 0;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<span style='color:" + color.get(d.data.parti) + "'>" + d.data.parti + "<strong>:</strong> <span style='color:white'>" + d.data.year + "%" + "</span>";
        });

    var svg = d3.select("#donut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")");

    svg.call(tip);

    var firstMun = "Upplands Väsby";

    var arr = getMunData(firstMun, "2014");

    draw(arr);

    function draw(data_arr) {

        var partyArray = [];
        data_arr.forEach(function(d) {
            if (!isNaN(d.year)) {
                partyArray.push(d.parti);
            }
        });

        path = svg.datum(data_arr).selectAll("path")
            .data(pie)
            .enter().append("path")
            .attr("fill", function(d) {
                return color.get(d.data.parti);
            })
            .attr("d", arc)
            .each(function(d) {
                this._current = d;
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var legend = svg.selectAll('.legend')
            .data(partyArray)
            .enter()
            .append('g')
            .attr('class', 'legend')
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
        pie.value(
            function(p, i) {
                return !isNaN(filteredData[i].year) ? filteredData[i].year : 0;
            });
        path = path.data(pie);
        path.attr("d", arc);
        path.transition().duration(750).attrTween("d", arcTween);

        //Funkar inte
        /*
                            var tip = d3.tip()
                            .attr('class', 'd3-tip')
                            .offset([-10,0])
                            .html(function(d) {
                                console.log(d)
                            return "<span style='color:white'>" + d.data.parti + "<strong>:</strong> <span style='color:orange'>" + d.data.year + "%" +"</span>";
                          }); 
        */

        //path.attr("fill-opacity", 1)

        svg.selectAll(".legend").remove();

        var data_arr = getMunData(mun, electionYear);

        var partyArray = [];
        data_arr.forEach(function(d) {
            if (!isNaN(d.year)) {
                partyArray.push(d.parti);
            }
        });

        var legend = svg.selectAll('.legend')
            .data(partyArray)
            .enter()
            .append('g')
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.size / 2;
                var horz = 12 * legendRectSize;
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

    }

    function arcTween(a) {

        var i = d3.interpolate(this._current, a);
        this._current = i(0);

        return function(t) {
            return arc(i(t));
        };
    }
}