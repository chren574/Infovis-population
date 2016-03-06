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

    navbarCommands("search");

});

$("#mining").click(function() {

    navbarCommands("mining");

});


$('#year').on('slide', function(event, ui) {

    $("#currYear").text(ELECTIONYEARSARRAY[ui.value]).css("font-weight", "Bold");

    var year = ELECTIONYEARSARRAY[ui.value];

    setButtons(year);

    var buttonVal = $('#party button.active').val();

    partyChose(year, buttonVal);

});


$("#party > .btn").on("click", function() {

    $(this).addClass("active").siblings().removeClass("active");

    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];

    var buttonVal = $('#party button.active').val();

    partyChose(year, buttonVal);

});


function formatStringInput(inputString) {

    var inputString = inputString.trim();

    if (inputString.trim().length != 0) {

        var str = (inputString.substr(0, 1)).toUpperCase() + (inputString.substr(1)).toLowerCase();

        if (!str.indexOf(" ").length) {
            var i = str.indexOf(" ");
            str = str.replace(str[i + 1], str[i + 1].toUpperCase());
        }
        if (!str.indexOf("-").length) {
            var i = str.indexOf("-");
            str = str.replace(str[i + 1], str[i + 1].toUpperCase());
        }
    } else {
        var str = "noRegion";
    }

    return str;
};

function setButtons(year) {

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

    if (year < 1998) {
        $('.btn-sve').prop('disabled', true);
    } else {
        $('.btn-sve').prop('disabled', false);
    }
};

function isRegion(inputString) {

    var valid = false;

    REGIONARRAY.forEach(function(r) {
        if (inputString == r) { valid = true; }
    });

    return valid;
};

function functionChose(region, year, functionType) {

    if (functionType == "search") {
        map1.munBorder(region);
    } else if (functionType == "mining") {
        map1.regionsimilarities(year, region);
    }

};

function partyChose(year, party) {

    if (party == "All") {
        map1.colorByYear(year);
    } else {
        map1.colorByParty(year, party);
    }

};

function getSearchString() {

    var str = $('#searchfield').val();

    if (!str.trim()) {
        var str = $("#searchfield").attr("placeholder");
    } else {
        var str = $('#searchfield').val();
    }

    return str
}

function navbarCommands(type) {

    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];

    var str = getSearchString();

    $('#searchfield').val('');

    var formatString = formatStringInput(str);

    var validRegion = isRegion(formatString);

    if (validRegion) {

        if (type == "search") {
            functionChose(formatString, year, "search");
        } else {
            functionChose(formatString, year, "mining");
        }

        $("#searchfield").attr("placeholder", formatString).val("").focus().blur();
    } else {
        $("#searchfield").attr("placeholder", "Ingen kommun").val("").focus().blur();
    }

};