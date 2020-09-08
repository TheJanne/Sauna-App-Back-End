// Creates a SQL value query string from object values and returns it.
// ["Name", "Lastname"] => ("Name", "Lastname")
// Return value is type of string.
module.exports.objectValuesIntoSQLValues = (object) => {    

    let sqlString = "";

    object.forEach(value => {

        sqlString += "'" + value + "'";

        if(object.indexOf(value) !== object.length - 1){
            sqlString += ", ";
        }
    });

    return sqlString;
}
