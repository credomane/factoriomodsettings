'use strict';

function loadFileToJson(file) {
    let fs = require("fs");
    if (!fs.existsSync(file)) {
        throw new Error("Mod Settings file does not exist.");
    }

    let fileHandle = fs.openSync(file, "r");
    let deserializer = require("./ModSettingsDeserialiser");
    deserializer = new deserializer(fileHandle);

    let verMain = deserializer.loadUShort();
    let verMajor = deserializer.loadUShort();
    let verMinor = deserializer.loadUShort();
    let verDeveloper = deserializer.loadUShort();

    let data = {};
    data.version = {
        main: verMain,
        major: verMajor,
        minor: verMinor,
        developer: verDeveloper,
    };

    //Handle the extra boolean added in Factorio 0.17.0
    if (verMain >= 1 || (verMain === 0 && verMajor === 17)) {
        data.unknownBooleanAfterVersionInfo = deserializer.loadBool();
    }

    data.settings = deserializer.loadPropertyTree();
    return data;
}

function saveJsonToFile(file, data) {
    let fs = require("fs");
    let fileHandle = fs.openSync(file, "w");

    let serializer = require("./ModSettingsSerialiser");
    serializer = new serializer(fileHandle);

    let verMain = data.version.main;
    let verMajor = data.version.major;
    let verMinor = data.version.minor;
    let verDeveloper = data.version.developer;


    serializer.saveUShort(verMain);
    serializer.saveUShort(verMajor);
    serializer.saveUShort(verMinor);
    serializer.saveUShort(verDeveloper);

    //Handle the extra boolean added in Factorio 0.17.0
    if (verMain >= 1 || (verMain === 0 && verMajor === 17)) {
        serializer.saveBool(data.unknownBooleanAfterVersionInfo);
    }

    serializer.savePropertyTree(data.settings);
}


exports = module.exports = {
    "loadFileToJson": loadFileToJson,
    "saveJsonToFile": saveJsonToFile
};
