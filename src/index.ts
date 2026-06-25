/**
 * @botuyo/contracts — single source of truth for cross-repo contracts.
 *
 * RULES:
 *  - Types & constants ONLY. No secrets, no runtime side effects, no heavy deps.
 *  - The public chat widget (@botuyo/chat-widget-standalone) does NOT depend on
 *    this package: its public contracts (socket events, props, theme) stay inside
 *    the widget so external consumers never need a separate package.
 *  - This package is consumed by the INTERNAL apps: backend, landing, admin, mcp.
 */

export * from './ai/models'
export * from './agents/export'
export * from './copilot/proposal'
export * from './voice/profiles'
export * from './http/envelope'
export * from './http/constants'
