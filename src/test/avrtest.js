/**
 * AVRTEST
 *      a basic node program to test the functionality of the 'avr.js' commands
 *      for a Marantz AVR remote commands over a telnet connetion.
 */

"use strict";

let IPADDRESS = "192.168.1.35";
let IPPORT    = 2222;

let Avr = require("./avr");

let mAvr = new Avr( IPPORT, IPADDRESS, "testavr", "SR5010");

console.log("IP address : ", mAvr.getHostname());
console.log("Port       : ", mAvr.getPort());
console.log("Type       : ", mAvr.getType());
console.log("Name       : ", mAvr.getName());

mAvr.setTest(); // enable testing (ignoring avr type restrictions).

/**
 * Check all power commands.
 *
 */
let checkPowerCommands = () => {

    setTimeout( () => {              mAvr.powerOn();             },   10);
    setTimeout( () => { console.log( mAvr.getPowerStatus());     }, 1000);
    setTimeout( () => { console.log( mAvr.getPowerOnOffState()); }, 1200);
    setTimeout( () => {              mAvr.powerOff();            }, 2000);
    setTimeout( () => { console.log( mAvr.getPowerStatus());     }, 2500);
    setTimeout( () => { console.log( mAvr.getPowerOnOffState()); }, 2700);
};

/**
 * Check all main zone power commands.
 *
 */
let checkMainZonePowerCommands = () => {

    setTimeout( () => {              mAvr.mainZonePowerOn();             },   10);
    setTimeout( () => { console.log( mAvr.getMainZonePowerStatus());     }, 1000);
    setTimeout( () => { console.log( mAvr.getMainZonePowerOnOffState()); }, 1200);
    setTimeout( () => {              mAvr.mainZonePowerOff();            }, 2000);
    setTimeout( () => { console.log( mAvr.getMainZonePowerStatus());     }, 2500);
    setTimeout( () => { console.log( mAvr.getMainZonePowerOnOffState()); }, 2700);
};

/**
 * Check all mute commands.
 *
 */
let checkMuteCommands = () => {

    setTimeout( () => {              mAvr.muteOn();             },   10);
    setTimeout( () => { console.log( mAvr.getMuteStatus());     },  500);
    setTimeout( () => { console.log( mAvr.getMuteOnOffState()); },  800);
    setTimeout( () => {              mAvr.muteOff();            }, 1000);
    setTimeout( () => { console.log( mAvr.getMuteStatus());     }, 1500);
    setTimeout( () => { console.log( mAvr.getMuteOnOffState()); }, 1800);
};

/**
 * Check all vlume commands.
 *
 */
let checkVolumeCommands = () => {

    setTimeout( () => {              mAvr.volumeUp();        },   10);
    setTimeout( () => { console.log( mAvr.getVolume());      },  500);
    setTimeout( () => {              mAvr.volumeDown();      },  800);
    setTimeout( () => { console.log( mAvr.getVolume());      }, 1300);
    setTimeout( () => {              mAvr.setVolume(33);     }, 1600);
    setTimeout( () => { console.log( mAvr.getVolume());      }, 2000);
};

/**
 * Check all input source commands.
 *
 */
let checkInputSourceCommands = () => {

    setTimeout( () => {              mAvr.selectInputSourcePhono();        },   10);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },  200);
    setTimeout( () => {              mAvr.selectInputSourceCd();           },  400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },  600);
    setTimeout( () => {              mAvr.selectInputSourceDvd();          },  800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 1000);
    setTimeout( () => {              mAvr.selectInputSourceBluray();       }, 1200);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 1400);
    setTimeout( () => {              mAvr.selectInputSourceTv();           }, 1600);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 1800);
    setTimeout( () => {              mAvr.selectInputSourceSatCbl();       }, 2000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 2200);
    setTimeout( () => {              mAvr.selectInputSourceSat();          }, 2400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 2600);
    setTimeout( () => {              mAvr.selectInputSourceMplay();        }, 2800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 3000);
    setTimeout( () => {              mAvr.selectInputSourceVcr();          }, 3200);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 3400);
    setTimeout( () => {              mAvr.selectInputSourceGame();         }, 3600);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 3800);
    setTimeout( () => {              mAvr.selectInputSourceVaux();         }, 4000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 4200);
    setTimeout( () => {              mAvr.selectInputSourceTuner();        }, 4400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 4800);
    setTimeout( () => {              mAvr.selectInputSourceSpotify();      }, 5000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 5200);
    setTimeout( () => {              mAvr.selectInputSourceNapster();      }, 5400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 5600);
    setTimeout( () => {              mAvr.selectInputSourceFlickr();       }, 5800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 6000);
    setTimeout( () => {              mAvr.selectInputSourceIradio();       }, 6200);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 6400);
    setTimeout( () => {              mAvr.selectInputSourceFavorites();    }, 6600);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 6800);
    setTimeout( () => {              mAvr.selectInputSourceAux1();         }, 7000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 7200);
    setTimeout( () => {              mAvr.selectInputSourceAux2();         }, 7400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 7600);
    setTimeout( () => {              mAvr.selectInputSourceAux3();         }, 7800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 8000);
    setTimeout( () => {              mAvr.selectInputSourceAux4();         }, 8200);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 8400);
    setTimeout( () => {              mAvr.selectInputSourceAux5();         }, 8600);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 8800);
    setTimeout( () => {              mAvr.selectInputSourceAux6();         }, 9000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 9200);
    setTimeout( () => {              mAvr.selectInputSourceAux7();         }, 9400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            }, 9600);
    setTimeout( () => {              mAvr.selectInputSourceInetUsb();      }, 9800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },10000);
    setTimeout( () => {              mAvr.selectInputSourceNet();          },10200);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },10400);
    setTimeout( () => {              mAvr.selectInputSourceBluetooth();    },10600);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },10800);
    setTimeout( () => {              mAvr.selectInputSourceMxport();       },11000);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },11200);
    setTimeout( () => {              mAvr.selectInputSourceUsbIpod();      },11400);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },11600);
    setTimeout( () => {              mAvr.sendInputSourceCommand("SICD");  },11800);
    setTimeout( () => { console.log( mAvr.getInputSelection());            },12000);
    setTimeout( () => { console.log( mAvr.getValidInputSelection());       },12200);
};

/**
 * Check all surround mode commands.
 *
 */
let checkSurroundCommands = () => {
    setTimeout( () => {              mAvr.setSurroundModeToMovies();         },    1);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                },  200);
    setTimeout( () => {              mAvr.setSurroundModeToMusic();          },  400);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                },  600);
    setTimeout( () => {              mAvr.setSurroundModeToGame();           },  800);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 1000);
    setTimeout( () => {              mAvr.setSurroundModeToDirect();         }, 1200);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 1400);
    setTimeout( () => {              mAvr.setSurroundModeToPureDirect();     }, 1600);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 1800);
    setTimeout( () => {              mAvr.setSurroundModeToStereo();         }, 2000);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 2200);
    setTimeout( () => {              mAvr.setSurroundModeToAuto();           }, 2400);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 2600);
    setTimeout( () => {              mAvr.setSurroundModeToNeural();         }, 2800);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 3000);
    setTimeout( () => {              mAvr.setSurroundModeToStandard();       }, 3200);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 3400);
    setTimeout( () => {              mAvr.setSurroundModeToDolby();          }, 3600);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 3800);
    setTimeout( () => {              mAvr.setSurroundModeToDts();            }, 4000);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 4200);
    setTimeout( () => {              mAvr.setSurroundModeToMultiChnStereo(); }, 4400);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 4600);
    setTimeout( () => {              mAvr.setSurroundModeToMatrix();         }, 4800);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 5000);
    setTimeout( () => {              mAvr.setSurroundModeToVirtual();        }, 5200);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 5400);
    setTimeout( () => {              mAvr.setSurroundModeToLeft();           }, 5600);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 5800);
    setTimeout( () => {              mAvr.setSurroundModeToRight();          }, 6000);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 6200);
    setTimeout( () => {              mAvr.sendSurroundCommand("MSAUTO");     }, 6400);
    setTimeout( () => { console.log( mAvr.getSurroundMode());                }, 6600);
    setTimeout( () => { console.log( mAvr.getValidSurround());               }, 6800);
};

/**
 * Check all eco commands.
 *
 */
let checkEcoCommands = () => {
    setTimeout( () => { console.log( mAvr.hasEco());              },                1);
    setTimeout( () => {              mAvr.ecoOn();                },              200);
    setTimeout( () => { console.log( mAvr.getEcoMode());          },              400);
    setTimeout( () => {              mAvr.ecoOff();               },              600);
    setTimeout( () => { console.log( mAvr.getEcoMode());          },              800);
    setTimeout( () => {              mAvr.ecoAuto();              },             1000);
    setTimeout( () => { console.log( mAvr.getEcoMode());          },             1200);
    setTimeout( () => {              mAvr.sendEcoCommand("ECO_UN_SUPPORTED"); }, 1400);
    setTimeout( () => { console.log( mAvr.getValidEcoCommands()); },             1600);
};

/**
 * Check all avr commands
 * Calls checks for power, mani zone power, mute, volume, inputsource, surround mode and eco.
 *
 */
let checkAll = () => {

    setTimeout( () => { checkPowerCommands();             },    10);
    setTimeout( () => { checkMainZonePowerCommands();     },  3000);
    setTimeout( () => { checkMuteCommands();              },  6000);
    setTimeout( () => { checkVolumeCommands();            },  8000);
    setTimeout( () => { checkInputSourceCommands();       }, 11000);
    setTimeout( () => { checkSurroundCommands();          }, 25000);
    setTimeout( () => { checkEcoCommands();               }, 35000);
    setTimeout( () => { process.exit(0);                  }, 40000);
};


checkAll();
