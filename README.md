# Intent-to-Execution-Agent Demo

Chinese documentation: [README_CN.md](README_CN.md)

A productized agent experience for complex task collaboration. The demo shows how a user can start with an ambiguous goal and move through clarification, plan confirmation, task progress, stage review, human handoff, and final delivery.

The reference scenario is an e-commerce operations automation agent, but the core workflow can be adapted to market research, software development, event planning, data analysis, and other long-running complex tasks.

## Core Capabilities

- Ambiguous goal input and requirement clarification.
- Structured objective and execution plan confirmation.
- Multi-step task progress and status updates.
- Explainable event log and task timeline.
- Risk notices, pause/resume, and human handoff.
- Stage review and final delivery export.
- Iteration entry point for follow-up optimization.

## Tech Stack

- React
- TypeScript
- Vite
- lucide-react

## Installation

```bash
npm install
```

## Run Demo

```bash
npm run dev
```

Open the browser at:

```text
http://127.0.0.1:5173
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Demo Guide

Recommended flow:

1. Keep or edit the default goal in the input area: “Build an e-commerce operations automation agent to improve store sales.”
2. Click the goal clarification action.
3. Select the platform, business objective, and automation boundary.
4. Generate and confirm the structured execution plan.
5. Observe task progress, event log, risk status, and delivery status.
6. Try pause, resume, or human handoff during execution.
7. Review the generated result, accept it, and export the final delivery.

See the full guide: [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md).

## Quick Preview

![Goal input](assets/screenshots/01_goal_input.png)

![Final delivery](assets/screenshots/05_final_delivery.png)

## Project Structure

```text
.
|-- docs/       # Product specification and demo guide
|-- assets/     # Screenshots, diagrams, and demo recording
|-- public/     # Static assets
|-- src/        # React application source
|-- package.json
`-- vite.config.ts
```

## Documentation

- Product specification: [docs/PROJECT_2_AGENT_USER_FLOW_SPEC.md](docs/PROJECT_2_AGENT_USER_FLOW_SPEC.md)
- Demo guide: [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)

## Notes

This repository intentionally keeps demo screenshots and a short recording as review assets. Local dependencies, build output, logs, and local environment files are ignored by `.gitignore` and should not be committed.
