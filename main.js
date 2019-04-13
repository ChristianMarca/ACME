const EmployeePayment = require('./script');
let employees = new EmployeePayment('employees_data.txt')
let one = employees.amountToPay();
let two = employees.amountToPaySync();
one.then(value=>{
	console.log('One',value);
})
console.log('Two',two)

