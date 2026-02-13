# React + Vite + Cloudflare Workers with Agents SDK

A starter template for building React applications with Cloudflare Workers and the Agents SDK, featuring RPC support via `@callable()` decorators.

## Setup

1. Clone this repo and `npm install`
2. Run `npm run dev` to start the development server
3. Run `npm run build` to build for production

## Key Configuration

To support the `@callable()` decorator syntax in both dev and build environments, the TypeScript configuration targets **ES2021**. This ensures proper decorator compilation across Miniflare's V8 runtime and production builds.

- **tsconfig.worker.json**: Targets ES2021 (extends tsconfig.node.json)
- **tsconfig.app.json**: Targets ES2022 (for the React frontend)

## Environment

- `agents@0.4.1`
- `@cloudflare/vite-plugin@^1.25.0`
- `wrangler@^4.65.0`
- `vite@^7.3.1`
- `typescript@~5.9.3`
