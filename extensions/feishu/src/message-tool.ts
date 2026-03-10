import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { listEnabledFeishuAccounts } from "./accounts.js";
import { createFeishuToolClient } from "./tool-account.js";
import { sendMessageFeishu } from "./send.js";

const SendMessageSchema = Type.Object({
  to: Type.String({
    description: "Target chat_id or user open_id. If omitted, replies to current context.",
  }),
  text: Type.String({
    description: "The message content in Markdown format.",
  }),
  reply_to: Type.Optional(Type.String({
    description: "Optional message_id to reply to.",
  })),
  accountId: Type.Optional(Type.String({
    description: "Optional account ID to send from. Defaults to the agent's assigned account.",
  })),
});

export function registerFeishuMessageTools(api: OpenClawPluginApi) {
  if (!api.config) return;

  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) return;

  api.registerTool(
    (ctx: any) => ({
      name: "feishu_message",
      label: "Feishu Message",
      description: "Send a message to a Feishu chat or user.",
      parameters: SendMessageSchema,
      async execute(_toolCallId: string, params: any) {
        try {
          const p = params as any;
          const clientParams = { accountId: p.accountId };
          const client = createFeishuToolClient({ 
            api, 
            executeParams: clientParams, 
            defaultAccountId: ctx.agentAccountId 
          });
          
          const result = await sendMessageFeishu({
            cfg: api.config!,
            to: p.to,
            text: p.text,
            replyToMessageId: p.reply_to,
            accountId: p.accountId || ctx.agentAccountId,
          });

          return { 
            content: [{ type: "text", text: JSON.stringify(result) }],
            details: result 
          };
        } catch (err) {
          return { 
            content: [{ type: "text", text: String(err) }],
            error: String(err) 
          };
        }
      },
    }),
    { name: "feishu_message" },
  );
  api.logger.info?.("feishu_message: Registered feishu_message tool");
}
