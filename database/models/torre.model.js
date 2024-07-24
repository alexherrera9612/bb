//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');



/*===================Torre Model===================== */
var Torre = db.define('torre',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    edificioId: {
        type: Sequelize.INTEGER,
        allowNull : false
    }, 
    descripcion:{
        type: Sequelize.STRING(20),
        allowNull: false,       
    }
},
{
    tableName: 'torres',
    timestamps: false
});

 /* models.Torre.sync({force:true}).then(() => {
   console.log('Table Torre Created');
   }) 
 */

module.exports = Torre;