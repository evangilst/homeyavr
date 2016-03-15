"use strict";

let net = require("net");
//let self;

//const TELNET_PORT = 23;
const TIMERTIME   = 5000;


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

let sendData = (connection, data ) => {
    return new Promise( (resolve, reject) => {
        connection.write( data, (err) => {
            return err ? reject(err) : resolve();
        });
    });
};

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

class Avr {

    /**
     * Constructor - create an MarantzAvr instance.
     * @param  {string} sHost - Host IP address or FQDN hostname.
     */
    constructor( sPort, sHost ) {

        this.port = sPort;
        this.host = sHost;

        this.consoleout     = 1;

        this.powerstatus    = "unknown";
        this.inputsource    = "unknown";
        this.decodemode     = "unknown";
        this.videosource    = "unknown";
        this.surroundmode   = "unknown";
        this.hdmiresolution = "unknown";
        this.volume         = "unknown";

        console.log("MarantzAvr init .....");
    }

    _cbPowerStatus( data , optionsArray ){
        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        for( let I = 0 ; I < optionsArray.length; I++ ) {

            if ( xData.indexOf( optionsArray[I].type) !== -1 ) {
                this.powerstatus = optionsArray[I].text;
                break;
            }
        }
        this._d(`MarantzAvr: powerstatus set to ${this.powerstatus}.`);
    }

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

    _writeCommandWithReponse( command, optionsArray, callback ){
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
                    callback( data, optionsArray);
                    return myCon.end();
                })
            .catch(
                (err) => {
                    console.log(`MarantzAvr: WCWR (${command}) -> ${err}`);
                    myCon.end();
                });
    }

    getHostname() {
        return this.host;
    }

    getPort() {
        return this.port;
    }

    /*********************************************************************
     *  debug methods.
     *********************************************************************/
    setConsoleOn() {
        this.consoleout = 1;
    }

    setConsoleOff() {
        this.consoleout = 0;
    }

    _d(str) {
        if ( this.consoleout == 1 ) {
            console.log(str);
        }
    }


}

module.exports = Avr;
