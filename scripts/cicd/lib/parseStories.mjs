/**
 * Parse all user stories from the epic & user stories MD file.
 * @param {string} content - Full file content
 * @returns {Array<{id: string, status: string|null, title: string, gherkin: string, epicLabel: string}>}
 */
export function parseStories(content) {
  // Split into chunks, one per story header
  const chunks = content.split(/(?=\*\*Story [\d.]+)/);
  const HEADER_RE = /^\*\*Story ([\d.]+(?:-bis)?):?\s*(?:\[([^\]]*)\])?\*\*\s*(.+)/;
  const results = [];

  for (const chunk of chunks) {
    const m = HEADER_RE.exec(chunk);
    if (!m) continue;

    const [, id, rawStatus, titleText] = m;
    const status = rawStatus ? rawStatus.trim() : null;

    // Extract all gherkin/plain code blocks
    const gherkinBlocks = [];
    const CODE_BLOCK_RE = /```(?:gherkin)?\n([\s\S]*?)```/g;
    let cb;
    while ((cb = CODE_BLOCK_RE.exec(chunk)) !== null) {
      const block = cb[1].trim();
      if (block) gherkinBlocks.push(block);
    }

    results.push({
      id,
      status,
      title: titleText.trim(),
      gherkin: gherkinBlocks.join('\n\n'),
      epicLabel: 'epic-' + id.split('.').slice(0, 2).join('.'),
    });
  }

  return results;
}

/**
 * Build the GitHub issue title for a story.
 * Strips "so that ..." clause for brevity.
 */
export function buildIssueTitle(story) {
  const short = story.title.replace(/\s+so that\b.*/i, '').trim().replace(/[,;]+$/, '');
  return `[Story ${story.id}] ${short}`;
}

/**
 * Build the GitHub issue body for a story.
 */
export function buildIssueBody(story) {
  const gherkinSection = story.gherkin
    ? `\n\n**Acceptance Criteria (Gherkin):**\n\n\`\`\`gherkin\n${story.gherkin}\n\`\`\``
    : '';
  return `**Story ${story.id}**\n${story.title}${gherkinSection}`;
}
