"use strict";

let Avr = require("./lib/avr");

let avrDevArray  = [];
let newDevInfo   = {};
let my_Debug_Avr = 1 ;

/**
 * Prints using homey.log if debug is switched on.
 *
 * @param      {string}  str     The message string
 */
let prtDbg = (str) => {
    if ( my_Debug_Avr === 1 ) {
        let date = new Date();
        let dateStr = date.toISOString();
        //console.log(str);
        Homey.log(`${dateStr}-${str}`);
    }
};

/**
 * Gets the string defined in the locales files of homey.
 *
 * @param      {string}  str     The ID string
 * @return     {string}  The 'locales' string for the ID.
 */
let getI18String = (str) => {
    return Homey.manager("i18n").__(str);
};

/**
 * Deleting a AVR device
 *
 * @method     deleted
 * @param      Object    device    Info of the to-be-delete device
 * @param      Function  callback  Inform Homey of the result.
 * @return     'callback'
 */
let deleted = (device, callback) => {

    prtDbg("Marantzavr: delete device called");
    prtDbg(`Marantzavr: delete_device: ${device.avrip}.`);
    prtDbg(`Marantzavr: delete_device: ${device.avrport}.`);
    prtDbg(`Marantzavr: delete_device: ${device.avrname}.`);
    prtDbg(`Marantzavr: delete_device: ${device.avrindex}.`);

    prtDbg("device :" , device);

    if ( typeof(avrDevArray[device.avrindex]) === "undefined" ||
                avrDevArray[device.avrindex]  === null ) {

        callback( new Error( getI18String("error.dev_mis_del")), false );

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

    prtDbg("MarantzAvr: init devices called");

    if ( devices.length !== 0 ) {

        devices.forEach( (device) => {
            prtDbg(`MarantzAvr: init: '${device.avrip}'.`);
            prtDbg(`MarantzAvr: init: '${device.avrport}'.`);
            prtDbg(`MarantzAvr: init: '${device.avrname}'.`);
            prtDbg(`MarantzAvr: init: '${device.avrtype}'.`);
            prtDbg(`MarantzAvr: init: '${device.avrindex}'.`);

            avrDevArray[ device.avrindex ] = new Avr( device.avrport,
                                                      device.avrip,
                                                      device.avrname,
                                                      device.avrtype  );

            //prtDbg(`avrDevArray slot ${device.avrindex}: `);
            //prtDbg( device );
        });

        for ( let I = 0 ; I < avrDevArray.length ; I++ ) {
            let host = avrDevArray[I].getHostname();
            let port = avrDevArray[I].getPort();

            prtDbg(`Entry ${I} has ${host}:${port}.`);
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

            prtDbg( data );

            prtDbg("MarantzAvr: pair => list_devices called.");

            prtDbg(`MarantzAvr: pair => list_devices: '${newDevInfo.avrip}'.`);
            prtDbg(`MarantzAvr: pair => list_devices: '${newDevInfo.avrport}'.`);
            prtDbg(`MarantzAvr: pair => list_devices: '${newDevInfo.avrname}'.`);
            prtDbg(`MarantzAvr: pair => list_devices: '${newDevInfo.avrtype}'.`);
            prtDbg(`MarantzAvr: pair => list_devices: '${newDevInfo.avrindex}'.`);

            let devices = [
                {
                    name: newDevInfo.avrname,
                    data: {
                        id:       newDevInfo.avrname,
                        avrip:    newDevInfo.avrip,
                        avrport:  newDevInfo.avrport,
                        avrname:  newDevInfo.avrname,
                        avrtype:  newDevInfo.avrtype,
                        avrindex: newDevInfo.avrindex
                    }
                }
            ];

            prtDbg(`MarantzAvr_get_devices: avrIndex is using ${newDevInfo.avrindex}.`);

            avrDevArray[ newDevInfo.avrindex ] = new Avr( newDevInfo.avrport,
                                                          newDevInfo.avrip,
                                                          newDevInfo.avrname,
                                                          newDevInfo.avrtype  );

            prtDbg(`avrDevArray slot ${newDevInfo.avrindex} filled.`);

            for ( let I = 0 ; I < avrDevArray.length ; I++ ) {
                let host = avrDevArray[I].getHostname();
                let port = avrDevArray[I].getPort();

                prtDbg(`Entry ${I} has ${host}:${port}.`);
            }

            newDevInfo = {};

            callback( null, devices);
        })

        .on("get_devices", (data) => {

            prtDbg("MarantzAvr: pair => get_devices called.");
            prtDbg(`MarantzAvr: pair => get_devices: got IP address '${data.avrip}'.`);
            prtDbg(`MarantzAvr: pair => get_devices: got port '${data.avrport}'.`);
            prtDbg(`MarantzAvr: pair => get_devices: got AVR name '${data.avrname}'.`);
            prtDbg(`MarantzAvr: pair => get_devices: got AVR type '${data.avrtype}'.`);

            let avrCurrIndex = -1 ;

            prtDbg("avrDevArray :", avrDevArray.length );

            if ( avrDevArray.length === 0 ) {
                // Empty device array no devices configured yet.
                avrCurrIndex = 0 ;
            } else {

                for ( let I = 0 ; I <= avrDevArray.length; I++ ){

                    if ( typeof(avrDevArray[I]) === "undefined" || avrDevArray[I] === null ) {
                        prtDbg("found open slot ", I );
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

            socket.emit("continue", null );
        })

        .on("disconnect" , () => {
            prtDbg("Marantz app - User aborted pairing, or pairing is finished");
        });
};

let capabilities = {

    onoff: {
        get: (device_data,callback) => {
            if ( device_data instanceof Error || !device_data) return callback(device_data);

            if ( typeof( avrDevArray[ device_data.avrindex ]) !== "undefined" &&
                     avrDevArray[ device_data.avrindex ]  !== null  ) {

                let powerStatus = avrDevArray[ device_data.avrindex ].getPowerOnOffState();

                prtDbg("powerStatus : " + powerStatus );
                callback(null, powerStatus);
            } else {
                callback( true, false );
            }
        },
        set: (device_data, data, callback) => {

            if ( device_data instanceof Error || !device_data) return callback(device_data);

            if ( typeof( avrDevArray[ device_data.avrindex ]) !== "undefined" &&
                     avrDevArray[ device_data.avrindex ]  !== null  ) {

                if ( data == true ) {
                    avrDevArray[ device_data.avrindex ].powerOn();
                } else {
                    avrDevArray[ device_data.avrindex ].powerOff();
                }

                callback(null, true);
            } else {
                callback( true, false );
            }
        }
    }
};

let setSettings = (device_data) => {

    prtDbg("SetSettings called");
    prtDbg(device_data);
};

/**
 * Change he settings of the selected AVR.
 * Uses the callback to signal Homey of the result.
 *
 * @param      {Object}    device_data    The device data
 * @param      {Object}    newSet         The new set
 * @param      {Object}    oldSet         The old set
 * @param      {Array}     changedKeyArr  The changed key arr
 * @param      {Function}  callback       The callback
 */
let settings = (device_data, newSet, oldSet, changedKeyArr, callback) => {

    prtDbg( JSON.stringify(device_data));
    prtDbg( JSON.stringify(newSet));
    prtDbg( JSON.stringify(changedKeyArr));

    let nIP        = "";
    let nPort      = "";
    let nType      = "";
    let deBug      = false;
    let num        = 0;
    let newAvr     = false ;
    let errorDect  = false ;
    let errorIdStr = "";

    changedKeyArr.forEach( (key) => {
        switch (key) {
            case "avrip" :
                if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(newSet.avrip))  {

                    prtDbg(`Correct IP adresss ${nIP}.`);
                    nIP = newSet.avrip;
                    newAvr = true;
                } else {

                    errorDect = true;
                    errorIdStr = "error.invalidIP";
                }

                break;
            case "avrport" :
                num = parseInt(nPort);

                if ( isNaN(num) || num < 0 || num > 65535 ) {
                    errorDect = true;
                    errorIdStr = "error.invalidPort";
                } else {
                    nPort = newSet.avrport;
                    newAvr = true;
                }
                break;
            case "avrtype":
                nType = newSet.avrtype;
                newAvr = true;
                break;
            case "sDebug":
                deBug = newSet.sDebug;
                break;
        }

    });

    if ( errorDect === false ) {

        if ( newAvr === true ) {

            // get the unchanged parameters
            //
            let nIP   = nIP   === "" ? device_data.avrip : nIP ;
            let nPort = nPort === "" ? device_data.avrport : nPort ;
            let nType = nType === "" ? device_data.avrtype : nType ;

            if ( avrDevArray[ device_data.avrindex ] !== null ) {

                avrDevArray[ device_data.avrindex ].disconnect();

                avrDevArray[ device_data.avrindex ] = null;
            }

            prtDbg(`Updated avr: ${device_data.avrname}:${nIP}:${nPort}:${nType}.`);

            avrDevArray[ device_data.avrindex ] = new Avr( nPort,
                                                           nIP,
                                                           device_data.avrname ,
                                                           nType );
        }
    }

    if ( deBug === true ) {
        avrDevArray[ device_data.avrindex ].setConsoleToDebug();
    } else {
        avrDevArray[ device_data.avrindex ].setConsoleOff();
    }

    if ( errorDect === true ) {
        prtDbg("Settings: returning an error.");
        callback( new Error(getI18String(errorIdStr)), false );
    } else {
        prtDbg("Settings: returning an oke.");
        callback( null, true );
    }
};

/**************************************************
 * Homey is shutting down/ reboots, Close the open network connections.
 **************************************************/

Homey.on("unload" , () => {

    for ( let I = 0 ; I < avrDevArray.length ; I++ ) {
        if ( typeof( avrDevArray[ I ]) !== "undefined" &&
                     avrDevArray[ I ]  !== null  ) {

            avrDevArray[I].diconnect();
        }
    }
});

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
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    })

    .on("action.poweroff", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].powerOff();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    });

/**************************************************
 * main_zone-power methodes, valid for all Marantz devices.
 **************************************************/

Homey.manager("flow")

    .on("action.main_zone_poweron" , (callback, args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].mainZonePowerOn();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    })

    .on("action.main_zone_poweroff", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].mainZonePowerOff();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
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
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    })

    .on("action.unmute", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].muteOff();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    });

/**************************************************
 * Input source selection based on the available sources per AVR.
 **************************************************/

Homey.manager("flow")

    .on("action.selectinput.input.autocomplete", (callback, args) => {

        prtDbg( args.device.avrindex );

        let items = avrDevArray[ args.device.avrindex ].getValidInputSelection();

        let cItems = [];

        for ( let I = 0 ; I < items.length; I++ ){
            let x = {};
            x.command = items[I].command;
            x.name    = getI18String(items[I].name);

            cItems.push(x);
        }

        callback(null, cItems);
    })

    .on("action.selectinput", (callback, args) => {

        prtDbg( args );

        avrDevArray[ args.device.avrindex ].sendInputSourceCommand(args.input.command);

        callback(null, true);
    });

/**************************************************
 * Volume methodes, valid for all Marantz devices.
 **************************************************/

Homey.manager("flow")

    .on("action.volumeup", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].volumeUp();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    })

    .on("action.volumedown", (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].volumeDown();

            callback(null, true);
        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    })
    .on("action.setvolume" , (callback,args) => {

        if ( typeof( avrDevArray[ args.device.avrindex ]) !== "undefined" &&
                     avrDevArray[ args.device.avrindex ]  !== null  ) {

            avrDevArray[ args.device.avrindex ].setVolume( args.volumeNum);

            callback(null, true);

        } else {
            prtDbg("Error: Unknown device.");
            callback(new Error(getI18String("error.unknowndev")), false );
        }
    }) ;

/**************************************************
 * Surround selection based on the available sources per AVR.
 **************************************************/

Homey.manager("flow")

    .on("action.surround.input.autocomplete", (callback, args) => {

        prtDbg( args.device.avrindex );

        let items = avrDevArray[ args.device.avrindex ].getValidSurround();

        let cItems = [];

        for ( let I = 0 ; I < items.length; I++ ){
            let x = {};
            x.command = items[I].command;
            x.name    = getI18String(items[I].name);

            cItems.push(x);
        }

        callback(null, cItems);
    })

    .on("action.surround", (callback, args) => {

        prtDbg( args );

        avrDevArray[ args.device.avrindex ].sendSurroundCommand(args.input.command);

        callback(null, true);
    });

/**************************************************
 * eco methodes, based on the support per AVR.
 *
 * NEED TO BE CHANGED:
 * Needs to be conditional: should be available only when AVR supports ECO
 * Currently it needs to defined in app.json regardsless if it is supported or not
 * Currently if not supported an array with 1 entry "not supported" is returned.
 **************************************************/
Homey.manager("flow")

    .on("action.eco.input.autocomplete", (callback, args) => {

        prtDbg( args.device.avrindex );

        let items = avrDevArray[ args.device.avrindex ].getValidEcoCommands();

        let cItems = [];

        for ( let I = 0 ; I < items.length; I++ ){
            let x = {};
            x.command = items[I].command;
            x.name    = getI18String(items[I].name);

            cItems.push(x);
        }

        callback(null, cItems);
    })

    .on("action.eco", (callback, args) => {

        prtDbg( args );

        avrDevArray[ args.device.avrindex ].sendEcoCommand(args.input.command);

        callback(null, true);
    });

module.exports.deleted      = deleted;
module.exports.init         = init;
module.exports.pair         = pair;
module.exports.capabilities = capabilities;
module.exports.settings     = settings;
module.exports.setSettings  = setSettings;
