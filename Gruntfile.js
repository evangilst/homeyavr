"use strict";

module.exports = function( grunt ) {

    require("matchdep").filterDev("grunt-*").forEach( grunt.loadNpmTasks);

    grunt.initConfig({

        defs: {
            localDir:      ".",
            srcDir:        "./src",
            srcSimDir:     "<%= defs.srcDir %>/test",

            destDir:       "./dist/",

            destDocDir:    "<%= defs.destDir %>/docs",
            destTstDir:    "<%= defs.destDir %>/test",
            destAppDir:    "<%= defs.destDir %>/nl.evgilst.homeyavr"
        },

        clean: {
            all:    ["<%= defs.destDir %>"],
            docs:   ["<%= defs.destDocDir %>"],
            tst:    ["<%= defs.destTstDir %>"],
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
                        src:    "drivers/avr/assets/*.svg",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "drivers/avr/assets/images/*.jpg",
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
                        cwd:    "<%= defs.localDir %>",
                        src:    "README.md",
                        dest:   "<%= defs.destAppDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>",
                        src:    "app.json",
                        dest:   "<%= defs.destAppDir %>"
                    }
                ]
            },
            test_files: {
                files: [
                    {
                        expand: true,
                        cwd:    "<%= defs.srcDir %>/drivers/avr/lib",
                        src:    "conf/**/*.json",
                        dest:   "<%= defs.destTstDir %>"
                    }
                ]
            }
        },

        babel: {
            options: {
                sourceMap: false
            },
            homey: {
                files: {
                    "<%= defs.destAppDir %>/app.js":   "<%= defs.srcDir %>/app.js",

                    "<%= defs.destAppDir %>/drivers/avr/driver.js":
                            "<%= defs.srcDir %>/drivers/avr/driver.js",

                    "<%= defs.destAppDir %>/drivers/avr/lib/avr.js":
                            "<%= defs.srcDir %>/drivers/avr/lib/avr.js"
                }
            },
            "tst": {
                files: {
                    "<%= defs.destTstDir %>/avrsim.js":
                            "<%= defs.srcSimDir %>/avrsim.js",
                    "<%= defs.destTstDir %>/avrtest.js":
                            "<%= defs.srcSimDir %>/avrtest.js",
                    "<%= defs.destTstDir %>/avr.js":
                            "<%= defs.srcDir %>/drivers/avr/lib/avr.js"
                }
            }
        },

        jsdoc: {
            dist: {
                src: [
                    "<%= defs.srcDir %>/app.js",
                    "<%= defs.srcDir %>/drivers/avr/driver.js",
                    "<%= defs.srcDir %>/drivers/avr/lib/avr.js",
                    "<%= defs.srcDir %>/test/avrsim.js",
                    "<%= defs.srcDir %>/test/avrtest.js",
                    "<%= defs.srcDir %>/gen/gen_jsons.js"
                ],
                options: {
                    destination: "<%= defs.destDocDir %>"
                }
            }
        },

        jsonlint: {
            all: {
                src: ["<%= defs.srcDir %>/drivers/avr/lib/conf/*.json",
                      "<%= defs.srcDir %>/locales/*.json"],
                options: {
                    formatter: "prose"
                }
            }
        }
    });

    var buildApplication = [
        "clean:appl",
        "copy:homey_files",
        "babel:homey"
    ];

    var buildDocumentation = [
        "clean:docs",
        "jsdoc"
    ];

    var buildTestEnv = [
        "clean:tst",
        "copy:test_files",
        "babel:tst"
    ];

    var checkJson = [
        "jsonlint:all"
    ];

    grunt.registerTask("buildapp", buildApplication);
    grunt.registerTask("buildtest", buildTestEnv);
    grunt.registerTask("builddocs", buildDocumentation);
    grunt.registerTask("checkjson", checkJson);

    grunt.registerTask("buildall", function() {
        grunt.task.run(checkJson);
        grunt.task.run(buildApplication);
        grunt.task.run(buildTestEnv);
        grunt.task.run(buildDocumentation);
    });
};
