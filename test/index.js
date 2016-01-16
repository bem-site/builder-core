require('./src/changes.test.js');
require('./src/model.test.js');
require('./src/util.test.js');

require('./src/tasks-libraries/model/base.test.js');
require('./src/tasks-libraries/model/block.test.js');
require('./src/tasks-libraries/model/document.test.js');
require('./src/tasks-libraries/model/level.test.js');
require('./src/tasks-libraries/model/version.test.js');

require('./src/tasks-docs/github/index.test.js');

require('./src/tasks-core/merge-models.test.js');
require('./src/tasks-core/normalize-model.test.js');
require('./src/tasks-core/rsync.test.js');

// require('./src/tasks-docs/load-from-github.test.js');
// require('./src/tasks-docs/load-from-file.test.js');
require('./src/tasks-docs/transform-md-html.test.js');

require('./src/tasks-override/util.test.js');
// require('./src/tasks-override/override-docs.test.js');

require('./src/tasks-page/util.test.js');
require('./src/tasks-page/header-title.test.js');
require('./src/tasks-page/header-meta.test.js');
require('./src/tasks-page/breadcrumbs.test.js');
require('./src/tasks-page/search-meta.test.js');

require('./src/tasks-sitemap/sitemap-xml.test.js');
