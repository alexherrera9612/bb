//import Libraries 
const { db } = require('./../index');
const Sequelize = require('sequelize');
var horario = `{"Mon":"00:00 - 24:00","Tue":"00:00 - 24:00","Wed":"00:00 - 24:00","Thu":"00:00 - 24:00","Fri":"00:00 - 24:00","Sat":"00:00 - 24:00","Sun":"00:00 - 24:00"}`

/*=====================User Models=============================*/
var User = db.define('user',{
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        unique: true
    },
    password: {
        type: Sequelize.STRING(250),
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    email:{
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,  
    },
    phone: {
        type: Sequelize.STRING(20),
    },
	
	
	
    tag:{
        type: Sequelize.STRING(20)
    },
    
	
	
	
	
	
	
    status:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    edificioId: {
        type: Sequelize.INTEGER,
    },
    torreId: {
        type: Sequelize.INTEGER,
    },
    aptoId: {
        type: Sequelize.INTEGER,
    },
    admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    rol: {
        type: Sequelize.ENUM('Residente','Servicio','Mantenimiento'),    
        defaultValue: 'Residente'
    },
    horario:{
        type : Sequelize.STRING(600),
        defaultValue: horario
    },
},
{
    tableName: 'users',
    timestamps: false
})


  

   module.exports = User;