const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// SQL Connection
const mySQL = require('mysql');
const { json } = require("express");
var connection;


app.use((req, res, next) => {

    // Enable CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
  
    if (req.method === 'OPTIONS'){
  
      res.header('Access-Control-Allow-Methods', 'POST');
    }

    // Connection configurations.
    connection = mySQL.createConnection({

        host: "localhost",
        user: "root",
        password: "",
        database: "sauna_reservations"
    });
  
    next();
});

app.post("/test", (req, res) => {    
    
    res.sendStatus(200);
});

app.post("/bookNewReservation", (req, res) => {

    const reservation = [req.body.FN, req.body.LN, req.body.DATE, req.body.TIME];   
    
    connection.connect((err) => {
        
        connection.query('INSERT INTO reservations (firstname, lastname, date, time) VALUES(' + objectValuesIntoSQLValues(reservation) + ')', (err, results, fields) => {

            if(err){
                console.log(time() + " " + err);                
                res.sendStatus(500);
            }

            else{
                console.log(time() + " " + results);
                res.sendStatus(200);
            }
        });
    })

    connection.end();
});

app.post("/getReservations", (req, res) => {

    connection.connect((err) => {
        
        // Check if any errors occured.
        if(err){

            // Log the error to servers console and response with internal error.
            console.log(time() + " " + err);
            connection.end();
            res.sendStatus(500);
        }
        
        else{

            const date = req.body.DATE;
    
            const queryString = "SELECT date, time FROM reservations WHERE WEEK(date) = WEEK('" + date + "')";
            connection.query(queryString, (err, results, fields) => {
                
                if(err){ 

                    connection.end();
                    console.log(time() + " " +err);     
                    res.json(results);
                }
                else{

                    results.forEach(data => {       

                        // Remove the time after the date and replace it as new data.
                        data["date"] = data["date"].toISOString().split("T")[0];
                    })

                    connection.end();
                    res.json(results);
                }
            });
        }
    });
});

const objectValuesIntoSQLValues = (object) => {    
    
    let sqlString = "";

    object.forEach(value => {

        sqlString += "'" + value + "'";

        if(object.indexOf(value) !== object.length - 1){
            sqlString += ", ";
        }
    });

    return sqlString;
}

const time = () => {

    const currentTime = new Date();
    return " [ " + currentTime.getHours() + ":" + currentTime.getMinutes() + " ]: ";
}

// Leave these to bottom!!!.
app.listen(port = 5000, () => {console.log('Server started on port ' + port)});
app.post('*', (req, res) => {res.sendStatus(404)});