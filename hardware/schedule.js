//import cron from "node-cron";
const cron = require('node-cron');
const moment = require('moment');
const fs = require('fs');
const { Tag } = require('./core');

//let checksum = "Inicial";
let checksumFile = "Inicial";

//cron.schedule("*/5 * * * * *", () => {
console.log('CRON FILE:' )
cron.schedule("0 */12 * * *", () => { // CADA 12H
    //console.log(`this message logs every 15s`);
    io1.emit("offline_copy", { buildingId: process.env.ID_DEVICE })
});

//cron.schedule("*/10 * * * * *", () => {
//    let data={
//        status: 'validate_tag',
//        door : "2",
//        door_way : "11",
//        tag: "TESTTAG",
//        date: moment().format()
//       }
//    Tag.emit('validate',data)
//});

//module.exports = {
//    checksum:checksum
//}




    //console.log(`this message logs every minute`);//"* * * * *"
    //console.log(`this message logs every hour`);//"0 * * * *"
    //console.log(`this message logs every segundo`);//"* * * * * *"