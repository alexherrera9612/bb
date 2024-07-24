//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');



 /*===================Nivel Model===================== */
var UserNivel = db.define('access_level',{
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    nivelId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    }
},
{
    tableName: 'access_level',
    timestamps: false
} )



  /*  models.UserNivel.sync({force:true}).then(() => {
   console.log('Table Niveles Created');
   })  */


   module.exports = UserNivel;

