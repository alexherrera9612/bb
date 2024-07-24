//Require General Settings
require('./../config/config')

//Import Libraries
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DBname, process.env.usernameDB, process.env.passwordDB,{
    host: process.env.hostDB,
    dialect: 'mariadb',
    port: process.env.portDB,
    logging: false,
    dialectOptions: {
      timezone: process.env.db_timezone
    },
    timezone: process.env.db_timezone
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection with DataBase has been established \x1b[32mSuccessfully\x1b[0m.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = { db : sequelize };

//Models to associations
const Edificio = require ('./models/edificio.model');
const Torre = require ('./models/torre.model');
const Apto = require ('./models/apto.model');
const Nivel = require ('./models/nivel.model');
const User = require ('./models/user.model');
const Camara = require ('./models/camara.model');
const Puerta = require ('./models/puerta.model');
const Device = require('./models/device.model');
const UserNivel  = require('./models/userlevels.model');
//const Carro = require ('./models/carro.model');
//const Group = require ('./models/group.model');

Edificio.hasMany(Torre);
Edificio.hasMany(Apto);
Edificio.hasMany(Nivel);
Edificio.hasMany(Puerta);
Edificio.hasMany(Camara);
Edificio.hasMany(User);
Edificio.hasOne(Device);
Torre.belongsTo(Edificio);
Torre.hasMany(Apto);
Apto.belongsTo(Torre);
Apto.belongsTo(Edificio);
Torre.hasMany(Nivel);
Nivel.belongsTo(Torre);
Nivel.belongsTo(Edificio);
Apto.hasMany(User);
User.belongsTo(Apto);
User.belongsTo(Torre);
User.belongsTo(Edificio);
User.belongsToMany(Nivel, {through: 'access_level'});
Nivel.belongsToMany(User, {through: 'access_level'}); 
Nivel.hasMany(Puerta);
Puerta.belongsTo(Nivel);
Puerta.belongsTo(Edificio);
Puerta.hasOne(Camara);
Camara.belongsTo(Edificio);
User.hasMany(UserNivel);
Nivel.hasMany(UserNivel);