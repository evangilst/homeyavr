"use strict";

let net = require("net");
//let self;

//const TELNET_PORT = 23;
const TIMERTIME   = 5000;

/**
 * Open a connection (socket) to the AVR.
 *
 * @method     getConnected
 * @param      {number}   sPort   - The network port
 * @param      {string}   sHost   - the IP address of the AVR
 * @return     {Promise}
 */
let getConnected = (sPort, sHost) => {

    return new Promise( (resolve, reject) => {
        let connectTimer = setTimeout( () => {
            return reject(new Error("Connection request timed out."));
        }, TIMERTIME);
        let connection = net.connect( sPort, sHost)
            .on("error", (err) => {
                clearTimeout(connectTimer);
                return reject(err);
            })
            .on("connect", () => {
                clearTimeout(connectTimer);
                resolve(connection);
            });
    });
};


/**
 * Send data over the open connection to the AVR
 *
 * @method     sendData
 * @param      {socket}   connection  - the open netwrk socket connected the the AVR.
 * @param      {string}   data        - The command to be send to the AVR.
 * @return     {Promise}
 */
let sendData = (connection, data ) => {
    return new Promise( (resolve, reject) => {
        connection.write( data, (err) => {
            return err ? reject(err) : resolve();
        });
    });
};

/**
 * Read data from the AVR.
 *
 * @method     readData
 * @param      {socket}   connection  - the open netwrk socket connected the the AVR.
 * @return     {Promise}
 */
let readData = (connection) => {
    return new Promise( (resolve, reject ) => {
        let readTimer = setTimeout( () => {
            return reject(new Error("Read request timed out."));
        }, TIMERTIME);
        connection
            .on("data" , (data) => {
                clearTimeout(readTimer);
                return resolve(data);
            })
            .on("error", (err) => {
                clearTimeout(readTimer);
                return reject(err);
            });
    });
};

let powerModes = [
    {type: "PWON",       text: "power on"      },
    {type: "PWSTANDBY",  text: "power standby" }
];

let muteModes = [
    {type: "MUON",       text: "Mute on"  },
    {type: "MUOFF",      text: "Mute off" }
];

let inputSources = [
    {   id: "PHONO",     text: "Phono",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "CDR",       text: "Cdr",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: true,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: true,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "CD",        text: "CD player",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "DVD",       text: "DVD",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: false, nr1504: false
    },
    {   id: "BD",        text: "Bluray",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "TV",        text: "TV audio",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "SAT/CBL",   text: "Satelite/ Cable",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: false,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: false, nr1506: true,  nr1504: true
    },
    {   id: "SAT",       text: "Satelite",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: true,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: true,  nr1506: false, nr1504: false
    },
    {   id: "MPLAY",     text: "Media player",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: false,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: false,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: false,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: false, nr1506: true,  nr1504: true
    },
    {   id: "VCR",       text: "VCR player",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: true,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: true,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: true,
        sr6005: true,  sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "GAME",     text: "Game console",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "V.AUX",     text: "V.AUX source",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: true,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: true,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: true,  sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "TUNER",     text: "Tuner",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "SPOTIFY",   text: "Spotify",
        av8802: false, av8801: true,  av7702: false, av7701: true,  av7005: false,
        sr7010: false, sr7009: false, sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: false, sr6009: false, sr6008: true,  sr6007: true,  sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: true,  sr5007: true,
        sr5006: false, nr1606: false, nr1605: false, nr1604: true,  nr1603: true,
        nr1602: false, nr1506: true,  nr1504: true
    },
    {   id: "NAPSTER",   text: "Napster",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: true,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: true,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: true,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: true,  nr1506: false, nr1504: false
    },
    {   id: "FLICKR",    text: "Flickr",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: false, sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: false, sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: false, sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: false, nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: false, nr1504: true
    },
    {   id: "IRADIO",    text: "Internet radio",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "SERVER",    text: "Server",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },
    {   id: "FAVORITES", text: "Favorites",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: true,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: true,  nr1504: true
    },

    {   id: "AUX1",      text: "Aux1",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: false,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: false,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: false, nr1506: true,  nr1504: true
    },
    {   id: "AUX2",      text: "Aux2",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: false,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: false,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: false,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: true,  nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "AUX3",      text: "Aux3",
        av8802: true,  av8801: true, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "AUX4",      text: "Aux4",
        av8802: true,  av8801: true, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "AUX5",      text: "Aux5",
        av8802: true,  av8801: true, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "AUX6",      text: "Aux6",
        av8802: true,  av8801: true, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "AUX7",      text: "Aux7",
        av8802: true,  av8801: true, av7702: false, av7701: false, av7005: false,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: false,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: false, nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: false, nr1506: false, nr1504: false
    },
    {   id: "NET/USB",   text: "Internet/USB",
        av8802: false, av8801: false, av7702: false, av7701: false, av7005: true,
        sr7010: false, sr7009: false, sr7008: false, sr7007: false, sr7005: true,
        sr6010: false, sr6009: false, sr6008: false, sr6007: false, sr6006: true,
        sr6005: false, sr5010: false, sr5009: false, sr5008: false, sr5007: false,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: false, nr1603: false,
        nr1602: true,  nr1506: false, nr1504: false
    },
    {   id: "NET",       text: "Internet",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: false,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: false,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: true,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: true,  nr1603: true,
        nr1602: false, nr1506: true,  nr1504: true
    },
    {   id: "BT",        text: "Bluetooth",
        av8802: true,  av8801: false, av7702: true,  av7701: false, av7005: false,
        sr7010: true,  sr7009: true,  sr7008: false, sr7007: false, sr7005: false,
        sr6010: true,  sr6009: true,  sr6008: false, sr6007: false, sr6006: false,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: false, sr5007: false,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: false, nr1603: false,
        nr1602: false, nr1506: true,  nr1504: false
    },
    {   id: "MXPORT",    text: "MXport",
        av8802: false, av8801: true,  av7702: false, av7701: true,  av7005: true,
        sr7010: false, sr7009: false, sr7008: true,  sr7007: true,  sr7005: true,
        sr6010: false, sr6009: false, sr6008: true,  sr6007: true,  sr6006: true,
        sr6005: true,  sr5010: false, sr5009: false, sr5008: true,  sr5007: true,
        sr5006: true,  nr1606: false, nr1605: false, nr1604: true,  nr1603: true,
        nr1602: true,  nr1506: false, nr1504: true
    },
    {   id: "USB/IPOD",  text: "USB / IPod",
        av8802: true,  av8801: true,  av7702: true,  av7701: true,  av7005: false,
        sr7010: true,  sr7009: true,  sr7008: true,  sr7007: true,  sr7005: false,
        sr6010: true,  sr6009: true,  sr6008: true,  sr6007: true,  sr6006: false,
        sr6005: false, sr5010: true,  sr5009: true,  sr5008: true,  sr5007: false,
        sr5006: false, nr1606: true,  nr1605: true,  nr1604: true,  nr1603: false,
        nr1602: false,  nr1506: true,  nr1504: true
    }

];

class Avr {

    /**
     * Constructor
     *
     * @method     constructor
     * @param      {number}  sPort   - the network port to be used.
     * @param      {string}  sHost   - The IP address of the AVR.
     */
    constructor( sPort, sHost , sName, sType ) {

        this.port = sPort;
        this.host = sHost;
        this.name = sName;
        this.type = sType;

        this.consoleout     = 1;

        this.powerstatus    = "unknown";
        this.mute           = "unknown";
        this.inputsource    = "unknown";
        this.volume         = "unknown";

        console.log("MarantzAvr init .....");
    }

    /**
     * Callback function to process the received power information from the AVR.
     *
     * @method     _cbPowerStatus
     * @param      {string}  data         - The data received from the AVR.
     */
    _cbPowerStatus( data ){
        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        for( let I = 0 ; I < powerModes.length; I++ ) {

            if ( xData.indexOf( powerModes[I].type) !== -1 ) {
                this.powerstatus = powerModes[I].text;
                break;
            }
        }
        this._d(`MarantzAvr: powerstatus set to ${this.powerstatus}.`);
    }


    /**
     * Callback function to process the received mute information from the AVR.
     *
     * @method     _cbMute
     * @param      {string}  data         - The data received from the AVR.
     */
    _cbMute(data) {

        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        for( let I = 0 ; I < muteModes.length; I++ ) {
            if ( xData.indexOf( muteModes[I].type) !== -1 ) {
                this.mute = muteModes[I].text;
                break;
            }
        }

        this._d(`MarantzAvr: mute set to ${this.mute}.`);
    }


    /**
     * Callback function to process the received inputsource information from the AVR.
     *
     * @method     _cbInputSource
     * @param      {string}  data         - The data received from the AVR.
     */
    _cbInputSource(data ) {

        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        console.log(`cbInputSource received '${xData}'.`);

        for( let I = 0 ; I < inputSources.length; I++ ) {

            if ( xData.indexOf( inputSources[I].id) !== -1 ) {
                this.inputsource = inputSources[I].text;
            }
        }
        this._d(`MarantzAvr: inputsource set to ${this.inputsource}.`);
    }


    _cbVolume( data ) {

        let xData = String(data);

        xData = xData.replace("\r", "");

        let rets = /.*MV(\d+).*/i.exec(xData);

        console.log(`_cbVolume: data : '${xData}'.`);
        console.log(`_cbVolume: rets : '${rets}'.`);

        this.volume = rets[1];

        this._d(`MarantzAvr: volume set to ${this.volume}.`);
    }

    /**
     * Write a command to the AVR while no response is expected.
     *
     * @method     _writeCommandNoResponse
     * @param      {string}  command  = the AVR command.
     */
    _writeCommandNoResponse( command ) {
        let myCon = null;

        this._d(`Using IP/port : ${this.port}/${this.host}`);

        getConnected(this.port, this.host)
            .then(
                (connection) => {
                    myCon = connection;
                    this._d(`MarantzAvr: WCNR (${command}) -> connected`);

                    return sendData( myCon, command + "\r");
                })
            .then(
                () => {
                    this._d(`MarantzAvr: WCNR (${command}) -> data sent`);
                    return myCon.end();
                })
            .catch(
                (err) => {
                    console.log(`MarantzAvr: WCNR (${command}) -> ${err}`);
                    myCon.end();
                });
    }

    /**
     * Write a command to the AVR and expected a response from the AVR.
     *
     * @method     _writeCommandWithReponse
     * @param      {string}    command       - The AVR command
     * @param      {Array}     optionsArray  - Array with the possible status of the command.
     * @param      {Function}  callback      - function which will process the received data.
     */
    _writeCommandWithReponse( command, callback ){
        let myCon = null;

        this._d(`Using IP/port : ${this.port}/${this.host}`);

        getConnected(this.port, this.host)
            .then(
                (connection) => {
                    myCon = connection;
                    this._d(`MarantzAvr: WCWR (${command}) -> connected`);

                    return sendData( myCon, command + "\r");
                })
            .then(
                () => {
                    this._d(`MarantzAvr: WCWR (${command}) -> data sent`);
                    return readData(myCon);
                })
            .then(
                (data) => {
                    this._d(`MarantzAvr: WCWR (${command}) -> data received`);
                    callback( data );
                    return myCon.end();
                })
            .catch(
                (err) => {
                    console.log(`MarantzAvr: WCWR (${command}) -> ${err}`);
                    myCon.end();
                });
    }

    getValidSelection( sArray, avrtype, index ) {

        console.log(`getValidSelection called with ${this.type}/${index}`);

        let items = [];

        for ( let I = 0 ; I < sArray.length; I++ ) {

            switch( this.type ) {
                case "av8801":
                    if ( sArray[I].av8801 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "av7702":
                    if ( sArray[I].av7702 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "av7701":
                    if ( sArray[I].av7701 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "av7005":
                    if ( sArray[I].av7005 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr7010":
                    if ( sArray[I].sr7010 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr7009":
                    if ( sArray[I].sr7009 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr7008":
                    if ( sArray[I].sr7008 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr7007":
                    if ( sArray[I].sr7007 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr7005":
                    if ( sArray[I].sr7005 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr6010":
                    if ( sArray[I].sr6010 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr6009":
                    if ( sArray[I].sr6009 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr6008":
                    if ( sArray[I].sr6008 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr6007":
                    if ( sArray[I].sr6007 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr6006":
                    if ( sArray[I].sr6006 ) {
                        let item = {};

                        item.name = sArray[I].text;
                        item.id   = index;

                        items.push(item);
                    }
                    break;
                case "sr6005":
                    if ( sArray[I].sr6005 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr5010":
                    if ( sArray[I].sr5010 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr5009":
                    if ( sArray[I].sr5009 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr5008":
                    if ( sArray[I].sr5008 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr5006":
                    if ( sArray[I].sr5006 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "sr5005":
                    if ( sArray[I].sr5005 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1606":
                    if ( sArray[I].nr1606 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1605":
                    if ( sArray[I].nr1605 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1604":
                    if ( sArray[I].nr1604 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1603":
                    if ( sArray[I].nr1603 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1602":
                    if ( sArray[I].nr1602 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1506":
                    if ( sArray[I].nr1506 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
                case "nr1504":
                    if ( sArray[I].nr1504 ) {
                        let item = {};

                        item.name  = sArray[I].text;
                        item.id    = sArray[I].id;
                        item.index = index;

                        items.push(item);
                    }
                    break;
            }
        }

        console.log(`getValidSelection result:  ${items}`);

        return items;
    }

    /**
     * Return the IP address of the AVR
     *
     * @method     getHostname
     * @return     {string}  - The IP address of the AVR.
     */
    getHostname() {
        return this.host;
    }

    /**
     * Return the port number used.
     *
     * @method     getPort
     * @return     {number}  - The used network port.
     */
    getPort() {
        return this.port;
    }

    /**
     * Return the name of the device
     *
     * @method     getName
     * @return     {string}  - Name of the device
     */
    getName() {
        return this.name;
    }

    /**
     * Return the type of the device
     *
     * @method     getType
     * @return     {string}  - the Type of the device.
     */
    getType() {
        return this.type;
    }

    /*********************************************************************
     *  debug methods.
     *********************************************************************/

    /**
     * Enable console messages.
     *
     * @method     setConsoleOn
     */
    setConsoleOn() {
        this.consoleout = 1;
    }

    /**
     * Disable console messages.
     *
     * @method     setConsoleOff
     */
    setConsoleOff() {
        this.consoleout = 0;
    }

    /**
     * Conditionally write console messages.
     *
     * @method     _d
     * @param      {<type>}  str     { description }
     */
    _d(str) {
        if ( this.consoleout == 1 ) {
            console.log(str);
        }
    }

    /*********************************************************************
     *  Power methods.
     *********************************************************************/

    /**
     * Power on a SR7007.
     *
     * @method     powerOn
     */
    powerOn() {

        let xThis = this ;

        this._writeCommandNoResponse("PWON");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * Power off / standby a SR7007
     *
     * @method     powerStandby
     */
    powerStandby() {

        let xThis = this ;

        this._writeCommandNoResponse("PWSTANDBY");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * Power off / standby a SR7007
     *
     * @method     powerStandby
     */
    powerOff() {

        let xThis = this ;

        this._writeCommandNoResponse("PWSTANDBY");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * Get the power status from the AVR.
     *
     * @method     getPowerStatusFromAvr
     */
    getPowerStatusFromAvr() {

        let xThis = this;

        this._writeCommandWithReponse("PW?", xThis._cbPowerStatus.bind(xThis));
    }

    /**
     * Retunr the stored power status.
     *
     * @method     getPowerStatus
     * @return     {string}  - The stored power value.
     */
    getPowerStatus() {
        return this.powerstatus;
    }

    /*********************************************************************
     *  Mute methods.
     *********************************************************************/

    /**
     * Switch on mute
     *
     * @method     muteOn
     */
    muteOn() {

        let xThis = this ;

        this._writeCommandNoResponse("MUON");

        setTimeout( () => {
            xThis.getMuteStatusFromAvr() ;
        }, 1000);
    }

    /**
     * Switch off mute (unmute)
     *
     * @method     muteOff
     */
    muteOff() {

        let xThis = this ;

        this._writeCommandNoResponse("MUOFF");

        setTimeout( () => {
            xThis.getMuteStatusFromAvr() ;
        }, 1000);
    }

    /**
     * Get the mute status from the AVR.
     *
     * @method     getMuteStatusFromAvr
     */
    getMuteStatusFromAvr() {

        let xThis = this ;

        this._writeCommandWithReponse("MU?", xThis._cbMute.bind(xThis) );
    }

   /**
    * Return the stored mute status,
    *
    * @method     getMuteStatus
    * @return     {string}  - The stored mute status.
    */
    getMuteStatus() {
        return this.mute;
    }

     /*********************************************************************
     *  Inputsource methods.
     *********************************************************************/

    getValidInputSelection( index ) {
        console.log(`yep called with ${index}.`);

        return this.getValidSelection( inputSources, index);
    }

   /**
    * Select PHONO as input source
    *
    * @method     selectInputSourcePhono
    */
    selectInputSourcePhono() {

        let xThis = this ;

        this._writeCommandNoResponse("SIPHONO");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select CD as input source
     *
     * @method     selectInputSourceCd
     */
    selectInputSourceCd() {

        let xThis = this ;

        this._writeCommandNoResponse("SICD");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

   /**
    * Select DVD as input source
    *
    * @method     selectInputSourceDvd
    */
    selectInputSourceDvd() {

        let xThis = this ;

        this._writeCommandNoResponse("SIDVD");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select Bluray as input source
     *
     * @method     selectInputSourceBluray
     */
    selectInputSourceBluray() {

        let xThis = this ;

        this._writeCommandNoResponse("SIBD");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select TV as input source
     *
     * @method     selectInputSourceTv
     */
    selectInputSourceTv() {

        let xThis = this ;

        this._writeCommandNoResponse("SITV");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

   /**
    * Select SAT/CBL as input source
    *
    * @method     selectInputSourceSatCbl
    */
    selectInputSourceSatCbl() {

        let xThis = this ;

        this._writeCommandNoResponse("SISAT/CBL");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select SAT as input source
     *
     * @method     selectInputSourceSat
     */
    selectInputSourceSat() {

        let xThis = this ;

        this._writeCommandNoResponse("SISAT");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

   /**
    * Select MPLAY as input source
    *
    * @method     selectInputSourceMplay
    */
    selectInputSourceMplay() {

        let xThis = this ;

        this._writeCommandNoResponse("SIMPLAY");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
    * Select VCR as input source
    *
    * @method     selectInputSourceVcr
    */
    selectInputSourceVcr() {

        let xThis = this ;

        this._writeCommandNoResponse("SIVCR");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select GAME as input source
     *
     * @method     selectInputSourceGame
     */
    selectInputSourceGame() {

        let xThis = this ;

        this._writeCommandNoResponse("SIGAME");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select V.AUX as input source
     *
     * @method     selectInputSourceVaux
     */
    selectInputSourceVaux() {

        let xThis = this ;

        this._writeCommandNoResponse("SIV.AUX");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select TUNER as input source
     *
     * @method     selectInputSourceTuner
     */
    selectInputSourceTuner() {

        let xThis = this ;

        this._writeCommandNoResponse("SITUNER");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select SPOTIFY as input source
     *
     * @method     selectInputSourceSpotify
     */
    selectInputSourceSpotify() {

        let xThis = this ;

        this._writeCommandNoResponse("SISPOTIFY");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select NAPSTER as input source
     *
     * @method     selectInputSourceNapster
     */
    selectInputSourceNapster() {

        let xThis = this ;

        this._writeCommandNoResponse("SINAPSTER");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select FLICKR as input source
     *
     * @method     selectInputSourceFlickr
     */
    selectInputSourceFlickr() {

        let xThis = this ;

        this._writeCommandNoResponse("SIFLICKR");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select Internet Radion as input source
     *
     * @method     selectInputSourceIRadio
     */
    selectInputSourceIRadio() {

        let xThis = this ;

        this._writeCommandNoResponse("SIIRADIO");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select SERVER as input source
     *
     * @method     selectInputSourceServer
     */
    selectInputSourceServer() {

        let xThis = this ;

        this._writeCommandNoResponse("SISERVER");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select Favorites as input source
     *
     * @method     selectInputSourceFavorites
     */
    selectInputSourceFavorites() {

        let xThis = this ;

        this._writeCommandNoResponse("SIFAVORITES");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }


   /**
    * Select CDR as input source
    *
    * @method     selectInputSourceCdr
    */
    selectInputSourceCdr() {

        let xThis = this ;

        this._writeCommandNoResponse("SICDR");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }


   /**
    * Select AUX1 as input source
    *
    * @method     selectInputSourceAux1
    */
    selectInputSourceAux1() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX1");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX2 as input source
     *
     * @method     selectInputSourceAux2
     */
    selectInputSourceAux2() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX2");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX3 as input source
     *
     * @method     selectInputSourceAux3
     */
    selectInputSourceAux3() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX3");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX4 as input source
     *
     * @method     selectInputSourceAux4
     */
    selectInputSourceAux4() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX4");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX5 as input source
     *
     * @method     selectInputSourceAux5
     */
    selectInputSourceAux5() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX5");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX6 as input source
     *
     * @method     selectInputSourceAux6
     */
    selectInputSourceAux6() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX6");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select AUX7 as input source
     *
     * @method     selectInputSourceAux7
     */
    selectInputSourceAux7() {

        let xThis = this ;

        this._writeCommandNoResponse("SIAUX7");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

   /**
    * Select Net as input source
    *
    * @method     selectInputSourceNet
    */
    selectInputSourceNet() {

        let xThis = this ;

        this._writeCommandNoResponse("SINET");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
    * Select Net/Usb as input source
    *
    * @method     selectInputSourceNetUsb
    */
    selectInputSourceNetUSB() {

        let xThis = this ;

        this._writeCommandNoResponse("SINET/USB");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
    * Select BT as input source
    *
    * @method     selectInputSourceBluetooth
    */
    selectInputSourceBluetooth() {

        let xThis = this ;

        this._writeCommandNoResponse("SINET/USB");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select M-XPort as input source
     *
     * @method     selectInputSourceMXport
     */
    selectInputSourceMXport() {

        let xThis = this ;

        this._writeCommandNoResponse("SIM-XPORT");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Select USB/IPOD as input source
     *
     * @method     selectInputSourceUsbIpod
     */
    selectInputSourceUsbIpod() {

        let xThis = this ;

        this._writeCommandNoResponse("SIUSB/IPOD");

        setTimeout( () => {
            xThis.getInputSourceFromAvr() ;
        }, 1000);
    }

    /**
     * Get the input source selection from the AVR.
     *
     * @method     getInputSourceFromAvr
     */
    getInputSourceFromAvr() {
        let xThis = this ;
        this._writeCommandWithReponse("SI?", xThis._cbInputSource.bind(xThis));
    }

   /**
    * Get the stored source input selection
    *
    * @method     getInputSource
    * @return     {string}  - The stored source input selection.
    */
    getInputSource() {
        return this.inputsource;
    }

    selectCorrectInputSource( selection ) {

        switch( selection ) {
            case "PHONO":
                this.selectInputSourcePhono();
                break;
            case "CD":
                this.selectInputSourceCd();
                break;
            case "DVD":
                this.selectInputSourceDvd();
                break;
            case "BD":
                this.selectInputSourceBluray();
                break;
            case "TV":
                this.selectInputSourceTv();
                break;
            case "SAT/CBL":
                this.selectInputSourceSatCbl();
                break;
            case "SAT":
                this.selectInputSourceSat();
                break;
            case "MPLAY":
                this.selectInputSourceMplay();
                break;
            case "VCR":
                this.selectInputSourceVcr();
                break;
            case "GAME":
                this.selectInputSourceGame();
                break;
            case "V.AUX":
                this.selectInputSourceVaux();
                break;
            case "TUNER":
                this.selectInputSourceTuner();
                break;
            case "SPOTIFY":
                this.selectInputSourceSpotify();
                break;
            case "NAPSTER":
                this.selectInputSourceNapster();
                break;
            case "FLICKR":
                this.selectInputSourceFlickr();
                break;
            case "IRADIO":
                this.selectInputSourceIRadio();
                break;
            case "SERVER":
                this.selectInputSourceServer();
                break;
            case "FAVORITES":
                this.selectInputSourceFavorites();
                break;
            case "CDR":
                this.selectInputSourceCdr();
                break;
            case "AUX1":
                this.selectInputSourceAux1();
                break;
            case "AUX2":
                this.selectInputSourceAux2();
                break;
            case "AUX3":
                this.selectInputSourceAux3();
                break;
            case "AUX4":
                this.selectInputSourceAux4();
                break;
            case "AUX5":
                this.selectInputSourceAux5();
                break;
            case "AUX6":
                this.selectInputSourceAux6();
                break;
            case "AUX7":
                this.selectInputSourceAux7();
                break;
            case "NET":
                this.selectInputSourceNet();
                break;
            case "NET/USB":
                this.selectInputSourceNetUsb();
                break;
            case "BT":
                this.selectInputSourceBluetooth();
                break;
            case "MXPORT":
                this.selectInputSourceMXport();
                break;
            case "USB/IPOD":
                this.selectInputSourceUsbIpod();
                break;
            default:
                console.log("Unknown input source !.");
        }
    }

    /*************************************************************************
     * Volume methodes
     *************************************************************************/

    /**
     * Increase the volume
     *
     * @method     increaseVolume
     */
    increaseVolume() {

        let xThis = this ;

        this._writeCommandNoResponse("MVUP");

        setTimeout( () => {
            xThis.getVolumeFromAvr() ;
        }, 1000);
    }

    /**
     * Descreas the volume
     *
     * @method     decreaseVolume
     */
    decreaseVolume() {

        let xThis = this ;

        this._writeCommandNoResponse("MVDOWN");

        setTimeout( () => {
            xThis.getVolumeFromAvr() ;
        }, 1000);
    }

    /**
     * Set the volime of the AVr (min:0, MAx: 80 )
     *
     * @method     setVolume
     * @param      {number}  level   The desired volume setting
     */
    setVolume( level ) {

        let xThis = this;

        if ( level >= 0 && level <= 80 ) {

            this._writeCommandNoResponse(`MV${level}`);

            setTimeout( () => {
                xThis.getVolumeFromAvr() ;
            }, 1000);
        }
    }

    /**
     * Get the volume setting from the AVR.
     *
     * @method     getVolumeFromAvr
     */
    getVolumeFromAvr() {

        let xThis = this ;

        this._writeCommandWithReponse("MV?", [] , xThis._cbVolume.bind(xThis));
    }

    /**
     * Get the store volume
     *
     * @method     getVolume
     * @return     {number}  - The stored last voluem settins.
     */
    getVolume() {
        return this.volume;
    }
}

module.exports = Avr;
