const xbee = require('./tools/com')
const EventEmitter = require('events');
const moment = require('moment');
const bitwise = require('bitwise');
const fs = require('fs');
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const MasterLec = require('./tools/MasterLecV1')
const Montacoches = require('./tools/BBMontacoches')
const { ID_DOORS, ID_DEVICE } = require('./cams');
const { CONNREFUSED } = require('dns');

const blockedID = []
const lockDoors = []
var statusDoors = []

const aStatus = {
    STANDBY: 0,
    ACTIVATE: 1
}
let stateVisit

const Tag = new EventEmitter()
const Log_events = new EventEmitter()
let sensorDoors = [] //setInterval(blinkLED, 250);


const alarms = [
    {alarm:'SECURITY' , out: new Gpio(  4, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'EMERGENCY', out: new Gpio( 17, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'DISARM'   , out: new Gpio( 18, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'DOOR_M'   , out: new Gpio( 27, 'out'), status: aStatus.STANDBY, door: ''},
    //{alarm:'DOOR_E'   , out: new Gpio( 22, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'DOOR_C'   , out: new Gpio( 23, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'DOOR_S'   , out: new Gpio( 24, 'out'), status: aStatus.STANDBY, door: ''},
    {alarm:'DOOR_S2'  , out: new Gpio( 25, 'out'), status: aStatus.STANDBY, door: ''}
]

//{alarm:'BARRIER'  , out: new Gpio( 22, 'in', 'both'), status: aStatus.STANDBY, door: ''}
var pushButton = new Gpio(22, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and 


pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
    try {
        if (err) { //if an error
            
            console.log("\x1b[41m%s\x1b[0m", `ERROR:ALARMS INPUT //TIME:${moment().format()}`, err);
            console.error(`ERROR:ALARMS INPUT: ${err} //TIME:${moment().format()}`);
            return
        }
        if(value != 0)
            console.log(`PIN VALUE ${value}`)
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:ALARMS INPUT //TIME:${moment().format()}`, err);
        console.error(`ERROR:ALARMS INPUT: ${err} //TIME:${moment().format()}`);
    }

});

xbee.xbeeAPI.on("frame_object", function (frame) {
    //console.table(frame)
    analizarTrama(frame);
});

const set_alarm = function (signal, status, idDoor) { //function to start blinking
    console.log(signal + "::" + status)
    if (signal === 'MUTE') {
        alarms.forEach(e => {
            set_alarm(e.alarm, aStatus.STANDBY)
        })
    } else {
        switch (signal) {
            case 'FORCED':
            case 'LONG_OPEN_DOOR':
                al = alarms.find(a => a.door === idDoor)
                if (al) {
                    al.out.writeSync(status)
                    al.status = status
                }
                break
            case 'ARM':
            case 'DISARM':
                status = signal === 'ARM' ? aStatus.ACTIVATE : aStatus.STANDBY
                signal = 'DISARM'
            default:
                al = alarms.find(alarm => alarm.alarm === signal)
                if (al) {
                    al.out.writeSync(status)
                    al.status = status
                }
                break
        }
    }
}
const on_start_alarms= function(signal, status){ //function to start blinking
    let alarmsFS
    try {
        alarms.forEach(al => {
            let tt = ID_DOORS.map((e) => e).find(a => a.alarm === al.alarm)
            if (tt) {
                al.door = tt.id
            }
        })
        alarmsFS = JSON.parse(fs.readFileSync('./alarms.json', 'utf8'))
        alarmsFS.forEach(e => {
            set_alarm(e.alarm, e.status)
        })
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:ALARMS FILE //TIME:${moment().format()}`, err);

    }
}
on_start_alarms()



const data_levels = function (data) {
    let doorsL = []

    let a_levels = [{ 8: 0 }, { 7: 0 }, { 6: 0 }, { 5: 0 }, { 4: 0 }, { 3: 0 }, { 2: 0 }, { 1: 0 },
    { 16: 0 }, { 15: 0 }, { 14: 0 }, { 13: 0 }, { 12: 0 }, { 11: 0 }, { 10: 0 }, { 9: 0 },
    { 24: 0 }, { 23: 0 }, { 22: 0 }, { 21: 0 }, { 20: 0 }, { 19: 0 }, { 18: 0 }, { 17: 0 }
    ]
    doorsL = data.user.doors
    let towerOrigin = data.towerId
    //console.log("===LEVELS===")
    //console.log(data)
    //console.log(`=======================`)
    //console.table(doorsL)
    //console.log(`=======================`)
    /////////FUNCION UNICAMENTE PARA BALCONES DEL PARQUE///////// 
    // EL ASCENSOR SE ACTIVA PARA TODOS LOS PISOS SOLO CON EL ENVIO DE LA PUERTA PRIVADA (17) PERO PARA ENVIAR EL [64,0,0]
    // QUE ES EL QUE ACTIVA EL PISO 7 SE DEBE USAR ESTA FUNCION QUE NO TIENE EN CUENTA EL (17) Y POR ENDE NO ENVIA [65,0,0]
    try {
        let uNiveles = [];
        doorsL.forEach(element => {
            console.table(element.floor.tower)
            console.log(`${data.localId} != ${element.localId} && ${towerOrigin} == ${element.floor.tower.id}`)
            if (data.localId != element.localId && towerOrigin == element.floor.tower.id) {
                console.log("PRIVATE DOOR ADD:" + parseInt(element.localId / 10, 10))
                uNiveles.push(parseInt(element.localId / 10, 10));
            }
        })
        //console.log(`$$============================`)
        //console.log(uNiveles);
        //console.log(`$$=============================`)
        uNiveles.forEach(element => {
            a_levels.find(function (value, index) {
                //console.log('Visited index ' + index + ' with value ' + value);
                //console.log(value);
                if (Object.keys(value) == element) {
                    console.log(Object.keys(value));
                    a_levels[index] = 1
                }

            })
        })
        a_levels.forEach(function callback(element, i) {
            if (element == 1) {
                a_levels[i] = 1;
            } else {
                a_levels[i] = 0;
            }
        });

        a_levels = [bitwise.byte.write(a_levels.slice(0, 8)),
        bitwise.byte.write(a_levels.slice(8, 16)),
        bitwise.byte.write(a_levels.slice(16, 24))]




        //sistema viejo
        //0|index    | tipo puerta: privada
        //0|index    | [ 128, 7, 0 ]
        //0|index    | puerta dentro del horario
        //0|index    | usuario dentro del horario
        //0|index    | Niveles 2: 3
        //0|index    | Sistema envio por xbee 0,0,32,1,3,1,10,10,0,128,7,0
        //0|index    | Modulo solicita sincronizacion

        //SSISTEMA NUEVO
        //0|index  | [ 0, 7, 0 ]
        //0|index  | 4
        //0|index  | Reader 0:4
        //0|index  | Sistema envio por xbee 0,0,32,1,4,1,30,30,50,0,7,0

        /*
        try{
            //mapeo el array de pisos sobre el tamaño del 0, y en dada una itero las puertas
            //si una de las puerta (p) coincide con la pos del a_levels, la seteo en 1 en la 
            //torre que corresponde
            a_levels.map(l=>l).find((value, index) =>{
                doorsL.map(d =>{
                    //console.log(d)
                    let p = parseInt(parseInt(d.localId,10)/10,10)
                    let t = d.floor.tower.id  
                    //console.log(`p: ${p} - t: ${t} = ${towerOrigin}`)
                    if(Object.keys(value) == p && t==towerOrigin){
                        a_levels[index]=1
                    }
                }) 
            })
            a_levels.forEach( (l,j,a) =>{
                if(l != 1){
                    a[j]=0
                }            
            })
            console.log(`=======================`)
            console.log(a_levels)
            console.log(`=======================`)
            let ll_a = a_levels.slice(0, 8)
            let ll_b = a_levels.slice(8, 16)
            let ll_c = a_levels.slice(16, 24)
            console.log(`=======================`)
            console.log(ll_a)
            console.log(`=======================`)
    
            a_levels = [bitwise.byte.write( ll_a),
                    bitwise.byte.write( ll_b), 
                    bitwise.byte.write( ll_c)]
        }
        catch(err){
            console.log(`ERROR BUSCANDO PRIVADOS ${err}`)
    
        }
        //console.log(`=============================`)
        */



    }
    catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:BUSCANDO PRIVADOS //TIME:${moment().format()}`, err);
    }
    //console.log(a_levels)
    return a_levels

}


const analizarTrama = (infoTrama) => {
    //Buffer 01 07 0b 00 00 01 09 12 86 d7 73 30 00 77 28 ed

    //PENDIENTE PANICO BALCONES
    //<Buffer 01 0e 0a 00 00 04 0a a1 4a df 0e 3a 00 ff 04 7f>
    //UNKNOWN DATA TYPE: 4

    // DATA {[0]:TYPE_ORIGIN ,[1]:ID_FROM, [3]:TYPE_COM, [3]:TYPE_DEST, [4]:ID_DEST

    //console.log('Modulo envia');
    if (infoTrama.type == 0x90) {// 0x90hx = 144d------------------------------------------------------------------------$
        //console.log('Modulo envia');
        //console.log(`TM: ${infoTrama.data[2]}`);
        //console.log('//////////////INI////////////');
        //console.log(infoTrama);
        //console.log('//////////////FIN////////////');
        if (infoTrama.data[2] == 0x0A && infoTrama.data[3] == 0x00) { //-----------------------Solicitud de u$
            //console.log('LECTORA PUERTA');
            processRequest(infoTrama)
        }
        else if (infoTrama.data[2] == 0x0B) {//----------------------------------------------------------------$
            console.log("RESPONSE:SENSOR:" + infoTrama.data[1])
            console.log(infoTrama)
            /* 
                        CERRADA
                        Buffer 01 01 0b 00 00 02 00 79 33 6b d5 f4 00 fe 50 ff
            
                        OPen
                        Buffer 01 01 0b 00 00 02 01 05 07 cf 65 a8 00 fe 50 ff
            */
            let idSensor = infoTrama.data[1]
            let originID
            ID_DOORS.map((e) => e.id).find(function (value, index) {
                if (value.split('/')[1] == idSensor) { //info.data[1]){
                    //MAUR PENDIENTE REVISAR CUANDO SON 2 MODULOS AL MISMO SENSOR
                    originID = value
                }
            })
            console.log('RESPONSE:to ID:' + originID)
            doorSensor = infoTrama.data[6]
            if (lockDoors.includes(originID)) {
                let id_door = lockDoors.find(data => data === originID);

                console.log("RESPONSE:LOCK DOOR:" + originID + ":::" + id_door)

                if (doorSensor == 0x00) {// LOCK DOOR IS CLOSE 
                    console.log("RESPONSE:LOCK DOOR:CAN OPEN:" + originID)
                    stateVisit = true

                    resRoutine(200, originID)
                } else { //LOCK DOOR IS OPEN
                    console.log("RESPONSE:LOCK DOOR:CANT OPEN:" + originID)
                    stateVisit = false
                    resRoutine(400, originID)
                }
                var index = lockDoors.indexOf(originID);
                if (index > -1) {
                    lockDoors.splice(index, 1);
                }
            } else {
                console.log("SIN PENDIENTES:" + originID)
            }

            if (infoTrama.data[3] == 0x00) { // PUERTAS CERRADAS
                //console.log("Module:"+element)
                //orderCoreToModule(parseInt(element,10),MasterLec.commands.open_motor)           
            }
            if (infoTrama.data[3] == 0x01) { // PUERTAS ABIERTAS
                //console.log("Module:"+element)
                //orderCoreToModule(parseInt(element,10),MasterLec.commands.open_motor2) 

            }
        }
        else if (infoTrama.data[2] == 0x21) {//----------------------------------------------------------------$
            //console.log('Modulo solicita sincronizacion');   
            processOrder(infoTrama)
            //console.log(infoTrama);      
        }
        else if (infoTrama.data[2] == 0x02) {//--------------LECTORAS VEHICULARES
            console.log('\x1b[44m%s\x1b[0m', `LECTORA VEHICULAR PUERTA ${infoTrama.data[0]}`); // id lectora uhf
            processReqCar(infoTrama)
        }
        else if (infoTrama.data[2] == 0x0A) { //botoneras
            console.log("Botonera:" + infoTrama.data[3] + ": stateVisit:" + stateVisit)
            console.log(infoTrama)
            //18 Puerta grande parqueadero visitantes //1:abre, 11:cierra
            //20 Puerta pequeñ parqueadero visitantes //1:abre, 11:cierra
            orderCoreToModule(129, MasterLec.commands.open)

            sleep(500).then(() => {
                if (infoTrama.data[3] == 0x01) {
                    if (stateVisit) { //true:cerrado
                        console.log("Open 1")
                        orderCoreToModule(18, MasterLec.commands.open_motor)
                        stateVisit = false
                    } else {
                        console.log("Close 1")
                        orderCoreToModule(18, MasterLec.commands.open_motor2)
                        stateVisit = true
                    }
                }
                if (infoTrama.data[3] == 0x02) {
                    if (stateVisit) { //true:cerrado
                        console.log("Open 2")
                        orderCoreToModule(20, MasterLec.commands.open_motor)
                        stateVisit = false
                    } else {
                        console.log("Close 2")
                        orderCoreToModule(20, MasterLec.commands.open_motor2)
                        stateVisit = true
                    }
                }
            });



        } else if (infoTrama.data[1] == 0x10) { //SENSOR BALCONES DEL PARQUE
            console.log("SENSOR:" + infoTrama.data[2])
            //console.log(infoTrama)

            let idSensor = infoTrama.data[2]
            let originID
            ID_DOORS.map((e) => e.id).find(function (value, index) {
                if (value.split('/')[1] == idSensor) { //info.data[1]){
                    //MAUR PENDIENTE REVISAR CUANDO SON 2 MODULOS AL MISMO SENSOR
                    originID = value
                }
            })
            console.log(originID)
            doorSensor = infoTrama.data[3]
            if (lockDoors.includes(originID)) {
                let id_door = lockDoors.find(data => data === originID);

                console.log("LOCK DOOR:" + originID + ":::" + id_door)

                if (doorSensor == 0x01) {// LOCK DOOR IS CLOSE 
                    console.log("OPEN DOOR:" + originID)
                    stateVisit = true

                    resRoutine(200, originID)
                } else { //LOCK DOOR IS OPEN
                    stateVisit = false

                    resRoutine(400, originID)
                }
                var index = lockDoors.indexOf(originID);
                if (index > -1) {
                    lockDoors.splice(index, 1);
                }
            } else {
                console.log("SIN PENDIENTES:" + originID)
            }

            if (infoTrama.data[3] == 0x01) { // PUERTAS CERRADAS
                //console.log("Module:"+element)
                //orderCoreToModule(parseInt(element,10),MasterLec.commands.open_motor)           
            }
            if (infoTrama.data[3] == 0x00) { // PUERTAS ABIERTAS
                //console.log("Module:"+element)
                //orderCoreToModule(parseInt(element,10),MasterLec.commands.open_motor2) 

            }

        }
        //else if(infoTrama.data[1] == 0x40 || infoTrama.data[1] == 0x30 || infoTrama.data[1] == 0x20){//--$
        //infoConsole(infoTrama)
        //}
        /*
        else if(infoTrama.data[1]==0x0A){//---------------------------------------------------------------$
            playCMD(infoTrama)                        
        }else if(infoTrama.data[1]==0x10){//---------------------------------------------------------------$
            playModuleRes(infoTrama)            
        }
        */
        else {
            console.log("///////TRAMA MODULO///////")
            console.log(infoTrama.data)
        }
    } else if (infoTrama.type == 0x92) {
        //console.log('TYPE 0X92 - 146'); 
        //console.log(infoTrama);
    } else if (infoTrama.type == 149) {
        console.log(`XBee On MAC = ${infoTrama.remote64.toUpperCase()}`)
    } else {
        console.log('infoTrama = ' + infoTrama.type);
        console.log(infoTrama);
    }
}



//FUNCION QUE RECIBE DEL SOCKET PARA PROCESAR APERTURAS
const resValidate = function (status, IDModulo, data) {
    //0|index  | [ 0, 0, 0, 0, 0, 0, 0, 0,-- 0, 0, 0, 0, 0, 0, 1, 0,-- 0, 0, 0, 0, 0, 0, 0, 0 ]
    //0|index  | [ 8, 7, 6, 5, 4, 3, 2, 1,--16,15,14,13,12,11,10,09,--24,23,22,21,20,19,18,17 ]
    //0|index  | [ 0, 2, 0 ]   

    console.log(`VALIDATE: ${IDModulo} // STATUS: ${status} //TIME:${moment().format()}`);
    let levels = []
    try {
        switch (status) {
            case 200:
            case 201:
                console.log(`USER CHECKED//TIME:${moment().format()}`)
                //console.log(data.user.doors)
                console.log(data.doorType + ":" + data.type)
                if (data.doorType == "PRIVATE" || data.type == "PRIVATE") {
                    levels = data_levels(data)
                }
                if (IDModulo.includes('m')) {
                    if (IDModulo.includes('.')) {
                        let s_id = IDModulo.split('.')
                        s_id = s_id[1]+'.'+s_id[0]
                        console.log(IDModulo)
                        IDModulo.split('.').forEach(function callback(element, i) {
                            if(i > 1)
                            s_id += '.'+element
                        })
                        
                        
                        IDModulo = s_id
                        console.log(IDModulo)
                    }
                }
                IDModulo.split('.').forEach(function callback(element, i) {
                    console.log(`Puerta:${element}`)
                    if (!blockedID.includes(element)) { // Only can use an ID when -t (seconds) occurred 
                        if (element.includes('-')) { //UNION PARA BLOQUEAR EL ID POR -t segundos
                            //console.log("En lista: "+element)
                            blockedID.push(element)
                            let t = parseInt(element.split('-')[1], 10) * 1000
                            sleep(t).then(() => {
                                console.log("FREE:" + element)
                                let index = blockedID.indexOf(element);
                                if (index > -1) {
                                    blockedID.splice(index, 1);
                                }
                            });
                        }
                        if (element.includes('m')) { //UNION PARA SABER QUE ES UN MODULO
                            console.log("Modulo BH: " + element)
                            //100,32,128,1,30,30,50


                            orderCoreToModule(parseInt(element, 10), MasterLec.commands.open)
                        }
                        else if (element.includes('e')) { //UNION PARA SABER QUE ES UN MODULO
                            console.log("Modulo BB: " + element)
                            //console.log(!levels.every(item => item === 0))
                            if (!levels.every(item => item === 0)) {
                                let id_door = ID_DOORS.find(data => data.id == IDModulo)
                                let cmdElevator
                                console.log("=================")
                                console.log(levels)
                                console.log("=================")
                                if (levels[0] == 1 || id_door.alarm == "IN_EXT") {
                                    console.log(id_door.arg.cmd)
                                    cmdElevator = id_door.arg.cmd
                                } else {
                                    console.log(id_door.arg.s1)
                                    cmdElevator = id_door.arg.s1
                                }
                                switch (cmdElevator) {
                                    case 'EXT_TO_P1': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.EXT_TO_P1, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    case 'EXT_TO_S0': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.EXT_TO_S0, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    //case 'EXT_TO_S0':reqCoreToLec(parseInt(element,10),Montacoches.commands.EXT_TO_S0,5);break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    case 'P1_TO_EXT': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.P1_TO_EXT, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    case 'S0_TO_EXT': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.S0_TO_EXT, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    case 'PLAT_P1': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.PLAT_P1, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                    case 'PLAT_S0': orderCoreToBuilding(parseInt(element, 10), Montacoches.commands.PLAT_S0, 5); break;//BuildingTypes.ID_ON_OFF_CONTROL);break
                                }
                            }
                        }
                        else if (element.includes('/')) { // UNION PARA SABER SI TIENE EXCLUSA ASOCIADA
                            var lockDoor = element
                            console.log("VALIDATE:LOCK DOOR:")
                            console.log(lockDoor)
                            //// REVISAR MAUR
                            // PENDIENTE CAMBIAR LA FORMA EN QUE SE PREGUNTA EL ESTADO DE UNA LECTORA.
                            console.log("VALIDATE:QUERY LOCK DOOR:" + parseInt(element.split('/')[1], 10) + ":" + MasterLec.request.doorState)

                            if (ID_DEVICE == '3fed2c6f-0022-47ea-933f-338746456e7f') {// BALCONES
                                orderCoreToModule(parseInt(element.split('/')[1], 10), MasterLec.commands.open)
                            } else {
                                //orderCoreToLec(parseInt(element.split('/')[1],10) ,MasterLec.commands.state_door)
                                reqCoreToLec(parseInt(element.split('/')[1], 10), MasterLec.request.doorState)
                            }


                            lockDoors.push(lockDoor);
                            console.log("List Door:")
                            console.log(lockDoors)
                        } else {
                            if (element.includes('S')) { //UNION PARA REPORTARLE AL USUARIO QUE LA ALARMA SE VA A ACTIVAR
                                let sensorZone = parseInt(element.split('S')[0], 10)
                                //MAUR REVISAR enviar a la lectora el timer para q el usuario sepa
                                console.log("SENSOR: Slow " + element)
                                orderCoreToLec(parseInt(element, 10), MasterLec.commands.slow, null)

                                //sensorDoors = [element, ] //setInterval(blinkLED, 250);

                                let t = parseInt(element.split('S')[1], 10) * 1000

                                //HOW TO CANCEL THE SLEEP WHEN ENTER THE ID
                                sleep(t / 2).then(() => {
                                    console.log("SENSOR: Fast " + element)
                                    // MAUR CONSULTAR EL ID ANTES DE ENVIAR
                                    orderCoreToLec(parseInt(element, 10), MasterLec.commands.fast, null)
                                });
                                sleep(t).then(() => {
                                    console.log("SENSOR: Security " + element)
                                    // MAUR CONSULTAR EL ID ANTES DE ENVIAR
                                    orderCoreToLec(parseInt(element, 10), MasterLec.commands.forced, null)
                                });

                            }
                            orderCoreToLec(parseInt(element, 10), MasterLec.commands.open, levels)
                            if (element.includes('+')) {
                                console.log("Module: Auto close: " + element)
                                sleep(60000).then(() => {
                                    orderCoreToModule(parseInt(element, 10), MasterLec.commands.open_motor2)     //INPERPI CMD 11        
                                });
                            }    
                            
                            //MAUR REVISAR TOCA QUITAR LO DE PAR E IMPAR CAMBIAR EL MODULO POR m
                            /*if (i == 0) { // The first element is the emitter, each even is a Module, each odd is a Reader
                                console.log("Reader 0:" + element)
                                console.log(levels)
                                orderCoreToLec(parseInt(element, 10), MasterLec.commands.open, levels)
                                
                            } else if (i % 2 == 0) { // odd is a Reader
                                console.log("Reader i:" + element)
                                orderCoreToLec(parseInt(element, 10), MasterLec.commands.open, null)
                            } else { //even is a Module
                                */
                                //console.log("Module:" + element)
                                
                                //if (status == 201) {
                                //    orderCoreToModule(parseInt(element, 10), MasterLec.commands.close_motor)
                                //} else {
                                //    orderCoreToModule(parseInt(element, 10), MasterLec.commands.open_motor) //PENDIENTE MAUR INPERPI CMD 11
                                //}                            
                                //SOLO POR INPERPI QUE EL ABRIR Y CERRAR SON EL MISMO COMANDO
                            
                            
                        }
                    } else {
                        console.log("ID BLOCKED: " + element)
                    }
                });
                break
            //ESTO SE HIZO PARA INPERPI PARA EL CODIGO DE LA PUERTA DEL SOTANO PENDIENTE POR REVISAR MAUR
            case 301:
                // REVISAR MAUR 
                // ESTE CODIGO SE HIZO DE PRUEBA PARA SACAR LAS PUERTAS DE LAS LISTAS CUANDO ERAN EXCLUSAS
                //var id_door = ID_DOORS.map((e) => e.id).find( data => data.split('.')[0] === info.data[1] );
                let originID
                ID_DOORS.map((e) => e.id).find(function (value, index) {
                    if (value.split('/')[1] == IDModulo) { //info.data[1]){
                        originID = value
                    }
                })
                console.log(originID)
                doorSensor = 0x01
                if (lockDoors.includes(originID)) {
                    let id_door = lockDoors.find(data => data === originID);

                    console.log("LOCK DOOR:" + originID + ":::" + id_door)

                    if (doorSensor == 0x01) {// LOCK DOOR IS CLOSE  
                        resRoutine(200, originID)
                    } else { //LOCK DOOR IS OPEN
                        resRoutine(400, originID)
                    }
                    let index = lockDoors.indexOf(originID);
                    if (index > -1) {
                        lockDoors.splice(index, 1);
                    }
                }
                break
            case 401:
                console.log(`USER BLOCKED//TIME:${moment().format()}`)
                orderCoreToLec(parseInt(IDModulo, 10), MasterLec.commands.denegate, null)
                break
            case 404:
                console.log('USER UNKNOWN')
                orderCoreToLec(parseInt(IDModulo, 10), MasterLec.commands.denegate, null)
                break
        }
    } catch (err) {
        console.log(`resValidate ${err} //TIME:${moment().format()}`)
    }
}
//FUNCION QUE RECIBE DEL SOCKET PARA PROCESAR ALARMAS
const resAlert = (data, IDModulo) => {
    let reader_cmd
    console.log(`ALERT: ${data.status}, ${IDModulo} //TIME:${moment().format()}`);
    switch (data.status) {
        case 'EMERGENCY':
            reader_cmd = MasterLec.commands.emergencyOn
            set_alarm(data.status, aStatus.ACTIVATE, IDModulo)
            if (global && global.io1) {
                console.log(`SMS TO MAUR: ${data.status}`);
                //global.io1.emit("event:notify", { buildingId: process.env.ID_DEVICE ,eventType: data.status})
            }
            break
        case 'PANIC':
        case 'FORCED':
            reader_cmd = MasterLec.commands.securityOn
            set_alarm(data.status, aStatus.ACTIVATE, IDModulo)
            break
        case 'MUTE':
            reader_cmd = MasterLec.commands.panicOff
            //set_alarm(data.status , aStatus.STANDBY , IDModulo)
            let data_t
            //FR = Software Reset. Reset module. Responds immediately with an OK status, and then performs a software reset about 2 seconds later
            //data_t = "FR" 
            //orderAT(data_t)
            //NR = Network Reset. Reset network layer parameters on one or more modules within a PAN.
            //Responds immediately with an “OK” then causes a network restart. All network
            //configuration and routing information is consequently lost.
            //If NR = 0: Resets network layer parameters on the node issuing the command.
            //If NR = 1: Sends broadcast transmission to reset network layer parameters on all nodes
            //in the PAN.
            data_t = "NR1"
            data_t = "OP"
            //orderAT(data_t)
            //process.exit(0)
            //configLec(16,MasterLec.config.reset)

            configLec(6, MasterLec.config.enableSensor)
            //configLec(1, MasterLec.config.enableSensor)
            //configLec(12,MasterLec.config.disableSensor)
            //configLec(103,MasterLec.config.disableSensor)
        case 'ARM':
        case 'DISARM':
            set_alarm(data.status, aStatus.STANDBY, IDModulo)
            break
        case 'DISCONNECT':
            reader_cmd = MasterLec.commands.disconnect
            break
    }
    if (reader_cmd) {  //} && reader_cmd==MasterLec.commands.panicOff){
        orderCoreToType(MasterLec.commands.type, reader_cmd, null)
    }
    try {
        fs.writeFileSync('./alarms.json', JSON.stringify(alarms, null, 2), 'utf-8');
    } catch (err) {
        //console.log(`ERROR FILE ALARMS:${err} //TIME:${moment().format()}`)
        console.log("\x1b[41m%s\x1b[0m", `ERROR:ALARMS FILE //TIME:${moment().format()}`, err);
        console.error(`ERROR:ALARMS FILE ${err} //TIME:${moment().format()}`);
    }
}
//FUNCION QUE RECIBE DEL SOCKET PARA PROCESAR FUNCIONES DEL SISTEMA
const resRoutine = (status, IDModulo) => {
    switch (status) {
        case 100:
            orderCoreToLec(parseInt(IDModulo, 10), MasterLec.commands.reconnection, null)
            break
        case 200:
            orderCoreToLec(parseInt(IDModulo, 10), MasterLec.commands.open, null)
            break
        case 400:
            orderCoreToLec(parseInt(IDModulo, 10), MasterLec.commands.denegate, null)
            break
    }
}
//FUNCION QUE ENVIA A LAS LECTORAS POR ID
const orderCoreToLec = (idDevice, infoCMD, data) => {
    let infoTrama = [];
    infoTrama.push(0);
    infoTrama.push(0);
    infoTrama.push(0x20);
    infoTrama.push(1);
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    if (data != null) {
        data.forEach(element => {
            infoTrama.push(element);
        });
    }
    xbee.sendCMD(infoTrama)
}
//FUNCION QUE ENVIA A LAS LECTORAS POR ID
const orderCoreToBuilding = (idDevice, infoCMD, DeviceType, data) => {
    let infoTrama = [];
    infoTrama.push(0);
    infoTrama.push(0);
    infoTrama.push(0x20);
    infoTrama.push(DeviceType);
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    if (data != null) {
        data.forEach(element => {
            infoTrama.push(element);
        });
    }
    xbee.sendCMD(infoTrama)
}
//FUNCION QUE ENVIA A LAS LECTORAS POR ID
const reqCoreToLec = (idDevice, infoCMD) => {

    console.log("Estados Lectora:" + idDevice)
    let infoTrama = [];

    infoTrama.push(0);//ID-ORIGIN
    infoTrama.push(0);//TYPE-ORIGIN
    infoTrama.push(0x10);//TYPE-COMUNICATION 0x10:Request //0x11:Response //0x20:Order //0x30:TYPE-ORDER //0x31:GROUP-ORDER
    infoTrama.push(1);//TYPE-DEST //1:READER //2:REMOTE //3:UHF //4:LIFT-READER //5:MODULES
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    xbee.sendCMD(infoTrama)
}
//FUNCION QUE ENVIA A LOS MODULOS POR TIPO // MAUR: PENDIENTE POR REVISAR
const orderCoreToType = (idDevice, infoCMD) => {
    let infoTrama = [];
    infoTrama.push(0);
    infoTrama.push(0);
    infoTrama.push(0x30);
    infoTrama.push(idDevice);
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    xbee.sendCMD(infoTrama)
}
//FUNCION QUE ENVIA A LOS MODULOS DIRECTO // MAUR: PENDIENTE POR REVISAR
const orderCoreToModule = (idDevice, infoCMD) => {
    let infoTrama = [];
    infoTrama.push(0x64);
    //infoTrama.push(0x32);
    infoTrama.push(0x20);
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    xbee.sendCMD(infoTrama)
}

//FUNCION QUE ENVIA A LOS MODULOS DIRECTO // MAUR: PENDIENTE POR REVISAR
const configLec = (idDevice, infoCMD, data) => {
    let infoTrama = [];
    infoTrama.push(0);
    infoTrama.push(0);
    infoTrama.push(0x50);
    infoTrama.push(1);
    infoTrama.push(idDevice);
    infoTrama.push(infoCMD.cmd);
    infoCMD.args.forEach(element => {
        infoTrama.push(element);
    });
    if (data != null) {
        data.forEach(element => {
            infoTrama.push(element);
        });
    }
    xbee.sendCMD(infoTrama)
}
//FUNCION QUE ENVIA AT // MAUR: PENDIENTE POR REVISAR
const orderAT = (infoCMD) => {
    //console.log(`order AT - infoCMD:${infoCMD}`)
    xbee.sendAT(infoCMD)
}
const processOrder = (info) => {
    if (info.data[5] == 0x01) { // Sync module UNICAST 
        console.log("SYNC UNICAST")
        console.log(info)
    } else if (info.data[5] == 0x03) {   // Update doorState 
        let id_door = find_door(info.data[1])
        switch (info.data[6]) {
            case 0x05:
                console.log(`DOOR (${info.data[1]}) LONG_OPEN_DOOR T:${moment().format()}`)
                state_event = "LONG_OPEN_DOOR"
                break
            case 0x07://PANICO//EMERGENCIA
                console.log(`DOOR (${info.data[1]}) PANIC T:${moment().format()}`)
                state_event = 'PANIC'
                break
            case 0x08://INTRUSO - SEGURIDAD
                console.log(`DOOR (${info.data[1]}) FORCED T:${moment().format()}`)
                state_event = 'FORCED'
                break
            case 0x09:
                console.log(`DOOR (${info.data[1]}) STANDBY T:${moment().format()}`)
                state_event = 'STANDBY'
                break
            case 0x0C:
                console.log(`DOOR (${info.data[1]}) CLOSE T:${moment().format()}`)
                state_event = 'CLOSE_DOOR'
                break
            case 0x0D:
                console.log(`DOOR (${info.data[1]}) OPEN T:${moment().format()}`)
                state_event = 'OPEN_DOOR'
                break
            case 0x0E:
                console.log(`DOOR (${info.data[1]}) PUSHBUTTON T:${moment().format()}`)
                state_event = 'PUSH_BUTTON'
                break
            case 0x0F:
                console.log(`DOOR (${info.data[1]}) SENSOR FORCED T:${moment().format()}`)
                state_event = 'SENSOR_FORCED'
                break
            case DEFAULT:
                console.log(`DOOR (${info.data[1]}) DEFAULT T:${moment().format()}`)
                break
        }
        try {
            //console.table(ID_DOORS)
            ID_DOORS.map((e) => e).find(data => data.id === id_door).state = state_event;
            //console.table(ID_DOORS)
        } catch (err) {
            console.log("UPDATE STATE:" + err)
        }

        let data = {
            status: state_event,
            door: id_door,
            door_way: 999,
            tag: state_event,
            date: moment().format()
        }
        //TOCO PONER UNA FUNCION QUE NOTIFIQUE DE UNA FORMA AL SERVER Y DE OTRA A LAS LECTORAS
        //resAlert Notifica a las lectoras
        //Log_events Notifica a el servidor
        //PANICO EN LAS LECTORAS ES EMERGENCIA
        //PANICO EN EL SERVER ES SEGURIDAD
        if (state_event == 'PUSH_BUTTON') {
            data.status = "EMERGENCY"
            resAlert(data, id_door)
            data.status = "PANIC"
        } else if (state_event == 'SENSOR_FORCED') {
            resAlert(data, id_door)
        }


        if (state_event != 'OPEN_DOOR' && state_event != 'CLOSE_DOOR'
            && state_event != 'PANIC') {
            //let a_door = [id_door,0,moment().format()] 
            if (state_event == "LONG_OPEN_DOOR" && id_door.includes('.')) {
                //REVISAR MAUR: PENDIENTE EVALUAR A QUE PUERTAS SI SE LES DEBE HACER EL CIERRE AUTOMATICO 
                console.log("ALERT:LONG DOOR OPEN:"+id_door)
                statusDoors.push(id_door)
                console.log(statusDoors)
            }
            if ((state_event == "FORCED" || state_event == "SENSOR_FORCED") && id_door.includes('.')) {
                //REVISAR MAUR: PENDIENTE EVALUAR A QUE PUERTAS SI SE LES DEBE HACER EL CIERRE AUTOMATICO 
                statusDoors.push(id_door)
                statusDoors.push(id_door)
                console.log(statusDoors)
                orderCoreToLec(parseInt(id_door.split('.')[0], 10), MasterLec.commands.panicOff, null)
                //resValidate(200,id_door,0)
            }
            var count = {}
            statusDoors.forEach(function (i) { count[i] = (count[i] || 0) + 1; })
            //console.log(count)

            Object.keys(count).forEach((key) => {
                console.log("ALERT: COUNT DOORS: ")
                console.log(count)
                if (count[key] > 1) {
                    console.log(key, count[key]);
                    resValidate(200, key, 0)
                    statusDoors = statusDoors.filter((item) => item !== id_door)
                    console.log(statusDoors)
                }
            })
        } else {
            if (state_event == "CLOSE_DOOR" && id_door.includes('.')) {
                //REVISAR MAUR: PENDIENTE EVALUAR A QUE PUERTAS SI SE LES DEBE HACER EL CIERRE AUTOMATICO 
                statusDoors = statusDoors.filter((item) => item !== id_door)
                console.log(statusDoors)
            }
        }
    }
};

const find_door = (door) => {
    try {
        let res = ID_DOORS.map((e) => e.id).find(data => parseInt(data.split('.')[0].split('-')[0].split('m')[0].split('/')[0].split('S')[0].split('+')[0], 10) === door)
        console.log(res)
        return res
    }
    catch (err) {
        //console.log(`ERROR BUSCANDO PUERTA ${err}//TIME:${moment().format()}`)
        console.log("\x1b[41m%s\x1b[0m", `ERROR:BUSCANDO PUERTA //TIME:${moment().format()}`, err);
    }
}

//proceso apertura tag
const processRequest = (info) => {
    console.log(info.data)
    if (info.data[5] == 0x02) {   // tag validate  
        let door_way = info.data[6]
        let stringTag = info.data.slice(7, 12).toString('hex').toUpperCase()
        console.log(`DOOR (${info.data[1]}) TAG: ${stringTag} T:${moment().format()}`)
        let data = {
            status: 'validate_tag',
            door: find_door(info.data[1]),
            door_way: door_way,
            tag: stringTag,
            date: moment().format()
        }
        Tag.emit('validate', data)

        ///MAUR PENDIENTE POR REVISAR SI ESTO DE LOS SENSORES SE DEBE PROCESAR ACA O EN OTRA RUTINA, ACTUALMENTE ES OTRO TIPO DE ENTRADA
        //RESPUESTA DE UNA CONSULTA A UNA LECTORA
    } else if (lockDoors.includes(info.data[1])) {
        let id_door = find_door(info.data[1])

        console.log("LOCK DOOR:RESPONSE:" + info.data[1] + ":::" + id_door)
        //MAUR PENDIENTE POR SABER CUAL ES ES DATA[X] DEL ESTADO
        if (info.data[6] == 0x01) {// LOCK DOOR IS CLOSE  
            resRoutine(200, info.data[1])
        } else { //LOCK DOOR IS OPEN
            resRoutine(400, info.data[1])
        }
        console.log("LOCK DOOR:" + info.data[1])
        let index = lockDoors.indexOf(info.data[1]);
        if (index > -1) {
            lockDoors.splice(index, 1);
        }
    } else if (info.data[5] == 0x03) {   // Update doorState 
        if (info.data[6] == 0x06) {//RECONNETED
            console.log(`DOOR (${info.data[1]}) DISCONNECTED`)
            resRoutine(100, info.data[1])
        }
    } else {
        console.log(`UNKNOWN DATA TYPE: ${info.data[5]}`);
    }
};
//proceso apertura tag lectora
const processReqCar = (info) => {
    if (info.data[1] == 0xA1) {   // tag validate
        let stringTag = info.data.slice(3, 11).toString('hex').toUpperCase()
        console.log('\x1b[44m%s\x1b[0m', 'TAG_CAR', stringTag);
        console.log(`DOOR (${info.data[0]}) CAR: ${stringTag} T:${moment().format()}`)
        let data = {
            status: 'validate_tag',
            door: find_door(info.data[0]),
            door_way: 11,
            tag: stringTag,
            date: moment().format()
        }
        Tag.emit('validate', data)
    }
    else {
        console.log(`El comando ${info.data[5]} no esta procesado`);
    }
};
/*else if(info.data[5]==cte.CONFIG_UNICAST){
        console.log('El modulo solicita coneccion')
    }  
    else if(info.data[5]==cte.UPDATE_STATE){
        if(info.data[6]==cte.RECONEXION){
            sendResponse(cte.RECONEXION,null,info,null)
        }
    }  
*/

orderCoreToType(MasterLec.commands.type, MasterLec.commands.panicOff, null)
//orderCoreToLec(11,MasterLec.commands.panicOff)
//configLec(2,MasterLec.config.enableSensor)


module.exports = {
    resValidate: resValidate,
    resAlert: resAlert,
    Tag: Tag,
    Log_events: Log_events,
    moment: moment
}




/*
let blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms

function blinkLED() { //function to start blinking
  if (ZONE5.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    ZONE5.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    ZONE5.writeSync(0); //set pin state to 0 (turn LED off)
  }
}

function endBlink() { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  ZONE5.writeSync(0); // Turn LED off
  //LED.unexport(); // Unexport GPIO to free resources
}
setTimeout(endBlink, 5000); //stop blinking after 5 seconds
*/
