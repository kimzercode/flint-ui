// Flint UI docs — Eleventy config
// input:  docs-site/src   →   output: docs/  (committed, viewable without Node)
//
// The output mirrors repo paths for library assets (css/, js/, demos/) so the
// existing demo pages keep working unchanged inside the docs site: a demo at
// docs/demos/drawer.html still resolves its ../css/flint.css.
export default function (eleventyConfig) {
  // Vendored library files (copied from the repo by scripts/vendor.mjs).
  // NOTE: passthrough source paths resolve relative to the project root
  // (docs-site/), not the Eleventy input dir.
  eleventyConfig.addPassthroughCopy({ "src/vendor/css/*": "css/" });
  eleventyConfig.addPassthroughCopy({ "src/vendor/js/*": "js/" });
  eleventyConfig.addPassthroughCopy({ "src/vendor/demos/*": "demos/" });

  // Docs-only assets (companion files to the vendored ones in docs/css, docs/js)
  eleventyConfig.addPassthroughCopy({ "src/css/*": "css/" });
  eleventyConfig.addPassthroughCopy({ "src/js/*": "js/" });

  return {
    dir: {
      input: "src",
      output: "../docs",
    },
    // Only .njk/.md are parsed as templates; stray .html (demos, snapshots)
    // is never treated as content.
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk",
  };
}
