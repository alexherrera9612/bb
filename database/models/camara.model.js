//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');

/*=================Model Camera========================*/
var Camara = db.define('camara',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    key: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    ip: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    descripcion:{
        type: Sequelize.STRING(100)
    },
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    puertaId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
	edificioId: {
        type: Sequelize.INTEGER,
        allowNull : false
    },
    torreId: {
        type: Sequelize.INTEGER,
        allowNull : false
    },
    nivelId: {
        type: Sequelize.INTEGER,
        allowNull : false
    }
	
    },
    {
    tableName: 'camaras',
    timestamps: false
})


/*   models.Camera.sync({force:true}).then(() => {
   console.log('Table Camera Created');
   }) 
 */

module.exports = Camara;