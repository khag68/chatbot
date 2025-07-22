import { t } from "elysia";
const chatRequestSchema = t.Object({
  message: t.String({ minLength: 1 }),
  conversation: t.Optional(t.Array(t.Object({
    role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
    content: t.String()
  }))),
  model: t.Optional(t.String()),
  temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
  maxTokens: t.Optional(t.Number({ minimum: 1, maximum: 4000 }))
})

export { chatRequestSchema };