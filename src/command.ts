import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export type Argv = Awaited<ReturnType<typeof command>>;

export async function command() {
  const debug_argv = await yargs(hideBin(process.argv))
    .option("debug", {
      type: "boolean",
      description: "Enable debug mode with more options for debugging",
    })

    .help(false).argv;

  if (!debug_argv.debug) {
    return (
      yargs(hideBin(process.argv))
        .option("force", {
          type: "boolean",
          description: "Force sync even if no changes are detected",
        })

        .option("check", {
          type: "boolean",
          description: "Print status table without syncing",
        })

        .option("debug", {
          type: "boolean",
          description: "Enable debug mode with more options for debugging",
        })

        // disallow unknown options
        .strict()
        .help().argv
    );
  }

  return (
    yargs(hideBin(process.argv))
      .option("force", {
        type: "boolean",
        description: "Force sync even if no changes are detected",
      })

      .option("check", {
        type: "boolean",
        description: "Print status table without syncing",
      })

      .option("debug", {
        type: "boolean",
        description: "Enable debug mode with more options for debugging",
      })

      .option("verbose", {
        type: "boolean",
        description: "Log extra information during execution",
      })

      .option("write-state-json", {
        type: "boolean",
        description: "Write state to local json file for debugging",
      })

      .option("mock-metadata", {
        type: "boolean",
        description: "Mock local store metadata for testing",
      })
      // disallow unknown options
      .strict()
      .help().argv
  );
}
