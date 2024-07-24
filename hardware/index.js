const rtsp = require('rtsp-ffmpeg');
const SocketIO = require("socket.io-client");
const axios = require('axios');
const digest = require("digest-fetch")




require('../config/config');
const fs = require('fs');
const connections = require('./connections');
const { check_dbOffline, check_csFile, clean_dataOffline, add_dataOffline, clean_TraceOffline } = require('./dbOffline');
const { streamsBS , ID_DOORS, ID_DEVICE, streamType } = require('./cams');
const { resValidate, resAlert, Tag, Log_events, moment } = require('./core');
const { Console } = require('console');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const wsUrl = process.env.API_URL_SOCKET || 'ws://localhost:3000'
console.log("======================")
console.log(`connecting to WS :${wsUrl} BuildingID: ${ID_DEVICE} //TIME:${moment().format()}`)
console.log("======================")
console.log("\x1b[41m%s\x1b[0m", `REBOOT: //TIME:${moment().format()}`);
console.error(`REBOOT: //TIME:${moment().format()}`);
console.log("======================")

const cardSocket = {}
const camSocket = SocketIO.connect(wsUrl+'/cams', {
  transports: ['websocket']
})


cardSocket.init =(io1) =>{ 
    let Register_Door
    check_csFile()
    io1.on('connect', () => {
      console.log('START CARD: '+new Date())       
      io1.emit("init_device", { buildingId: ID_DEVICE, doors: ID_DOORS.map((e) => e.id) })  
      console.log('===OFFLINE COPY===')
      io1.emit("offline_copy", { buildingId: ID_DEVICE })
      clean_dataOffline()
    })

    io1.on("offline_data", (data) => {
      console.log("::::BACKUP::::")
      //console.log(data)
      //console.log("::::BACKUP::::")
      check_dbOffline(data);
    })

    io1.on("door:setup", (data) => {
      console.log("::::SEPTUP DOOR: START::::")
      console.log(data)
      Register_Door = data.localId
      io1.emit("door:setup:response", { status: "OK" })
      sleep(600000).then(() => {
        console.log("::::SEPTUP DOOR: END::::")
        Register_Door = 250
      });
    })

    //notifica al servidor que hubo alguna alarma.
    Log_events.on('update_state',(data)=>{
      if (dbOnState){
        io1.emit("read_card", { buildingId: ID_DEVICE, door: data.door, tag: data.tag })
      }
    })

    Tag.on('validate',(data)=>{
        //console.log("data")
        console.log(data)
        console.log("======================")
        let IDdoor = parseInt(data.door)
        //console.log(IDdoor+"::"+ID_DEVICE)
        //console.log("======================")

        if(IDdoor == Register_Door){//REGISTRAR TARJETA
          console.log(`DOOR ${IDdoor} ->SERVER REGISTER: ${data.status}`)
          io1.emit("tag", { buildingId: ID_DEVICE, door: data.door, tag: data.tag })
        }else if (dbOnState && data==0){
          
          if(IDdoor > 0 &&  IDdoor < 255){//CONSULTAR TARJETA
              console.log(`DOOR ${data.door} ->SERVER OPEN DOOR: ${data.status}`)
              io1.emit("read_card", { buildingId: ID_DEVICE, door: data.door, tag: data.tag })
          }else{
            console.log(data)
          }
        }else{
          let userTag, offDoor, id_door

          try{
            dbOffline =JSON.parse(fs.readFileSync('./data.json', 'utf8'));
            //console.log("=========DB-OFFLINE UPDATED=============")
          }catch (err){
            //console.log(`ERROR LOADING DB-OFFLINE ${err}`)
            console.log("\x1b[41m%s\x1b[0m", `ERROR:LOADING DB-OFFLINE //TIME:${moment().format()}`, err);
            console.error(`ERROR:LOADING DB-OFFLINE: ${err} //TIME:${moment().format()}`);
          }
          //console.log(dbOffline)
          //console.log("=====USER TAG=================")
          userTag = dbOffline.cards.map((e) => e).find(tt => data.tag == tt.tag)

          /*dbOffline.cards.forEach(tt => {
            if(data.tag == tt.tag){
              userTag = tt
            }
          })*/
          //console.log(userTag)
          //console.log("=====ID DOORS=================")
          //console.log(ID_DOORS)
            
          id_door = ID_DOORS.map((e) => e.id).find( dd => dd.split(".")[0] == data.door || dd == data.door)  ;
          offDoor = dbOffline.doors.map((e) => e).find(dd => id_door == dd.localId)
          
          /*dbOffline.doors.forEach(dd => {
            //console.log(`ID: ${id_door} -- D_DOOR: ${data.door} -- DD_L_DOOR: ${dd.localId}`)
            if(id_door == dd.localId){
              //console.log(`ID: ${id_door} -- D_DOOR: ${data.door} -- DD_L_DOOR: ${dd.localId}`)
              offDoor = dd
              //return dd
            }
          })*/
          //console.log("=====DOOR=================")
          //console.log(offDoor)
                         
          if(userTag && id_door && offDoor){ 
            if(offDoor.type != "PUBLIC"){
              console.log("PRIVATE - RESERVED")
              //dbOffline.accesses
              offDoor = dbOffline.doors.map((e) => e).find(dd => id_door == dd.localId)

              let user_access = []
              dbOffline.accesses.forEach(aa => {
                if(userTag.userId == aa.userId){
                  let aa_structure = {}
                  aa_structure.id = aa.doorId
                  aa_structure.localId = dbOffline.doors.map((e) => e).find(a => a.id === aa.doorId).localId
                  aa_structure.doorType = dbOffline.doors.map((e) => e).find(a => a.id === aa.doorId).type
                  let aa_tower = {}
                  aa_tower.id = 
                  aa_structure.floor = {
                    'id':0, 
                    'tower': {'id':dbOffline.doors.map((e) => e).find(a => a.id === aa.doorId).towerId}
                  }   
                  //aa_structure.floor.tower.id = 3            
                  //console.log("=====AA ACCESS=================")
                  //console.log(aa_structure)
                  //console.log("======================")  
                  user_access.push(aa_structure);
                }
              })

              //console.log("=====USER ACCESS=================")
              //console.log(user_access)
              //console.log("======================")              


              let access_door = user_access.map((e) => e).find(ua => ua.id == offDoor.id)

              if(access_door!=null){
                  console.log("========PERMITED=========")
                  //console.log(offDoor)
                  var user = {}
                  user.id = userTag.userId;
                  user.doors = user_access;
                  offDoor['user']=user
                  //console.log("=====USER ACCESS=================")
                  //console.log(offDoor)
                  //console.log(user_access)
                  //console.log("======================")


                  user_access = []
                  resValidate(200,offDoor.localId,offDoor)
                  ////EVENTS SYNC LOG
                  let dataoff = { 
                    tag: userTag.tag, 
                    userId: userTag.userId, 
                    doorId: offDoor.id, 
                    timestamp: Date.now() 
                  }
                  add_dataOffline(dataoff)
                  /////MUTE OFFLINE
                  let panic_door = ID_DOORS.map((e) => e).find(a => a.state === 'PANIC')

                  console.log("========PANIC DOOR=========")
                  console.log(panic_door)
                  if(panic_door==null){
                    console.log("========PANIC NULL=========")
                  }else if(panic_door!=null && offDoor.localId == 3 || offDoor.localId == 8){
                    let tempdata={
                      status: "MUTE",
                      door : 1,
                      door_way : 999,
                      tag: "MUTE",
                      date: moment().format()
                    }
                    resAlert(tempdata,999)
                    panic_door = null
                  }
                }
            }else{
              console.log("=====OPEN======")
              resValidate(200,offDoor.localId,offDoor)

              ////EVENTS SYNC LOG
              let dataoff = { 
                tag: userTag.tag, 
                userId: userTag.userId, 
                doorId: offDoor.id, 
                timestamp: Date.now() 
              }
              add_dataOffline(dataoff)

              /////MUTE OFFLINE
              let panic_door = ID_DOORS.map((e) => e).find(a => a.state === 'PANIC')
              console.log("========PANIC DOOR=========")
              console.log(panic_door)
              if(panic_door==null){
                console.log("========PANIC NULL=========")
              }else if(panic_door!=null && offDoor.localId == 3 || offDoor.localId == 8){
                let tempdata={
                  status: "MUTE",
                  door : 1,
                  door_way : 999,
                  tag: "MUTE",
                  date: moment().format()
                }
                resAlert(tempdata,999)
              }
              panic_door=null
            }
          }else{
            console.log("=====NOT RECOGNIZED======")
            resValidate(404,data.door,offDoor)
            console.log(`DOOR UNKNOWN TRY: ${data.door}`)

            let panic_door = ID_DOORS.map((e) => e).find(a => a.state === 'PANIC')

            console.log("========PANIC DOOR=========")
            console.log(panic_door)
            if(panic_door==null){
              //console.log("========PANIC NULL=========")
            }else if(panic_door!=null && data.door == 250){
              let tempdata={
                status: "MUTE",
                door : 1,
                door_way : 999,
                tag: "MUTE",
                date: moment().format()
              }
              resAlert(tempdata,999)
              panic_door = null
            }
            
          }
        }
    })
    io1.on("door_access", (data) => {
        console.log("ON:door_access")
        console.log(data)
        resValidate(data.status,data.localId,data)        
    })
    io1.on("system_event", (data) => {
      console.log("ON:SYSTEM_EVENT")
      console.log(data)       
      resAlert(data,999)

      
      
      //PRUEBAS OFFLINE
      /*
      if(data.status === 'PANIC'){
        console.log(dbOffline)       
      }else if(data.status === 'EMERGENCY'){
        dbOffline =JSON.parse(fs.readFileSync('./data.json', 'utf8'));  
      }else if(data.status === 'MUTE'){
        let data={
          status: 'validate_tag',
          door : "4",
          door_way : "10",
          tag: "B667DA7378"
        }
        Tag.emit('validate',data) 
      }*/

    })

    io1.on("card:sync_events:response", (data) => {
      //console.log("CARDS:SYNC_EVENTS:RESPONSE:")
      //console.log(data);
      clean_TraceOffline(data)  
    })
    io1.on('reconnect', (attemptNumber) => {
        console.log("RECONNECT:"+attemptNumber)
        if(attemptNumber>=5){
            let alert={
                status: "DISCONNECT",
                door : 999,
                door_way : 999,
                tag: "DISCONNECT",
                date: moment().format()
            }
            //resAlert(alert,999)
        }   
    })
    io1.on('connect_error', (error) => {
      console.log("\x1b[41m%s\x1b[0m", `ERROR:connect_error //TIME:${moment().format()}`, error.message||error.description.message);
      console.error(`ERROR:connect_error: ${error.message||error.description.message} //TIME:${moment().format()}`);

      let alert={
          status: "DISCONNECT",
          door : 999,
          door_way : 999,
          tag: "DISCONNECT",
          date: moment().format()
      }
      //resAlert(alert,999)
      try{
        dbOnState = false
        if(check_csFile()){
            console.log(`DB UPDATED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
        }else{
            console.log(`DB FAILED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
            dbOffline =JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        }
      }catch (err){
        console.log(`ERROR DISCONNECT SOCKET CARDS ${err} //TIME:${moment().format()}`)
      }
  
    })
    io1.on('reconnect_failed', (error) => {
      console.log("\x1b[41m%s\x1b[0m", `ERROR:reconnect_failed //TIME:${moment().format()}`, error.message||error.description.message);
      console.error(`ERROR:reconnect_failed: ${error.message||error.description.message} //TIME:${moment().format()}`);

      let alert={
          status: "DISCONNECT",
          door : 999,
          door_way : 999,
          tag: "DISCONNECT",
          date: moment().format()
      }
      //resAlert(alert,999)
      try{
        dbOnState = false
        if(check_csFile()){
            console.log(`DB UPDATED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
        }else{
            console.log(`DB FAILED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
            dbOffline =JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        }
      }catch (err){
        console.log(`ERROR DISCONNECT SOCKET CARDS ${err} //TIME:${moment().format()}`)
      }
  
    })
    io1.on('disconnect', (reason) => {
      console.log(`CARDS DISCONNECTED: ${reason}`)
      console.log("\x1b[41m%s\x1b[0m", `ERROR:CARDS DISCONNECTED //TIME:${moment().format()}`, reason);
      
      let alert={
          status: "DISCONNECT",
          door : 999,
          door_way : 999,
          tag: "DISCONNECT",
          date: moment().format()
      }
      //resAlert(alert,999)
      try{
        dbOnState = false
        if(check_csFile()){
            console.log(`DB UPDATED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
        }else{
            console.log(`DB FAILED = ${checksumSys}-DB_ONLINE:${dbOnState}`)
            dbOffline =JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        }
      }catch (err){
        console.log(`ERROR DISCONNECT SOCKET CARDS ${err} //TIME:${moment().format()}`)
      }
    })
}


let test = 2;
let pollPromise = null
const client = new digest("admin","bluehome1328")
camSocket.on('connect', () => {
    console.log('WS CAMERAS OPEN')
    if(streamType=="jpeg"){
      if(test==1) console.log("STREAM: JPEG")
      if (pollPromise === null) {
        if(test==1) console.log("STREAM: POLL NULL")
        pollPromise = poll()
      }else{
        if(test==1) console.log("STREAM: POLL FULL")
      }

    } else {
      if(test==1) console.log("STREAM: RTSP");
      const pipeStream = (camId) => {
        return (data) => {
          if (camSocket.connected) {
            // console.log('sending data', camId)
            // Convert to Base64 if we want to support rendering stream to an img tag
            // camSocket.emit(camId, data.toString('base64'))
            camSocket.emit("cam_stream", { buildingId: ID_DEVICE, camId, stream: data, timestamp: Date.now() })
          }else{
            console.log('Error sending data to API', camId)
          }
        }
      }

      streamsBS.forEach(({ id, stream }) => {
        stream.on('data', pipeStream(id))
      })
    }
  })

  camSocket.on('disconnect', (reason) => {
    console.log('WS CAMERAS DISCONNECTED')
    if(streamType!="jpeg"){
      if(test==1) console.log("DISCONNECT:REMOVE RTSP");
      streamsBS.forEach(({ id, stream }) => {
        stream.removeAllListeners(['data'])
        stream.stop()
      })
    }else{ ///TOCA HACER ALGO CUANDO NO HAYA CONEXION
      if(test==1) console.log("DISCONNECT:JPEG");
    }
  })

  function getStreamImages() {
    return streamsBS.map((resource, index) => {
      let { id: camId, stream, ip, path, timer = null } = resource
      //console.log({ camId, timestamp: Date.now(), event: 'START' })
      if(test==1) console.log("GETSTREAMS");
      // if current resource (stream) failed for more than or equal to 10 times
      // then don't do anything and skip that stream for 10min
      if (resource.retries && resource.retries >= 3) {
        if(test==1) console.log("GETSTREAMS:RETRIES >= 3");
        if (!timer) {
          if(test==1) console.log("GETSTREAMS:!TIMMER");
          timer = setTimeout(() => {
            if(test==1) console.log("GETSTREAMS:SETITIMEOUT");
            resource.retries = 0
            resource.timer = null
          }, 600000)

          resource.timer = timer
        }

        // Don't do anything if already failed more than 10 times
        return Promise.resolve()
      }

      const options = {
        responseType: 'arraybuffer',
        hostname: ip,
        //port: 80,
        path: path,
        method: 'GET',
        timeout: 5000,
        url: stream,
        uri: stream,
        headers: {
          'Content-Type': 'image/jpeg'
        },
        auth: {
          user: "admin",
          pass: "bluehome1328",
          sendImmediately: false,
        },
      };
              
      const options2 = {
        responseType: 'arraybuffer',
        method: 'GET',
        timeout: 5000,
        encoding: "binary",
        uri: stream,
        headers: {
          'Content-Type': 'image/jpeg'
        },
        auth: {
          user: "admin",
          pass: "bluehome1328",
          sendImmediately: false,
        },
      };      
      return axios.request(options)
      .then( ({ data }) => {
        if(test==1) console.log("TEST===365");
        if (camSocket.connected) {
          //console.log(`sending data cam/jpg:${camId}`)
          //console.log("IMG===" + data);
          if(test==1) console.log("TEST===369");
          camSocket.emit("cam_stream", { buildingId: ID_DEVICE, camId, stream: data, timestamp: Date.now() })
        }

        if (resource.timer) {
          if(test==1) console.log("TEST===374");
          clearTimeout(resource.timer)
          resource.timer = null
        }
        resource.retries = 0
        //console.log({ camId, timestamp: Date.now(), event: 'SEND' })
        //console.log(`${camId}, timestamp: ${Date.now()}, event: 'SEND'`)
      })
      .catch(function (error) {
        if(test==1) console.log("TEST===383");
        // handle error
        //console.log({ camId, timestamp: Date.now(), event: 'ERROR', stream, error: `${error}` })
        //console.log("\x1b[43m%s\x1b[0m", `ERROR:Axios //TIME:${moment().format()}, e:`, error.response.status);
        if(error.response.status && error.response.status== 401){
          if(test==1) console.log("TEST===388");
          //console.log("\x1b[45m%s\x1b[0m", `ERROR:401 //TIME:${moment().format()}`);
          //console.log(`ERROR CAM: ${camId} sending data cam/jpg: ${stream} reason: ${error}, timestamp: ${moment().format()}`)
          
          return client
          .fetch(stream, options)
          .then((resp) => resp.arrayBuffer())
          .then((data) => {
            if(test==1) console.log("TEST===396");
            if (camSocket.connected) {
              if(test==1) console.log("TEST===398");
              //console.log(`sending data building:${ID_DEVICE} camId:${camId}`);
              camSocket.emit("cam_stream", { buildingId: ID_DEVICE, camId: camId, stream: data, timestamp: Date.now() });
            }
            if (resource.timer) {
              if(test==1) console.log("TEST===403");
              clearTimeout(resource.timer)
              resource.timer = null
            }
            resource.retries = 0
          }).catch(function (error) {
            if(test==1) console.log("TEST===409");
            console.log(`${camId}, error Fetch:${error}`)
            if (resource.retries) {
              if(test==1) console.log("TEST===410");
              resource.retries++
            } else {
              if(test==1) console.log("TEST===415");
              resource.retries = 1
            }
          })
    
        }else{
          if(test==1) console.log("TEST===421");
          //console.log(`${camId}, timestamp: ${moment().format()}, event: 'ERROR', ${stream}, error:${error}`)
          if(test==1) console.log(`${camId}, error Axios:${error}`)
          //console.log(`ERROR: Axios ${error} //TIME:${moment().format()}`)
          //console.log("\x1b[41m%s\x1b[0m", `ERROR:Axios //TIME:${moment().format()}`,error);
        }

        if (resource.retries) {
          if(test==1) console.log("TEST===429");
          resource.retries++
        } else {
          if(test==1) console.log("TEST===432");
          resource.retries = 1
        }
        if(test==1) console.log("TEST===435");
      })
    })
  }

  function poll() {
    let promises = getStreamImages()
    if(test==1) console.log("TEST===442");
    return Promise.all(promises).then(() => {
      try{
        if(test==1) console.log("TEST===445");
        sleep(1000).then(() => {
        poll()       
      });}
      catch(err){
        if(test==1) console.log("TEST===450");
        //console.log(`ERROR LOADING DB-OFFLINE ${err}`)
        console.log("\x1b[41m%s\x1b[0m", `ERROR:SLEEP CAMS //TIME:${moment().format()}`, err);
        console.error(`ERROR:SLEEP CAMS: ${err} //TIME:${moment().format()}`);
        poll()
      }
      
    }).catch(function (error) {
      if(test==1) console.log("TEST===457")
      poll()
    })
  }

module.exports ={ cardSocket, camSocket};
