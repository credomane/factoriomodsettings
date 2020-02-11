let fs = require('fs');
let path = require("path");
let modset = require(".");

function print_usage() {
    console.log("------------------------------------------------------------\n" +
        "Automatically converts to and from mod-settings.dat and mod-settings.json\n" +
        "\n" +
        "To convert from dat to json:" +
        "\tnode standaloneapp.js inputFileName.dat \n" +
        "\n" +
        "To convert from json to dat:" +
        "\tnode standaloneapp.js inputFileName.json \n" +
        "\n" +
        "The outputFile will always be the inputFileName with the extension the file was converted too.\n" +
        "WARNING: outputFile will always be overwritten." +
        "------------------------------------------------------------\n");
}

let parts;
let direction = "";
let directory = "";
let infile = "";
let outfile = "";

if (process.argv.length === 3) {
    infile = process.argv[2];
    parts = path.parse(infile);
    if (parts.dir !== "") {
        directory = parts.dir + path.sep;
    }
    if (parts.ext.toLowerCase() === ".json") {
        direction = "todat";
        outfile = directory + parts.name + ".dat";

    } else if (parts.ext.toLowerCase() === ".dat") {
        direction = "tojson";
        outfile = directory + parts.name + ".json";
    } else {
        console.log("File '" + infile + "' must have either the json or dat extension.");
        process.exit(1);
    }
} else {
    console.log("ERROR: Incorrect number of arguments.");
    print_usage();
    process.exit(1);
}

//Sanity check. This error should never appear unless app is broken.
if (direction !== "tojson" && direction !== "todat") {
    console.log("ERROR: Unknown direction: '" + direction + "'");
    print_usage();
    process.exit(1);
}

if (!fs.existsSync(infile)) {
    console.log("File '" + infile + "' does not exist.");
    process.exit(1);
}

if (direction === "tojson") {
    console.log("Attempting to load and parse '" + infile + "'");
    let json = modset.loadFileToJson(infile);
    json = JSON.stringify(json, null, 2);
    console.log("Writing json to file '" + outfile + "'");
    fs.writeFileSync(outfile, json);
}

if (direction === "todat") {
    console.log("Attempting to load and parse '" + infile + "'");
    let contents = fs.readFileSync(infile);
    contents = JSON.parse(contents);
    console.log("Writing to dat file '" + outfile + "'");
    modset.saveJsonToFile(outfile, contents);
}
