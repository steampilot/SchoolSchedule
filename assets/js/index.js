/**
 * Created by Jerome Roethlisberger on 07.11.14.
 */
/**
 * Hides all the elements that are not yet available
 * Initialize all event listeners
 */
$(function () {
	$('#profession').hide();
	$('#school_class').hide();
	// when the page has finished loading
	getProfession();

	// when something has changed
	$('#profession').on('change', function(){
		var professionId;
		professionId = $('#profession option:selected').val();
		if(professionId == 0) {
			$('#school_class').hide('slow');
		} else {
			getSchoolClassByProfessionId(professionId);
		}
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
		$('#profession').show('slow');
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
		$('#school_class').show('slow');
	});
}
/**
 * Builds the drop down options for selecting a profession
 * @param profession
 */
function displayProfession(profession) {
	var options = '<option value="0">** Bitte wählen Sie einen Beruf aus</option>';
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
	var options = '<option value="0">** Bitte wählen Sie eine Klasse aus</option>';
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
