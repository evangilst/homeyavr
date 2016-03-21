"use strict";

let Avr = require("./lib/avr");

let avrDevArray = [];
let newDevInfo  = {};

/**
 * Deleting a AVR device
 *
 * @method     deleted
 * @param      <type>    device    Info of the to-be-delete device
 * @param      Function  callback  Inform Homey of the result.
 * @return     'callback'
 */
let deleted = (device, callback) => {

    console.log("Marantzavr: delete device called");
    console.log(`Marantzavr: delete_device: ${device.avrip}.`);
    console.log(`Marantzavr: delete_device: ${device.avrport}.`);
    console.log(`Marantzavr: delete_device: ${device.avrname}.`);
    console.log(`Marantzavr: delete_device: ${device.avrindex}.`);

    console.log("device :" , device);

    if ( typeof(avrDevArray[device.avrindex]) === "undefined" ||
                avrDevArray[device.avrindex]  === null ) {

        callback( new Error("Device mismatch on deletion") , false);

    } else {

        avrDevArray[device.avrindex] = null ;

        callback( null, true);
    }
};

/**
 * Initiate the stored devices after a start of Homey or loading softwate again.
 *
 * @method     init
 * @param      Array     devices   Array with all devices info/
 * @param      Function  callback  Notify Homey we have started
 * @return     'callback'
 */
let init = (devices, callback ) => {

    console.log("MarantzAvr: init devices called");

    console.log("devices :" , devices);

    if ( devices.length !== 0 ) {

        devices.forEach( (device) => {
            console.log(`MarantzAvr: init: '${device.avrip}'.`);
            console.log(`MarantzAvr: init: '${device.avrport}'.`);
            console.log(`MarantzAvr: init: '${device.avrname}'.`);
            console.log(`MarantzAvr: init: '${device.avrtype}'.`);
            console.log(`MarantzAvr: init: '${device.avrindex}'.`);

            avrDevArray[ device.avrindex ] = new Avr( device.avrport,
                                                      device.avrip,
                                                      device.avrname,
                                                      device.avrtype  );

            console.log(`avrDevArray slot ${device.avrindex}: ${avrDevArray[device.avrindex]}`);
        });

        for ( let I = 0 ; I < avrDevArray.length ; I++ ) {
            let host = avrDevArray[I].getHostname();
            let port = avrDevArray[I].getPort();

            console.log(`Entry ${I} has ${host}:${port}.`);
        }
    }

    callback( null, "");
};

/**
 * Communication channel between Homey and the AVR to create new AVR devices.
 *
 * @method     pair
 * @param      socket  socket  communication socket
 * @return     'callback'
 */
let pair = (socket) => {

    socket

        .on("list_devices", (data, callback) => {

            console.log("MarantzAvr: pair => list_devices called.");

            console.log(`MarantzAvr: pair => list_devices: '${newDevInfo.avrip}'.`);
            console.log(`MarantzAvr: pair => list_devices: '${newDevInfo.avrport}'.`);
            console.log(`MarantzAvr: pair => list_devices: '${newDevInfo.avrname}'.`);
            console.log(`MarantzAvr: pair => list_devices: '${newDevInfo.avrtype}'.`);
            console.log(`MarantzAvr: pair => list_devices: '${newDevInfo.avrindex}'.`);

            let devices = [
                {
                    data: {
                        id:       newDevInfo.avrname,
                        avrip:    newDevInfo.avrip,
                        avrport:  newDevInfo.avrport,
                        avrname:  newDevInfo.avrname,
                        avrtype:  newDevInfo.avrtype,
                        avrindex: newDevInfo.avrindex
                    },
                    name: newDevInfo.avrname
                }
            ];

            console.log(`MarantzAvr_get_devices: avrIndex is using ${newDevInfo.avrindex}.`);

            avrDevArray[ newDevInfo.avrindex ] = new Avr( newDevInfo.avrport,
                                                          newDevInfo.avrip,
                                                          newDevInfo.avrname,
                                                          newDevInfo.avrtype  );

            console.log(`avrDevArray slot ${newDevInfo.avrindex} filled.`);

            for ( let I = 0 ; I < avrDevArray.length ; I++ ) {
                let host = avrDevArray[I].getHostname();
                let port = avrDevArray[I].getPort();

                console.log(`Entry ${I} has ${host}:${port}.`);
            }

            newDevInfo = {};

            callback( null, devices);
        })

        .on("get_devices", (data) => {

            console.log("MarantzAvr: pair => get_devices called.");
            console.log(`MarantzAvr: pair => get_devices: got IP address '${data.avrip}'.`);
            console.log(`MarantzAvr: pair => get_devices: got port '${data.avrport}'.`);
            console.log(`MarantzAvr: pair => get_devices: got AVR name '${data.avrname}'.`);
            console.log(`MarantzAvr: pair => get_devices: got AVR type '${data.avrtype}'.`);

            let avrCurrIndex = -1 ;

            console.log("avrDevArray :", avrDevArray.length );

            if ( avrDevArray.length === 0 ) {
                // Empty device array no devices configured yet.
                avrCurrIndex = 0 ;
            } else {

                for ( let I = 0 ; I <= avrDevArray.length; I++ ){

                    if ( typeof(avrDevArray[I]) === "undefined" || avrDevArray[I] === null ) {
                        console.log("found open slot ", I );
                        avrCurrIndex = I ;
                        break;
                    }
                }
            }

            newDevInfo = {
                avrip:    data.avrip,
                avrport:  data.avrport,
                avrname:  data.avrname,
                avrtype:  data.avrtype,
                avrindex: avrCurrIndex
            };

            console.log("emitting a continue");
            socket.emit("continue", null );
        })

        .on("disconnect" , () => {
            console.log("Marantz app - User aborted pairing, or pairing is finished");
        });
};

/**************************************************
 * power methodes, valid for all Marantz devices.
 **************************************************/

Homey.manager("flow")

    .on("action.poweron" , (callback, args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].powerOn();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    })

    .on("action.poweroff", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].powerStandby();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    })

    .on("action.checkpoweravr", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].getPowerStatusFromAvr();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    });

/**************************************************
 * mute methodes, valid for all Marantz devices.
 **************************************************/
Homey.manager("flow")

    .on("action.mute", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].muteOn();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    })

    .on("action.unmute", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].muteOff();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    })

    .on("action.checkmuteavr", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].getMuteStatusFromAvr();

            callback(null, true);
        } else {
            console.log("Error: Unknown device.");
            callback(new Error("unknown device."), false );
        }
    });

/**************************************************
 * Input source selection based on the available sources per AVR.
 **************************************************/

Homey.manager("flow")

    .on("action.selectinput.input.autocomplete", (callback, args) => {

        console.log( args.device.avrindex );

        let items = avrDevArray[ args.device.avrindex ].getValidInputSelection(args.device.avrindex);

        console.log( items );

        callback(null, items);
    })

    .on("action.selectinput", (callback, args) => {

        console.log( args );

        avrDevArray[ args.device.avrindex ].selectCorrectInputSource(args.input.id);

        callback(null, true);
    });


module.exports.deleted      = deleted;
module.exports.init         = init;
module.exports.pair         = pair;
