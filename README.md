# `@callable()` decorator doesn't work in Vite dev server

This repo reproduces the issue. Clone it, `npm install`, and run `npm run dev` to see the error.

## Steps to reproduce

1. Clone this repo and `npm install`
2. Run `npm run dev`
3. Dev server crashes with:
   ```
   error when starting dev server:
   SyntaxError: Invalid or unexpected token
       at Object.runInlinedModule (workers/runner-worker.js:1314:35)
       at CustomModuleRunner.directRequest (workers/runner-worker.js:1166:80)
       at CustomModuleRunner.cachedRequest (workers/runner-worker.js:1084:73)
   ```

## What's happening

The `@callable()` decorator from the agents SDK marks methods as invocable via RPC (e.g. `agent.stub.chat()` from the client). The code in `worker/agents/chat.ts` uses `@callable()` on the `chat` method:

```ts
import { Agent, callable } from "agents";

class ChatAgent extends Agent<Env, ChatAgentState> {
  @callable()
  async chat(message: string): Promise<string> {
    // ...
  }
}
```

`npm run build` (`tsc -b && vite build`) **passes** because TypeScript compiles decorators down to plain JS. But `npm run dev` **crashes** because the Vite dev server runs worker code inside workerd's V8 runtime (via Miniflare), and that V8 version doesn't support TC39 stage 3 decorator syntax. The `@` token is an `Invalid or unexpected token`.

## Expected behavior

`@callable()` should work in dev, since it's the documented way to mark methods as RPC-callable.

## Workaround

Apply `callable()` programmatically after the class definition instead of using `@` syntax:

```ts
import { Agent, callable } from "agents";

class ChatAgent extends Agent<Env, ChatAgentState> {
  async chat(message: string): Promise<string> {
    // ...
  }
}

// Register as callable (workerd doesn't support @ decorator syntax yet)
callable()(
  ChatAgent.prototype.chat,
  { kind: "method", name: "chat" } as ClassMethodDecoratorContext
);
```

To apply this workaround to this repo: remove the `@callable()` line above `async chat(` in `worker/agents/chat.ts` and add the programmatic registration after the class closing brace.

## Environment

- `agents@0.4.1`
- `@cloudflare/vite-plugin@^1.25.0`
- `wrangler@^4.65.0`
- `vite@^7.3.1`
- `typescript@~5.9.3`
