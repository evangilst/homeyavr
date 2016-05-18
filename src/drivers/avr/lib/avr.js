"use strict";

let net  = require("net");
let fs   = require("fs");
let path = require("path");

/*************************************************************************
 * Note for on/off or UP /down commands referencing the json arrays
 * for the different AVRs.
 *
 * index 0   : Is the ON or UP commands
 * index 1   : Is the OFF/STANDBY or DOWN commands
 * index 2   : Is the ststua request command
 * index 3-n : possible other commands.
 */

class Avr {

    constructor( sPort , sHost, sName, sType ) {
        this.port   = sPort;
        this.host   = sHost;
        this.name   = sName;
        this.type   = sType;
        this.errMsg = "";
        this.conf   = null;

        this.avrConfigFile = `./conf/${this.type}.json`;
        this.consoleOut = 1;    //debug purposes

        this.hasNetworkConnection = false;

        // Array with possible inputsource selections.
        this.selAr = [];

        // Initial parameter status of the AVR.
        // Will be updated by _processData
        this.powerStatus          = "unknown";
        this.powerMainZoneStatus  = "unknown";
        this.muteStatus           = "unknown";
        this.inputSourceSelection = "unknown";
        this.volumeStatus         = "unknown";

        // Get the correct configuration of the AVR type.
        // Note needs to be readFileSync otherwise the first commands will fail
        //      as the configuration loading is not finished yet.
        //      Will only occur during creation (new....)
        this._d(`__dirname : ${__dirname}.`);
        let jsondata = fs.readFileSync(path.join( __dirname, this.avrConfigFile)).toString();

        try {
            this.conf = JSON.parse( jsondata );
            this._d("config loaded !.");
        } catch (err ) {
            this.conf = null;
            this._d(`Error parsing ${this.avrConfigFile} : ${err}.`);
        }

        this. _fillSelectionArray() ;

        // Create the socket for the communication with the AVR.
        // Set allowHalfOpen so the connection will stay open after the buffers
        // are empty.
        this.socket = new net.Socket({
            allowHalfOpen: true
        });

        this._openConnection();
    }

     /*********************************************************************
     * Private methods
     *********************************************************************/

    _openConnection() {
        this._d("Opening AVR network connection...");

        this.socket.connect( this.port, this.host );

        this.socket
            .on( "connect" , () => {
                this.hasNetworkConnection = true;
                this._d("Network connection open.");
            })
            .on( "error" , (err) => {
                this._d(`Error: ${err}.`);
                this.hasNetworkConnection = false;
                this.socket.end();
            })
            .on( "data" , (data) => {
                this._processData(data);
            })
            .on( "end" , () => {
                this._d("AVR closed the connection.");
                this.hasNetworkConnection = false;
                this.socket.end();
            })
            .on( "timeout" , () => {
                this._d("Connection timed out.");
            });
    }

    _fillSelectionArray() {

        for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {

            if ( typeof( this.conf.inputsource[I]) !== "undefined" &&
                 this.conf.inputsource[I] !== null ) {

                if ( this.conf.inputsource[I].valid === true ) {

                    let item = {};

                    item.name    = this.conf.inputsource[I].name;
                    item.command = this.conf.inputsource[I].command;

                    this.selAr.push( item );
                }
            }
        }
    }

    _processData(data) {
        let xData = String(data).replace("\r", "");
        let date = new Date();
        let dateStr = date.toISOString();

        this._d(`${dateStr}-Received : ${xData}.`);

        switch( xData.substr(0,2) ) {

            case "PW" :
                // main power
                this.powerStatus = xData;
                break;
            case "ZW" :
                // mian zone power
                this.powerMainZoneStatus = xData ;
                break;
            case "SI":
                // inputselection
                this.inputSourceSelection = xData ;
                break;
            case "MU":
                // mute
                this.muteStatus = xData;
                break;

        }
    }

    _sendData(data, index = 0) {

        if ( this.hasNetworkConnection === true ) {
            let date = new Date();
            let dateStr = date.toISOString();
            this._d(`${dateStr} Sending : ${data}.`);
            this.socket.write(data + "\r");
        } else {
            setTimeout( () => {
                if ( this.hasNetworkConnection === true ) {
                    this._sendData(data, index++ );
                } else {
                    if ( index < 10 ) {
                        this._openConnection();
                        this._sendData(data, index++);
                    }
                }
            },1000);
        }

    }

    /*********************************************************************
     * Debug methods
     *********************************************************************/

    setConsoleOn() {
        this.consoleOut = 1;
    }

    setConsoleOff() {
        this.consoleOut = 0;
    }

    _d(str) {
        if ( this.consoleOut === 1 ) {
            console.log(str);
        }
    }

    /*********************************************************************
     * get AVR initial parameters methods
     *********************************************************************/

    getHostname() {
        return this.host;
    }

    getPort() {
        return this.port;
    }

    getType() {
        return this.type;
    }

    getName() {
        return this.name;
    }

    /*********************************************************************
     * Power methods
     *********************************************************************/

    powerOn() {
        this._sendData( this.conf.power[0].command );
    }

    powerOff() {
        this._sendData( this.conf.power[1].command );
    }

    getAVRPowerStatus() {
        this._sendData( this.conf.power[2].command );
    }

    getPowerStatus() {

        let retStr = "";

        for ( let I = 0 ; I < this.conf.power.length; I++ ) {

            if ( this.powerStatus === this.conf.power[I].command ) {
                retStr = this.conf.power[I].text;
                break;
            }
        }

        return retStr;
    }

    /*********************************************************************
     * Main zone power methods
     *********************************************************************/

    mainZonePowerOn() {
        this._sendData( this.conf.main_zone_power[0].command );
    }

    mainZonePowerOff() {
        this._sendData( this.conf.main_zone_power[1].command );
    }

    getAVRMainZonePowerStatus() {
        this._sendData( this.conf.main_zone_power[2].command );
    }

    getMainZonePowerStatus() {

        let retStr = "";

        for ( let I = 0 ; I < this.conf.main_zone_power.length; I++ ) {

            if ( this.powerMainZoneStatus  === this.conf.main_zone_power[I].command ) {
                retStr = this.conf.main_zone_power[I].text;
                break;
            }
        }

        return retStr;
    }

    /*********************************************************************
     * Mute methods
     *********************************************************************/
    muteOn() {
        this._sendData( this.conf.mute[0].command );
    }

    muteOff() {
        this._sendData( this.conf.mute[1].command );
    }

    getAVRMuteStatus() {
        this._sendData( this.conf.mute[2].command );
    }

    getMuteStatus() {

        let retStr = "";

        for ( let I = 0 ; I < this.conf.mute.length; I++ ) {

            if ( this.muteStatus  === this.conf.mute[I].command ) {
                retStr = this.conf.mute[I].text;
                break;
            }
        }

        return retStr;
    }

    /*********************************************************************
     * Inputsource selection methods
     *********************************************************************/

    getValidInputSelection() {

        return this.selAr;
    }

    selectCorrectInputSource( command ) {
        this._sendData( command );
    }

    getInputSelection() {

        let retStr = "";

        for ( let I = 0 ; I < this.conf.inputsource.length; I++ ) {

            if ( this.inputSourceSelection === this.conf.inputsource[I].command ) {
                retStr = this.conf.inputsource[I].text;
                break;
            }
        }

        return retStr;
    }

    /*********************************************************************
     * Volume methods
     *********************************************************************/

    volumeUp() {
        this._sendData( this.conf.volume[0].command );
    }

    volumeDown() {
        this._sendData( this.conf.volume[1].command );
    }

    getAVRVolumeStatus() {
        this._sendData( this.conf.volume[2].command );
    }

    setVolume( level ) {
        if ( level >= 0 && level < 80 ) {
            this._sendData( this.conf.volume[3].command + `${level}`);
        }
    }
}

module.exports = Avr;
