const EmployeePayment = require('./script');
let employes = new EmployeePayment('employees_data.txt');
employes.amountToPay()