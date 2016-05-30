"use strict";

let net = require("net");

class AvrSim {

    constructor( sPort ) {

        this.port   = sPort;
        this.socket = null;

        this.powerstatus   = "PWSTANDBY";
        this.mzpowerstatus = "ZMOFF";
        this.mute          = "MUOFF";
        this.inputsel      = "SICD";
        this.volumestatus  = 45;
        this.surroundMode  = "MSAUTO";
        this.ecoMode       = "ECOON";
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

        let date = new Date();
        let dateStr = date.toISOString();
        console.log(`${dateStr} Received : '${xData}'.`);

        if ( xData.substr(0,2) === "PW") {
            if ( xData !== "PW?" ) {
                this.powerstatus = xData ;
            }
            console.log(`Returning : ${this.powerstatus}.`);
            this.socket.write( this.powerstatus);

        } else if ( xData.substr(0,2) === "ZM") {

            if ( xData !== "ZM?" ) {
                this.mzpowerstatus = xData ;
            }
            console.log(`Returning : ${this.mzpowerstatus}.`);
            this.socket.write( this.mzpowerstatus);

        } else if ( xData.substr(0,2) === "MU") {

            if ( xData !== "MU?" ) {
                this.mute = xData ;
            }
            console.log(`Returning : ${this.mute}.`);
            this.socket.write( this.mute);

        } else if ( xData.substr(0,2) === "SI") {

            if ( xData !== "SI?" ) {
                this.inputsel = xData ;
            }
            console.log(`Returning : ${this.inputsel}.`);
            this.socket.write( this.inputsel);

        } else if ( xData.substr(0,2) === "MV") {

            let re = /^MV(\d+)/i;

            if ( xData === "MVUP" ) {
                this.volumestatus++;

            } else if ( xData === "MVDOWN") {
                this.volumestatus--;

            } else {

                let Ar = xData.match(re);

                if ( Ar !== null ) {
                    this.volumestatus = Ar[1];
                    console.log(`Returning: MV${this.volumestatus}.`);
                }
            }
            console.log(`Returning : MV${this.volumestatus}.`);
            this.socket.write( "MV" + this.volumestatus );
        } else if ( xData.substr(0,2) === "MS") {

            if ( xData !== "MS?" ) {
                this.surroundMode = xData ;
            }
            console.log(`Returning : ${this.surroundMode}.`);
            this.socket.write( this.surroundMode);
        } else if ( xData.substr(0,2) === "EC") {

            if ( xData !== "ECO?" ) {
                this.ecoMode = xData ;
            }
            console.log(`Returning : ${this.ecoMode }.`);
            this.socket.write( this.ecoMode );
        }
    }
}

let avrSim = new AvrSim( 2222 );

avrSim.connect();
