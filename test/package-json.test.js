import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("check script runs all verification commands", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const checkCommands = packageJson.scripts.check.split(" && ");

  assert.deepEqual(checkCommands, [
    "npm run build",
    "npm run lint",
    "npm run format:check",
    "npm run typecheck",
    "npm test",
    "node scripts/build-skill.js --check",
    "node scripts/build-plugin.js --check",
  ]);
});

test("committed skill matches the generator stub", async () => {
  const { createSkillMarkdown } = await import("../src/skill.js");
  const committed = await readFile(new URL("../skills/visual-fix/SKILL.md", import.meta.url), "utf8");

  assert.equal(committed, createSkillMarkdown(), "run `npm run build:skill` and commit the result");
});

test("published package includes the installable skill", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.ok(packageJson.files.includes("skills/visual-fix"));
});

test("published package root is a complete Agent Plugin", async () => {
  // The tarball root doubles as the plugin root, so both the manifest and the skills it
  // discovers have to ship; without either, an installed copy is not installable as a plugin.
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.ok(packageJson.files.includes("plugin.json"));
  assert.ok(packageJson.files.includes("skills/visual-fix"));
});

test("release-please keeps the plugin manifest version in step with the package", async () => {
  const config = JSON.parse(await readFile(new URL("../release-please-config.json", import.meta.url), "utf8"));

  assert.deepEqual(config.packages["."]["extra-files"], [{ type: "json", path: "plugin.json", jsonpath: "$.version" }]);
});

test("visual-fix-design agent skill is marked internal for skills CLI discovery", async () => {
  const skillMd = await readFile(new URL("../.agents/skills/visual-fix-design/SKILL.md", import.meta.url), "utf8");
  const frontmatter = skillMd.slice(4, skillMd.indexOf("\n---\n", 4));

  assert.match(frontmatter, /^name: visual-fix-design$/m);
  assert.match(frontmatter, /^metadata:\n {2}internal: true$/m);
});

test("public visual-fix skill is not marked internal", async () => {
  const skillMd = await readFile(new URL("../skills/visual-fix/SKILL.md", import.meta.url), "utf8");
  const frontmatter = skillMd.slice(4, skillMd.indexOf("\n---\n", 4));

  assert.doesNotMatch(frontmatter, /^metadata:\n {2}internal: true$/m);
});

test("build copies local design assets for published artifact injection", async () => {
  const buildScript = await readFile(new URL("../scripts/build.js", import.meta.url), "utf8");

  assert.match(buildScript, /daisyui\.css/);
  assert.match(buildScript, /daisyui-themes\.css/);
  assert.match(buildScript, /tailwindcss-browser\.js/);
});

test("package metadata matches the GitHub repository used for npm provenance", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageJson.repository.url, "git+https://github.com/entrancestone/visual-fix.git");
  assert.equal(packageJson.bugs.url, "https://github.com/entrancestone/visual-fix/issues");
  assert.equal(packageJson.homepage, "https://github.com/entrancestone/visual-fix#readme");
});

test("pnpm lock root importer matches the publish manifest", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const pnpmLock = await readFile(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");

  for (const [name, specifier] of Object.entries(packageJson.dependencies)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedSpecifier = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    assert.match(pnpmLock, new RegExp(`["']?${escapedName}["']?:[\\s\\S]*?specifier: ${escapedSpecifier}`));
  }
});

test("release workflow publishes from the release tag checkout", async () => {
  const workflow = await readFile(new URL("../.github/workflows/release-please.yml", import.meta.url), "utf8");

  assert.match(
    workflow,
    /uses: actions\/checkout@v6\n\s+if: \$\{\{ steps\.release\.outputs\.release_created \}\}\n\s+with:\n\s+ref: \$\{\{ steps\.release\.outputs\.tag_name \}\}/,
  );
});

test("source, build script and release workflow embed no telemetry host or Umami settings", async () => {
  const { readdir } = await import("node:fs/promises");
  const banned = /a\.kunchenguid\.com|umami|VISUAL_FIX_TELEMETRY/i;
  const roots = ["../src", "../scripts", "../bin"];
  const files = [new URL("../.github/workflows/release-please.yml", import.meta.url)];
  for (const root of roots) {
    const dir = new URL(`${root}/`, import.meta.url);
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.isFile()) files.push(new URL(entry.name, dir));
    }
  }
  for (const file of files) {
    const text = await readFile(file, "utf8");
    assert.doesNotMatch(text, banned, `${file.pathname} must not reference telemetry`);
  }
});
