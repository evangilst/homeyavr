"use strict";

let Avr = require("./avr");

let powerModes = [
    {
        type: "PWON",
        text: "power on"
    },
    {
        type: "PWSTANDBY",
        text: "power standby"
    }
];

let muteModes = [
    {
        type: "MUON",
        text: "Mute on"
    },
    {
        type: "MUOFF",
        text: "Mute off"
    }
];

class SR7007 extends Avr {

    /**
     * Constructor
     *
     * @method     constructor
     * @param      {number}  sPort  - The network port to be used.
     * @param      {string}  sHost  - The IP address of the AVR
     */
    constructor( sPort, sHost ) {
        super( sPort, sHost);

        this.powerstatus    = "unknown";
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

        this._writeCommandWithReponse("PW?", powerModes, xThis._cbPowerStatus.bind(xThis));
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

        this._writeCommandWithReponse("MU?", muteModes,  xThis._cbMute.bind(xThis) );
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
}

module.exports = SR7007;
