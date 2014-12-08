/**
 * Created by Jerome Roethlisberger on 07.11.14.
 */
/**
 * Hides all the elements that are not yet available
 * Initialize all event listeners
 */




app = {};

if (!app.Index) {
	app.Index = {};
}

app.Index = function (config) {

	// this object
	var $this = this;

	// config
	this.config = config || {};



	/**
	 * Init page
	 *
	 * @returns {undefined}
	 */
	this.init = function () {

		$('#page_control').hide();
		$('#profession').hide();
		$('#school_class').hide();
		$('#not_found').hide();
		$('#board').hide();

		$('#datepicker').datepicker({
			autoclose: true,
			weekStart: 1,
			todayBtn: 'linked',
			calendarWeeks: true,
			selectWeek: true,
			todayHighLight: true,
			format: 'yyyy-mm-dd'
		});

		$('#datepicker').datepicker().val($this.getCurrentDate());
        $('#selectedDate').val($this.getCurrentDate());
		$('#datepicker').datepicker().on('hide', this.datepicker_onHide);
		$('#profession').on('change', this.profession_onChange);
		$('#school_class').on('change', this.school_class_onChange);
		$('#previous').on('click', this.previous_onClick);
		$('#next').on('click', this.next_onClick);
		$('#datepicker').on('keydown', this.datepicker_onKeyDown);

	};

	this.load = function () {
		// rpc request
		// load form data
		// when the page has finished loading
		$this.getProfession();


		var professionId = $d.getCookie("professionId", 0);
		if (professionId > 0) {
			$('#profession').val(professionId);
			//$('#profession').trigger('change');
			var classId = $d.getCookie("classId", 0);
			if (classId > 0) {
				$('#school_class').val(classId);
				$('#school_class').trigger('change');
			}
		}


	};


	this.getCurrentDate = function(){
		var d = new Date();
		var n = d.toISOString();
		var result = n.substring(0,10);
		return result;
	};
	/**
	 * Gets the week numbre by a given date object
	 * @param d {Date}
	 * @returns {number}
	 */
	this.getWeek = function (strDate) {
		var d = new Date(strDate);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		var yearStart = new Date(d.getFullYear(), 0, 1);
		var weekNr = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
		var numYear = yearStart.getFullYear();
		var weekYear = weekNr+'-'+numYear;
		var result = {
			weekYear: weekYear,
			week: weekNr,
			year: numYear
		};
 		return result;
	};

	/**
	 * gets the name and the id of a profession via JSON response
	 */
	this.getProfession = function () {
		$.ajax({
			type: "POST",
			url: "http://home.gibm.ch/interfaces/133/berufe.php"
		}).done(function (response) {
			$this.displayProfession(response);

			$('#profession').show('slow');
		});
	};

	this.getSchoolClassByProfessionId = function (professionId) {
		$.ajax({
			type: 'POST',
			url: 'http://home.gibm.ch/interfaces/133/klassen.php?beruf_id=' + professionId
		}).done(function (response) {
			$this.displaySchoolClass(response);

			$('#school_class').show('slow');
		});
	};

	this.getBoard = function () {
		var classId = $('#school_class').val();
		var selectedDate = $this.getSelectedDate();

		var week = $this.getWeek(selectedDate);
		$('#page_control').fadeIn('slow');
		$('#board').hide('slow');
		$('#not_found').hide('slow');
		var strParams = $.param({
			klasse_id: classId,
			woche: week.weekYear
		});
		var url = 'http://home.gibm.ch/interfaces/133/tafel.php?' + strParams;

		$.ajax({
			type: 'POST',
			url: url
		}).done(function (response) {
			$this.displayBoard(response, week.weekYear);
		});
	};
	/**
	 * Builds the drop down options for selecting a profession
	 * @param profession
	 */
	this.displayProfession = function (profession) {
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
	};

	this.displaySchoolClass = function (schoolClass) {
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
	};

	this.prepareBoard = function (rows) {
		var result = [];
		for (var i in rows) {
			var row = rows[i];
			var weekday = row.tafel_wochentag;
			if (!(weekday in result)) {
				result[weekday] = [];
			}
			result[weekday].push(row);
		}
		return result;

	};
	/**
	 * Left padding
	 *
	 * @param {string} str
	 * @param {number} nLen
	 * @param {string} sChar
	 * @returns {string}
	 */
	this.padLeft = function(str, nLen, sChar) {
		str = String(str);
		sChar = sChar || ' ';
		while (str.length < nLen) {
			str = sChar + str;
		}
		return str;
	};


	this.formatDate = function (strIsoDate){
		var strResult = '';
		var date = new Date(strIsoDate);
		var d = $this.padLeft(date.getDate(), 2, '0');
		var m = $this.padLeft(date.getMonth() + 1, 2, '0');
		var y = date.getYear();
		if (y < 999) {
			y = y + 1900;
		}
		y = $d.padLeft(y, 4, '0');
		var strResult = new String().concat(d, '.', m, '.', y);
		return strResult;

	};
	this.displayBoard = function (board, week_year) {
		$('#week_year').html('Woche: ' + week_year);

		$('#lecture_board').html('');
		var date = null;

		var result = $this.prepareBoard(board);
		if (result && result.length) {
			$('#board').show('slow');
			$('#not_found').hide('slow');
		} else {
			$('#board').hide('slow');
			$('#not_found').show('slow');
			return;
		}
		for (var weekday in result) {
			var lecture = result[weekday];
			// creating jquery dom object of the cloned html template
			var tpl = $($('#board_content').html());

			var tbody = tpl.find('tbody');
			var select = $($('#select_date_content').html());
			tpl.find('#week_day').html(gh($this.getWeekDayName(weekday)));
			tpl.find('#select_date').append(select);
			var rows = 'Lectures: ';
			for (var i in lecture) {
				rows += '<tr>';
				var row = lecture[i];

				tpl.find('#date').html($this.formatDate(row.tafel_datum));
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

	};


	this.getWeekDayName = function (id) {
		var weekdayName = [
			'Sontag',
			'Montag',
			'Dienstag',
			'Mittwoch',
			'Donnerstag',
			'Freitag',
			'Samstag'
		];
		return weekdayName[id];
	};

	this.profession_onChange = function () {

		var professionId = $('#profession').val();
		$d.setCookie('professionId', professionId);
		$d.setCookie('classId', 0);

		if (professionId == 0) {
			$('#school_class').hide('slow');
			$('#board').hide('slow');
		} else {
			$('#board').hide('slow');
			$('#not_found').hide('slow');
			$this.getSchoolClassByProfessionId(professionId);
		}
	};

	this.school_class_onChange = function () {
		var classId = $('#school_class').val();
		$d.setCookie('classId', classId);
		//classId = 1481221;
		if (classId == 0) {
			$('#board').hide('slow');
			$('#not_found').hide('slow');
		} else {
			//$d.setCookie('classId', classId);
			$this.getBoard();
		}
	};
    this.getSelectedDate = function () {
        var selectedDate = $('#datepicker').val();
        return selectedDate;
    };
	this.previous_onClick = function () {
        var selectedDate = $this.getSelectedDate();
		var d = new Date(selectedDate);
		d.setDate(d.getDate() -7);
        var n = d.toISOString();
        var result = n.substring(0,10);
        $('#datepicker').val(result);
		$this.getBoard();

	};

	this.next_onClick = function () {

		var selectedDate = $this.getSelectedDate();
		var d = new Date(selectedDate);
		d.setDate(d.getDate() +7);
		var n = d.toISOString();
		var result = n.substring(0,10);
		$('#datepicker').val(result);
		$this.getBoard();
	};

	this.datepicker_onKeyDown = function (e) {
		e.preventDefault();
		return false;
	};
	this.datepicker_onHide = function () {
        $this.selecdetDate = "hello";
			$this.getBoard();

	};


	this.init();

};


$(function () {
	var page = new app.Index();
	page.load();
});
