'use strict';

class ModSettingsDeserialiser {
    constructor(file) {
        this._fs = require("fs");
        this._file = file;

        this._type = require("./ModeSettingsPropertyTypes");
    }

    loadRaw(length) {
        let buf = Buffer.alloc(length);
        if (this._fs.readSync(this._file, buf, 0, length) < length) {
            throw new Error("Error reading from file.");
        }

        return buf;
    }


    loadByte() {
        return this.loadRaw(1).readUInt8();
    }

    loadBool() {
        return !!this.loadRaw(1).readUInt8();
    }

    loadUShort() {
        return this.loadRaw(2).readUInt16LE();
    }

    loadUInt() {
        return this.loadRaw(4).readUInt32LE();

    }

    loadULong() {
        return this.loadRaw(8).readBigUInt64LE();
    }

    loadDouble() {
        return this.loadRaw(8).readDoubleLE();
    }

    loadString() {
        if (this.loadBool()) // true if empty
            return "";

        let stringSize = this.loadByte();
        if (stringSize === 255) {
            stringSize = this.loadUInt();
        }

        let buffer = this.loadRaw(stringSize);
        return buffer.toString("utf8");
    }

    loadPropertyTree() {
        let type = this.loadByte();
        this.loadBool(); // any-type flag

        let count, data;

        switch (type) {
            case this._type.none:
                break;
            case this._type.boolean:
                return this.loadBool();
            case this._type.number:
                return this.loadDouble();
            case this._type.string:
                return this.loadString();
            case this._type.list:
                count = this.loadUInt();
                data = [];
                // Read list values
                for (let i = 0; i < count; ++i) {
                    // List uses the same key <> value format as Dictionary but the key is unused
                    this.loadString();
                    data[data.length] = this.loadPropertyTree();
                }

                return data;
            case this._type.dictionary:
                count = this.loadUInt();
                data = {};

                // Read dictionary values
                for (let i = 0; i < count; ++i) {
                    let propName = this.loadString();
                    data[propName] = this.loadPropertyTree();
                }

                return data;
            default:
                throw new Error("Unknown type: " + type);
        }
    }
}

exports = module.exports = ModSettingsDeserialiser;
