import * as React from "react";

import * as Ink from "ink";

import { Store } from "../app/Store.js";

import { cli } from "./cli.js";
import { invariant } from "./invariant.js";

// prettier-ignore
const JSON_FIELDS = "--json number,state,baseRefName,headRefName,commits,title,url";

export async function pr_list(): Promise<Array<PullRequest>> {
  const state = Store.getState();
  const actions = state.actions;

  const username = state.username;
  const repo_path = state.repo_path;
  invariant(username, "username must exist");
  invariant(repo_path, "repo_path must exist");

  const cli_result = await cli(
    `gh pr list --repo ${repo_path} --author ${username} --state open ${JSON_FIELDS}`,
    {
      ignoreExitCode: true,
    }
  );

  if (cli_result.code !== 0) {
    handle_error(cli_result.output);
  }

  const result_pr_list: Array<PullRequest> = JSON.parse(cli_result.stdout);

  actions.set((state) => {
    for (const pr of result_pr_list) {
      state.pr[pr.headRefName] = pr;
    }
  });

  return result_pr_list;
}

function handle_error(output: string): never {
  const state = Store.getState();
  const actions = state.actions;

  actions.set((state) => {
    state.step = "github-api-error";
  });

  throw new Error(output);
}

export async function pr_status(branch: string): Promise<null | PullRequest> {
  const state = Store.getState();
  const actions = state.actions;

  const username = state.username;
  const repo_path = state.repo_path;
  invariant(username, "username must exist");
  invariant(repo_path, "repo_path must exist");

  const cache = state.pr[branch];

  if (cache) {
    actions.debug(
      <Ink.Text>
        <Ink.Text dimColor>Github pr_status cache</Ink.Text>
        <Ink.Text> </Ink.Text>
        <Ink.Text bold color="#22c55e">
          {"HIT "}
        </Ink.Text>
        <Ink.Text> </Ink.Text>
        <Ink.Text dimColor>{branch}</Ink.Text>
      </Ink.Text>
    );

    return cache;
  }

  actions.debug(
    <Ink.Text>
      <Ink.Text dimColor>Github pr_status cache</Ink.Text>
      <Ink.Text> </Ink.Text>
      <Ink.Text bold color="#ef4444">
        MISS
      </Ink.Text>
      <Ink.Text> </Ink.Text>
      <Ink.Text dimColor>{branch}</Ink.Text>
    </Ink.Text>
  );

  const cli_result = await cli(
    `gh pr view ${branch} --repo ${repo_path} --author ${username} ${JSON_FIELDS}`,
    {
      ignoreExitCode: true,
    }
  );

  if (cli_result.code !== 0) {
    handle_error(cli_result.output);
  }

  const pr: PullRequest = JSON.parse(cli_result.stdout);

  actions.set((state) => {
    state.pr[pr.headRefName] = pr;
  });

  return pr;
}

export async function pr_create(branch: string, base: string) {
  const cli_result = await cli(
    `gh pr create --fill --head ${branch} --base ${base}`
  );

  if (cli_result.code !== 0) {
    handle_error(cli_result.output);
  }
}

export async function pr_base(branch: string, base: string) {
  const cli_result = await cli(`gh pr edit ${branch} --base ${base}`);

  if (cli_result.code !== 0) {
    handle_error(cli_result.output);
  }
}

type Commit = {
  authoredDate: string; // "2023-10-22T23:13:35Z"
  authors: [
    {
      email: string;
      id: string;
      login: string; // magus
      name: string; // magus
    },
  ];
  committedDate: string; // "2023-10-23T08:41:27Z"
  messageBody: string;
  messageHeadline: string;
  oid: string; // "ce7eadaa73518a92ae6a892c1e54c4f4afa6fbdd"
};

export type PullRequest = {
  number: number;
  state: "OPEN" | "CLOSED";
  baseRefName: string;
  headRefName: string;
  commits: Array<Commit>;
  title: string;
  url: string;
};
