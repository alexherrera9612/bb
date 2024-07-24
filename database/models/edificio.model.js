//import Libraries 
const { db } = require('../index');
const Sequelize = require('sequelize');


/*===================Edificio Model===================== */
var Edificio = db.define('edificio',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    descripcion:{
        type: Sequelize.TEXT,      
    },
    codigo_seguridad:{
        type: Sequelize.STRING(10),
        allowNull: false,
    },
    deviceId:{
        type: Sequelize.INTEGER,
        allowNull: false,
    }
},
{
    tableName: 'edificios',
    timestamps: false
})

module.exports = Edificio;