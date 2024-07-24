// importing Bluebird promises so we can Promise.map
const Promise = require('bluebird');
//import db conf
const {db} = require('./../index');


const Edificio = require ('./../models/edificio.model');
const Torre = require ('./../models/torre.model');
const Apto = require ('./../models/apto.model');
const Nivel = require ('./../models/nivel.model');
const User = require ('./../models/user.model');
const Camara = require ('./../models/camara.model');
//const Group = require ('./../models/group.model');
const Puerta = require ('./../models/puerta.model');
//const AdminUser = require('../models/user_admin_model');
const Device = require('../models/device.model');
//const Carro = require ('./models/carro.model');

//Data to seed
const EdificioData = [
  // {
  //   descripcion: 'bsmart',
  //   codigo_seguridad :'123456',
  //   deviceId: 1
  // },
]

const DeviceData = [
  // {
  //   descripcion: 'bsmart',
  //   ip :'192.168.1.108',
  //   mac:'00:00:00:00:00'
  // },
]

const TorreData = [
  // {
  //   descripcion: '1',
  //   edificioId:'1'
  // }
]
const AptoData = [
  // {
  //   torreId: 1,
  //   categoria: '1',
  //   descripcion: '101'
  // },
  // {
  //   torreId: 1,
  //   categoria: '1',
  //   descripcion: '201'
  // }
]
const NivelData = [
  // {
  //   descripcion: 'lobby',
  //   torreId: 1
  // },
  // {
  //   descripcion: 'nivel 1',
  //   torreId: 1
  // }
]

const UserData = [
//   {
//     id: '1090448755',
//     name: 'Juan David',
//     email: 'jdavidguerrerocas@gmail.com',
//     password: '$2b$10$c9CHpz8rqiFPsZQpCCkUDeZwuFSzOLl.VBm9/4HnqE9hRKWFv0UvW',
//     phone: '3012340670',
//     status: true,
//     aptoId: 2,
//     torreId: 1,
//     tag: 'D9463663CA',
//     id_firebase: 'UVKs8yl50nRlwLPyYc1G1EzIC8N2',
//     rol: 'Residente',
//     horario: `{
//         "Mon":"00:00 - 24:00",
//         "Tue":"00:00 - 24:00",
//         "Wed":"00:00 - 24:00",
//         "Thu":"00:00 - 24:00",
//         "Fri":"00:00 - 24:00",
//         "Sat":"00:00 - 24:00",
//         "Sun":"00:00 - 24:00"
//       }`,
//   },
//   {
//     id:'12345678',
//     name: 'Mauricio Buritica',
//     email: 'mburitica@bsmart.com.co',
//     password: '$2b$10$c9CHpz8rqiFPsZQpCCkUDeZwuFSzOLl.VBm9/4HnqE9hRKWFv0UvW',
//     phone: '3012340670',
//     status: true,
//     aptoId: 2,
//     torreId: 1,
//     id_firebase: 'UVKs8yl50nRlwLPyYc1G1EzIC8N2',
//     rol: 'Residente',
//     horario: `{
//       "Mon":"00:00 - 24:00",
//       "Tue":"00:00 - 24:00",
//       "Wed":"00:00 - 24:00",
//       "Thu":"00:00 - 24:00",
//       "Fri":"00:00 - 24:00",
//       "Sat":"00:00 - 24:00",
//       "Sun":"00:00 - 24:00"
//     }`,
// }
]

const CamaraData = [
  // {
  //   key:"ULCAYA",
  //   ip:"192.168.1.105",
  //   descripcion:"Entrada",
  //   status: true,
  //   puertaId: 1
    
  // },
  // {
  //   key:"BPSZAT",
  //   ip:"192.168.2.67",
  //   descripcion:"Ascensor",
  //   status: true,
  //   puertaId: 2
    
  // }
]

const CarteleraData = [
  // {
  //   fecha_inicio: "2019-05-05",
  //   fecha_fin:"2019-05-20",
  //   mensaje:"primer cartelera"
  // },
  // {
  //   fecha_inicio: "2019-05-05",
  //   fecha_fin:"2019-05-10",
  //   mensaje:"segunda cartelera"
  // }
]

const PuertaData=[
  // {
  //   tipo: "publica",
  //   descripcion: "ascensor",
  //   camaraId: "2",
  //   nivelId: "1",
  //   horario: `{
  //       "Mon":"00:00 - 24:00",
  //       "Tue":"00:00 - 24:00",
  //       "Wed":"00:00 - 24:00",
  //       "Thu":"00:00 - 24:00",
  //       "Fri":"00:00 - 24:00",
  //       "Sat":"00:00 - 24:00",
  //       "Sun":"00:00 - 24:00"
  //     }`,
  //   left: 69,
  //   top: 10,
  // },
  // {
  //   tipo: "publica",
  //   descripcion: "entrada",
  //   camaraId: "1",
  //   nivelId: "1",
  //   horario: `{
  //       "Mon":"00:00 - 24:00",
  //       "Tue":"00:00 - 24:00",
  //       "Wed":"00:00 - 24:00",
  //       "Thu":"00:00 - 24:00",
  //       "Fri":"00:00 - 24:00",
  //       "Sat":"00:00 - 24:00",
  //       "Sun":"00:00 - 24:00"
  //     }`,
  //   left: 50,
  //   top: 20,
  // }
]


// Sync and restart db before seeding
db.sync({force:true})
.then(() => {
  console.log('synced DB and dropped old data');
})
// here, we go through all the models one by one, create each
// element from the seed arrays above, and log how many are created
.then(() => {
  return Promise.map(EdificioData, function(edificio) {
    return Edificio.create(edificio);
  })
})
.then(createdEdificios => {
  console.log(`${createdEdificios.length} Edificios created`);
})
.then(() => {
  return Promise.map(TorreData, torre => Torre.create(torre))
})
.then(createdTorres => {
  console.log(`${createdTorres.length} torres created`);
})
.then(() => {
  return Promise.map(AptoData, apto => Apto.create(apto))
})
.then(createdAptos => {
  console.log(`${createdAptos.length} Aptos created`);
})
.then(() => {
  return Promise.map(NivelData, nivel => Nivel.create(nivel))
})
.then(createdNiveles => {
  console.log(`${createdNiveles.length} niveles created`);
})
.then(() => {
  return Promise.map(UserData, user => User.create(user))
})
.then(createdUsers => {
  console.log(`${createdUsers.length} users created`);
})
.then(() => {
  return Promise.map(CamaraData, camara => Camara.create(camara))
})
.then(createdCamaras => {
  console.log(`${createdCamaras.length} camaras created`);
})
.then(() => {
  return Promise.map(PuertaData, puerta => Puerta.create(puerta))
})
.then(createdPuertas => {
  console.log(`${createdPuertas.length} puertas created`);
})
.then(() => {
  return Promise.map(DeviceData, device => Device.create(device))
})
.then(createdDevices => {
  console.log(`${createdDevices.length} devices created`);
})

.catch(err => {
  console.error('Error!', err, err.stack);
})
.finally(() => {
  db.close();
  console.log('Finished!');
  return null;
});


