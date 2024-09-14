import { log } from "../lib/log";
import { DbDialect, ShadrizProcessor, StripeProcessorOpts } from "../lib/types";
import {
  addShadcnComponents,
  appendToFileIfTextNotExists,
  compileTemplate,
  installDependencies,
  renderTemplate,
} from "../lib/utils";
import { pkStrategyImportTemplates } from "./pk-strategy-processor";

interface StripeDbDialectStrategy {
  stripeSchemaTemplatePath: string;
}

const stripeDbDialectStrategy: Record<DbDialect, StripeDbDialectStrategy> = {
  postgresql: {
    stripeSchemaTemplatePath:
      "stripe-processor/schema/stripe.ts.postgresql.hbs",
  },
  mysql: {
    stripeSchemaTemplatePath: "stripe-processor/schema/stripe.ts.mysql.hbs",
  },
  sqlite: {
    stripeSchemaTemplatePath: "stripe-processor/schema/stripe.ts.sqlite.hbs",
  },
};

export class StripeProcessor implements ShadrizProcessor {
  opts: StripeProcessorOpts;

  constructor(opts: StripeProcessorOpts) {
    this.opts = opts;
  }

  dependencies = ["@stripe/stripe-js", "stripe"];

  devDependencies = [];

  shadcnComponents: string[] = ["card", "badge", "alert"];

  async init() {
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

    await addShadcnComponents({
      shadcnComponents: this.shadcnComponents,
      packageManager: this.opts.packageManager,
      latest: this.opts.latest,
    });
  }

  async render(): Promise<void> {
    this.addAccountPage();
    this.addPricingPage();
    this.addAccessUtil();
    this.addStripeSchema();
    this.appendStripeSecretsToEnvLocal();
    this.addCheckOutSessionsApiRoute();
    this.addCustomerPortalApiRoute();
    this.addWebhookApiRoute();
    this.addConfirmationPage();
    this.addCreatePriceScript();
  }

  addAccountPage() {
    renderTemplate({
      inputPath: "stripe-processor/app/(private)/account/page.tsx.hbs",
      outputPath: "app/(private)/account/page.tsx",
    });
  }

  addPricingPage() {
    renderTemplate({
      inputPath: "stripe-processor/app/(public)/pricing/page.tsx.hbs",
      outputPath: "app/(public)/pricing/page.tsx",
    });
  }

  addAccessUtil() {
    renderTemplate({
      inputPath: "stripe-processor/lib/access.ts.hbs",
      outputPath: "lib/access.ts",
    });
  }

  addStripeSchema() {
    const pkText =
      this.opts.dbDialectStrategy.pkStrategyTemplates[this.opts.pkStrategy];
    const pkStrategyImport = pkStrategyImportTemplates[this.opts.pkStrategy];
    renderTemplate({
      inputPath:
        stripeDbDialectStrategy[this.opts.dbDialect].stripeSchemaTemplatePath,
      outputPath: "schema/stripe.ts",
      data: {
        pkText: pkText,
        pkStrategyImport: pkStrategyImport,
      },
    });
  }

  appendStripeSecretsToEnvLocal() {
    const text = compileTemplate({
      inputPath: "stripe-processor/.env.local.hbs",
    });
    appendToFileIfTextNotExists(".env.local", text, "STRIPE_SECRET_KEY");
  }

  addCheckOutSessionsApiRoute() {
    renderTemplate({
      inputPath: "stripe-processor/app/api/checkout_sessions/route.ts.hbs",
      outputPath: "app/api/checkout_sessions/route.ts",
    });
  }

  addCustomerPortalApiRoute() {
    renderTemplate({
      inputPath: "stripe-processor/app/api/customer_portal/route.ts.hbs",
      outputPath: "app/api/customer_portal/route.ts",
    });
  }

  addWebhookApiRoute() {
    renderTemplate({
      inputPath: "stripe-processor/app/api/webhook/route.ts.hbs",
      outputPath: "app/api/webhook/route.ts",
    });
  }

  addConfirmationPage() {
    renderTemplate({
      inputPath: "stripe-processor/app/(public)/confirmation/page.tsx.hbs",
      outputPath: "app/(public)/confirmation/page.tsx",
    });
  }

  addCreatePriceScript() {
    renderTemplate({
      inputPath: "stripe-processor/scripts/create-price.ts.hbs",
      outputPath: "scripts/create-price.ts",
    });
  }

  printCompletionMessage() {
    log.checklist("stripe checklist");

    log.log("\nstripe setup:");
    log.dash("go to stripe > developers > api keys");
    log.dash("update NEXT_STRIPE_PUBLISHABLE_KEY in .env.local");
    log.dash("update STRIPE_SECRET_KEY in .env.local");

    log.log("\nstripe webhook setup:");
    log.dash("go to stripe > developers > webhooks");
    log.dash("update STRIPE_WEBHOOK_SECRET in .env.local");

    log.log("\nstart local stripe listener:");
    log.cmd("stripe login");
    log.cmd("stripe listen --forward-to localhost:3000/api/webhook");

    log.log("\ntest stripe webhook:");
    log.cmd("stripe trigger payment_intent.succeeded");
    log.cmd("stripe trigger --help");

    log.log("\ncreate products in stripe and db:");
    log.cmd("npx tsx scripts/create-price.ts");

    log.log("\nsave customer portal settings:");
    log.dash("https://dashboard.stripe.com/test/settings/billing/portal");
  }
}
