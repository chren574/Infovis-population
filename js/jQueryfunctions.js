$(function() {

    $("#searchfield").autocomplete({
        /*Source refers to the list of fruits that are available in the auto complete list. */
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(REGIONARRAY, request.term);

            response(results.slice(0, 5));
        },
        // Must have to get it runnung with slider
        open: function(event, ui) {
            $(".ui-slider-handle").css("z-index", -1);
        },
        close: function(event, ui) {
            $(".ui-slider-handle").css("z-index", 2);
        }
    });

    $("#year").slider({
        animate: "slow",
        min: 0,
        max: ELECTIONYEARSARRAY.length - 1,
        value: 2014,
    });

    

    $("#searchfield").keydown(function(event) {
        var SPACE = 13;
        if (event.keyCode == SPACE) {
            $("#searchMun").trigger("click");
            return false;
        }
    });
});


$("#searchMun").click(function() {

    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];

    //Get
    var str = $('#searchfield').val();

    //Set
    $('#searchfield').val('');

    str = (str.substr(0, 1)).toUpperCase() + (str.substr(1)).toLowerCase();

    if (!str.indexOf(" ").length) {
        var i = str.indexOf(" ");
        str = str.replace(str[i + 1], str[i + 1].toUpperCase());
    }
    if (!str.indexOf("-").length) {
        var i = str.indexOf("-");
        str = str.replace(str[i + 1], str[i + 1].toUpperCase());
    };

    var formatString = str;

    var validReg = validateRegion(formatString);

    if (validReg) {
        donut1.drawMun(formatString, year);
        map1.munBorder(formatString);
        $("#searchfield").attr("placeholder", formatString).val("").focus().blur();
    } else {
        $("#searchfield").attr("placeholder", "Fel kommun").val("").focus().blur();

    }

});

$("#mining").click(function() {

    var trueVal = $("#year").slider("value");
    var year = ELECTIONYEARSARRAY[trueVal];

    //Get
    var str = $('#searchfield').val();
    if (str.trim() || str == "Municipality") {
        var str = $('#searchfield').val();
    } else {
        var str = $("#searchfield").attr("placeholder");
    }

    //Set
    $('#searchfield').val('');

    str = (str.substr(0, 1)).toUpperCase() + (str.substr(1)).toLowerCase();

    if (!str.indexOf(" ").length) {
        var i = str.indexOf(" ");
        str = str.replace(str[i + 1], str[i + 1].toUpperCase());
    }
    if (!str.indexOf("-").length) {
        var i = str.indexOf("-");
        str = str.replace(str[i + 1], str[i + 1].toUpperCase());
    };

    var formatString = str;

    var validReg = validateRegion(formatString);

    if (validReg) {
        map1.regionsimilarities(year, formatString);
        $("#searchfield").attr("placeholder", formatString).val("").focus().blur();
    } else {
        $("#searchfield").attr("placeholder", "Not a region").val("").focus().blur();

    }
});


$('#year').on('slidestop', function(event, ui) {

    var str = ELECTIONYEARSARRAY[ui.value].toString();
    $("#currYear").html(str.bold());
    $("#currYear").val(ELECTIONYEARSARRAY[ui.value]);

    var year = ELECTIONYEARSARRAY[ui.value];

    if (year < 1998) {
        $('.btn-sve').prop('disabled', true);
    } else {
        $('.btn-sve').prop('disabled', false);
    }

    if (year < 1982) {
        $('.btn-mil').prop('disabled', true);
    } else {
        $('.btn-mil').prop('disabled', false);
    }

    if (year == 1988) {
        $('.btn-krist').prop('disabled', true);
    } else {
        $('.btn-krist').prop('disabled', false);
    }

    var party = $('#party button.active').val();

    if (party == "All") {
        map1.colorByYear(year);
    } else {
        map1.colorByParty(year, party);
    }

});


$('#year').on('slide', function(event, ui) {

    $("#currYear").text(ELECTIONYEARSARRAY[ui.value]);
    $("#currYear").val(ELECTIONYEARSARRAY[ui.value]).css("font-weight", "Bold");

    var year = ELECTIONYEARSARRAY[ui.value];

    if (year < 1998) {
        $('.btn-sve').prop('disabled', true);
    } else {
        $('.btn-sve').prop('disabled', false);
    }

    if (year < 1982) {
        $('.btn-mil').prop('disabled', true);
    } else {
        $('.btn-mil').prop('disabled', false);
    }

    if (year == 1985) {
        $('.btn-krist').prop('disabled', true);
    } else {
        $('.btn-krist').prop('disabled', false);
    }

    var party = $('#party button.active').val();

    if (party == "All") {
        map1.colorByYear(year);
    } else {
        map1.colorByParty(year, party);
    }

});


$("#party > .btn").on("click", function() {

    $(this).addClass("active").siblings().removeClass("active");

    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];

    var party = $('#party button.active').val();

    if (party == "All") {
        map1.colorByYear(year);
    } else {
        map1.colorByParty(year, party);
    }

});