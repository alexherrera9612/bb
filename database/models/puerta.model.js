//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');
var horario = `{"Mon":"00:00 - 24:00","Tue":"00:00 - 24:00","Wed":"00:00 - 24:00","Thu":"00:00 - 24:00","Fri":"00:00 - 24:00","Sat":"00:00 - 24:00","Sun":"00:00 - 24:00"}`

/*===================Alertas Model===================== */
var Puerta = db.define('puerta',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    tipo:{
        type: Sequelize.ENUM('reserva', 'privada', 'publica'),
        allowNull: false
    },
    descripcion:{
        type: Sequelize.STRING(100)
    }, 
    camaraId: {
        type: Sequelize.INTEGER,
    },
    edificioId: {
        type: Sequelize.INTEGER,
        allowNull : false
    },
    torreId: {
        type: Sequelize.INTEGER,
        allowNull : false
    },
    nivelId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    horario:{
        type: Sequelize.STRING(600),
        defaultValue: horario
    },
    left:{
        type: Sequelize.STRING(4)
    },
    top:{
        type: Sequelize.STRING(4)
    },
},
{
    tableName: 'puertas',
    timestamps: false
});

module.exports = Puerta;