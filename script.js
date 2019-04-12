const fs = require('fs')
const readline = require('readline')
const path = require('path')
const CONSTRAINS = require('./constraints.json')

function EmployeePayment(file) {
	/*
		Contructor
		input: file (name of the file that contains the employee record)
	*/

	this.file = file;
}

EmployeePayment.prototype._getEmployesFromFile = async function(file) {
	/*
		Read File and return an array with employees information
		input: file (name of the file that contains the employee record)
		output: array (array of employee record information)
	*/

	let employees_data = [];
	return new Promise((resolve, reject) => {
		const readFileStream = fs.createReadStream(path.join(__dirname, file));
		readFileStream.on('error',(error)=>reject(error));
		let employee = readline.createInterface({
			input: readFileStream
		});
		employee.on('line', line => employees_data.push(line));
		employee.on('close', ()=>{
			console.log(employees_data)
			resolve(employees_data)
		});
	});
};

EmployeePayment.prototype._calculateTime = function(startHour,startMinute,endHour,endMinute) {
	/*
		Calculate the number of hours between two times of day
		input: 
				- startHour (start hour of the day)
				- startMinute (start minute of the day)
				- endoHour (end hour of the day)
				- endMinute (end minute of the day)
		output: number (number of hours between two hours a day,
						 and 0 if there is an error in the income data)
	*/

	if (startHour >= 24 || endHour >= 24 || startMinute >= 60 || endMinute >= 60 || endHour<startHour){
		return 0;
	}
	if (startMinute > endMinute) {
		endHour--;
		endMinute += 60;
	}
	return (endHour - startHour + (endMinute - startMinute) / 60).toFixed(2);
};

EmployeePayment.prototype._verifyHour = function(hour, minute, shift, type) {
	/*
		check if the hour of entry is within the limit of the restriction
		input: 
				- hour: (hour to analyze in a work shift restriction)
				- minute: (minute to analyze in a work shift restriction)
				- shift: (restriction of the work shift)
				- type:  (type of restriction, upper limit (false), lower limit (true))
		output: boolean (complies or not with the restriction)
	*/

	let shiftHour = Number(shift[0]);
	hour = Number(hour);
	minute = Number(minute);
	if (type) {
		if (hour == shiftHour) {
			if (minute == 0) return false;
			return true;
		} else if (hour > shiftHour) {
			return true;
		} else {
			return false;
		}
	} else {
		if (hour == shiftHour) {
			if (minute != 0) return false;
			return true;
		} else if (shiftHour == 0) {
			if (hour < 24) {
				return true;
			}
		} else if (hour < shiftHour) {
			return true;
		} else {
			return false;
		}
	}
};

EmployeePayment.prototype._paymentPerDay = function(startHour,startMinute,endHour,endMinute,valueByDate) {
	/*
		Obtain the value to pay per working day, considering two possible scenarios 
		1) the employee works a single shift (base case)
		2) the employee has work hours between two different shifts

		input: 
				- startHour (start hour of working day)
				- startMinute (start minute of working day)
				- endoHour (end hour of working day)
				- endMinute (end minute of working day)
				- valueByDate (array of objects of work shift restrictions)
		output: number (amount to pay a one-day employee)
	*/

	let isFound = false;
	let amountToPlay = 0;
	for (let i = 0; i < valueByDate.length; i++) {
		let startHourShift = valueByDate[i].start.split(':');
		let endHourShift = valueByDate[i].end.split(':');
		let lowerLimit = this._verifyHour(startHour, startMinute, startHourShift, true);
		let upperLimit = this._verifyHour(endHour, endMinute, endHourShift, false);
		if ( lowerLimit && upperLimit ) {
			let time = this._calculateTime( startHour,startMinute,endHour,endMinute);
			amountToPlay = valueByDate[i].USD * time;
			isFound = true;
		}
	}
	if (isFound) {
		return amountToPlay;
	} else {
		for (let i = 0; i < valueByDate.length; i++) {
			let startHourShift = valueByDate[i].start.split(':');
			let endHourShift = valueByDate[i].end.split(':');
			let startHourShiftNext,endHourShiftNext;
			if(i==2){
				startHourShiftNext=valueByDate[0].start.split(':');
				endHourShiftNext=valueByDate[1].start.split(':');
			}else{
				startHourShiftNext=valueByDate[i+1].start.split(':');
				endHourShiftNext=valueByDate[i+1].end.split(':');
			}
			let lowerLimit = this._verifyHour(startHour, startMinute, startHourShift, true);
			let upperLimit = this._verifyHour(endHour,endMinute, endHourShiftNext, false);
			if ( lowerLimit && upperLimit) {
				const totalFirstTurn=this._paymentPerDay(startHour,startMinute,endHourShift[0],endHourShift[1],valueByDate);
				const totalSecondTurn=this._paymentPerDay(startHourShiftNext[0],startHourShiftNext[1],endHour,endMinute,valueByDate);
				return totalFirstTurn + totalSecondTurn
			}
		}
	}
};

EmployeePayment.prototype._calculateAmountToPay = function(employeeInfo) {
	/*
		It establishes the set of restrictions for the calculation 
		and returns the total value to be paid to an employee
		input: employeeInfo (information array of employee work hours)
		output number (total amount to be paid to an employee)
	*/

	let valueByDate = {};
	let total = 0;
	for (let i = 0; i < employeeInfo.length; i += 5) {
		if (CONSTRAINS.WEEKDAY.includes(employeeInfo[i])) {
			valueByDate = CONSTRAINS.TIME_WEEKDAY;
		} else {
			valueByDate = CONSTRAINS.TIME_WEEKEND;
		}
		total += this._paymentPerDay(
			employeeInfo[i + 1],
			employeeInfo[i + 2],
			employeeInfo[i + 3],
			employeeInfo[i + 4],
			valueByDate
		);
	}
	return total.toFixed(2);
};

EmployeePayment.prototype._getAmountToPay = async function(file) {
	/*
		Obtain the values to be paid to employees
		input: file (name of the file that contains the employee record)
		output: void (print in console the amount to be paid to employees)
	*/

	try{
		const EMPLOYES = await this._getEmployesFromFile(file);
		EMPLOYES.map(employee => {
			let info = employee.match(/([[a-z]+|[^a-z]+]|[^=,:-]+)/gi);
			let valueToPaid=this._calculateAmountToPay(info.slice(1, info.length + 1));
			process.stdout.write(`The amount to pay ${info[0]} is: ${valueToPaid} USD \n`)
		});
	}catch(error){
		process.stdout.write('An error has occurred: ',error);
		process.stdout.write(error);
	}
};

EmployeePayment.prototype.amountToPay = function() {
	this._getAmountToPay(this.file);
};

module.exports = EmployeePayment;