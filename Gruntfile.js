"use strict";

module.exports = function( grunt ) {

    require("matchdep").filterDev("grunt-*").forEach( grunt.loadNpmTasks);

    grunt.initConfig({

        defs: {
            srcDir:        "./src",
            srcSimDir:     "./avrsim",

            destDir:       "./dist/",

            destDocDir:    "<%= defs.destDir %>/docs",
            destSimDir:    "<%= defs.destDir %>/avrsim",
            destAppDir:    "<%= defs.destDir %>/nl.evgilst.homeyavr"
        },

        clean: {
            all:    ["<%= defs.destDir %>"],
            docs:   ["<%= defs.destDocDir %>"],
            sim:    ["<%= defs.destSimDir %>"],
            appl:   ["<%= defs.destAppDir %>"]
        },

        copy: {
            homey_files: {
                files: [
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "assets/**/*",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "locales/**/*",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "drivers/avr/assets/**/*",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "drivers/avr/pair/**/*",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "drivers/avr/lib/conf/**/*.json",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "app.json",
                        dest:   "<%= defs.destAppDir %>"
                    }
                ]
            }
        },

        babel: {
            options: {
                sourceMap: true
            },
            homey: {
                files: {
                    "<%= defs.destAppDir %>/app.js":   "<%= defs.srcDir %>/app.js",

                    "<%= defs.destAppDir %>/drivers/avr/driver.js":
                            "<%= defs.srcDir %>/drivers/avr/driver.js",

                    "<%= defs.destAppDir %>/drivers/avr/lib/avr.js":
                            "<%= defs.srcDir %>/drivers/avr/lib/avr.js",
                    "<%= defs.destAppDir %>/drivers/avr/lib/avrtest.js":
                            "<%= defs.srcDir %>/drivers/avr/lib/avrtest.js",


                }
            },
            "sim": {
                files: {
                    "<%= defs.destSimDir %>/avrsim.js":
                            "<%= defs.srcSimDir %>/avrsim.js"
                }
            }
        },

        jsdoc: {
            dist: {
                src: [
                    "<%= defs.srcDir %>/app.js",
                    "<%= defs.srcDir %>/drivers/avr/driver.js",
                    "<%= defs.srcDir %>/drivers/avr/lib/avr.js",
                ],
                options: {
                    destination: "<%= defs.destDocDir %>"
                }
            }
        }
    });

    var buildApplication = [
        "clean:appl",
        "copy:homey_files",
        "babel:homey"
    ];

    var buildSimulator = [
        "clean:sim",
        "babel:sim"
    ];

    var buildDocumentation = [
        "clean:docs",
        "jsdoc"
    ];

    grunt.registerTask("buildapp", buildApplication);
    grunt.registerTask("buildsim", buildSimulator);
    grunt.registerTask("builddocs", buildDocumentation);

    grunt.registerTask("buildall", function() {
        grunt.task.run(buildApplication);
        grunt.task.run(buildSimulator);
        grunt.task.run(buildDocumentation);
    });
};
