"use strict";

module.exports = function( grunt ) {

    require("matchdep").filterDev("grunt-*").forEach( grunt.loadNpmTasks);

    grunt.initConfig({

        m: {
            srcDir:     "./src",
            destDocDir: "./dist/",
            es5destDir: "./dist/es5/nl.evgilst.homeyavr",
            es5rel:     "es5",

            es6destDir: "/dist/es6/nl.evgilst/homeyavr",
            es6rel:     "es6"
        },

        clean: {
            es5:    ["<%= m.es5destDir %>"],
            es6:    ["<%= m.es6destDir %>"]
        },

        copy: {
            es5_homey_files: {
                files: [
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "assets/**/*",
                        dest:   "<%= m.es5destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "locales/**/*",
                        dest:   "<%= m.es5destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "drivers/avr/accests/**/*",
                        dest:   "<%= m.es5destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "drivers/avr/pair/**/*",
                        dest:   "<%= m.es5destDir %>"
                    },

                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "app.json",
                        dest:   "<%= m.es5destDir %>"
                    }
                ]
            },
            es6_homey_files: {
                files: [
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "assets/**/*",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "locales/**/*",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "drivers/avr/accests/**/*",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "drivers/avr/pair/**/*",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "drivers/avr/lib/**/*",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "app.json",
                        dest:   "<%= m.es6destDir %>"
                    },
                    {
                        expand: true,
                        cwd:    "<%= m.srcDir %>",
                        src:    "app.js",
                        dest:   "<%= m.es6destDir %>"
                    }
                ]
            }
        },

        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "<%= m.es5destDir %>/app.js":   "<%= m.srcDir %>/app.js",

                    "<%= m.es5destDir %>/drivers/avr/driver.js":
                            "<%= m.srcDir %>/drivers/avr/driver.js",

                    "<%= m.es5destDir %>/drivers/avr/lib/avr.js":
                            "<%= m.srcDir %>/drivers/avr/lib/avr.js",
                    "<%= m.es5destDir %>/drivers/avr/lib/sr7007.js":
                            "<%= m.srcDir %>/drivers/avr/lib/sr7007.js",
                    "<%= m.es5destDir %>/drivers/avr/lib/sr7006.js":
                            "<%= m.srcDir %>/drivers/avr/lib/sr7006.js"
                }
            }
        },

        jsdoc: {
            dist: {
                src: [
                    "<%= m.srcDir %>/app.js",
                    "<%= m.srcDir %>/drivers/avr/driver.js",
                    "<%= m.srcDir %>/drivers/avr/lib/avr.js",
                    "<%= m.srcDir %>/drivers/avr/lib/sr7007.js"
                ],
                options: {
                    destination: "<%= m.destDocDir %>/docs"
                }
            }
        }
    });

    var es5BuildTasks = [
        "clean:es5",
        "copy:es5_homey_files",
        "babel"
    ];

    var es6BuildTasks = [
        "clean:es6",
        "copy:es6_homey_files"
    ];

    var jsDocTasks = [
        "jsdoc"
    ];

    grunt.registerTask("buildes5", es5BuildTasks);
    grunt.registerTask("buildes6", es6BuildTasks);
    grunt.registerTask("builddoc", jsDocTasks);

    grunt.registerTask("builddist", [es5BuildTasks, es6BuildTasks, jsDocTasks]);
};
