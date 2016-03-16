"use strict";

let net = require("net");

class AvrSim {

    constructor( sPort ) {

        this.port   = sPort;
        this.socket = null;

        this.powerstatus = "standby";
        this.mute        = "off";
        this.inputsel    = "CD";
    }

    connect() {
        net.createServer ( (socket) => {
            this.socket = socket;

            socket
                .on( "listening", () => {
                    console.log(`AvrSim is listening on port ${this.port}.`);
                })

                .on( "data" , (data) => {
                    this.processData( data );
                })

                .on( "error" , (err) => {
                    console.log(`Error: ${err}.`);
                });
        }).listen( this.port );
    }

    close() {
        this.socket.destroy();
    }

    processData( data ) {
        let xData = String(data);

        xData = xData.replace("\r", "");

        console.log(`Received : '${xData}'.`);

        if ( xData === "PW?" ) {
            if ( this.powerstatus === "on") {
                console.log("Send: 'PWON'.");
                this.socket.write( "PWON\r");
            } else {
                console.log("Send: 'PWSTANDBY'.");
                this.socket.write( "PWSTANDBY\r");
            }
        } else if ( xData === "PWON") {
            this.powerstatus = "on";
        } else if ( xData === "PWSTANDBY") {
            this.powerstatus = "standby";
        } else if ( xData === "MUON") {
            this.mute = "on";
        } else if ( xData === "MUOFF") {
            this.mute = "off";
        } else if ( xData === "MU?") {
            if ( this.mute === "on") {
                console.log("Send: 'MUON'.");
                this.socket.write( "MUON\r");
            } else {
                console.log("Send: 'MUOFF'.");
                this.socket.write( "MUOFF\r");
            }
        } else if ( xData === "SIPHONO") {
            this.inputsel = "PHONO";
        } else if ( xData === "SICD") {
            this.inputsel = "CD";
        } else if ( xData === "SIDVD") {
            this.inputsel = "DVD";
        } else if ( xData === "SIBD") {
            this.inputsel = "BD";
        } else if ( xData === "SITV") {
            this.inputsel = "TV";
        } else if ( xData === "SISAT/CBL") {
            this.inputsel = "SAT/CBL";
        } else if ( xData === "SISAT") {
            this.inputsel = "SAT";
        } else if ( xData === "SIMPLAY") {
            this.inputsel = "MPLAY";
        } else if ( xData === "SIVCR") {
            this.inputsel = "VCR";
        } else if ( xData === "SIGAME") {
            this.inputsel = "GAME";
        } else if ( xData === "SIV.AUX") {
            this.inputsel = "V.AUX";
        } else if ( xData === "SITUNER") {
            this.inputsel = "TUNER";
        } else if ( xData === "SILASTFM") {
            this.inputsel = "LASTFM";
        } else if ( xData === "SIFLICKR") {
            this.inputsel = "FLICKR";
        } else if ( xData === "SIIRADIO") {
            this.inputsel = "IRADIO";
        } else if ( xData === "SISERVER") {
            this.inputsel = "SERVER";
        } else if ( xData === "SIFAVORITES") {
            this.inputsel = "FAVORITES";
        } else if ( xData === "CDR") {
            this.inputsel = "CDR";
        } else if ( xData === "SIAUX1") {
            this.inputsel = "AUX1";
        } else if ( xData === "SIAUX2") {
            this.inputsel = "AUX2";
        } else if ( xData === "SINET") {
            this.inputsel = "NET";
        } else if ( xData === "SINET/USB") {
            this.inputsel = "NET/USB";
        } else if ( xData === "SIM-XPORT") {
            this.inputsel = "M-XPORT";
        } else if ( xData === "SIUSB/IPOD") {
            this.inputsel = "USB/IPOD";
        } else if ( xData === "SI?") {
            console.log(`Send: SI${this.inputsel}\r`);
            this.socket.write( `SI${this.inputsel}\r`);
        }
    }
}

let avrSim = new AvrSim( 2222 );

avrSim.connect();
