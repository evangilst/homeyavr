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

let inputSources = [
    {
        type: "PHONO",
        text: "Phono"
    },
    {
        type: "CD",
        text: "CD player"
    },
    {
        type: "DVD",
        text: "DVD"
    },
    {
        type: "BD",
        text: "Bluray"
    },
    {
        type: "TV",
        text: "TV audio"
    },
    {
        type: "SAT/CBL",
        text: "Cable/Satelite"
    },
    {
        type: "SAT",       // Needs to be later than 'STA/CBL' for correct functioning.
        text: "Satelite"
    },
    {
        type: "MPLAY",
        text: "Media player"
    },
    {
        type: "GAME",
        text: "Game computer"
    },
    {
        type: "TUNER",
        text: "Tuner"
    },
    {
        type: "LASTFM",
        text: "LastFM"
    },
    {
        type: "FLICKR",
        text: "Flickr"
    },
    {
        type: "IRADIO",
        text: "Internet radio"
    },
    {
        type: "SERVER",
        text: "Server"
    },
    {
        type: "FAVORITES",
        text: "Favorites"
    },
    {
        type: "AUX1",
        text: "AUX1 port"
    },
    {
        type: "AUX2",
        text: "AUX2 port"
    },
    {
        type: "NET",
        text: "Network"
    },
    {
        type: "M-XPORT",
        text: "m-Xport"
    },
    {
        type: "USB/IPOD",
        text: "USB/IPOD port"
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

    /*********************************************************************
     *  Inputsource methods.
     *********************************************************************/

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
     * Select LASTFM as input source
     *
     * @method     selectInputSourceLastfm
     */
    selectInputSourceLastfm() {

        let xThis = this ;

        this._writeCommandNoResponse("SILASTFM");

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
        this._writeCommandWithReponse("SI?", inputSources, xThis._cbInputSource.bind(xThis));
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
}

module.exports = SR7007;
