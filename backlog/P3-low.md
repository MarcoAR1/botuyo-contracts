# P3 — Low / cleanup

## CON-P3-1 — `ApiError` name overlaps the MCP client's `ApiError`

- **Category:** naming / inconsistency
- **Location:** `src/http/envelope.ts:9` exports an **interface** `ApiError`; `botuyo-mcp/src/client.ts` defines a **class** `ApiError extends Error`. Same name, different concept.
- **Problem:** A file importing both (or a dev grepping for `ApiError`) gets confused — one is a wire-shape, the other a thrown error.
- **Fix:** Rename the contracts interface to `ApiErrorPayload` (or `ApiErrorBody`) to disambiguate from thrown-error classes. Minor breaking change → bump + changelog + update consumers.
- **Confidence:** High. **Effort:** S.

## CON-P3-2 — `ApiResponse<T>` could be a discriminated union

- **Category:** typing ergonomics (optional)
- **Location:** `src/http/envelope.ts:16-22` — `{ success: boolean; data: T; message?; error? }`
- **Problem:** With `success: boolean` + always-present `data`, consumers can't narrow on `success` to know whether `data` or `error` is populated. The real backend contract is "success → data; failure → error".
- **Fix (optional):** Offer a discriminated union `type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiErrorPayload }` alongside the current type (keep `ApiResponse` for back-compat). Lets frontends narrow safely.
- **Confidence:** Med — **(verify)** the backend always sends `data` on success / `error` on failure before tightening. **Effort:** S.
