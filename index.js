const express = require("express");
const app = express();

// Tools to parse requests.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const Helpers = require("./helpers");

// SQL Connection
const mySQL = require('mysql');
var connection;

// Configurations for application.
app.use((req, res, next) => {

    // Enable CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');  
    if (req.method === 'OPTIONS'){
  
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    }

    // SQL database connection configurations.
    connection = mySQL.createConnection({

        host: "localhost",
        user: "root",
        password: "",
        database: "sauna_reservations"
    });
  
    next();
});

// Inserts a new reservation into the database.
// Returns status code.
app.post("/bookNewReservation", (req, res) => {

    const reservation = [req.body.FN, req.body.LN, req.body.DATE, req.body.TIME];
    const reservationObject = Helpers.objectValuesIntoSQLValues(reservation);
    
    connection.connect((err) => {

        // Error check if connection error happens.
        if(err){

            // Log the error to servers console and response with internal error.
            console.log(err);
            connection.end();
            res.sendStatus(500);
        }

        connection.query('INSERT INTO reservations (firstname, lastname, date, time) VALUES(' + reservationObject + ')', (err, results, fields) => {

            if(err){
                console.log(err);                
                res.sendStatus(500);
            }

            else{
                res.sendStatus(200);
            }

            connection.end();
        });
    });    
});

// Gets all reservations from database by a week number.
// Returns JSON object with the reservations.
app.post("/getReservations", (req, res) => {

    connection.connect((err) => {
        
        // Error check if connection error happens.
        if(err){

            // Log the error to servers console and response with internal error.
            console.log(err);
            connection.end();
            res.sendStatus(500);
        }
        
        else{

            const week = req.body.WEEK;
    
            const queryString = "SELECT date, time FROM reservations WHERE WEEK(date) = '" + week + "'";
            connection.query(queryString, (err, results, fields) => {
                
                if(err){ 

                    connection.end();
                    console.log(err);     
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

// Uncomment to test if the server is working.
/*
app.post("/test", (req, res) => {    
    
    res.sendStatus(200);
});
*/

// Inform the developers that the server is up and running. Display the port too.
app.listen(port = 5000, () => {console.log('Server started on port ' + port)});

// If no valid address were given, return not found error code.
app.post('*', (req, res) => {res.sendStatus(404)});