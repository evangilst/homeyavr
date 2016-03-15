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

class Avr {

    /**
     * Constructor
     *
     * @method     constructor
     * @param      {number}  sPort   - the network port to be used.
     * @param      {string}  sHost   - The IP address of the AVR.
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

    /**
     * Callback function to process the received power information from the AVR.
     *
     * @method     _cbPowerStatus
     * @param      {string}  data         - The data received from the AVR.
     * @param      {Array}  optionsArray  - The array with possible power status.
     */
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


    /**
     * Callback function to process the received mute information from the AVR.
     *
     * @method     _cbMute
     * @param      {string}  data         - The data received from the AVR.
     * @param      {Array}   optionsArray - The array with possible mute status.
     */
    _cbMute(data, optionsArray) {

        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        for( let I = 0 ; I < optionsArray.length; I++ ) {
            if ( xData.indexOf( optionsArray[I].type) !== -1 ) {
                this.mute = optionsArray[I].text;
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
     * @param      {Array}   optionsArray - The array with possible inputsource status.
     */
    _cbInputSource(data, optionsArray ) {

        let xData = String(data);

        // Remove "\r" from data for better logging.
        xData = xData.replace("\r", "");

        for( let I = 0 ; I < optionsArray.length; I++ ) {

            if ( xData.indexOf( optionsArray[I].type) !== -1 ) {
                this.inputsource = optionsArray[I].text;
            }
        }
        this._d(`MarantzAvr: inputsource set to ${this.inputsource}.`);
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

    /**
     * Retunr the IP address of the AVR
     *
     * @method     getHostname
     * @return     {string}  - The IP address of the AVR.
     */
    getHostname() {
        return this.host;
    }

    /**
     * Retunr the port number used.
     *
     * @method     getPort
     * @return     {number}  - The used network port.
     */
    getPort() {
        return this.port;
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
}

module.exports = Avr;
