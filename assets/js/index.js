/**
 * Created by Jerome Roethlisberger on 07.11.14.
 */
/**
 * Initialize all event listeners
 */
$(function () {
	// when the page has finished loading
	getProfession();

	// when something has changed
	$('#profession').on('change', function(){
		var professionId;
		professionId = $('#profession option:selected').val();

		getSchoolClassByProfessionId(professionId);
	});

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
function getAllSchoolClasses() {
	$.ajax({
		type: "POST",
		url: "http://home.gibm.ch/interfaces/133/klassen.php"
	}).done(function (response) {

		displaySchoolClass(response);
	});
}
function getSchoolClassByProfessionId(professionId) {
	$.ajax({
		type: 'POST',
		url: 'http://home.gibm.ch/interfaces/133/klassen.php?beruf_id=' + professionId
	}).done(function (response){
		displaySchoolClass(response);
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
		options +=
			'<option value="' +
			gh(row.beruf_id) + '">' +
			gh(row.beruf_name) +
			'</option>';
	}
	$('#profession').html(options);
}
function displaySchoolClass(schoolClass){
	var options = '';
	for (var i in schoolClass) {
		console.log(schoolClass[i]);
		var row = schoolClass[i];
		options +=
			'<option value="' +
				gh(row.klasse_id) + '">' +
				gh(row.klasse_name) + ' - ' +
				gh(row.klasse_longname) +
			'</option>';
	}
	$('#school_class').html(options);
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
