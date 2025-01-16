import { log } from "../lib/log";
import { dialectStrategyFactory } from "../lib/strategy-factory";
import {
  DbDialect,
  DbDialectStrategy,
  DrizzleNextConfig,
  DrizzleNextProcessor,
} from "../lib/types";
import {
  appendToFileIfTextNotExists,
  renderTemplate,
  renderTemplateIfNotExists,
} from "../lib/utils";
import { ScaffoldProcessor } from "./scaffold-processor";
import { caseFactory } from "../lib/case-utils";

export class AdminProcessor implements DrizzleNextProcessor {
  opts: DrizzleNextConfig;
  dependencies: string[] = [];
  devDependencies: string[] = [];
  dbDialectStrategy: DbDialectStrategy;

  constructor(opts: DrizzleNextConfig) {
    this.dbDialectStrategy = dialectStrategyFactory(opts.dbDialect);
    this.opts = opts;
  }

  async init(): Promise<void> {
    log.init("initializing admin...");
    await this.render();
  }

  async render(): Promise<void> {
    const userObj = caseFactory("user", {
      pluralize: this.opts.pluralizeEnabled,
    });
    renderTemplate({
      inputPath: "admin-processor/app/(admin)/layout.tsx.hbs",
      outputPath: "app/(admin)/layout.tsx",
      data: { userObj },
    });

    renderTemplate({
      inputPath: "admin-processor/app/(admin)/admin/page.tsx.hbs",
      outputPath: "app/(admin)/admin/page.tsx",
    });

    renderTemplate({
      inputPath: "admin-processor/app/admin-login/page.tsx.hbs",
      outputPath: "app/admin-login/page.tsx",
    });

    renderTemplate({
      inputPath: `admin-processor/scripts/grant-admin.ts.hbs`,
      outputPath: "scripts/grant-admin.ts",
      data: {
        userObj,
      },
    });

    renderTemplateIfNotExists({
      inputPath: `admin-processor/components/admin/admin-sidebar.tsx.hbs`,
      outputPath: `components/admin/admin-sidebar.tsx`,
    });

    renderTemplate({
      inputPath: "admin-processor/app/(admin)/admin/settings/page.tsx.hbs",
      outputPath: "app/(admin)/admin/settings/page.tsx",
    });

    renderTemplate({
      inputPath: "admin-processor/lib/authorization.ts.hbs",
      outputPath: "lib/authorization.ts",
    });

    renderTemplate({
      inputPath:
        "admin-processor/components/admin-login/admin-login-form.tsx.hbs",
      outputPath: "components/admin-login/admin-login-form.tsx",
    });

    renderTemplate({
      inputPath: "admin-processor/actions/admin-login/admin-login.ts.hbs",
      outputPath: "actions/admin-login/admin-login.ts",
      data: {
        userObj,
      },
    });

    renderTemplate({
      inputPath: "admin-processor/scripts/create-password-hash.ts.hbs",
      outputPath: "scripts/create-password-hash.ts",
    });

    renderTemplate({
      inputPath: "admin-processor/components/admin/admin-header.tsx.hbs",
      outputPath: "components/admin/admin-header.tsx",
      data: {
        userObj,
      },
    });

    const strategies: Record<DbDialect, string[]> = {
      postgresql: [
        "name:text",
        "email:text",
        "email_verified:timestamp",
        "image:text",
        "role:text",
        "password:text",
      ],
      mysql: [
        "name:varchar",
        "email:varchar",
        "email_verified:timestamp",
        "image:varchar",
        "role:text",
        "password:varchar",
      ],
      sqlite: [
        "name:text",
        "email:text",
        "email_verified:timestamp",
        "image:text",
        "role:text",
        "password:text",
      ],
    };

    const userScaffold = new ScaffoldProcessor({
      ...this.opts,
      authorizationLevel: "admin",
      columns: strategies[this.opts.dbDialect],
      table: this.opts.pluralizeEnabled ? "users" : "user",
      enableCompletionMessage: false,
      enableUiScaffold: true,
      enableDbScaffold: false,
    });

    userScaffold.process();
  }

  printCompletionMessage() {
    log.checklist("admin checklist");
    log.task("grant admin privilege");
    log.cmdsubtask("npx tsx scripts/grant-admin.ts user@example.com");
  }
}
