const fs= require('fs');
const readline=require('readline');
const path= require('path');
const CONSTRAINS= require('./constraints.json');

'use strict'

var EmployeePayment=function(file){
    this.file=file;
    this.amountToPlay();
}

EmployeePayment.prototype._getEmployesFromFile=async function(file){
    //Read File and return an Array or Employee information
    let employees_data=[];
    return new Promise((resolve,reject)=>{
        let employee= readline.createInterface({
            input: fs.createReadStream(path.join(__dirname,file))
        });
        employee.on('line',(line)=>{
            employees_data.push(line);
        })
        employee.on('close',_=>{
            resolve(employees_data);
        })
        // fs.readFile(path.join(__dirname,file),'utf8',(err,data)=>{
        //     if (err) reject(err);
        //     resolve(data)
        // })
    });
}

EmployeePayment.prototype._calculateTime=function(startHour,startMinute,endHour,endMinute){
    //Calculate the number of hours into two day hours
    if(startHour>=24 || endHour >=24 || startMinute >=60 || endMinute >= 60 ) return -1
    if(startMinute>endMinute){
        endHour --;
        endMinute += 60;
    }
    return (endHour-startHour)+(endMinute-startMinute)/60;
};

EmployeePayment.prototype._verifyHour=function(hour,minute,shift,type){
    let shiftHour= Number(shift[0]);
    hour=Number(hour);
    minute=Number(minute);
    if(type){
        if(hour==shiftHour){
            if(minute==0) return false
            return true;
        }else if(hour>shiftHour){
            return true
        }else{
            return false
        }
    }else{
        if(hour==shiftHour){
            if(minute!=0) return false
            return true;
        }else if(shiftHour==0){
            if(hour<24){
                return true
            }
        }
        else if(hour<shiftHour){
            return true
        }else{
            return false
        }
    }
}

EmployeePayment.prototype._paymentPerDay=function(startHour,startMinute,endHour,endMinute,valueByDate){
    let isFound=false;
    let amountToPlay=0;
    for(let i=0;i<valueByDate.length;i++){
        let startHourShift=valueByDate[i].start.split(':');
        let endHourShift=valueByDate[i].end.split(':');
        if(this._verifyHour(startHour,startMinute,startHourShift,true) && this._verifyHour(endHour,endMinute,endHourShift,false)){
            console.log("entro",startHour,startMinute,endHour,endMinute,valueByDate[i])
            console.log('paga',valueByDate[i].USD)
            let time=this._calculateTime(startHour,startMinute,endHour,endMinute);
            amountToPlay=valueByDate[i].USD*time;
            isFound=true;
        }
    }
    if(isFound){
        return amountToPlay
    }else{
        console.log("no se encontro conicidencia",startHour,startMinute,endHour,endMinute,valueByDate)
    }    
};

EmployeePayment.prototype._calculateAmountToPay=function(employeeInfo){
    let valueByDate={};
    let total=0;
    // console.log(employeeInfo[0],'test',typeof CONSTRAINS.WEEKDAY[employeeInfo[0]],CONSTRAINS.WEEKDAY)
    for(let i=0;i<employeeInfo.length;i+=5){
        if(CONSTRAINS.WEEKDAY.includes(employeeInfo[i])){
            valueByDate=CONSTRAINS.TIME_WEEKDAY;
        }else{
            valueByDate=CONSTRAINS.TIME_WEEKEND;
        }
        total+=this._paymentPerDay(employeeInfo[i+1],employeeInfo[i+2],employeeInfo[i+3],employeeInfo[i+4],valueByDate);
    }
    console.log(total)
}

EmployeePayment.prototype._getEmployes=async function(){
    //Crea un array de objetos de los empleados
    const EMPLOYES=await this._getEmployesFromFile('employees_data.txt');
    let values=EMPLOYES.map(employee=>{
        console.log(employee)
        let info= employee.match(/([[a-z]+|[^a-z]+]|[^=,:-]+)/gi);
        this._calculateAmountToPay(info.slice(1,info.length+1))
        // console.log(employee.split('=')
    })
}

EmployeePayment.prototype.amountToPlay=function(){
    this._getEmployes();
    // const test=this._calculateTime(02,07,23,39);
    // console.log('hours',test)
}

new EmployeePayment();