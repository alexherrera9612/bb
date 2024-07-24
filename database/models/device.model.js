//import Libraries 
const { db } = require('../index');
const Sequelize = require('sequelize');


/*===================Edificio Model===================== */
var Device = db.define('device',{
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true
    },
    descripcion:{
        type: Sequelize.TEXT,      
    },
    ip:{
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    mac:{
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    },
    {
    tableName: 'devices',
    timestamps: false
})

/* models.Edificio.sync({force:true}).then(() => {
   console.log('Table Edificio Created');
   }) */

   module.exports = Device;