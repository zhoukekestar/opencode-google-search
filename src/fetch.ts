export default (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> =>
  fetch(input, {
    // https://bun.com/docs/guides/http/proxy
    ...(process.env.OPENCODE_ANTIGRAVITY_AUTH_PROXY
      ? { proxy: process.env.OPENCODE_ANTIGRAVITY_AUTH_PROXY }
      : {}),
    ...(init ?? {})
  })
