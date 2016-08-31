// Startup functions
$(function() {

    // Searchfunction
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

    // Slider to change the year
    $("#year").slider({
        animate: "slow",
        min: 0,
        max: ELECTIONYEARSARRAY.length - 1,
        value: DEFAULTYEAR,
    });

    // Keybinding "Enter", when using thne searchfield
    $("#searchfield").keydown(function(event) {
        var SPACE = 13;
        if (event.keyCode == SPACE) {
            $("#searchMun").trigger("click");
            return false;
        }
    });

    // Reset Buttens when refreshing website
    setButtons(DEFAULTYEAR);

    // Default setting for miningfunction
    miningMode = false;

});

// Handles the search input
$("#searchMun").click(function() {

    if(!isSameString()) {
        miningMode = false;
        navbarCommands("search");
    }
});

// Enables the miningfunction
$("#mining").click(function() {

    miningMode = true;
    navbarCommands("mining");

});

// Update how many municipalities that is chosen
function updateSliderValue(value){
    var miningDiv = document.getElementById("miningAmount");
    miningDiv.innerHTML = value;
};

// Updated the map to the chosen year
$('#year').on('slide', function(event, ui) {

    $("#currYear").text(ELECTIONYEARSARRAY[ui.value]).css("font-weight", "Bold");

    var year = ELECTIONYEARSARRAY[ui.value];

    setButtons(year);

    var buttonVal = $('#party button.active').val();

    var region = getSearchString();

    if (miningMode) {
        var region = getSearchString();
        var miningAmount = parseInt(document.getElementById("miningAmount").innerHTML);
        map1.regionsimilarities(year, region, miningAmount);
    } else {
        partyChose(year, buttonVal);
    }

});

// Updates the map to the chosen party
$("#party > .btn").on("click", function() {

    miningMode = false;

    $(this).addClass("active").siblings().removeClass("active");

    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];

    var buttonVal = $('#party button.active').val();

    partyChose(year, buttonVal);

});

// Format the input to match the database
function formatStringInput(inputString) {

    var inputString = inputString.trim();

    // If the string is not empty
    if (inputString.length != 0) {

        // The first element to upper cae and the rest to lower case
        var str = (inputString.substr(0, 1)).toUpperCase() + (inputString.substr(1)).toLowerCase();

        // Handles special symbols
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

// Diables/enables partybuttons
// Special cases where partys didnt exist that year
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

// Validates the input if it is a real region
function isRegion(inputString) {

    var valid = false;

    REGIONARRAY.forEach(function(r) {
        if (inputString == r) { valid = true; }
    });

    return valid;
};

// Sends the data to exteral function with the chosen mode
function functionChose(region, year, functionType) {

    if (functionType == "search") {
        map1.colorByYear(year, region);
        map1.selectedMun(region, year);
    } else if (functionType == "mining") {
        var miningAmount = parseInt(document.getElementById("miningAmount").innerHTML);
        map1.regionsimilarities(year, region, miningAmount);
        map1.selectedMun(region, year);
    }

};

// Updates the map to the chosen party and year
function partyChose(year, party) {

    var region = getSearchString("search");

    if (party == "All") {
        map1.selectedMun(region, year);
        map1.colorByYear(year, region);
    } else {
        map1.colorByParty(year, party);
        map1.selectedMun(region, year);
    }

};

// Collect the input from the field
function getSearchString(type) {

    var str = $('#searchfield').val();

    if (!str.trim() || type != "search") {
        str = $("#searchfield").attr("placeholder");
    }

    return str;
}

// Checks if the input is the same as the last search
function isSameString() {

    var input = $('#searchfield').val();
    var placeHolder = $("#searchfield").attr("placeholder");

    return (input.trim() == placeHolder) ? true : false;
}

// Helper function to execute commandes 
function navbarCommands(type) {

    // Searchinput and chosen year
    var year = ELECTIONYEARSARRAY[$("#year").slider("value")];
    var str = getSearchString(type);

    // Set the searchfield to white space
    $('#searchfield').val('');

    var formatString = formatStringInput(str);
    var validRegion = isRegion(formatString);

    if (validRegion) {

        if (type == "search") {
            functionChose(formatString, year, "search");
        } else {
            functionChose(formatString, year, "mining");
        }
        $("#searchfield").attr("placeholder", formatString).val("");
    } else {
        $("#searchfield").attr("placeholder", "Ingen kommun").val("");
    }
};