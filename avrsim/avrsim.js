"use strict";

let net = require("net");

class AvrSim {

    constructor( sPort ) {

        this.port   = sPort;
        this.socket = null;

        this.powerstatus   = "standby";
        this.mzpowerstatus = "off";
        this.mute          = "off";
        this.inputsel      = "CD";
        this.volumestatus  = 45;
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

        if ( xData.substr(0,2) === "PW") {
            if ( xData === "PW?") {
                console.log(`Sending : ${this.powerstatus}.`);
                return this.powerstatus;
            } else {
                this.powerstatus = xData;
                console.log(`Returning: ${this.powerstatus}.`);
            }

        } else if ( xData.substr(0,2) === "ZW") {

            if ( xData === "ZW?") {
                console.log(`Sending : ${this.mzpowerstatus}.`);
                return this.mzpowerstatus;
            } else {
                this.mzpowerstatus = xData;
                console.log(`Returning: ${this.mzpowerstatus}.`);
            }

        } else if ( xData.substr(0,2) === "MU") {

            if ( xData === "MU?") {
                console.log(`Sending : ${this.mutestatus}.`);
                return this.mutestatus;
            } else {
                this.mutestatus = xData;
                console.log(`Returning: ${this.mutestatus}.`);
            }

        } else if ( xData.substr(0,2) === "SI") {

            if ( xData === "SI?") {
                console.log(`Sending : ${this.inputsel}.`);
                return this.inputsel;
            } else {
                this.inputsel = xData;
                console.log(`Returning: ${this.inputsel}.`);
            }

        } else if ( xData.substr(0,2) === "MV") {

            let re = /^MV(\d+)/i;

            if ( xData === "MV?") {
                console.log(`Sending : MV${this.volumestatus}.`);
                return this.volumestatus;
            } else if ( xData === "MVUP" ) {
                this.volumestatus++;
                console.log(`Returning: MV${this.volumestatus}.`);
            } else if ( xData === "MVDOWN") {
                this.volumestatus--;
                console.log(`Returning: MV${this.volumestatus}.`);
            } else {

                let Ar = xData.match(re);

                console.log( Ar );

                if ( Ar !== null ) {
                    this.volumestatus = Ar[1];
                    console.log(`Returning: MV${this.volumestatus}.`);
                }
            }
        }
    }
}

let avrSim = new AvrSim( 2222 );

avrSim.connect();
