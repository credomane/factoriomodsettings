'use strict';

class ModSettingsSerialiser {
    constructor(file) {
        this._fs = require("fs");
        this._file = file;

        this._type = require("./ModeSettingsPropertyTypes");
    }

    saveRaw(value) {
        let length = value.length;
        if (this._fs.writeSync(this._file, value, 0, length) < length) {
            throw new Error("Error writing to file.");
        }
    }

    saveByte(value) {
        let buf = Buffer.alloc(1);
        buf.writeUInt8(value);
        this.saveRaw(buf);
    }

    saveBool(value) {
        let buf = Buffer.alloc(1);
        //Gotta do this otherwise it always writes 1 now matter if value is true or false.
        //value = (!!value) ? 1 : 0;
        buf.writeUInt8(value);
        this.saveRaw(buf);
    }

    saveUShort(value) {
        let buf = Buffer.alloc(2);
        buf.writeUInt16LE(value);
        this.saveRaw(buf);
    }

    saveUInt(value) {
        let buf = Buffer.alloc(4);
        buf.writeUInt16LE(value);
        this.saveRaw(buf);
    }

    saveULong(value) {
        let buf = Buffer.alloc(8);
        buf.writeBigUInt64LE(value);
        this.saveRaw(buf);
    }

    saveDouble(value) {
        let buf = Buffer.alloc(8);
        buf.writeDoubleLE(value);
        this.saveRaw(buf);
    }

    saveString(value) {
        /*
        //According to Rseding91's sample code this is how this is suppose to work...
        this.saveBool(value.length === 0);
        if (value.length === 0) {
            return;
        }
        */
        //...but it is always false in practice.
        this.saveBool(false);

        let buf = Buffer.from(value);

        if (buf.length < 255) {
            this.saveByte(buf.length);
        } else {
            this.saveByte(255);
            this.saveUInt(buf.length);
        }
        this.saveRaw(buf);
    }

    savePropertyTree(tree) {
        let type = typeof (tree);
        // Type
        this.saveByte(this._type[type]);
        // Any-type flag
        //According to rseding91's sample code this is how the any-flag works but in reality it is always false..
        //this.saveBool(this._type[type] === this._type.string);
        this.saveBool(false);

        let count, data;

        switch (this._type[type]) {
            case this._type.none:
                break;
            case this._type.boolean:
                this.saveBool(tree);
                break;
            case this._type.number:
                this.saveDouble(tree);
                break;
            case this._type.string:
                this.saveString(tree);
                break;
            case this._type.list:
                count = tree.length;
                this.saveUInt(count);
                // Save list values
                tree.forEach(function (value) {
                    // List uses the same key <> value format as Dictionary but the key is unused
                    this.saveString("");
                    this.savePropertyTree(tree[value]);
                }.bind(this));
                break;
            case this._type.dictionary:
                count = Object.keys(tree).length;
                this.saveUInt(count);

                // Save dictionary values
                Object.keys(tree).forEach(function (value) {
                    this.saveString(value);
                    this.savePropertyTree(tree[value]);
                }.bind(this));

                break;
            default:
                throw new Error("Unknown type: " + type);
        }

    }
}

exports = module.exports = ModSettingsSerialiser;
