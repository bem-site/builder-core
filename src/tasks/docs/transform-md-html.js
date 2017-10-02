'use strict';

const Q = require('q');
const _ = require('lodash');
const path = require('path');
const hljs = require('highlight.js');
const bemhtml = require('bem-xjst').bemhtml;
const bemhtmlTemplates = bemhtml.compile();
const slugger = new (require('github-slugger'))();
const mdToBemjson = require('md-to-bemjson');

const baseUtil = require('../../util');

/**
 * Transforms page content source files from markdown format to html
 * @param {Model} model - application model instance
 * @param {Object} options - task options
 * @param {Object} [options.mdToBemjson] - md-to-bemjson options
 * @param {Function} [options.templates] - bem-xjst templates
 * @param {Function} [options.processHTML] - function to process HTML before saving to file
 * @param {Number} [options.concurrency] - number of pages processed at the same time
 * @returns {Function}
 * @example
 * var Q = require('q');
 * var gorshochek = require('gorshochek');
 * var model = gorshochek.createModel();
 * Q()
 *    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
 *    .then(tasks.docs.loadSourcesFromLocal(model))
 *    .then(tasks.docs.transformMdToHtml(model))
 *    .then(tasks.core.saveModel(model))
 *    .then(tasks.core.rsync(model, {
 *        dest: './data',
 *        exclude: ['*.meta.json', 'model.json', '*.md']
 *    }))
 *    .done();
 */
module.exports = (model, options) => {
    options = options || {};
    options.concurrency = options.concurrency || 20;

    /**
     * Returns true if given page has contentFile field
     * and value of this field ends on .md
     * @param {Object} page - model page object
     * @returns {Boolean}
     */
    function hasMarkdownSource(page) {
        return !!(page.contentFile && page.contentFile.match(/\.md$/));
    }

    /**
     * Transforms BEMJSON into html syntax.
     * @param {Object} page - page object
     * @param {Object} md - markdown content of page
     * @returns {String}
     */
    function transform(page, md) {
        slugger.reset();

        return Q(mdToBemjson.convert(md, options.mdToBemjson))
            .then(bemjson => {
                bemjson.hljs = hljs;
                bemjson.slugger = slugger;

                return (options.templates || bemhtmlTemplates).apply(bemjson);
            })
            .catch(error => {
                console.error(`Error occur while transform md -> html for page: ${page.url}`);
                console.error(error.stack);
                throw error;
            });
    }

    /**
     * @param {Object} page - page object
     * @param {String} html - html content of page
     * @returns {String}
     */
    function processHTML(page, html) {
        if (options.processHTML) {
            return options.processHTML(page, html);
        }

        return html;
    }

    /**
     * Transform md content of page source file into html syntax
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @returns {Promise}
     */
    function processPage(model, page) {
        const sourceFilePath = page.contentFile;
        const mdFileDirectory = path.dirname(sourceFilePath);
        const htmlFilePath = path.join(mdFileDirectory, 'index.html');

        return Q(sourceFilePath)
            .then(baseUtil.readFileFromCache.bind(baseUtil))
            .then(transform.bind(null, page))
            .then(processHTML.bind(null, page))
            .then(baseUtil.writeFileToCache.bind(baseUtil, htmlFilePath))
            .then(() => {
                page.contentFile = htmlFilePath;
                return page;
            });
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, hasMarkdownSource, processPage, options.concurrency)
            .thenResolve(model);
    };
};
