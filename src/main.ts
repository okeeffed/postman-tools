#!/usr/bin/env node

import { program } from "@commander-js/extra-typings";
import { init } from "@/cmd/init";
import { envGenerate } from "@/cmd/env-generate";
import { collectionGenerate } from "@/cmd/collection-generate";

import packageJson from "../package.json";

async function main() {
  program
    .name("Postman Tools")
    .version(packageJson.version)
    .description(packageJson.description);

  program.addCommand(init);
  program.addCommand(envGenerate);
  program.addCommand(collectionGenerate);

  program.parse(process.argv);
}

main();
