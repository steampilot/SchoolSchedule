/**
 * Created by Jerome Roethlisberger on 07.11.14.
 */
/**
 * Initialize all event listeners
 */
$(function () {
	// when the page has finished loading
	getProfession();

	// when something has been clicked
	$('#submit').on('click', function () {
		alert('submit');
	});
});

/**
 * gets the name and the id of a profession via JSON response
 */
function getProfession() {
	$.ajax({
		type: "POST",
		url: "http://home.gibm.ch/interfaces/133/berufe.php"
	}).done(function (response) {

		displayProfession(response);
	});
}

/**
 * Builds the drop down options for selecting a profession
 * @param profession
 */
function displayProfession(profession) {
	var options = '';
	for (var i in profession) {
		console.log(profession[i]);
		var row = profession[i];
		options += '<option value="' + gh(row.beruf_id) + '">' + gh(row.beruf_name) + '</option>';
	}
	$('#profession').html(options);
}

/**encodes html conform string
 * @param value
 * @returns {*|jQuery}
 */
function gh(value) {
	//create a in-memory div, set it's inner text(which jQuery automatically encodes)
	//then grab the encoded contents back out.  The div never exists on the page.
	return $('<div/>').text(value).html();
}
