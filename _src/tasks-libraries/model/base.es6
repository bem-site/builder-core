import Q from 'q';
import fsExtra from 'fs-extra';
import Logger from 'bem-site-logger';

/**
 * @exports
 * @class Base
 * @desc base library model class
 */
export default class Base {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Instance of logger
         * @type {Logger}
         */
        this.logger = Logger.createLogger(module);

        /**
         * Private data property for hold all key-value data pairs
         * @type {{}}
         * @private
         */
        this._data = {};
    }

    /**
     * Sets value to given this._data object field.
     * @param {String} field id
     * @param {String|Number|Array|Boolean} value
     * @returns {Base} - instance of class
     * @public
     */
    setValue(field, value) {
        this._data[field] = value;
        return this;
    }

    /**
     * Saves given content to file placed by given filePath
     * @param {String} filePath - path to file
     * @param {String|Object} content content string or js object (JSON stringify will be used before saving)
     * @param {Boolean} [isJSON] - if true then given content object will be saved as string
     * inside fsExtra.outputJSON method. Otherwise fsExtra.outputFile method will be used
     * @returns {*}
     * @public
     */
    saveFile(filePath, content, isJSON) {
        const method = isJSON ? 'outputJSON' : 'outputFile';
        return Q.nfcall(fsExtra[method], filePath, content)
            .thenResolve(filePath)
            .catch(error => {
                this.logger
                    .error(`Error occur while saving file: ${filePath}`)
                    .error(`Error: ${error.stack}`);
                throw error;
            });
    }

    /**
     * Returns page meta-data object
     * @returns {Object}
     * @public
     */
    getData() {
        return this._data;
    }
}