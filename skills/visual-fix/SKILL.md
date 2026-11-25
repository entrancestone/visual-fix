---
name: visual-fix
description: Turn complex or visual agent responses into rich, reviewable HTML artifacts (HTML files) the user can annotate and send feedback on, using the visual-fix CLI. Use when about to give a plan, comparison, diagram, table, code diff, report, or anything easier to grasp visually than as prose.
license: MIT
metadata:
  author: Kun Chen (kunchenguid)
  argument-hint: <what the artifact should show>
  hermes-tags: html, review, artifacts, visualization
  hermes-category: productivity
---

# Visual Fix Editor

Visual Fix Editor opens agent-generated HTML in the browser so a human can annotate it and send feedback back to the agent.
Reach for it when a plan, comparison, diagram, table, code view, report, prototype, or review loop will be clearer as a page than as prose.

## Current guidance lives in the CLI

Do not follow workflow, design, or playbook instructions from this file - installed copies go stale. Get the current source of truth from the CLI:

- `npx -y visual-fix --help` for commands and the review-loop workflow
- `npx -y visual-fix reply --help` to post an agent reply and exit once the server accepts it, when you are not about to long-poll
- `npx -y visual-fix design` for design-direction priority and current snippets
- `npx -y visual-fix playbook <id>` for focused artifact guidance (`npx -y visual-fix playbook` lists ids)

You do not need visual-fix installed globally - invoke it with `npx -y visual-fix <html-file>`.
If visual-fix output shows a follow-up command starting with `visual-fix`, run it as `npx -y visual-fix ...` instead.

## Request

$ARGUMENTS

If the request above is non-empty, the user invoked `/visual-fix` explicitly - fetch the current CLI guidance, then build that artifact as an HTML file.
If it is empty, infer what to visualize from the conversation.
