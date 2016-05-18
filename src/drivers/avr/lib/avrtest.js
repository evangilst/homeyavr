"use strict";

let Avr = require("./avr");

let mAvr = new Avr(2222, "192.168.1.35", "woon" , "sr5010");

// let x = mAvr.init(23, "marantz.fritz.box", "woon" , "sr5010");
// console.log( x );

// if ( ! x ) {
//     console.log("Failed to initialize....");
//     process.exit(2);
//}

console.log( mAvr.getHostname(), ":", mAvr.getPort() );

mAvr.setVolume(60);

// setTimeout ( () => {
//     mAvr.setVolume(60);
// }, 5000);

// setTimeout( () => {
//     let x = new Date();
//     console.log(`${x.toISOString()}: initial poweron.`);
//     mAvr.powerOn();
// }, 10);
// setTimeout( () => { mAvr.getAVRPowerStatus();}, 4000);
// setTimeout( () => {
//     mAvr.powerOff();
//     process.exit(0);
// }, 20000);

setTimeout ( () => {
    process.exit(0);
}, 7000);
