"use strict";

let net  = require("net");
let fs   = require("fs");
let path = require("path");
let eventEmitter = require("events");

const  TIME_TO_RETRY          = 10000; // === 10 sec
                                       // Time to wait before re-open a new
                                       // connection to the AVR will take place.
const  WAIT_BETWEEN_TRANSMITS = 100 ;  // === 100 msec
                                       // Wait time between two consecutive
                                       // command transmissions.
                                       // Marantz default is 50 msec or higher.

/**
 * Class AVR
 */
class Avr {

    /**
     * Create a new AVR Object.
     */
    constructor() {
        this.avrPort       = 0   ; // Network port to use
        this.avrHost       = ""  ; // IP address or hostname to use
        this.avrName       = ""  ; // Given name within Homry
        this.avrType       = ""  ; // Type of AVR to be used
        this.avrNum        = -1  ; // Internal index
        this.conChn        = null; // Event channel to communicate with the
                                   // Homey part of the application (driver.js)
        this.errMsg        = "";
        this.conf          = null; // Will hold avr type configuration data
        this.selAr         = [];   // Array with possible input source device
        this.surroundAr    = [];   // Array with possible surround modes
        this.ecoAr         = [];   // Array with possible eco modes
        this.sendAr        = [];   // the sendbuffer
        this.insertIndex   = 0;    // Send index of the sendbuffer.
        this.deleteIndex   = 0;    // Delete index of the sendbuffer
        this.MAXINDEX      = 64 ;  // Max commands in the sendbuffer
        this.socket        = null;
        this.test          = 0;    // Test indicator,
                                   // lifts some restrictions during testing.
        this.consoleOut    = 0;    // 0 = no output
                                   // 1 = debug

        // Internal process state vars.
        this.isLoopRunning        = false;
        this.hasToStop            = false;
        this.hasConfigloaded      = false;
        this.hasNetworkConnection = false;

        // Initial parameter status of the AVR.
        // Will be updated by _processData
        this.powerStatus          = "unknown";
        this.mainZonePowerStatus  = "unknown";
        this.muteStatus           = "unknown";
        this.inputSourceSelection = "unknown";
        this.volumeStatus         = "unknown";
        this.surroundMode         = "unknown";
        this.ecoStatus            = "unknown";

        // initialize send Array.
        for ( let I = 0 ; I <= this.MAXINDEX; I++ ) {
            this.sendAr[I] = "";
        }

        // internal event channel.
        this.server      = new eventEmitter();
        // setup the internal event listeners
        this._eventloop();
    }

    /**
     * Initialize an AVR.
     *
     * @param      {number}  sPort   The network port to use.
     * @param      {string}  sHost   The ip address of the AVR
     * @param      {string}  sName   The name of the AVR
     * @param      {string}  sType   The type of the AVR
     * @param      {number}  sNum    The index into the AVR array (internal)
     * @param      {socket}  sChannel The event socket
     */

    init( sPort , sHost, sName, sType , sNum , sChannel ) {
        this.avrPort   = sPort;
        this.avrHost   = sHost;
        this.avrName   = sName;
        this.avrType   = sType;
        this.avrNum    = sNum ;
        this.conChn    = sChannel;

        //this._d(`Test: ${this.avrHost}:${this.avrPort} - ${this.avrName} `);

        // Get the correct configuration of the AVR type.

        this.avrConfigFile = path.join(__dirname, `/conf/${this.avrType}.json` );
        this._d(this.avrConfigFile );

        fs.readFile( this.avrConfigFile, (err, data) => {

            if ( err ) {
                this.conf = null;
                this.hasConfigloaded = false;
                this.conChn.emit("init_failed", this.avrNum, this.avrType, err);
                return;
            }

            try {
                this.conf = JSON.parse( data );
            } catch (err ) {

                this.conf = null;
                this.hasConfigloaded = false;
                this.conChn.emit("init_failed", this.avrNum, this.avrType, err);
                return;
            }

            this.hasConfigloaded = true;

            // Fill the input selection array with the entries supported by the AVR type
            this._fillSelectionArray() ;
            // Fill the surround selection array with the entries supported by the AVR type.
            this._fillSurroundArray();
            // File the eco selection array with entries supported by the AVR.
            this._fillEcoArray();

            this.conChn.emit("init_success", this.avrNum, this.avrName, this.avrType);
            this.server.emit("config_loaded");
        });
    }

    /*********************************************************************
     * Private methods
     *********************************************************************/

    /**
     * EventLoop handles the avr control events
     * @private
     */

    _eventloop() {

        this.server
            // 'config_loaded' event is send by 'init' after succesfull
            // loading and parsing the AVR config file.
            // next action: open network connection.
            .on( "config_loaded", () => {
                this._openConnection();
            })

            // Network events all emitted by '_openConnection' depending
            // (except 'net_retry') on the received network events.
            // 'net_connect'    -> new connection established
            // 'net_disconnect' -> Disconnection request from the AVR
            // 'net_error'      -> Received net work errors.
            // 'net_timedout'   -> Network connection to the AVR has a timeout.
            // 'net_retry'      -> Try to connect again to the AVR.
            .on( "net_connect" , () => {
                // notify 'homey' part there is a connection
                // i.e make dev available

                this._getAVRStatusUpdate(); // get the status of the new AVR

                // Wait 2 sec before informing homey so the status of the AVR
                // can be collected.
                // Set hasNetworkConnection after the the wait time so the
                // above initial status requests don't cause events
                setTimeout( () => {
                    this.hasNetworkConnection = true;
                    this.conChn.emit("net_connected", this.avrNum, this.avrName);
                }, 2000);
            })
            .on( "net_disconnect" ,() => {
                // notify 'homey' part connection is disconnected
                // i.e make dev unavailable
                this.conChn.emit("net_disconnected", this.avrNum, this.avrName);
                this.server.emit("net_retry"); // connect again.
            })
            .on("net_error" , (err) => {
                // notify 'homey' part connection is disconnected
                // i.e make dev unavailable
                this.conChn.emit("net_error", this.avrNum, this.avrName, err);
                this.server.emit("net_retry"); // connect again.
            })
            .on("net_timed_out", () => {
                // notify 'homey' part connection is disconnected
                // i.e make dev unavailable
                this.conChn.emit("net_timed_out", this.avrNum, this.avrName);
                this.server.emit("net_retry"); // connect again.
            })
            .on( "net_retry" , () => {
                // Don't start the action if a request to stop is received.
                // hasToStop will be set by 'disconnect' function.
                if ( this.hasToStop === false ) {
                    setTimeout( () => {
                        this._openConnection();
                    }, TIME_TO_RETRY);
                }
            })
            // Disconnect request from user/Homey
            .on( "req_disconnect" , () => {
                this.hasToStop = true;
                this.socket.end();
            })

            // send buffer events.
            // 'send_command' event occurs when
            //    1) the send buffer is filled with a new command (_insertIntoSendBuffer)
            //    2) After a command is send to the AVR.
            //       To check if the buffer is no empty. (_insertIntoSendBufferToAvr).

            .on( "new_data" , () => {
                // New commands are added to the send buffer.
                // start the send loop only once
                // will be reset as soon the send buffer runs out of new data.
                if ( this.isLoopRunning === false ) {
                    this.isLoopRunning = true;
                    this._checkSendBuffer(); // Send command to AVR.
                }
            })
            .on( "check_buffer" , () => {
                this._checkSendBuffer();
            })

            // catch uncaught exception to prevent runtime problems.
            .on("uncaughtException", (err) => {
                this.conChn.emit("net_uncaught", this.avrNum, this.avrName, err);
            });
    }

    /**
     * Connects to the AVR and sets listeners on the possible connection events.
     *
     *  @private
     */
    _openConnection() {
        this._d(`Opening AVR network connection to ${this.avrHost}:${this.avrPort}.`);

        // Use allowHalfOpen to create a permanent connection to the AVR
        // over the network otherwise the connection will terminate asa soon
        // as the socket send buffer is empty.
        this.socket = new net.Socket({
            allowHalfOpen: true
        });

        this.socket.connect( this.avrPort, this.avrHost )
            .on( "connect" , () => {
                this.server.emit("net_connect");
            })
            .on( "error" , (err) => {
                this.hasNetworkConnection = false;
                this.socket.end();
                this.socket = null;
                this.server.emit("net_error", err);
            })
            .on("data" , (data) => {
                this._processData(data);
            })
            .on( "end" , () => {
                this.hasNetworkConnection = false;
                this.socket.end();
                this.socket = null;
                this.server.emit("net_disconnect");
            })
            .on( "timeout" , () => {
                this.hasNetworkConnection = false;
                this.socket.end();
                this.socket = null;
                this.server.emit("net_timed_out");
            })
            .on( "uncaughtException" , (err) => {
                this.hasNetworkConnection = false;
                this.socket.end();
                this.socket = null;
                this.server.emit("net_error", new Error(`uncaught exception - ${err}.`));
            });
    }

    /**
     * Sends a command to the avr.
     * It will automatically add a 'CR' to the command.
     * The AVR requires approx 50-60 msec between to consecutive commands.
     * The wait time between two commands is set by WAIT_BETWEEN_TRANSMITS (100msec)
     *
     * @param      {string}  cmd     The command to be send to the AVR
     * @private
     */
    _sendToAvr( cmd ) {

        this._d(`Sending : ${cmd}.`);
        this.socket.write(cmd + "\r");

        setTimeout( () => {
            this.server.emit("check_buffer");
        }, WAIT_BETWEEN_TRANSMITS);
    }


    /**
     * Check the send buffer if there is something to be send.
     * if not:
     *     set isLoopRunning to false and wait on new data to be send
     *     by _insertIntoSendBuffer routine.
     *  if so:
     *      Update the deleteIndex and send data to the AVR.
     *
     * @private
     */
    _checkSendBuffer() {

        this._d(`${this.insertIndex} / ${this.deleteIndex}.`);

        if ( this.insertIndex === this.deleteIndex ) {

            // end buffer is 'empty' => nothing to do then wait till's flled again.
            this.isLoopRunning = false ;
            this._d("Send loop temp stopped - empty send buffer.");
        } else {
            if ( this.sendAr[ this.deleteIndex ] === "" ) {

                // If the command to be send if empty consider it as
                // empty buffer and exit the data send loop.
                this.isLoopRunning = false ;
                this._d("Sendbuffer entry empty (stopping send loop)!.");
            } else {
                let data = this.sendAr[ this.deleteIndex ];
                this.sendAr[ this.deleteIndex ] = ""; // clear used buffer.
                this.deleteIndex++;

                if ( this.deleteIndex >= this.MAXINDEX ) {
                    this.deleteIndex = 0;
                }
                this._d(`Setting deleteIndex to ${this.deleteIndex}.`);

                this._sendToAvr( data );
            }
        }
    }

    /**
     * Inserts command data into the send buffer.
     * Updates the insertIndex and start the send data event loop.
     * If send buffer overrun occurs:
     *    1) drop the new commands
     *    2) notify Homey it occurred.
     *
     * @param      {string}  data    The command data.
     * @private
     */
    _insertIntoSendBuffer( data ) {

        let nextInsertIndex = this.insertIndex + 1;

        if ( nextInsertIndex >= this.MAXINDEX ) {
            nextInsertIndex = 0;
        }

        if ( this.nextInsertIndex === this.deleteIndex ) {
            // data buffer overrun !
            this.conChn.emit("error_log", this.avrNum, this.avrName,
                new Error( "send buffer overload !."));

        } else {

            this.sendAr[ this.insertIndex ] = data ;

            this.insertIndex++ ;

            if ( this.insertIndex >= this.MAXINDEX ) {
                this.insertIndex = 0;
            }

            this._d(`Next insert index = ${this.insertIndex}`);

            // Signal there is new data in the send buffer.

            this.server.emit("new_data");
        }
    }

    /**
     * Creates an array with the supported inputsource selections for this AVR type.
     *
     *  @private
     */
    _fillSelectionArray() {

        for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {

            if ( typeof( this.conf.inputsource[I]) !== "undefined" &&
                         this.conf.inputsource[I]  !== null ) {

                if ( this.conf.inputsource[I].valid   === true &&
                     this.conf.inputsource[I].prog_id !== "i_request") {

                    let item = {};

                    item.i18n   = this.conf.inputsource[I].i18n;
                    item.command = this.conf.inputsource[I].command;

                    this.selAr.push( item );
                }
            }
        }
    }

    /**
     * Creates an array with supported surround selections for this AVR type .
     *
     *  @private
     */
    _fillSurroundArray() {

        for ( let I = 0 ; I < this.conf.surround.length; I++) {

            if ( typeof( this.conf.surround[I]) !== "undefined" &&
                         this.conf.surround[I]  !== null ) {

                if ( this.conf.surround[I].valid   === true &&
                     this.conf.surround[I].prog_id !== "s_request") {

                    let item = {};

                    item.i18n   = this.conf.surround[I].i18n;
                    item.command = this.conf.surround[I].command;

                    this.surroundAr.push( item );
                }
            }
        }
    }

    /**
     * Creates an array with the supported eco commands for this AVR type.
     * or
     * an array with 'not supported'.
     *
     *  @private
     */
    _fillEcoArray() {
        for ( let I = 0 ; I < this.conf.eco.length; I++ ) {

            if ( typeof( this.conf.eco[I] ) !== "undefined" &&
                         this.conf.eco[I]   !== null ) {

                if ( this.conf.eco[I].valid   === true &&
                     this.conf.eco[I].prog_id !== "eco_request" ) {

                    let item = {};

                    item.i18n     = this.conf.eco[I].i18n ;
                    item.command  = this.conf.eco[I].command;

                    this.ecoAr.push(item);
                }
            }
        }

        if ( this.ecoAr.length === 0 ) {
            // Eco not supported for this type of AVR.

            let item = {};
            item.i18n = "eco.ns";
            item.command = "ECO_UN_SUPPORTED";

            this.ecoAr.push(item);
        }
    }

    /**
     * Process the received data from the AVR.
     * Is called when a 'data' network events is received.
     * Note:
     *     there is a 2 sec delay between the actual connection establishment
     *     and the internal connection flag update.
     *     This to allow the initial status requests to update the internal
     *     statuses without generating events to Homey.
     *
     * @private
     * @param      {buffer}  data    The data received from the AVR.
     */
    _processData(data) {
        let xData = String(data).replace("\r", "");

        this._d(`Received : ${xData}.`);

        switch( xData.substr(0,2) ) {

            case "PW" :
                // main power
                this.powerStatus = xData;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.power.length; I++ ) {
                        if ( xData === this.conf.power[I].command ) {
                            this.conChn.emit( "power_status_chg" , this.avrNum,
                                this.avrName, this.conf.power[I].i18n);
                        }
                    }
                }
                break;
            case "ZM" :
                // main zone power
                this.mainZonePowerStatus = xData ;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.main_zone_power.length; I++ ) {
                        if ( xData === this.conf.main_zone_power[I].command ) {
                            this.conChn.emit( "power_status_chg" , this.avrNum,
                                this.avrName, this.conf.main_zone_power[I].i18n);
                        }
                    }
                }
                break;
            case "SI":
                // inputselection
                this.inputSourceSelection = xData ;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {
                        if ( xData === this.conf.inputsource[I].command ) {
                            this.conChn.emit( "isource_status_chg", this.avrNum,
                                this.avrName, this.conf.inputsource[I].i18n);

                        }
                    }
                }
                break;
            case "MU":
                // mute
                this.muteStatus = xData;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.mute.length; I++ ) {
                        if ( xData === this.conf.mute[I].command ) {
                            this.conChn.emit( "mute_status_chg", this.avrNum,
                                this.avrName, this.conf.mute[I].i18n );
                        }
                    }
                }

                break;
            case "MS":
                // Surround mode
                this.surroundMode = xData;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.surround.length; I++ ) {
                        if ( xData === this.conf.surround[I].command ) {
                            this.conChn.emit( "mute_status_chg", this.avrNum,
                                this.avrName, this.conf.surround[I].i18n );
                        }
                    }
                }

                break;
            case "MV":
                this._processVolumeData( xData );
                break;
            case "EC":
                //Eco setting.
                this.ecoStatus = xData;
                if ( this.hasNetworkConnection === true ) {
                    for ( let I = 0 ; I < this.conf.eco.length; I++ ) {
                        if ( xData === this.conf.eco[I].command ) {
                            this.conChn.emit( "eco_status_chg", this.avrNum,
                                this.avrName, this.conf.eco[I].i18n);
                        }
                    }
                }
                break;
        }
    }

    _processVolumeData(xData) {

        this._d(`_processVolumeData received '${xData}'.`);

        if ( xData.match(/^MVMAX .*/) === null ) {
            this._d(`Setting volume status to '${xData}'.`);
            this.volumeStatus = xData;

            let re = /^MV(\d+)/i;

            let Ar = xData.match(re);

            if ( Ar !== null ) {
                this.conChn.emit( "volume_chg", this.avrNum,
                                this.avrName, Ar[1] );
            }
        }
    }

    /**
     * Called once after the AVR is created/started to get the current status of:
     *     1) power
     *     2) main zone power
     *     3) mute
     *     4) input selection
     *     5) volume
     *     6) surround
     *     7) eco
     *
     * @private
     */
    _getAVRStatusUpdate() {
        this._getAVRPowerStatus();
        this._getAVRMainZonePowerStatus();
        this._getAVRMuteStatus();
        this._getAVRInputSelection();
        this._getAVRVolumeStatus();
        this._getAVRSurroundMode();
        this._getAVREcoStatus();
    }

    /*********************************************************************
     * Debug methods not be to be used in prod env.
     *********************************************************************/

    /**
     * Enables the debug message to console.log (debuggging only).
     */
    setConsoleToDebug() {
        this.consoleOut = 1;
        this._d("Avr debug on");
    }

    /**
     * Disables the info/debug message to console.log (debuggging only).
     */
    setConsoleOff() {
        this._d("Avr debug off");
        this.consoleOut = 0;
    }

    /**
     * Overrides the AVR type filtering of some commands (testing only).
     */
    setTest() {
        this.test = 1;
    }

    /**
     * Clear the override of AVR type filtering of seom commands (testing only).
     */
    clearTest() {
        this.test = 0;
    }

    /**
     * Send conditionally debug message to console.log (debuggging only).
     *
     * @private
     * @param      {string}  str     The message to console.log
     */
    _d(str) {
        if ( this.consoleOut > 0 ) {
            this.conChn.emit( "debug_log", this.avrNum,
                                this.avrName, str );

            // let date = new Date();
            // let dateStr = date.toISOString();
            //console.log(`${dateStr}-${str}.`);
        }
    }

    /*********************************************************************
     * get AVR initial parameters methods
     *********************************************************************/
    /**
     * Returns the ipaddress of the AVR.
     *
     * @return     {string}  The hostname / IP address
     */
    getHostname() {
        return this.avrHost;
    }

    /**
     * Returns the network port of the AVR
     *
     * @return     {number}  The port.
     */
    getPort() {
        return this.avrPort;
    }

    /**
     * Returns the type of the AVR.
     *
     * @return     {string}  The type of the AVR.
     */
    getType() {
        return this.avrType;
    }

    /**
     * Returns the given name of the AVR as shown in 'Homey'.
     *
     * @return     {string}  The name.
     */
    getName() {
        return this.avrName;
    }

    /**
     * Determines if configuration loaded.
     *
     * @return     {boolean}  True if configuration loaded, False otherwise.
     */
    isConfigLoaded() {
        return this.hasConfigloaded;
    }

    /*********************************************************************
     * public non AVR methods
     *********************************************************************/
    /**
     * Disconnects the network connects on request of "Homey" when it
     * shuts down of reboots.
     * Don't start a new connection after receiving the disconnect command.
     */
    disconnect(){

        this._d("Disconnecting on request.");

        this.server.emit("req_disconnect");
    }

    /*********************************************************************
     * Power methods
     *********************************************************************/

    /**
     * Finds the command of the requested power action and send it to the AVR.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _powerCommand( cmd ) {
        for ( let I = 0 ; I < this.conf.power.length; I++ ) {
            // If 'test' is set don't filter if the command is valid or not for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.power[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.power[I].command );
                }
            } else {
                if ( this.conf.power[I].prog_id === cmd &&
                     this.conf.power[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.power[I].command );
                }
            }
        }
    }

    /**
     * Switch on the main power of the AVR.
     */
    powerOn() {
        this._powerCommand( "power_on" ) ;
    }

    /**
     * Switch off the main power of the AVR (standby)
     */
    powerOff() {
        this._powerCommand( "power_off" ) ;
    }

    /**
     * Gets the avr power status.
     * @private
     */
    _getAVRPowerStatus() {
        this._powerCommand( "power_request" ) ;
    }

    /**
     * Returns the i18n ident string of the current power status of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored power status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getPowerStatus() {

        let retStr = "error.cmdnf";

        for ( let I = 0 ; I < this.conf.power.length; I++ ) {

            if ( this.powerStatus === this.conf.power[I].command ) {
                retStr = this.conf.power[I].text;
                break;
            }
        }

        return retStr;
    }

    /**
     * Returns true (on) of false (off) based on the current stored power status.
     *
     * @return     {boolean}  The power on / off state.
     */
    getPowerOnOffState() {

        for ( let I = 0 ; I < this.conf.power.length; I++ ) {
            if ( this.conf.power[I].prog_id === "power_on") {
                if ( this.conf.power[I].command === this.powerStatus) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /*********************************************************************
     * Main zone power methods
     *********************************************************************/

    /**
     * Finds the command of the requested main zone power action and send it to the AVR.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _mainZonePowerCommand( cmd ) {
        for ( let I = 0 ; I < this.conf.main_zone_power.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.main_zone_power[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.main_zone_power[I].command );
                }
            } else {
                if ( this.conf.main_zone_power[I].prog_id === cmd &&
                     this.conf.main_zone_power[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.main_zone_power[I].command );
                }
            }
        }
    }

    /**
     * Switch on the main zone power of the AVR
     */
    mainZonePowerOn() {
        this._mainZonePowerCommand( "mzpower_on" ) ;
    }

    /**
     * Switch of the main zone power of the AVR
     */
    mainZonePowerOff() {
        this._mainZonePowerCommand( "mzpower_off" ) ;
    }

    /**
     * Gets the avr main zone power status.
     * @private
     */
    _getAVRMainZonePowerStatus() {
        this._mainZonePowerCommand( "mzpower_request" ) ;
    }

    /**
     * Returns the i18n ident string of the current main zone power status of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored main zone power status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getMainZonePowerStatus() {

        let retStr = "error.cmdnf" ;

        for ( let I = 0 ; I < this.conf.main_zone_power.length; I++ ) {
            if ( this.mainZonePowerStatus  === this.conf.main_zone_power[I].command ) {
                retStr = this.conf.main_zone_power[I].text;
                break;
            }
        }

        return retStr;
    }

    /**
     * Returns true of false based on the current stored main zone power status.
     *
     * @return     {boolean}  The main zone power on off state.
     */
    getMainZonePowerOnOffState() {

        for ( let I = 0 ; I < this.conf.main_zone_power.length; I++ ) {
            if ( this.conf.main_zone_power[I].prog_id === "mzpower_on") {
                if ( this.conf.main_zone_power[I].command === this.powerMainZoneStatus) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /*********************************************************************
     * Mute methods
     *********************************************************************/

     /**
     * Finds the command of the requested mute action and send it to the AVR.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _MuteCommand( cmd ) {
        for ( let I = 0 ; I < this.conf.mute.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.mute[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.mute[I].command );
                }
            } else {
                if ( this.conf.mute[I].prog_id === cmd &&
                     this.conf.mute[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.mute[I].command );
                }
            }
        }
    }

    /**
     * Switch mute on
     */
    muteOn() {
        this._MuteCommand( "mute_on" ) ;
    }

    /**
     * Switch mute off
     */
    muteOff() {
        this._MuteCommand( "mute_off" ) ;
    }

    /**
     * Gets the avr mute status.
     * @private
     */
    _getAVRMuteStatus() {
        this._MuteCommand( "mute_request" ) ;
    }

    /**
     * Returns the i18n ident string of the current mute status of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored mute status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getMuteStatus() {

        let retStr = "error.cmdnf";

        for ( let I = 0 ; I < this.conf.mute.length; I++ ) {

            if ( this.muteStatus  === this.conf.mute[I].command ) {
                retStr = this.conf.mute[I].text;
                break;
            }
        }

        return retStr;
    }

    /**
     * Returns true of false based on the current stored mute status.
     *
     * @return     {boolean}  The mute on off state.
     */
    getMuteOnOffState() {

        for ( let I = 0 ; I < this.conf.mute.length; I++ ) {
            if ( this.conf.mute[I].prog_id === "mute_on") {
                if ( this.conf.mute[I].command === this.muteStatus) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    /*********************************************************************
     * Inputsource selection methods
     *********************************************************************/

    /**
     * Finds the command of the requested input source and send it to the AVR.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _selectInputSource( source ) {

        for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.inputsource[I].prog_id === source ) {

                    this._insertIntoSendBuffer( this.conf.inputsource[I].command );
                }
            } else {
                if ( this.conf.inputsource[I].prog_id === source &&
                     this.conf.inputsource[I].valid === true  ) {

                    this._insertIntoSendBuffer( this.conf.inputsource[I].command );
                }
            }
        }
    }

    /**
     * Returns the input source selection array with type supported sources.
     *
     * @return     {array}  The valid input selection array.
     */
    getValidInputSelection() {

        return this.selAr;
    }

    /**
     * Fill the command into the send buffer and start the send loop.
     *
     * @param      {string}  command_id  The command id string
     */
    sendInputSourceCommand( command_id ) {
        this._insertIntoSendBuffer( command_id );
    }

    /**
     * Select Phono as input source
     */
    selectInputSourcePhono() {
        this._selectInputSource("i_phono");
    }

    /**
     * Select CD as input source
     */
    selectInputSourceCd() {
        this._selectInputSource("i_cd");
    }

    /**
     * Select DVD as input source
     */
    selectInputSourceDvd() {
        this._selectInputSource("i_dvd");
    }

    /**
     * Select Bluray (bd) as input source
     */
    selectInputSourceBluray() {
        this._selectInputSource("i_bd");
    }

    /**
     * Select TV as input source
     */
    selectInputSourceTv() {
        this._selectInputSource("i_tv");
    }

    /**
     * Select SAT/CBL as input source
     */
    selectInputSourceSatCbl() {
        this._selectInputSource("i_sat_cbl");
    }

    /**
     * Select SAT as input source
     */
    selectInputSourceSat() {
        this._selectInputSource("i_sat");
    }

    /**
     * Select mplay as input source
     */
    selectInputSourceMplay() {
        this._selectInputSource("i_mplay");
    }

    /**
     * Select VCR as input source
     */
    selectInputSourceVcr() {
        this._selectInputSource("i_vcr");
    }

    /**
     * Select game as input source
     */
    selectInputSourceGame() {
        this._selectInputSource("i_game");
    }

    /**
     * Select V.AUX as input source
     */
    selectInputSourceVaux() {
        this._selectInputSource("i_vaux");
    }

    /**
     * Select Tuner as input source
     */
    selectInputSourceTuner() {
        this._selectInputSource("i_tuner");
    }

    /**
     * Select spotify as input source
     */
    selectInputSourceSpotify() {
        this._selectInputSource("i_spotify");
    }

    /**
     * Select napster as input source
     */
    selectInputSourceNapster() {
        this._selectInputSource("i_napster");
    }

    /**
     * Select flickr as input source
     */
    selectInputSourceFlickr() {
        this._selectInputSource("i_flickr");
    }

    /**
     * Select iradio as input source
     */
    selectInputSourceIradio() {
        this._selectInputSource("i_iradio");
    }

    /**
     * Select favorites as input source
     */
    selectInputSourceFavorites() {
        this._selectInputSource("i_favorites");
    }

    /**
     * Select AUX1 as input source
     */
    selectInputSourceAux1() {
        this._selectInputSource("i_aux1");
    }

    /**
     * Select AUX2 as input source
     */
    selectInputSourceAux2() {
        this._selectInputSource("i_aux2");
    }

    /**
     * Select AUX3 as input source
     */
    selectInputSourceAux3() {
        this._selectInputSource("i_aux3");
    }

    /**
     * Select AUX4 as input source
     */
    selectInputSourceAux4() {
        this._selectInputSource("i_aux4");
    }

    /**
     * Select AUX5 as input source
     */
    selectInputSourceAux5() {
        this._selectInputSource("i_aux5");
    }

    /**
     * Select AUX6 as input source
     */
    selectInputSourceAux6() {
        this._selectInputSource("i_aux6");
    }

    /**
     * Select AUX7 as input source
     */
    selectInputSourceAux7() {
        this._selectInputSource("i_aux7");
    }

    /**
     * Select net/usb as input source
     */
    selectInputSourceInetUsb() {
        this._selectInputSource("i_net_usb");
    }

    /**
     * Select net as input source
     */
    selectInputSourceNet() {
        this._selectInputSource("i_net");
    }

    /**
     * Select bluetooth (bt) as input source
     */
    selectInputSourceBluetooth() {
        this._selectInputSource("i_bt");
    }

    /**
     * Select mxport as input source
     */
    selectInputSourceMxport() {
        this._selectInputSource("i_mxport");
    }

    /**
     * Select usb-ipod as input source
     */
    selectInputSourceUsbIpod() {
        this._selectInputSource("i_usb_ipod");
    }

    /**
     * Gets the avr input selection.
     * @private
     */
    _getAVRInputSelection() {
        this._selectInputSource("i_request");
    }

    /**
     * Returns the i18n ident string of the current inputsource of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored mute status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getInputSelection() {

        let retStr = "error.cmdnf" ;

        for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {

            if ( this.inputSourceSelection === this.conf.inputsource[I].command ) {
                retStr = this.conf.inputsource[I].i18n;
                break;
            }
        }

        return retStr;
    }


    /*********************************************************************
     * Volume methods
     *********************************************************************/

     /**
      * Finds the command of the requested volume action and fills the send buffer
      *
      * @param      {string}  cmd     The command
      * @param      {string}  level   The level to set the volume.
      * @private
      */
    _volumeCommand( cmd , level ) {
        for ( let I = 0 ; I < this.conf.volume.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.volume[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.volume[I].command  + `${level}`);
                }
            } else {
                if ( this.conf.volume[I].prog_id === cmd &&
                     this.conf.volume[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.volume[I].command + `${level}` );
                }
            }
        }
    }

    /**
     * Increase the volume
     */
    volumeUp() {
        this._volumeCommand( "volume_up", "" );
    }

    /**
     * Decrease the volume
     */
    volumeDown() {
        this._volumeCommand( "volume_down", "" );
    }

    /**
     * Sets the volume level.
     *
     * @param      {number}  level   The requested volume level
     */
    setVolume( level ) {
        if ( level >= 0 && level < 80 ) {
            this._volumeCommand( "volume_set", level );
        }
    }

    /**
     * Gets the avr volume status.
     */
    _getAVRVolumeStatus() {
        this._volumeCommand( "volume_request", "" );
    }

    /**
     * Returns the current volume level if known otherwise "unknown".
     *
     * @return     {string}  The volume level.
     */
    getVolume() {
        this._d(`volume is ${this.volumeStatus}.`);

        let re = /^MV(\d+)/i;

        let Ar = this.volumeStatus.match(re);

        if ( Ar !== null ) {
            return Ar[1];
        } else {
            return "unknown";
        }
    }

    /*********************************************************************
     * surround methods
     *********************************************************************/

    /**
     * Finds the command of the requested surround action and fills the send buffer.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _setSurroundMode( cmd ) {
        for ( let I = 0 ; I < this.conf.surround.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.surround[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.surround[I].command );
                }
            } else {
                if ( this.conf.surround[I].prog_id === cmd &&
                     this.conf.surround[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.surround[I].command );
                }
            }
        }
    }

    /**
     * Returns the surround array with the AVR type support surround modes.
     *
     * @return     {array}  The surround supported mode array.
     */
    getValidSurround() {

        return this.surroundAr;
    }

    /**
     * Send the surrounf command to the send bugger and start the even loop.
     *
     * @param      {string}  command  The command
     */
    sendSurroundCommand( command ) {
        this._insertIntoSendBuffer( command );
    }

    /**
     * Sets the surround mode to movies.
     */
    setSurroundModeToMovies() {
        this._setSurroundMode("s_movie");
    }

    /**
     * Sets the surround mode to music.
     */
    setSurroundModeToMusic() {
        this._setSurroundMode("s_music");
    }

    /**
     * Sets the surround mode to game.
     */
    setSurroundModeToGame() {
        this._setSurroundMode("s_game");
    }

    /**
     * Sets the surround mode to direct.
     */
    setSurroundModeToDirect() {
        this._setSurroundMode("s_direct");
    }

    /**
     * Sets the surround mode to pure direct.
     */
    setSurroundModeToPureDirect() {
        this._setSurroundMode("s_pure");
    }

    /**
     * Sets the surround mode to stereo.
     */
    setSurroundModeToStereo() {
        this._setSurroundMode("s_stereo");
    }

    /**
     * Sets the surround mode to automatic.
     */
    setSurroundModeToAuto() {
        this._setSurroundMode("s_auto");
    }

    /**
     * Sets the surround mode to neural.
     */
    setSurroundModeToNeural() {
        this._setSurroundMode("s_neural");
    }

    /**
     * Sets the surround mode to standard.
     */
    setSurroundModeToStandard() {
        this._setSurroundMode("s_standard");
    }
    /**
     * Sets the surround mode to dolby.
     */
    setSurroundModeToDolby() {
        this._setSurroundMode("s_dolby");
    }

    /**
     * Sets the surround mode to dts.
     */
    setSurroundModeToDts() {
        this._setSurroundMode("s_dts");
    }

    /**
     * Sets the surround mode to multi chn stereo.
     */
    setSurroundModeToMultiChnStereo() {
        this._setSurroundMode("s_mchstereo");
    }

    /**
     * Sets the surround mode to matrix.
     */
    setSurroundModeToMatrix() {
        this._setSurroundMode("s_matrix");
    }

    /**
     * Sets the surround mode to virtual.
     */
    setSurroundModeToVirtual() {
        this._setSurroundMode("s_virtual");
    }

    /**
     * Sets the surround mode to left.
     */
    setSurroundModeToLeft() {
        this._setSurroundMode("s_left");
    }

    /**
     * Sets the surround mode to right.
     */
    setSurroundModeToRight() {
        this._setSurroundMode("s_right");
    }
    /**
     * Gets the avr surround mode.
     * @private
     */
    _getAVRSurroundMode() {
        this._setSurroundMode("s_request");
    }

    /**
     * Returns the i18n ident string of the current surround mode of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored mute status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getSurroundMode() {

        let retStr = "error.cmdnf" ;

        for ( let I = 0 ; I < this.conf.surround.length; I++ ) {

            if ( this.surroundMode === this.conf.surround[I].command ) {
                retStr = this.conf.surround[I].i18n;
                break;
            }
        }

        return retStr;
    }

    /*********************************************************************
     * ECO methods
     *********************************************************************/

    /**
     * Finds the command of the requested eco action and fills the send buffer.
     *
     * @param      {string}  cmd     The 'prog_id' string of the requested command.
     * @private
     */
    _ecoMode( cmd ) {
        for ( let I = 0 ; I < this.conf.eco.length; I++ ) {
            // If 'test' is set don't filter if the command is valid for
            // this type of AVR.
            if ( this.test === 1 ) {
                if ( this.conf.eco[I].prog_id === cmd ) {
                    this._insertIntoSendBuffer( this.conf.eco[I].command );
                }
            } else {
                if ( this.conf.eco[I].prog_id === cmd &&
                     this.conf.eco[I].valid === true        ) {

                    this._insertIntoSendBuffer( this.conf.eco[I].command );
                }
            }
        }
    }

    /**
     * Gets the supported eco commands for this type of AVR.
     *
     * @return     {Array}  The array with valid eco commands.
     */
    getValidEcoCommands() {
        return this.ecoAr ;
    }

    /**
     * Fill the command into the send buffer and start the send loop.
     *
     * @param      {string}  command  The eco command string
     */
    sendEcoCommand(command) {
        if ( command !== "ECO_UN_SUPPORTED" ) {
            this._insertIntoSendBuffer(command);
        } else {
            this._d("Eco is unsupported for the device.");
        }
    }

    /**
     * Check if the AVR support the 'eco' commands.
     *
     * @return     {boolean}  True if has eco, False otherwise.
     */
    hasEco() {
        if ( this.conf.eco[0].valid === true ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Switch eco mode on
     */
    ecoOn() {
        this._ecoMode("eco_on");
    }

    /**
     * Switch eco mode off
     */
    ecoOff() {
        this._ecoMode("eco_off");
    }

    /**
     * Switch eco mode to auto
     */
    ecoAuto() {
        this._ecoMode("eco_auto");
    }

    /**
     * Gets the avr eco status.
     * @private
     */
    _getAVREcoStatus() {
        this._ecoMode("eco_request");
    }

    /**
     * Returns the i18n ident string of the current eco mode of the AVR.
     * The string should be used to get the i18n string from locales/<lang>.json
     * Current stored mute status is used.
     *
     * @return     {string}  The i18n ident string as defined in the conf/<type>.json file.
     */
    getEcoMode() {

        let retStr = "error.cmdnf" ;

        for ( let I = 0 ; I < this.conf.eco.length; I++ ) {

            if ( this.ecoStatus === this.conf.eco[I].command ) {
                retStr = this.conf.eco[I].i18n;
                break;
            }
        }

        return retStr;
    }
}

module.exports = Avr;
