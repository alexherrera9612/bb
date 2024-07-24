//==================================
// PORT
//==================================
// Configuration of the port
process.env.PORT = process.env.PORT || 3000;
process.env.SERVER_PORT = process.env.SERVER_PORT || 5000;
//==================================
//  ENVIROMENT
//==================================
process.env.TZ = 'America/Bogota';

// Defines the work environment
process.env.NODE_ENV = process.env.NODE_ENV || 'DEV';

//process.env.ID_DOORS = ['1','2','3','4.5','6','161-30+.5'] // INPERPI
//process.env.ID_DOORS = ['1.5$3','2/3$3','3','4.5','6'] //BSMART


//=================================
//         API DIRECTION
//=================================
process.env.API_URL_SOCKET = process.env.API_URL || 'https://bluebuilding-api-prod.herokuapp.com';
//process.env.API_URL = process.env.API_URL || 'http://localhost:3000';
//process.env.API_URL_SOCKET = process.env.API_URL_SOCKET || 'http://localhost:5000';

//==================================
//  ID OF CONNECTION WITH API
//==================================
process.env.ID_DEVICE = process.env.ID_DEVICE || '9380ec6a-8bd4-4e06-8abd-c0eb4b4c89fa';// Inperpi
//==================================
//  MARIADB DATABASE CONNECTION
//==================================

// Define configuration to Connect in the Maria DB
let dbname = 'building';
let username = 'admin';
let password = 'admin';

process.env.DBname = dbname;
process.env.usernameDB = username;
process.env.passwordDB = password;
process.env.db_timezone = 'Etc/GMT-5';//'+05:00';

// HOST MariaDB
//process.env.hostDB = '127.0.0.1';
process.env.hostDB = 'localhost';
process.env.portDB = 3306;