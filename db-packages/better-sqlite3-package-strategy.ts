import { log } from "../lib/log";
import { DbDialect, DbPackageStrategy, ShadrizConfig } from "../lib/types";
import {
  appendDbUrl,
  appendToFileIfTextNotExists,
  installDependencies,
  renderTemplate,
} from "../lib/utils";

export class BetterSqlite3PackageStrategy implements DbPackageStrategy {
  constructor(opts: ShadrizConfig) {
    this.opts = opts;
  }

  opts: ShadrizConfig;

  dialect: DbDialect = "sqlite";

  dependencies: string[] = ["better-sqlite3"];

  devDependencies: string[] = [];

  async init() {
    log.init("initializing better-sqlite3 package...");
    await this.install();
    await this.render();
  }

  async install(): Promise<void> {
    if (!this.opts.install) {
      return;
    }

    await installDependencies({
      dependencies: this.dependencies,
      packageManager: this.opts.packageManager,
      latest: this.opts.latest,
    });
  }

  async render(): Promise<void> {
    this.copyMigrateScript();
    this.appendDbUrl();
    this.copyDbInstance();
    this.copyDbInstanceForScripts();
    this.appendSqliteToGitignore();
    this.copyCreateUserScript();
  }

  copyMigrateScript(): void {
    renderTemplate({
      inputPath: "db-packages/scripts/migrate.ts.hbs",
      outputPath: "scripts/migrate.ts",
      data: {
        migratorImport: `import { migrate } from "drizzle-orm/better-sqlite3/migrator";`,
      },
    });
  }

  appendDbUrl(): void {
    appendDbUrl("sqlite.db");
  }

  copyDbInstance(): void {
    renderTemplate({
      inputPath: "db-packages/lib/db.ts.better-sqlite3.hbs",
      outputPath: "lib/db.ts",
    });
  }

  copyDbInstanceForScripts(): void {
    renderTemplate({
      inputPath: "db-packages/scripts/sdb.ts.better-sqlite3.hbs",
      outputPath: "scripts/sdb.ts",
    });
  }

  copyCreateUserScript() {
    renderTemplate({
      inputPath: "db-packages/scripts/create-user.ts.hbs",
      outputPath: "scripts/create-user.ts",
    });
  }

  appendSqliteToGitignore() {
    appendToFileIfTextNotExists(".gitignore", "\nsqlite.db", "sqlite.db");
  }

  printCompletionMessage(): void {
    log.checklist("better-sqlite3 checklist");
    log.task("update DB_URL in .env.local");
    log.cmdtask("npx drizzle-kit generate");
    log.cmdtask("npx drizzle-kit migrate");
  }
}
