import chalk from "chalk";
import {
  appendToFile,
  compileTemplate,
  logInfo,
  prependToFile,
  renderTemplate,
  spawnCommand,
} from "./utils";

type Providers = "github" | "google" | "credentials";

interface AuthProcessorOpts {
  providers: Providers[];
}

interface AuthStrategy {
  importTemplatePath: string;
  authTemplatePath: string;
  envTemplatePath: string;
}

interface AuthStrategyMap {
  github: AuthStrategy;
  google: AuthStrategy;
  credentials: AuthStrategy;
}

const authStrategyMap: AuthStrategyMap = {
  github: {
    importTemplatePath: "auth/auth.ts.github.imports.hbs",
    authTemplatePath: "auth/auth.ts.github.hbs",
    envTemplatePath: "auth/auth.ts.github.env.hbs",
  },
  google: {
    importTemplatePath: "auth/auth.ts.google.imports.hbs",
    authTemplatePath: "auth/auth.ts.google.hbs",
    envTemplatePath: "auth/auth.ts.google.env.hbs",
  },
  credentials: {
    importTemplatePath: "auth/auth.ts.credentials.imports.hbs",
    authTemplatePath: "auth/auth.ts.credentials.hbs",
    envTemplatePath: "auth/auth.ts.credentials.env.hbs",
  },
};

export class AuthProcessor {
  constructor(public opts: AuthProcessorOpts) {}

  async init() {
    for (const provider of this.opts.providers) {
      if (!(provider in authStrategyMap)) {
        throw new Error("invalid provider: " + provider);
      }
    }
    await this.installDependencies();
    await this.appendAuthSecretToEnv();
    this.addAuthConfig();
    this.addAuthRouteHandler();
    // this.addAuthMiddleware();
    this.appendSecretsToEnv();
    this.prependAdapterAccountTypeToSchema();
  }

  async installDependencies() {
    await spawnCommand("npm i @auth/drizzle-adapter next-auth@beta");
  }

  async appendAuthSecretToEnv() {
    await spawnCommand("npx auth secret");
  }

  addAuthConfig() {
    logInfo("adding auth config");
    let importsCode = "";
    let providersCode = "";
    for (const provider of this.opts.providers) {
      const strategy = authStrategyMap[provider];
      importsCode += compileTemplate({
        inputPath: strategy.importTemplatePath,
        data: {},
      });
      importsCode += "\n";
      providersCode += compileTemplate({
        inputPath: strategy.authTemplatePath,
        data: {},
      });
      providersCode += ",\n";
    }
    renderTemplate({
      inputPath: "auth/auth.ts.hbs",
      outputPath: "auth.ts",
      data: { importsCode: importsCode, providersCode: providersCode },
    });
  }

  addAuthRouteHandler() {
    logInfo("adding nextauth api routes");
    renderTemplate({
      inputPath: "app/api/auth/[...nextauth]/route.ts.hbs",
      outputPath: "app/api/auth/[...nextauth]/route.ts",
    });
  }

  // addAuthMiddleware() {
  //   renderTemplate({
  //     inputPath: "middleware.ts.hbs",
  //     outputPath: "middleware.ts",
  //     data: {},
  //   });
  // }

  appendSecretsToEnv() {
    logInfo("adding secrets to .env.local");
    for (const provider of this.opts.providers) {
      const strategy = authStrategyMap[provider];
      let envVars = compileTemplate({
        inputPath: strategy.envTemplatePath,
        data: {},
      });
      envVars = "\n" + envVars;
      appendToFile(".env.local", envVars);
    }
  }

  prependAdapterAccountTypeToSchema() {
    logInfo("adding imports to schema");
    prependToFile(
      "lib/schema.ts",
      'import type { AdapterAccountType } from "next-auth/adapters";\n'
    );
  }
}
