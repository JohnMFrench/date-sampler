res = document.getElementById('results');

function setOpts(){
	var opts = {};
	opts.holidays = document.getElementById("holidays").checked;
	opts.weekdays = document.getElementById("workdays").checked;
	opts.dupes = document.getElementById("dupes").checked;
	opts.cols = parseInt(document.getElementById("cols").value);
	if (document.getElementById('shortFormat').checked){
		opts.format = "short";
	} else {
		opts.format = "long";
	}
	opts.days = document.getElementById("sampleDaysButton").checked;
	opts.dispDay = document.getElementById("dispWeekdays").checked;
	opts.delim = document.getElementById("delimit").value;
	return opts;
}
/*
tips = {};
tips.submit = "Click this button to generate dates";
tips.date = "Choose lower and upper bounds for the sample dates";

onmousemove = function(e){
	tips.x = e.x;
	tips.y = e.y;
}

function tip (t){
	var tipBox = document.createElement('div');
	tipBox.innerHTML = t;
	tipBox.class = "tip";
	tipBox.style.position = "absolute";
	//tipbBox.style.left = "40px";
	console.log(tipBox.style.left);
	//document.body.appendChild(tipBox);
}
*/
//in format of m/d
holidata = [[1, 1], [7, 4], [11, 11], [12, 25], [12, 26]];

//dynamically creates a list of public holidays. should be called at init
function makeHolidayList(){

	//in format of m/week. All holidays occur on the first mon of the week
	var varDays = [[1, 3], [2, 3], [9, 1], [10, 2]];
	for (var i = 0; i < varDays.length; i++){
		calcVars(varDays[i]);
	}
}
//calculate t-giving for this year
function tGiving(){
	var thurs = 0;
	for (var i = 0; i < 30; i++){
		var foo = new Date(new Date().getFullYear(), 10, i);
		if (foo.getDay() == 4){
			thurs++;
			if (thurs == 4){
				holidata.push([11, i]);
			}
		}
	}
}
//calculates memorial day for this year
function memDay(){
	for (var i = 31; i > 0; i--){
		var foo = new Date(new Date().getFullYear(), 4, i);
		if (foo.getDay() == 1){
			holidata.push([5, i]);
			break;
		}
	}
}
//these three calls populate holidata
tGiving();
memDay();
makeHolidayList();

//calculate the variable date holidays and add to array
function calcVars(mw){
	var monds = 0;
	for (var i = 1; i < 31; i++){
		var foo = new Date(new Date().getFullYear(), (mw[0] - 1), i);
		if (foo.getDay() == 1){
			monds++;
			if (monds == mw[1]){
				holidata.push([mw[0], i])
			}
		}
	}
}

//this is what the computed dates are pushed to
var sampleDateArray = [];
var sampleWeekArray = [];

function checkInput(start, end){
	if (start > end){
		alert('The start date is later than the end date');
	}
	if (typeof(opts.cols) != "number" && typeof(opts.cols) != "undefined"){
		alert('Not a valid number of columns');
	}
}

function onButton(){
	console.log('onButton called');
	//construct the options object
	opts = setOpts();
	console.log('options set');
	console.log(opts.cols);
	//pass the html input values to vars and convert to date 
	var startInput = document.getElementById('start_date').value;
	var startDate = new Date(startInput.slice(0, 4), parseInt(startInput.slice(5, 7)) - 1, startInput.slice(8, 10));
	var endInput = document.getElementById('end_date').value;
	var endDate = new Date(endInput.slice(0, 4), parseInt(endInput.slice(5, 7)) - 1, endInput.slice(8, 10));

	//verify that start is before end
	checkInput(startDate, endDate);

	//check if an iteration is entered
	var iter = document.getElementById('samp_num').value;
	if (typeof(iter) != "string"){
		console.log(typeof(iter));
		alert('Select a number of samples');
	}
	if (opts.days){
		makeDates(startDate, endDate, iter);
	} else {
		makeWeeks(startDate, endDate, iter);
	}
}

function expand(){
	optsDisp = document.getElementById('options').style.display;
	if (document.getElementById('options').style.display == 'none'){
		document.getElementById('options').style.display = 'inline';
		document.getElementById('expand').innerHTML = '<b>- Collapse additional options</b>';
	} else {
		document.getElementById('options').style.display = 'none';
		document.getElementById('expando').innerHTML = '<b>+ Expand additional options</b>';
	}
}

function makeDates(start, end, k){
	var diff = Math.round(toDays((end - start)));
	
	for (var i = 0; i < k; i++){
		//creates a random date, then verifies that it is valid before pushing to sampleDateArray
		do {
			var d = randDateBetween(start, diff);
		} while (!verifyDate(d));
		sampleDateArray.push(d);
	}	
	//sort (actually works)
	sortAlg2(sampleDateArray);
	//mark to the DOM
	markDays(sampleDateArray);
}

//create k number mondays of sample weeks between start and end
function makeWeeks(start, end, k){
	var d = start;
	for (var i = 0; i < 7; i++){
		if (d.getDay() == 1){
			sampleDay = d;
			break;
		} else {
			d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
	}
	var diff = weeksBetween(sampleDay, end);
	for (var q = 0; q < k; q++){
		do {
			var w = randomWeek(sampleDay, diff);
		} while (isDupe(w, sampleWeekArray));
		sampleWeekArray.push(w);
	}
	//sort and mark to the the DOM
	sortAlg2(sampleWeekArray);
	markDays(sampleWeekArray);
}

function randomWeek(start, weekDiff){
	return new Date(start.getTime() + Math.round(weekDiff * Math.random()) * 7 * 24 * 60 * 60 * 1000);
}

//returns the *full* weeks between the two dates
function weeksBetween(start, end){
	var w = 0;
	var i = start;
	do {
		i = new Date(i.getTime() + 7 * 24 * 60 * 60 * 1000);
		w++;
	} while (i.getTime() < end.getTime());
	return w;
}

function randDateBetween(start, diff){
	sampleDate = new Date(start.getTime() + toMS((Math.round(Math.random() * diff))));
	return sampleDate;
}

//verify that the date is not on a weekend or holiday
function verifyDate(d){
	var dow = new Date(d);
	var day = dow.getDay();
	if ((day == 6 || day == 0) && !opts.weekdays){
		return false;
	} else {
		//check for holiday
		for (var i = 0; i < holidata.length; i++){
			if (holidata[i][0] == (dow.getMonth() + 1) && holidata[i][1] == dow.getDate() && !opts.holidays){
				//console.log('avoided holiday on:' + holidata[i]);
				return false;
				break;
			}
		}
		//return true if not duplicate
		if (!opts.dupe && isDupe(d, sampleDateArray)){
			return false;
		}
		return true;
	}
}
//throws true if date already exists in sampleDateArray
function isDupe(d, arr){
	if (typeof(arr[0]) == "undefined"){
		return false;
	}
	//loop through the sampleDates chosen to ensure date is not dupe
	for (var i = 0; i < arr.length; i++){
		if (d.getDate() == arr[i].getDate() && d.getFullYear() == arr[i].getFullYear()
			&& d.getMonth() == arr[i].getMonth()){
			return true;
		}
	}
}

//ms -> days
function toDays(i){
	i = i || 0;
	return i / 24 / 60 / 60 / 1000;
}

//days -> ms
function toMS(i){
	i = i || 0;
	return i * 24 * 60 * 60 * 1000;
}
//for formatting
var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//for formatting
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//handles different formats as per the opts.format string
function dateToString(d){
	console.log(d);
	t = "";
	if (opts.dispDay){
		t += daysOfWeek[d.getDay()] + ", ";
	}
	if (opts.format == "long"){
		t += months[d.getMonth()]  + " " + d.getDate() + ", " + d.getFullYear();
	} else {
		t += (d.getMonth() + 1) + "/" + d.getDate() + "/" + String(d.getFullYear()).slice(2, 4);
	}
	return t;
}

//presents an array of dates
function markDays(arr){
	res.innerHTML = "";
	for (var i = 0; i < arr.length; i++){
		if (opts.cols){
			for (var q = 0; q < opts.cols; q++){
				res.innerHTML += dateToString(arr[i]);
				if (q != opts.cols - 1){
					i++;
				}
				//base case
				if (i == arr.length){
					console.log('done');
					break;
				}
				//right edge of row
				if (q == opts.cols - 1 && i == arr.length - 1){
					res.innerHTML += ".";
				} else {
					res.innerHTML += opts.delim;
				}
			}
			res.innerHTML += "<br>";
		}
		else {
			res.innerHTML += dateToString(arr[i]);
		}
	}
	//unset array after passing to DOM
	sampleDateArray = [];
	sampleWeekArray = [];
}

//SO snippet creates an insertion method for arrays
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

function sortAlg2(arr){
	arr.sort(function(a, b){
		at = a.getTime();
		bt = b.getTime();
		if (at > bt){
			return 1;
		} else if(bt > at){
			return -1;
		} else {
			return 0;
		}
	})
}
