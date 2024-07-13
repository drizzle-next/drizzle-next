import { log } from "./log";
import { NewProjectProcessorOpts } from "./types";
import { renderTemplate, spawnCommand } from "./utils";
import path from "path";

interface TemplateToCopy {
  inputPath: string;
  outputPath: string;
}

export class NewProjectProcessor {
  opts: NewProjectProcessorOpts = { pnpm: false };

  installCommands = [
    "npm install drizzle-orm --legacy-peer-deps",
    "npm install -D drizzle-kit",
    "npm install dotenv",
    "npm install uuidv7",
    "npm install zod",
    "npm install drizzle-zod",
    "npm install @tanstack/react-table",
  ];

  pnpmInstallCommands = [
    "pnpm install drizzle-orm",
    "pnpm install -D drizzle-kit",
    "pnpm install dotenv",
    "pnpm install uuidv7",
    "pnpm install zod",
    "pnpm install drizzle-zod",
    "pnpm install @tanstack/react-table",
  ];

  shadcnCommands = [
    "npx shadcn-ui@latest init -y -d",
    "npx shadcn-ui@latest add -y -o table label input button textarea checkbox",
  ];

  templatesToCopy: TemplateToCopy[] = [
    {
      inputPath: ".env.local.hbs",
      outputPath: ".env.local",
    },
    {
      inputPath: "lib/config.ts.hbs",
      outputPath: "lib/config.ts",
    },
    {
      inputPath: "components/ui/data-table.tsx.hbs",
      outputPath: "components/ui/data-table.tsx",
    },
  ];

  constructor(public name: string, opts?: NewProjectProcessorOpts) {
    this.opts = {
      ...this.opts,
      ...opts,
    };
  }

  async init() {
    await this.createNewProject();
    this.changeDir();
    await this.installDependencies();
    await this.initShadcn();
    this.copyTemplates();
    this.printCompletionMessage();
  }

  async createNewProject() {
    if (this.opts.pnpm) {
      await this.runCommand(
        `pnpm create next-app ${this.name} --ts --eslint --tailwind --app --no-src-dir --no-import-alias`
      );
    } else {
      await this.runCommand(
        `npx create-next-app ${this.name} --ts --eslint --tailwind --app --no-src-dir --no-import-alias`
      );
    }
  }

  changeDir() {
    process.chdir(path.resolve(this.name));
  }

  async installDependencies() {
    if (this.opts.pnpm) {
      for (const cmd of this.pnpmInstallCommands) {
        await this.runCommand(cmd);
      }
    } else {
      for (const cmd of this.installCommands) {
        await this.runCommand(cmd);
      }
    }
  }

  copyTemplates() {
    for (const templateToCopy of this.templatesToCopy) {
      renderTemplate({
        inputPath: templateToCopy.inputPath,
        outputPath: templateToCopy.outputPath,
      });
    }
  }

  async initShadcn() {
    for (const cmd of this.shadcnCommands) {
      await this.runCommand(cmd);
    }
  }

  async runCommand(cmd: string) {
    await spawnCommand(cmd);
  }

  printCompletionMessage() {
    log.success("new project success: " + this.name);
    log.reminder();
    log.cmd(`cd ${this.name}`);
    log.cmd(`npx shadriz db -h`);
  }
}
