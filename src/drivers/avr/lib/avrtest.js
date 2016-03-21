"use strict";

let Avr = require("./avr");

let mAvr = new Avr( 2222, "192.168.1.35", "testavr", "av8801");

let items = mAvr.getValidInputSelection( 1 );

console.log( items );
/*
console.log(`hasInputSourcePhono     : ${mAvr.hasInputSourcePhono()}`);
console.log(`hasInputSourceCd        : ${mAvr.hasInputSourceCd()}`);
console.log(`hasInputSourceDvD       : ${mAvr.hasInputSourceDvd()}`);
console.log(`hasInputSourceBluray    : ${mAvr.hasInputSourceBluray()}`);
console.log(`hasInputSourceTv        : ${mAvr.hasInputSourceTv()}`);
console.log(`hasInputSourceSatCbl    : ${mAvr.hasInputSourceSatCbl()}`);
console.log(`hasInputSourceSat       : ${mAvr.hasInputSourceSat()}`);
console.log(`hasInputSourceMplay     : ${mAvr.hasInputSourceMplay()}`);
console.log(`hasInputSourceVcr       : ${mAvr.hasInputSourceVcr()}`);
console.log(`hasInputSourceGame      : ${mAvr.hasInputSourceGame()}`);
console.log(`hasInputSourceVaux      : ${mAvr.hasInputSourceVaux()}`);
console.log(`hasInputSourceTuner     : ${mAvr.hasInputSourceTuner()}`);
console.log(`hasInputSourceHdRadio   : ${mAvr.hasInputSourceHdRadio()}`);
console.log(`hasInputSourceSirius    : ${mAvr.hasInputSourceSirius()}`);
console.log(`hasInputSourceSpotify   : ${mAvr.hasInputSourceSpotify()}`);
console.log(`hasInputSourceSiriusXm  : ${mAvr.hasInputSourceSiriusXm()}`);
console.log(`hasInputSourceRhapsody  : ${mAvr.hasInputSourceRhapsody()}`);
console.log(`hasInputSourcePandora   : ${mAvr.hasInputSourcePandora()}`);
console.log(`hasInputSourceNapster   : ${mAvr.hasInputSourceNapster()}`);
console.log(`hasInputSourceLastFm    : ${mAvr.hasInputSourceLastFm()}`);
console.log(`hasInputSourceFlickr    : ${mAvr.hasInputSourceFlickr()}`);
console.log(`hasInputSourceIRadio    : ${mAvr.hasInputSourceIRadio()}`);
console.log(`hasInputSourceServer    : ${mAvr.hasInputSourceServer()}`);
console.log(`hasInputSourceFavorites : ${mAvr.hasInputSourceFavorites()}`);
console.log(`hasInputSourceCdr       : ${mAvr.hasInputSourceCdr()}`);
console.log(`hasInputSourceAux1      : ${mAvr.hasInputSourceAux1()}`);
console.log(`hasInputSourceAux2      : ${mAvr.hasInputSourceAux2()}`);
console.log(`hasInputSourceAux3      : ${mAvr.hasInputSourceAux3()}`);
console.log(`hasInputSourceAux4      : ${mAvr.hasInputSourceAux4()}`);
console.log(`hasInputSourceAux5      : ${mAvr.hasInputSourceAux5()}`);
console.log(`hasInputSourceAux6      : ${mAvr.hasInputSourceAux6()}`);
console.log(`hasInputSourceAux7      : ${mAvr.hasInputSourceAux7()}`);
console.log(`hasInputSourceNet       : ${mAvr.hasInputSourceNet()}`);
console.log(`hasInputSourceNetUsb    : ${mAvr.hasInputSourceNetUsb()}`);
console.log(`hasInputSourceBluetooth : ${mAvr.hasInputSourceBluetooth()}`);
console.log(`hasInputSourceMXport    : ${mAvr.hasInputSourceMXport()}`);
console.log(`hasInputSourceUsbIpod   : ${mAvr.hasInputSourceUsbIpod()}`);
*/
