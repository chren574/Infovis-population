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

});


$("#searchMun").click(function() {

    var trueVal = $("#year").slider("value");
    var sliderYear = ELECTIONYEARSARRAY[trueVal];

    var closestYear = closest(ELECTIONYEARSARRAY, sliderYear);

    //Get
    var str = $('#searchfield').val();

    //Set
    $('#searchfield').val('');

    str1 = (str.substr(0, 1)).toUpperCase();

    str2 = (str.substr(1)).toLowerCase();

    str = str1 + str2;

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
        donut1.drawMun(formatString, closestYear);
        map1.munBorder(formatString);
        $("#searchfield").attr("placeholder", formatString).val("").focus().blur();
    } else {
        $("#searchfield").attr("placeholder", "Not a region").val("").focus().blur();

    }

});

$("#mining").click(function() {

    var trueVal = $("#year").slider("value");
    var sliderYear = ELECTIONYEARSARRAY[trueVal];

    var closestYear = closest(ELECTIONYEARSARRAY, sliderYear);

    //Get
    var str = $('#searchfield').val();
    if (str.trim() || str == "Municipality") {
        var str = $('#searchfield').val();
    } else {
        var str = $("#searchfield").attr("placeholder");
    }

    //Set
    $('#searchfield').val('');

    str1 = (str.substr(0, 1)).toUpperCase();

    str2 = (str.substr(1)).toLowerCase();

    str = str1 + str2;

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
        map1.regionsimilarities(closestYear, formatString);
        $("#searchfield").attr("placeholder", formatString).val("").focus().blur();
    } else {
        $("#searchfield").attr("placeholder", "Not a region").val("").focus().blur();

    }
});


$('#year').on('slidestop', function(event, ui) {
    $("#currYear").text(ELECTIONYEARSARRAY[ui.value]);
    $("#currYear").val(ELECTIONYEARSARRAY[ui.value]);

    var trueVal = $("#year").slider("value");
    var sliderYear = ELECTIONYEARSARRAY[trueVal];

    var closestYear = closest(ELECTIONYEARSARRAY, sliderYear);

    if (closestYear < 1998) {
        $('.btn-sve').prop('disabled', true);
    } else {
        $('.btn-sve').prop('disabled', false);
    }

    if (closestYear < 1982) {
        $('.btn-mil').prop('disabled', true);
    } else {
        $('.btn-mil').prop('disabled', false);
    }

    if (closestYear == 1988) {
        $('.btn-krist').prop('disabled', true);
    } else {
        $('.btn-krist').prop('disabled', false);
    }

    var party = $('#party button.active').val();

    if (party == "All") {
        map1.colorByYear(closestYear);
    } else {
        map1.colorByParty(closestYear, party);
    }

});

$("#party > .btn").on("click", function() {

    $(this).addClass("active").siblings().removeClass("active");

    var trueVal = $("#year").slider("value");
    var sliderYear = ELECTIONYEARSARRAY[trueVal];

    //var sliderYear = $('#year').slider('getValue');
    var closestYear = closest(ELECTIONYEARSARRAY, sliderYear);

    var party = $('#party button.active').val();

    if (party == "All") {
        map1.colorByYear(closestYear);
    } else {
        map1.colorByParty(closestYear, party);
    }

});