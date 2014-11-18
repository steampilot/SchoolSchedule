/**
 * Created by Jerome Roethlisberger on 07.11.14.
 */
/**
 * Hides all the elements that are not yet available
 * Initialize all event listeners
 */
paginate = true;
$(function () {
	var d = new Date();
	var year = d.getFullYear();
	var week = getWeekNumber(d);
	var classId = null;
	var selectedWeek = 0;
	var selectedYear = 0;
	$('#datepicker').attr('placeholder',week+'-'+year);
	$('#page_control').hide();
	$('#profession').hide();
	$('#school_class').hide();
	$('#not_found').hide();
	$('#board').hide();
	// when the page has finished loading
	getProfession();
	// when something has changed
	$('#profession').on('change', function(){
		var professionId;
		professionId = $('#profession').val();
		if(professionId == 0) {
			$('#school_class').hide('slow');
			$('#board').hide('slow');
		} else {
			$('#board').hide('slow');
			$('#not_found').hide('slow');
			getSchoolClassByProfessionId(professionId);
		}
	});
	$('#school_class').on('change', function(){
		classId = $('#school_class').val();
		console.log(classId);
		//classId = 1481221;
		if(classId == 0) {
			$('#board').hide('slow');
			$('#not_found').hide('slow');
		} else {
			getBoard(classId,week,year);
		}
	});
	$('#datepicker').datepicker({
		autoclose: true,
		weekStart: 1,
		todayBtn: 'linked',
		calendarWeeks: true,
		selectWeek: true,
		todayHighLight: true,
		format: 'yyyy-mm-dd'
	});
	$('#previous').on('click', function(){
		week = week - 1;
		$('#datepicker').val(week+'-'+year);
		if ( classId != null && week != 0 && year != 0) {

			getBoard(classId, week, year);
		}
	});
	$('#next').on('click', function(){
		week = week + 1;
		$('#datepicker').val(week+'-'+year);
		if ( classId != null && week != 0 && year != 0) {

			getBoard(classId, week, year);
		}
	});
	$('#datepicker').datepicker()
		.on('hide', function(){
			var d =  new Date($('#datepicker').val());
			week = getWeekNumber(d);
			year = d.getFullYear();
		$('#datepicker').val(week+'-'+year);
			if ( classId != null && week != 0 && year != 0) {

				getBoard(classId, week, year);
			}

	});
});

function getWeekNumber(d){
	d = new Date(+d);
	d.setHours(0,0,0,0);
	d.setDate(d.getDate()+4 - (d.getDay() || 7));
	var yearStart = new Date(d.getFullYear(),0,1);
	var weekNr = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
	return weekNr;
}

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
	$('#page_control').fadeIn('slow');
	$('#board').hide('slow');
	$('#not_found').hide('slow');
	console.log('week: '+ week);
	console.log('year: '+ year);
	var week_year = 'Aktuel'
	var url = 'http://home.gibm.ch/interfaces/133/tafel.php?klasse_id=' +classId;
	if (week != null && year != null) {
		url += '&woche='+week+'-'+year;
		week_year = week +'-'+ year;
	}
		$.ajax({
		type: 'POST',
		url: url
	}).done(function (response){
			response

		displayBoard(response, week_year);
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
		var date = row.tafel_datum;
		if (!(weekday in result)) {
			result[weekday] = [];
		}
		result[weekday].push(row);
	}
	console.log(result);
	return result;

}
function displayBoard(board, week_year) {
	console.log(week_year);
	$('#week_year').html( 'Woche: ' + gh(week_year));

	$('#lecture_board').html('');
	var date = null;

	var result = prepareBoard(board);
	for (var weekday in result) {
		var lecture = result[weekday];
		// creating jquery dom object of the cloned html template
		var tpl = $($('#board_content').html());

		var tbody = tpl.find('tbody');
		var select = $($('#select_date_content').html());
		tpl.find('#week_day').html(gh(getWeekDayName(weekday)));
		tpl.find('#select_date').append(select);
		console.log(tbody);
		var rows = 'Lectures: ';
		console.log('lecture[0] ');
		for (var i in lecture) {
			rows += '<tr>';
			var row = lecture[i];

			tpl.find('#date').html(gh(row.tafel_datum));
			date = row.tafel_datum;
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
		$('#lecture_board').append(tpl);
	}

	console.log('board: ' + board);
	if (date != null) {
		$('#board').show('slow');
		$('#not_found').hide('slow');
		date = null;
	} else {
		$('#board').hide('slow');
		$('#not_found').show('slow');
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