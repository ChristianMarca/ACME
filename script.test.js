const EmployeePayment = require('./script');

const employeePayment= new EmployeePayment('employees_data.txt');

describe('Read file asynchronously',()=>{

	test('Read .text file asynchronously',()=>{
		return expect(employeePayment._getEmployesFromFile('employees_data.txt')).resolves.not.toHaveLength(0)
	});

	test('Can not find the .txt file',()=>{
		const file='employees_data1.txt';
		return expect(employeePayment._getEmployesFromFile(file)).rejects.toMatchObject({
			errno: -2,
			code: 'ENOENT',
			syscall: 'open',
			path: __dirname+'/'+file
		});
	});

});

describe('Read file synchronously',()=>{

	test('Read .text file synchronously',()=>{
		return expect(employeePayment._getEmployesFromFileSync('employees_data.txt')).not.toHaveLength(0)
	});

	test('Can not find the .txt file',()=>{
		const file='employees_data1.txt';
		expect(employeePayment._getEmployesFromFileSync(file)).toMatchObject({
			errno: -2,
			code: 'ENOENT',
			syscall: 'open',
			path: __dirname+'/'+file
		});
	})

});

describe('Calculate the time between two hours of the day',()=>{

	test('Calculate time with two valid hours',()=>{
		expect(employeePayment._calculateTime('08','30','10','00')).toBe(1.5.toFixed(2))
	});

	test('Calculate time with two valid hours 1',()=>{
		expect(employeePayment._calculateTime('00','12','23','37')).toBe(23.42.toFixed(2))
	});

	test('Calculate time with two invalid hours',()=>{
		expect(employeePayment._calculateTime('08','30','10','60')).toBe(0);
	});

	test('Calculate the time with two disordered hours',()=>{
		expect(employeePayment._calculateTime('10','30','08','00')).toBe(0);
	});

});

describe('Verify hour with restrictions of upper and lower limit',()=>{

	const constrainWeekday=[{start: ['00','01'],end: ['09','00'],USD:25},{start: ['09','01'],end: ['18','00'],USD: 15},{start:['18','01'],end: ['00','00'],USD: 20}];

	const startHourShift=constrainWeekday[1].start;

	const endHourShift=constrainWeekday[0].end;

	test('Lower limit with valid hour',()=>{
		expect(employeePayment._verifyHour([9,30],startHourShift,true)).toBeTruthy()
	});

	test('Lower limit with invalid hour',()=>{
		expect(employeePayment._verifyHour([8,30],startHourShift,true)).toBeFalsy()
	});

	test('Upper limit with valid hour',()=>{
		expect(employeePayment._verifyHour([8,30],endHourShift,false)).toBeTruthy()
	});

	test('Upper limit with invalid hour',()=>{
		expect(employeePayment._verifyHour([9,30],endHourShift,false)).toBeFalsy()
	});

})

describe('Calculate the value to pay per day',()=>{

	const constrainWeekday=[{start: ['00','01'],end: ['09','00'],USD:25},{start: ['09','01'],end: ['18','00'],USD: 15},{start:['18','01'],end: ['00','00'],USD: 20}];

	const constrainWeekend=[{start: ['00','01'],end: ['09','00'],USD: 30},{start: ['09','01'],end: ['18','00'],USD: 20},{start: ['18','01'],end: ['00','00'],USD: 25}];

	test('Calculate value to pay per day with valid hour',()=>{
		expect(employeePayment._paymentPerDay(10,30,15,30,constrainWeekend)).toBe(100)
	});

	test('Calculate value to pay per day with valid hour',()=>{
		expect(employeePayment._paymentPerDay(10,30,15,30,constrainWeekday)).toBe(75)
	});

	test('Calculate value to pay per day with work hours between two constraints',()=>{
		expect(employeePayment._paymentPerDay(10,30,19,30,constrainWeekday)).toBe(142.1)
	});

	test('Calculate value to pay per day with invalid hour',()=>{
		expect(employeePayment._paymentPerDay(10,30,15,65,constrainWeekday)).toBe(0)
	});

	test('Calculate the value to pay per day with disordered hours.',()=>{
		expect(employeePayment._paymentPerDay(10,30,9,35,constrainWeekend)).toBe(0)
	});

});

describe('Calculate the value to pay per employe',()=>{

	const employee=['MO','10','00','12','00','TH','12','00','14','00','SU','20','00','21','00'];

	const employeeErrorData=['MO','10','00','12','00','TH','12','00','14','00','SU','20','00','21','60'];

	test('Calculate total value to paid with valid data',()=>{
		expect(employeePayment._calculateAmountToPay(employee)).toBe(85.0.toFixed(2));
	});

	test('Calculate total value to paid with invalid data',()=>{
		expect(employeePayment._calculateAmountToPay(employeeErrorData)).toBe(60.0.toFixed(2));
	});
});

describe('Calculate the total value to pay',()=>{

	test('Calculate the total value to pay asynchronously',()=>{
		return expect(employeePayment._getAmountToPay('employees_data.txt',false)).resolves.toEqual(expect.arrayContaining([ 'The amount to pay RENE is: 215.00 USD','The amount to pay ASTRID is: 85.00 USD','The amount to pay ASTRIDgdg is: 329.30 USD' ]));
	});

	test('Calculate the total value to pay synchronously',()=>{
		return expect(employeePayment._getAmountToPay('employees_data.txt',true)).toEqual(expect.arrayContaining([ 'The amount to pay RENE is: 215.00 USD','The amount to pay ASTRID is: 85.00 USD','The amount to pay ASTRIDgdg is: 329.30 USD' ]));
	});

	test('Calculate the total value to pay asynchronously with a nonexistent file',()=>{
		let file='employees_data1.txt';
		return expect(employeePayment._getAmountToPay(file,false)).rejects.toMatchObject({
			errno: -2,
			code: 'ENOENT',
			syscall: 'open',
			path: __dirname+'/'+file
		});
	});

	test('Calculate the total value to pay synchronously with a nonexistent file',()=>{
		let file='employees_data1.txt';
		return expect(employeePayment._getAmountToPay(file,true)).toMatchObject({
			errno: -2,
			code: 'ENOENT',
			syscall: 'open',
			path: __dirname+'/'+file
		});
	});

});