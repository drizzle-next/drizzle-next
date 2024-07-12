import { log } from "../lib/log";
import { DbDialect, ScaffoldOpts } from "../lib/types";

export abstract class BaseDbDialectStrategy {
  public abstract dialect: DbDialect;
  public abstract init(): void;
  public abstract scaffold(opts: ScaffoldOpts): void;
  public abstract appendAuthSchema(): void;
  public abstract copyCreateUserScript(): void;
  protected abstract copyDrizzleConfig(): void;
  protected abstract copySchema(): void;
  public printInitCompletionMessage() {
    log.ghost("\n✅ db setup success: " + this.dialect);
    log.ghost("\n👉 reminder:");
    switch (this.dialect) {
      case "mysql":
      case "postgresql":
        log.todo("update DB_URL in .env.local");
        break;
      default:
        break;
    }
    log.cmd("npx shadriz auth -h");
    log.cmd("npx shadriz scaffold -h");
  }
}
