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

class SR7007 extends Avr {

    constructor( sPort, sHost ) {
        super( sPort, sHost);

        this.powerstatus    = "unknown";
    }

    /*********************************************************************
     *  Power methods.
     *********************************************************************/

    /**
     * power on the AVR
     * @public
     */
    powerOn() {

        let xThis = this ;

        this._writeCommandNoResponse("PWON");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * power off/standby the AVR
     * @public
     */
    powerStandby() {

        let xThis = this ;

        this._writeCommandNoResponse("PWSTANDBY");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * power off/standby the AVR
     * @public
     */
    powerOff() {

        let xThis = this ;

        this._writeCommandNoResponse("PWSTANDBY");

        setTimeout( () => {
            xThis.getPowerStatusFromAvr() ;
        }, 2000);
    }

    /**
     * Get the curremt power status from the AVR
     * @public
     */
    getPowerStatusFromAvr() {

        let xThis = this;

        this._writeCommandWithReponse("PW?", powerModes, xThis._cbPowerStatus.bind(xThis));
    }

    /**
     * Return saved powerstatus
     * @public
     */
    getPowerStatus() {
        return this.powerstatus;
    }
}

module.exports = SR7007;
