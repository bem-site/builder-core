import Q from 'q';
import Logger from 'bem-site-logger';
import Public from './public';
import Private from './private';

export default class Github{
    /**
     * Constructor
     * @param {Object} options object
     */
    constructor(options) {
        this.logger = Logger.setOptions(options.logger).createLogger(module);

        this.apis = new Map();
        this.apis.set(Public.getType(), new Public(options));
        this.apis.set(Private.getType(), new Private(options));
    }

    /**
     * Selects API by given options by host criteria
     * @param {Object} options object
     * @returns {Public|Private}
     * @private
     */
    _getApiByHost(options) {
        const host = options.host;
        const type = (host && host.indexOf('github.com') < 0) ? Private.getType() : Public.getType();
        return this.apis.get(type);
    }

    /**
     * Loads content of file from github via github API
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getContent(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.getContent.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occur while loading content from:`, options));
    }

    /**
     * Returns date of last commit for given file path
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getLastCommitDate(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.getCommits.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occur while get commits from:`, options))
            .then(result => {
                if(!result || !result[0]) {
                    throw new Error('Can not read commits');
                }
                return (new Date(result[0].commit.committer.date)).getTime();
            });
    }

    /**
     * Checks if given repository has issues section or not
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    hasIssues(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.hasIssues.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occur while get issues repo information:`, options));
    }

    /**
     * Returns name of branch by path or repository default branch if given path is tag
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getBranchOrDefault(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.isBranchExists.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occur while get branch information:`, options))
            .then(result => {
                return result ? options.ref : Q.nfcall(api.getDefaultBranch.bind(api), options, headers);
            });
    }

    /**
     * Returns error handler function
     * @param {String} errorMessage - base error message
     * @param {Object} options arg
     * @returns {Function} error handler function
     * @private
     */
    _createErrorHandler(errorMessage, options) {
        return error => {
            this.logger
                .error(`GH: ${error.message}`)
                .error(errorMessage)
                .error(`host: => ${options.host}`)
                .error(`user: => ${options.user}`)
                .error(`repo: => ${options.repo}`);

            options.ref && this.logger.error(`ref:  => ${options.ref}`);
            options.path && this.logger.error(`path: => ${options.path}`);

            throw error;
        };
    }
}
