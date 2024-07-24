const cron = require('node-cron')
const moment = require('moment')
const fs = require('fs')
const { Tag } = require('./core')
const { ID_DEVICE } = require('./cams');

global.checksumSys = "Inicial.ck"
global.checksumFile = "Inicial.ckf"
global.dbOnState = false
global.dbOffline = {}
global.events_sync = {}


try {
    checksumSys = checksumFile =JSON.parse(fs.readFileSync('./checksum.json', 'utf8'));
} catch (err) {
    checksumSys = "Inicial.ck"
    checksumFile = "Inicial.ckf"
    console.log('ERROR EN CHECKSUM FILE:'+err ) 

}

const check_csFile = function(){
    try {
        if(checksumFile  == "Inicial.ckf" && checksumSys == "Inicial.ck"){
            return true
        }else{
            checksumFile =JSON.parse(fs.readFileSync('./checksum.json', 'utf8'));
            if(checksumFile == checksumSys || checksumSys == "Inicial.ckf")
                return true
            else
                return false
        }
        
    } catch (err) {
        checksumFile = "ERROR"
        console.log('ERROR EN CHECKSUM FILE:'+err ) 
        return false
    }
}
// ESTA FUNCION VERIFICA EL ESTADO DE LA BASE DE DATOS COMPARADA CON EL SISTEMA LOCAL
const check_dbOffline = function(onlineData){
    if( checksumSys != onlineData.checksum){
        console.log("WEB CS: "+onlineData.checksum);
        checksumSys = onlineData.checksum
        dbOffline = onlineData
        dbOnState = true
        try{
            fs.writeFileSync('./data.json', JSON.stringify(onlineData, null, 2) , 'utf-8');
        }catch (err){
            console.log("\x1b[41m%s\x1b[0m", `ERROR:WR OFFLINE DATA //TIME:${moment().format()}`, err);
            console.error(`ERROR:WR OFFLINE DATA: ${err} //TIME:${moment().format()}`);
        }
        try{
            fs.writeFileSync('./checksum.json', JSON.stringify(onlineData.checksum, null, 2) , 'utf-8'); 
        }catch (err){
            console.log("\x1b[41m%s\x1b[0m", `ERROR:WR OFFLINE CHECK //TIME:${moment().format()}`, err);
            console.error(`ERROR:WR OFFLINE CHECK: ${err} //TIME:${moment().format()}`);
             }
    }else{
        console.log("Data Updated!")
        dbOnState = true
    }
};
const add_dataOffline = function(offlineData){
    let events_syncFS
    let traces_offline = []
    console.log(`TRACE:ADD //TIME:${moment().format()}`);
    try {
        events_syncFS =fs.readFileSync('./events_sync.json', 'utf8');
        //console.log("=========EVENTS_SYNC OPEN=============")
        //console.log(events_syncFS)
        let dataOff = {  
            tag: offlineData.tag, 
            userId: offlineData.userId, 
            doorId: offlineData.doorId , 
            timestamp: Date.now() 
        }
        traces_offline.push(dataOff);
        //console.log("=========TRACES=============")
        //console.log(traces_offline)
        if(!events_syncFS){
            //console.log(`TRACE:NEW FILE //TIME:${moment().format()}`);
            fs.writeFileSync('./events_sync.json', JSON.stringify(traces_offline, null, 2), 'utf-8', function (err) {
                if (err){
                    console.log("\x1b[41m%s\x1b[0m", `ERROR:WR EVENTS_SYNC NEW //TIME:${moment().format()}`, err);
                    console.error(`ERROR:WR EVENTS_SYNC NEW: ${err} //TIME:${moment().format()}`);    
                    throw err;
                } 
                console.log('WR EVENTS_SYNC NEW!');
            });
        }else{
            let a_traces = JSON.parse(events_syncFS);
            //console.log("=========traces=============")
            //console.log(a_traces)
            a_traces.forEach(tt => {
                //console.log("=========ADD traces=============")
                traces_offline.push(tt);
            })
            //console.log("=========TRACES ADDED=============")
            //console.log(traces_offline)
            //console.log(`TRACE:ADD TO FILE //TIME:${moment().format()}`);
            fs.writeFileSync('./events_sync.json', JSON.stringify(traces_offline, null, 2), 'utf-8', function (err) {
                if (err){
                    console.log("\x1b[41m%s\x1b[0m", `ERROR:WR EVENTS_SYNC ADD //TIME:${moment().format()}`, err);
                    console.error(`ERROR:WR EVENTS_SYNC ADD: ${err} //TIME:${moment().format()}`);    
                    throw err;
                } 
                console.log('WR EVENTS_SYNC ADD!');
            });
        }
        //console.log("=========END ADD EVENTS_SYNC FILE=============")
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:EVENTS_SYNC FILE //TIME:${moment().format()}`, err);
        console.error(`ERROR:EVENTS_SYNC FILE: ${err} //TIME:${moment().format()}`);
    }
};
const clean_dataOffline = function(){
    let events_syncFS
    //console.log(`TRACE:CLEAN ALL //TIME:${moment().format()}`);
    try {
        events_syncFS =JSON.parse(fs.readFileSync('./events_sync.json', 'utf8'))
        //console.log(events_syncFS)
        events_syncFS.forEach(trace => {
            let trace_emit = { 
                buildingId: ID_DEVICE, 
                tag: trace.tag, 
                userId: trace.userId, 
                doorId: trace.doorId , 
                timestamp: trace.timestamp 
            }
            if(global && io1){
                //console.log(trace_emit)
                io1.emit("card:sync_events", trace_emit)
            }
            
        })
        console.log(`TRACE: CLEAN ALL END//TIME:${moment().format()}`)
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:EVENTS_SYNC FILE //TIME:${moment().format()}`, err);
    }
};
const clean_TraceOffline = function(onlineData){
    let events_syncFS
    //console.log(`TRACE:CLEAN ONE //TIME:${moment().format()}`);
    //console.log(onlineData)
    try {
        events_syncFS =fs.readFileSync('./events_sync.json', 'utf8');
        //console.log("=========EVENTS_SYNC OPEN=============")
        //console.log(events_syncFS)
        if(events_syncFS){
            let a_traces = JSON.parse(events_syncFS);
            //console.log("=========INDEX TRACE=============")
            //console.log(a_traces)
            let usersWithoutTime = a_traces.filter(tt => tt.timestamp !== onlineData.timestamp);
            //console.log("=========TRACE CLEANED=============")
            //console.log(usersWithoutTime)

            //console.log("=========CLEAN EVENTS_SYNC=============")
            fs.writeFileSync('./events_sync.json', JSON.stringify(usersWithoutTime, null, 2), 'utf-8', function (err) {
                if (err){
                    console.log("\x1b[41m%s\x1b[0m", `ERROR:WR EVENTS_SYNC CLEAN //TIME:${moment().format()}`, err);
                    console.error(`ERROR:WR EVENTS_SYNC CLEAN: ${err} //TIME:${moment().format()}`);    
                    throw err;
                } 
                console.log('WR EVENTS_SYNC CLEAN!');
            });
        }else{
            //console.log('WR EVENTS_SYNC EMPTY!');
        }
    } catch (err) {
        console.log("\x1b[41m%s\x1b[0m", `ERROR:EVENTS_SYNC FILE //TIME:${moment().format()}`, err);
        console.error(`ERROR:EVENTS_SYNC FILE: ${err} //TIME:${moment().format()}`);
    }
};

/////https://crontab.guru/
cron.schedule("0 */12 * * *", () => { // CADA 12H
    console.log(`CRON:BACKUP DATA FROM SERVER //TIME:${moment().format()}`);
    io1.emit("offline_copy", { buildingId: ID_DEVICE })
});

/////https://crontab.guru/
cron.schedule("0 */1 * * *", () => { // CADA 15min
    console.log(`CRON:CLEAN DATA //TIME:${moment().format()}`);
    clean_dataOffline()
});

module.exports = {
    check_dbOffline : check_dbOffline,
    check_csFile : check_csFile,
    clean_dataOffline: clean_dataOffline,
    add_dataOffline: add_dataOffline,
    clean_TraceOffline:clean_TraceOffline,
    checksumFile : checksumFile,
    checksumSys : checksumSys,
    dbOnState : dbOnState,
    dbOffline : dbOffline

}


