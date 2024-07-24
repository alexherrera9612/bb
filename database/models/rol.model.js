//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');





/*===================Rol Model===================== */
var Rol = db.define('rol',{
  cod: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      unique: true
  },
  reserva:{
      type: Sequelize.BOOLEAN, 
  },
  Descripcion:{
      type: Sequelize.TEXT, 
  },
  horario:{
      type: Sequelize.STRING(50),
      allowNull: false
  },
  
  },
  {
  tableName: 'roles',
  timestamps: false
})



/* models.Rol.sync({force:true}).then(() => {
 console.log('Table Solicitudes Created');
 }) */ 
/*======================================================*/

module.exports = Rol;