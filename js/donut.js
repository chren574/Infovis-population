function donut(data){

	var donutDiv = $("#donut");

	var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = donutDiv.width() - margin.right - margin.left,
        height = donutDiv.height() - margin.top - margin.bottom;

    var width = 800,
        height = 400,
        radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
    	.outerRadius(radius - 10)
    	.innerRadius(radius - 70);

    var pie = d3.layout.pie()
    	.sort(null)
    	.value(function(d) { return d.year; });

	var svg = d3.select("#donut").append("svg")
    	.attr("width", width)
    	.attr("height", height)
  		.append("g")
    	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var tempMun = "Upplands Väsby";

    var arr = doStuff(tempMun);

    draw(arr);



    function draw(data_arr)
    {
    var g = svg.selectAll(".arc")
        .data(pie(data_arr))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color.get(d.data.parti); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.parti; });
//console.log(data_arr);
    var path = svg.datum(data_arr).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d) { 
            console.log(d)
            //return color(i); 
        })
        .attr("d", arc);

    }

    pie.value(function(d) { 
            //console.log(d);
    }); // change the value function

    function doStuff(mun) {
    var year = document.getElementById("year").value;
        //console.log(year)

    var nested_data = d3.nest()
            .key(function(d) { return d.region; })
            .sortValues(function(a, b) { return b.parti - a.parti; })
            .entries(data);


        nested_data = nested_data.filter(function(d) {
            return d.key == mun;
        })
            
        //console.log(nested_data);

        var colorOfParty = [];

        var obj = nested_data[0].values;

        //nested_data.forEach(function(d, i) {
        for(var i = 0; i < obj.length; ++i) {
            colorOfParty.push({parti: obj[i].parti, year: obj[i][year] });
        //});
        }

        //console.log(colorOfParty);

        return colorOfParty;
    }

      // Sends the name of the mun to other .js-files
    this.drawMun = function (mun) {

        //console.log(mun);
        var year = document.getElementById("ex6").value;

        //console.log(g.selectAll("path").data(arr))

        var arr = doStuff(mun);
        /*
        console.log(g.selectAll("path").data(arr))
            //console.log(party)
            pie.value( function(d) { 
                //console.log(d);
                return d[year];
            }); */
            path = g.data(pie(arr)); // compute the new angles
            console.log(path);
                path.attr("d", arc); // redraw the arcs
                
            // change the value function

    

    }

    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        //this._current = i(0);
        return function(t) {
            console.log(t)
            //return arc(i(t));
        };
    }

}