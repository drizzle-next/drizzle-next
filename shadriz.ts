import { Command } from "commander";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import Handlebars from "handlebars";

const program = new Command();

program
  .name("shadriz")
  .description(
    "shadriz - Full Stack Framework Next.js ShadCN/UI and Drizzle ORM"
  )
  .version("0.0.1");

program
  .command("new")
  .description("Create a new project with latest dependencies")
  .argument("<name>", "name of project")
  .action(async (name, options) => {
    try {
      await runCommand(
        `npx create-next-app ${name} --ts --eslint --tailwind --app --no-src-dir --no-import-alias`,
        []
      );
      await runCommand(
        `cd ${name} && npm i drizzle-orm mysql2 --legacy-peer-deps && npm i -D drizzle-kit`,
        []
      );
      await runCommand(`cd ${name} && npm i dotenv uuidv7`, []);
      await runCommand(
        `cd ${name} && npm i @auth/drizzle-adapter next-auth@beta`,
        []
      );
      await runCommand(`cd ${name} && npm i nodemailer`, []);
      await runCommand(`cd ${name} && npx shadcn-ui@latest init -y -d`, []);
      await runCommand(`cd ${name} && npx drizzle-kit generate`, []);
      copyTemplates(name);
    } catch (error) {
      console.error("Error running command:", error);
    }
  });

program
  .command("db")
  .description("Generate Drizzle ORM configuration")
  .argument("<dialect>", "sql dialect: pg, mysql, sqlite")
  .action(async (dialect, options) => {
    const dialects = ["pg", "mysql", "sqlite"];
    if (!dialects.includes(dialect)) {
      console.error(chalk.red(`${dialect} dialect invalid`));
      process.exit(1);
    }
    renderTemplate("drizzle.config.ts.hbs", { dialect: dialect });
  });

program
  .command("auth")
  .description("Generate Auth.js configuration")
  .argument("<provider>", "provider: github, google")
  .action(async (provider, options) => {
    console.log(provider);
  });

program
  .command("scaffold")
  .description(
    "Generate CRUD ui, db schema, db migration, and server actions for a table"
  )
  .argument("<table>", "table: post, product, order, etc")
  .action(async (table, options) => {
    console.log(table);
  });

function copyTemplates(name: string) {
  const templatesToCopy = [
    ".env.local.hbs",
    "lib/db.ts.hbs",
    "lib/config.ts.hbs",
    "scripts/migrate.ts.hbs",
    "drizzle.config.ts.hbs",
    "lib/schema.ts.hbs",
    "app/api/auth/[...nextauth]/route.ts.hbs",
    "components/sign-in.ts.hbs",
    "auth.ts.hbs",
  ];
  for (const filePath of templatesToCopy) {
    copyTemplate(name, filePath);
  }
}

function renderTemplate(filePath: string, data: any) {
  const templatePath = path.join(__dirname, "templates", filePath);
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const compiled = Handlebars.compile(templateContent);
  const content = compiled(data);
  const arr = filePath.split(".");
  arr.pop();
  const outputFilePath = arr.join(".");
  const outputPath = path.join(process.cwd(), outputFilePath);
  const resolvedPath = path.resolve(outputPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, content);
}

function copyTemplate(name: string, filePath: string) {
  const templatePath = path.join(__dirname, "templates", filePath);
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const arr = filePath.split(".");
  arr.pop();
  const outputFilePath = arr.join(".");
  const outputPath = path.join(__dirname, `${name}`, outputFilePath);
  const resolvedPath = path.resolve(outputPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, templateContent);
}

async function runCommand(command: string, args: string[]) {
  console.log(`Executing command: ${command} ${args.join(" ")}`);

  const child = spawn(command, args, { shell: true });

  child.stdout.on("data", (data) => {
    console.log(`${data.toString()}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`${data.toString()}`);
  });

  return new Promise((resolve, reject) => {
    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(
          new Error(
            `Command ${command} ${args.join(" ")} exited with code ${code}`
          )
        );
      }
    });
  });
}

program.parse();
