//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');



 /*===================Nivel Model===================== */
var Nivel = db.define('nivel',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    descripcion:{
        type: Sequelize.STRING(10)
    },
    torreId: {
        type: Sequelize.INTEGER,
       // allowNull : false
    },
    edificioId: {
        type: Sequelize.INTEGER,
        allowNull : false
    }
},
{
    tableName: 'niveles',
    timestamps: false
} )



  /*  models.Nivel.sync({force:true}).then(() => {
   console.log('Table Niveles Created');
   })  */


   module.exports = Nivel;

