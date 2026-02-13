import { Agent, callable } from "agents";
import type { Connection } from "agents";

export type ChatAgentState = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};

/**
 * AI Chat Agent - Uses Cloudflare Workers AI to respond to user messages
 * Uses the global Env type from worker-configuration.d.ts (includes AI, ASSETS, etc.)
 */
export class ChatAgent extends Agent<Env, ChatAgentState> {
  initialState: ChatAgentState = {
    messages: [],
  };

  async onConnect(connection: Connection) {
    // Send chat history and welcome message
    connection.send(
      JSON.stringify({
        type: "welcome",
        history: this.state.messages,
        message: "Connected to AI Chat Agent",
      })
    );
  }

  async onMessage(connection: Connection, message: string) {
    try {
      const data = JSON.parse(message);

      if (data.type === "chat") {
        await this.handleChat(connection, data.content);
      }
    } catch (err) {
      connection.send(
        JSON.stringify({
          type: "error",
          message:
            err instanceof Error ? err.message : "Failed to process message",
        })
      );
    }
  }

  // RPC method — callable via agent.stub.chat() from the client
  @callable()
  async chat(
    userMessage: string,
    _history?: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      // Add user message to history
      const messages = [
        ...this.state.messages,
        { role: "user" as const, content: userMessage },
      ];

      // Call Workers AI to generate a response
      const response = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...messages,
        ],
      });

      const assistantMessage =
        typeof response.response === "string"
          ? response.response
          : JSON.stringify(response.response);

      // Update state with both messages
      this.setState({
        messages: [
          ...messages,
          { role: "assistant", content: assistantMessage },
        ],
      });

      return assistantMessage;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate response";
      throw new Error(errorMessage);
    }
  }

  private async handleChat(
    connection: Connection,
    userMessage: string
  ): Promise<void> {
    try {
      const response = await this.chat(userMessage);

      // Send response back to client
      connection.send(
        JSON.stringify({
          type: "response",
          content: response,
        })
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate response";

      connection.send(
        JSON.stringify({
          type: "error",
          message: errorMessage,
        })
      );
    }
  }
}
