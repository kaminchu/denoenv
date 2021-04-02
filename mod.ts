import { cac } from "cac";
import dos from "dos";
import { download } from "download";
import { unZipFromFile } from "zip";
import { ensureDir } from "fs/mod.ts";
const cli = cac("denoenv");

const __dirname = new URL(".", import.meta.url).pathname;

// install
cli
  .command("install [version]", "Install a deno version", {
    allowUnknownOptions: true,
  })
  .option("-l", "List all available versions")
  .action(async (version, options) => {
    if (options.l) {
      const response = await fetch(
        `https://api.github.com/repos/denoland/deno/tags`,
      );
      const body = await response.json();
      body.forEach((tag: { name: string }) => console.log(tag.name));
    } else {
      const target = (() => {
        const platform = dos.platform();
        if (platform === "windows") {
          return "x86_64-pc-windows-msvc";
        } else if (platform === "darwin") {
          return "x86_64-apple-darwin";
        } else {
          return "x86_64-unknown-linux-gnu";
        }
      })();
      const url =
        `https://github.com/denoland/deno/releases/download/${version}/deno-${target}.zip`;
      await download(url, { file: `deno-${target}.zip`, dir: `${__dirname}` });
      await ensureDir(`${__dirname}/versions/${version}`);
      await unZipFromFile(`${__dirname}/deno-${target}.zip`, `${__dirname}/versions/${version}`);
      await Deno.remove(`${__dirname}/deno-${target}.zip`);

      // deno install directory
      await ensureDir(`${__dirname}/versions/${version}/bin`);
    }
  });

// global
cli
  .command("global [version]", "Set or show the global deno version", {
    allowUnknownOptions: true,
  })
  .action(async (version) => {
    if (version) {
      await Deno.writeTextFile(`${__dirname}/version`, version);
    } else {
      console.log(await Deno.readTextFile("version"));
    }
  });

// local
cli
  .command(
    "local [version]",
    "Set or show the local application-specific Node version",
    { allowUnknownOptions: true },
  )
  .action(async (version) => {
    if (version) {
      await Deno.writeTextFile(`${Deno.cwd()}/.deno-version`, version);
    } else {
      console.log(await Deno.readTextFile(`${Deno.cwd()}/.deno-version`));
    }
  });
cli.help();
cli.parse();
