//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');

 /*===================Reserva Model===================== */
 var Reserva = db.define('reserva',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    puerta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    fecha_Inicio:{
        type: Sequelize.DATE,
        allowNull: false
    },
    fecha_Fin:{
        type: Sequelize.DATE,
        allowNull: false
    },
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    },
    {
    tableName: 'reservas',
    timestamps: false
})



/*  models.Reserva.sync({force:true}).then(() => {
   console.log('Table Reservas Created');
   }) */
/*======================================================*/


module.exports = Reserva;