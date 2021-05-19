const fs = require("fs");
const path = require("path");
const TR = require("turbo-rss");

module.exports = function(api, options) {
  api.beforeBuild(({ store }) => {
    if (!options.contentTypeName) {
      throw new Error(`Missing contentTypeName option.`);
    }

    if (!options.feedOptions) {
      throw new Error(`Missing feedOptions options.`);
    }

    if (options.feedOptions && !options.feedOptions.title) {
      throw new Error(`Missing feedOptions.title option.`);
    }

    if (options.feedOptions && !options.feedOptions.description) {
      throw new Error(`Missing feedOptions.description option.`);
    }

    if (options.feedOptions && !options.feedOptions.link) {
      throw new Error(`Missing feedOptions.link option.`);
    }

    const feed = new TR({
      title: options.feedOptions.title,
      description: options.feedOptions.description,
      link: options.feedOptions.link,
    });

    const isExistContentType = store.getContentType(options.contentTypeName);

    if (!isExistContentType) {
      throw new Error(`Not exists ${options.contentTypeName} contentType`);
    }

    const items = store.getCollection(options.contentTypeName).data();

    for (const item of items) {
      feed.item(options.feedItemOptions(item));
    }

    const output = {
      dir: "./static",
      name: "rss.xml",
      ...options.output,
    };

    const outputPath = path.resolve(process.cwd(), output.dir);
    const outputPathExists = fs.existsSync(outputPath);
    const fileName = output.name.endsWith(".xml")
      ? output.name
      : `${output.name}.xml`;

    if (outputPathExists) {
      fs.writeFileSync(
        path.resolve(process.cwd(), output.dir, fileName),
        feed.xml()
      );
    } else {
      fs.mkdirSync(outputPath);
      fs.writeFileSync(
        path.resolve(process.cwd(), output.dir, fileName),
        feed.xml()
      );
    }
  });

  api.afterBuild(() => {
    // const rssFile = path.resolve(api._app.config.outDir, "rss.xml");
    // if (rssFile) {
    //   fs.unlinkSync(rssFile);
    // }
  });
};
