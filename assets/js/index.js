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
		professionId = $('#profession').val();
		if(professionId == 0) {
			$('#school_class').hide('slow');
		} else {
			getSchoolClassByProfessionId(professionId);
		}
	});
	$('#school_class').on('change', function(){
		var week = 12;
		var year = 2013;
		var classId = $('#school_class').val();
		console.log(classId);
		//classId = 1481221;
		getBoard(classId,week,year);
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
function getBoard(classId,week,year){
	var url = 'http://home.gibm.ch/interfaces/133/tafel.php' + '?klasse_id=' + classId + '&woche='+week+'-'+year;
		$.ajax({
		type: 'POST',
		url: url
	}).done(function (response){
		displayBoard(response);
	});
}
/**
 * Builds the drop down options for selecting a profession
 * @param profession
 */
function displayProfession(profession) {
	var options = '<option value="0">** Bitte wählen Sie einen Beruf aus</option>';
	for (var i in profession) {
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
function prepareBoard(rows) {
	var result = [];
	var lectures;
	var row;
	for (var i in rows) {
		var row = rows[i];
		var weekday = row.tafel_wochentag;
		if (!(weekday in result)) {
			result[weekday] = [];
		}
		result[weekday].push(row);
	}
	console.log(result);
	return result;

}
function displayBoard(board) {
	$('#lecture_table').html('');
	console.log(board);
	var result = prepareBoard(board);
	console.log(result);
	for (var weekday in result) {
		var lecture = result[weekday];

		// creating jquery dom object of the cloned html template
		var tpl = $($('#weekday_table').html());
		var tbody = tpl.find('tbody');
		tpl.find('[data-name=week_number_title]').html('Woche ')
		tpl.find('[data-name=weekday]').html(gh(getWeekDayName(weekday)));

		console.log(tbody);

		var rows = '';
		for (var i in lecture) {
			rows += '<tr>';
			var row = lecture[i];
			rows += '<td>' + gh(row.tafel_von) + '</td>';
			rows += '<td>' + gh(row.tafel_bis) + '</td>';
			rows += '<td>' + gh(row.tafel_raum) + '</td>';
			rows += '<td>' + gh(row.tafel_fach) + '</td>';
			rows += '<td>' + gh(row.tafel_longfach) + '</td>';
			rows += '<td>' + gh(row.tafel_lehrer) + '</td>';
			rows += '<td>' + gh(row.tafel_kommentar) + '</td>';
			rows += '</tr>';
		}
		tbody.html(rows);

		$('#lecture_table').append(tpl);
	}
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
function gu(value) {
	return '<a href="'+value+'">'+value+'</a>';
}

function getWeekDayName(id) {
	var weekdayName  = [
		'Sontag',
		'Montag',
		'Dienstag',
		'Mittwoch',
		'Donnerstag',
		'Freitag',
		'Samstag'
	];
	return weekdayName[id];
}