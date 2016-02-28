function donut(data) {

    var donutDiv = $("#donut");

    var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = donutDiv.width() - margin.right - margin.left,
        height = donutDiv.height() - margin.top - margin.bottom;

    var radius = Math.min(width, height) / 2;


    var legendRectSize = 18;
    var legendSpacing = 4;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return !isNaN(d.year) ? d.year : 0;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

    var svg = d3.select("#donut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var firstMun = "Upplands Väsby";

    var arr = getMunData(firstMun);

    draw(arr);

    function draw(data_arr) {

        path = svg.datum(data_arr).selectAll("path")
            .data(pie)
            .enter().append("path")
            .attr("fill", function(d) {
                return color.get(d.data.parti);
            })
            .attr("d", arc);

    }

    function getMunData(mun, electionYear) {

        //var year = $('#year').val();

        var year = electionYear;

        var nested_data = d3.nest()
            .key(function(d) {
                return d.region; })
            .sortValues(function(a, b) {
                return b.parti - a.parti; })
            .entries(data);
        //console.log(nested_data)
        nested_data = nested_data.filter(function(d) {
            return d.key == mun;
        })

        var munData = [];

        var obj = nested_data[0].values;

        for (var i = 0; i < obj.length; ++i) {
            munData.push({ parti: obj[i].parti, year: obj[i][year] });
        }

        return munData;
        // }
    }

    // Sends the name of the mun to other .js-files
    this.drawMun = function(mun, electionYear) {

            var filteredData = getMunData(mun, electionYear);
            pie.value(
                function(p, i) {
                    //console.log(p);
                    return !isNaN(filteredData[i].year) ? filteredData[i].year : 0;
                });
            path = path.data(pie);
            //path.attr("fill-opacity", 1)
            path.attr("d", arc);
        }
        /*
            this.validateMun = function(str) {
                

                var m = d3.map([{name: "Vallentuna"}, {name: "bar"}], function(d) { 
                    return d.name == str; 
                });
                var n1 = m.get("Vallentuna"); // {"name": "Vallentuna"}
                var n2 = m.get("bar"); // {"name": "bar"}
                var n3 = m.get("baz"); // undefined

                console.log(n1);
                console.log(n2);
                console.log(n3);

            }
        */
}