//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');

/*===================Apto Model===================== */
var Apto = db.define('apto',{
	  id: {
		  type: Sequelize.INTEGER,
		  primaryKey: true,
		  autoIncrement: true,
		  unique: true
	  },
	  categoria: {
		  type: Sequelize.STRING(20),
		  allowNull: false,
	  },
	  descripcion:{
		  type: Sequelize.STRING(5)
	  },
	  torreId: {
		  type: Sequelize.INTEGER,
		  allowNull : false
	  },
	  edificioId: {
		  type: Sequelize.INTEGER,
		  allowNull : false
	  }
  },{
		tableName: 'aptos',
		timestamps: false
	}
)



/*  models.Apto.sync({force:true}).then(() => {
 console.log('Table Aptos Created');
 }) */

 module.exports = Apto;