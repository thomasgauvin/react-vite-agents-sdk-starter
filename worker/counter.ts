import { DurableObject } from "cloudflare:workers";

/**
 * Counter Durable Object
 * 
 * Manages a persistent counter value with RPC methods to:
 * - Get the current counter value
 * - Increment the counter
 * - Decrement the counter
 */
export class Counter extends DurableObject {
  /**
   * Get the current counter value
   */
  async getCounterValue(): Promise<number> {
    const value = (await this.ctx.storage.get<number>("value")) || 0;
    return value;
  }

  /**
   * Increment the counter by the specified amount (default: 1)
   */
  async increment(amount: number = 1): Promise<number> {
    let value = (await this.ctx.storage.get<number>("value")) || 0;
    value += amount;

    // Input gates automatically protect against unwanted concurrency.
    // Read-modify-write is safe.
    await this.ctx.storage.put("value", value);
    return value;
  }

  /**
   * Decrement the counter by the specified amount (default: 1)
   */
  async decrement(amount: number = 1): Promise<number> {
    let value = (await this.ctx.storage.get<number>("value")) || 0;
    value -= amount;

    await this.ctx.storage.put("value", value);
    return value;
  }
}
