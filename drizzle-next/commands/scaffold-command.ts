import fs from "fs";
import { Command, Option } from "commander";
import { log } from "../lib/log";
import { AuthorizationLevel, DrizzleNextConfig } from "../lib/types";
import { select } from "@inquirer/prompts";
import { loadDrizzleNextConfig } from "../lib/utils";
import { ScaffoldProcessor } from "../processors/scaffold-processor";

export const scaffoldCommand = new Command("scaffold");

scaffoldCommand
  .summary("scaffold crud ui, db schema, migration, and actions")
  .description(
    `generate crud ui, db schema, db migration, and server actions for a database table

# sqlite example
npx drizzle-next@latest scaffold post -c title:text content:text is_draft:boolean published_at:text

# postgresql example
npx drizzle-next@latest scaffold post -c title:text content:text is_draft:boolean published_at:timestamp

# mysql example
npx drizzle-next@latest scaffold post -c title:varchar content:text is_draft:boolean published_at:timestamp

`
  )
  .argument("<table>", "the database table name")
  .requiredOption(
    "-c, --columns <columns...>",
    "space separated list of columns in the following format: column_name:data_type"
  )
  .addOption(
    new Option(
      "-a, --authorization-level <authorizationLevel>",
      "the authorization level of this scaffold"
    ).choices(["admin", "private", "public"])
  )
  .option("--no-db", "skip the generation of drizzle database table", true)
  .option("--no-ui", "skip the generation of routes, pages, and actions", true)
  .action(async (table, options) => {
    if (!options.ui && !options.db) {
      log.red(
        "--no-db and --no-ui flag are present. both ui and db generation are skipped. nothing to do."
      );
      process.exit(1);
    }
    const drizzleNextConfig: DrizzleNextConfig = loadDrizzleNextConfig();
    const authorizationLevel: AuthorizationLevel =
      options.authorizationLevel ||
      (await select({
        message:
          "Which authorization level would you like to use for this scaffold?",
        choices: [
          {
            value: "admin",
            description:
              "Requires authentication and administrative privileges.",
          },
          {
            value: "private",
            description: "Requires user authentication.",
          },
          {
            value: "public",
            description: "Accessible by anyone without authentication.",
          },
        ],
      }));

    if (authorizationLevel === "admin" && !fs.existsSync("app/(admin)")) {
      log.red("(admin) route group not found. authorization must be enabled.");
      process.exit(1);
    }
    if (authorizationLevel === "private" && !fs.existsSync("app/(private)")) {
      log.red("(private) route group not found. auth must be enabled.");
      process.exit(1);
    }

    const scaffoldProcessor = new ScaffoldProcessor({
      table: table,
      columns: options.columns,
      authorizationLevel: authorizationLevel,
      enableCompletionMessage: true,
      enableUiScaffold: options.ui,
      enableDbScaffold: options.db,
      ...drizzleNextConfig,
    });
    scaffoldProcessor.process();
  });
