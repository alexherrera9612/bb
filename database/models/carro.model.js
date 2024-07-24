//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');




 /*===================Carro Model===================== */
var Carro = db.define('carro',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    tag:{
        type: Sequelize.STRING(20)
    },
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    },
    {
    tableName: 'carros',
    timestamps: false
})



/*  models.Carro.sync({force:true}).then(() => {
   console.log('Table Carros Created');
   })   */
/*======================================================*/

module.exports = Carro;