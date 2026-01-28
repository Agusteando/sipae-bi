type CommentRow = { section_identifier: string; comment: string };

export function useComments() {
  const config = useRuntimeConfig();

  async function loadComments(opts: { plantel: string; year: number; month: number }) {
    const url = `${config.public?.botBaseUrl ?? config.botBaseUrl}/kardex/comments`;
    const rows = await $fetch<CommentRow[]>(url, { method: "GET", params: opts as any });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.section_identifier] = r.comment;
    return map;
  }

  async function saveComment(opts: { plantel: string; year: number; month: number; section_identifier: string; comment: string }) {
    const url = `${config.public?.botBaseUrl ?? config.botBaseUrl}/kardex/comments`;
    await $fetch(url, { method: "POST", body: opts });
  }

  return { loadComments, saveComment };
}