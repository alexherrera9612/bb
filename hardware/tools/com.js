'use strict'

const xbee_api      = require('xbee-api');
const SerialPort    = require('serialport');
//const { setSceneAction } = require('../../bh-front-user/src/services/Building.service');

const xbeeAPI       = new xbee_api.XBeeAPI({ api_mode: 1 })
//const serial        = new SerialPort('COM3', { autoOpen: false })
const serial        = new SerialPort('/dev/ttyUSB0')
//const serial        = new SerialPort('/dev/ttyS0')
//const serial        = new SerialPort('/dev/tty.usbserial-AL021NQF')
const xbeeC         = xbee_api.constants;

const KNOWN_64    = `FFFFFFFFFFFFFFFF`;
const UNKNOWN_64  = `000000000000FFFF`;
const UNKNOWN_16  = `FFFE`;
let list_frame= []


//serial.pipe(xbeeAPI.parser);
//xbeeAPI.builder.pipe(serial);

serial.open(function (err) {
  /*if (err) {
    return console.log('Error opening port: ', err.message);
  }*/
 
  // Because there's no callback to write, write errors will be emitted on the port:
  // port.write('main screen turn on');
  console.log('PORT OK');
});

//serial.on("open", () => {
//    console.log('Puerto OK');
//});


let frameBuf = Buffer.from('')
let maxSize = 0
let b_atcmd = 0

/*serial.on('readable', function () {
  console.log('Data:', serial.read());
});

serial.on('error', (err) => {
    console.log(err.message);
});
*/

serial.on('data', function (data) {
    //console.log(`DA ${data.length} = ${data.toString('hex')}`); 
    //console.log(`FB ${frameBuf.length} = ${frameBuf.toString('hex')}`) 
    if(frameBuf.length===0){
        if(data.indexOf(0x7E)>=0){
            frameBuf = data.slice(data.indexOf(0x7E),data.lengt);
        }else if(data.indexOf(0x4F)>=0){
            if(data.indexOf(0x4B)>=0){
                if(frameBuf.indexOf(0x0D)>=0){
                    frameBuf = Buffer.from('')
                    maxSize = 0
                    console.log("==OK==OK==0==")
                    sendAT("BHXBRESET2")
                }else{
                    frameBuf = Buffer.concat([frameBuf,data])
                }
            }else{
                frameBuf = Buffer.concat([frameBuf,data])
            }
        }
    }else{
        frameBuf = Buffer.concat([frameBuf,data])      
    }
    
    do{
        if(frameBuf.length>=maxSize && maxSize>0){
            const Frame = frameBuf.slice(0,maxSize);
            if (frameBuf[0]===0x7E && xbeeAPI.canParse(Frame)){
                try{
                    //console.log(`XBeeAPI.parseRaw ${Frame}`)
                    xbeeAPI.parseRaw(Frame);
                }catch(err){
                    console.log(`XBeeAPI.parseRaw ${err}`)
                    process.exit(0);
                }
            }else if(frameBuf.indexOf(0x4F)>=0){
                if(frameBuf.indexOf(0x4B)>=0){

                    console.log("==OK==OK==1==")
                    sendAT("BHXBRESET2")
                }
                
            }else{
                console.log(`La trama no puede ser procesada = ${Frame.toString('hex')}`);
            }
            frameBuf = frameBuf.slice(maxSize,frameBuf.length);
            maxSize = 0;
        }        
        if(frameBuf.length>=3 && maxSize===0){
            if(frameBuf[0]===0x7E && frameBuf[1]===0x00){
                maxSize=frameBuf[2]+4;
            }else if(frameBuf.indexOf(0x4F)>=0){
                if(frameBuf.indexOf(0x4B)>=0){
                    if(frameBuf.indexOf(0x0D)>=0){
                        frameBuf = Buffer.from('')
                        maxSize = 0
                        console.log("==OK==OK==2==")
                        if(b_atcmd==0)
                        sendAT("BHXBRESET2")
                    }
                }
            }
            else{
                console.log('Trama colada')
                console.log(frameBuf)
                process.exit(0);  
            }
        }
    }while(frameBuf.length>=maxSize && maxSize>0);
    
});

//Rutinas de envio de tramas
const sendXbeeFrame = (trama) => {
    let a = xbeeAPI.buildFrame(trama)
    console.log("==TRAMA SALIDA==")
    console.log(a)
    console.log("==TRAMA SALIDA==")
    serial.write(a, err => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
    });       
};

// exportar metodos
const sendCMD = (data, dir64, unicast) => {
    //console.log(unicast)
    let d64;
    if(unicast){
        if(dir64) d64=dir64.toUpperCase()
    }
    else d64=UNKNOWN_64
    const trama = {
        type:               xbeeC.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
        id:                 0x00,
        destination64:      d64,
        destination16:      UNKNOWN_16,
        broadcastRadius:    0x00,
        options:            0x00, 
        data:               data
    };
    sendXbeeFrame(trama);
    console.log(`Sistema envio por xbee ${trama.data}`);
}

const sendAT = (data) => {
    let frameId = xbeeAPI.nextFrameId()
    let d = []
    d[0]=data.substr(0,2).toUpperCase()
    d[1]=data.substr(2,data.length).toUpperCase()
    
    if(list_frame.unshift(data)>10)
        list_frame.pop()

    console.table(d)
    if(d[0]=="BH"){
        if(d[1] == "REBOOT"){
            console.log("REBOOT " + process.pid)
            //process.exit(0); 
        }else if(d[1] == "XBRESET"){
            console.log("RESET")
            sendAT("RE")
        }else if(d[1] == "XBRESET1"){
            console.log("RE:OPEN+++")
            let a = "+++"   
            b_atcmd =0
            serial.write(a, err => {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
            }) 
        }else if(d[1] == "XBRESET2"){
            console.log("RE:ATAP1")
            let a = "ATAP1\r"
            b_atcmd=1
            serial.write(a, err => {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
            }) 
        }else{

            d[0]=d[1].substr(0,2).toUpperCase()
            d[1]=d[1].substr(2,data.length).toUpperCase()

            if(d[1].length%2>0 && d[1].length>0)
            d[1]="0".concat('',d[1])
            let t1
            if(d[1].length>0){
                let pairs = Array.from({ length: d[1].length / 2 }, (_, i) => d[1].slice(i * 2, i * 2 + 2))
                t1 = pairs.map(ch => {return parseInt(ch,16) })
            }else{
                t1 =[]
            }
            let frame = {
                type:               "BH",
                id:                 "BH",
                command:            d[0],
                commandParameter:   t1
            }
            console.log("##################################")
            console.table(list_frame)
            list_frame.unshift(frame)
            console.table(list_frame)
            console.log("##################################")
            frame = {
                    type:               xbeeC.FRAME_TYPE.AT_COMMAND,
                    id:                 frameId,
                    command:            d[0],
                    commandParameter:   t1
                };
            sendXbeeFrame(frame);
            console.log(`Sistema envio por xbee ${frame.command}`);
            return frame;
        }
    }else{
        if(d[1].length%2>0 && d[1].length>0)
            d[1]="0".concat('',d[1])
        let t1
        if(d[0]=="NI"){
            t1 = d[1].split('').map(ch => {return parseInt(ch.charCodeAt(0)) })
        }else if(d[1].length>0){
            let pairs = Array.from({ length: d[1].length / 2 }, (_, i) => d[1].slice(i * 2, i * 2 + 2))
            t1 = pairs.map(ch => {return parseInt(ch,16) })
        }else{
            t1 = []
        }
        let frame = {
                type:               xbeeC.FRAME_TYPE.AT_COMMAND,
                id:                 frameId,
                command:            d[0],
                commandParameter:   t1
            };
        sendXbeeFrame(frame);
        console.log(`Sistema envio por xbee AT`)
        console.table(frame)
        return frame;
    }


}
const getListFrame = () => {
    return list_frame
}

const filterFrame = (command) => {
    let bh_cmd = 0
    list_frame = list_frame.filter(function(item) { 
        console.table(item)
        if(item.type=='BH' && item.command==command){
            bh_cmd = 1
        }
        return item.type !== 'BH'   
    })
    return bh_cmd
}
//sendAT("BHXBRESET1")
module.exports = {
    sendCMD,
    sendAT,
    xbeeAPI,
    getListFrame,
    filterFrame

}
/*
xbeeCommand({
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    //destination64: "0013a2004086a04a",
    command: "DB",
    commandParameter: [],
}).then(function(f) {
    console.log("Command successful:", f);
}).catch(function(e) {
    console.log("Command failed:", e);
});
*/