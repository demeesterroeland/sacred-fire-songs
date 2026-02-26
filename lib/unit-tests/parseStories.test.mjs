import { describe, it, expect } from 'vitest';
import { parseStories, buildIssueTitle, buildIssueBody } from '../../.claude/scripts/lib/parseStories.mjs';

const SAMPLE_MD = `
**Story 1.1.1: [Implemented]** As a Member, I want to add a song using a web form so that I can share medicine.

\`\`\`
Scenario: Admin uploads via Form
  Given I am logged in as an Admin
  When I fill in the Title and click "Add Song"
  Then a new song should be created
\`\`\`

**Story 1.1.2:** As an Admin, I want to upload a raw \`.cho\` file so that I don't have to type manually.

**Story 1.1.2-bis: [Not Implemented]** As an Admin, I want pasted metadata to populate fields.

**Story 2.3.1: [Partial]** As a Guest, I want to filter songs by category.
`;

describe('parseStories', () => {
  it('extracts all story IDs', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories.map(s => s.id)).toEqual(['1.1.1', '1.1.2', '1.1.2-bis', '2.3.1']);
  });

  it('extracts status correctly', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].status).toBe('Implemented');
    expect(stories[1].status).toBeNull();
    expect(stories[2].status).toBe('Not Implemented');
    expect(stories[3].status).toBe('Partial');
  });

  it('derives epic label from story ID', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].epicLabel).toBe('epic-1.1');
    expect(stories[3].epicLabel).toBe('epic-2.3');
  });

  it('extracts Gherkin from code blocks', () => {
    const stories = parseStories(SAMPLE_MD);
    expect(stories[0].gherkin).toContain('Scenario: Admin uploads via Form');
    expect(stories[1].gherkin).toBe('');
  });
});

describe('buildIssueTitle', () => {
  it('formats title as [Story X.X.X] short description', () => {
    const story = { id: '1.1.1', title: 'As a Member, I want to add a song so that I can share.' };
    expect(buildIssueTitle(story)).toBe('[Story 1.1.1] As a Member, I want to add a song');
  });

  it('handles -bis IDs', () => {
    const story = { id: '1.1.2-bis', title: 'As an Admin, I want pasted metadata so that things.' };
    expect(buildIssueTitle(story)).toMatch(/^\[Story 1\.1\.2-bis\]/);
  });
});

describe('buildIssueBody', () => {
  it('includes story ID and title', () => {
    const story = { id: '1.1.1', title: 'As a Member, I want to add a song.', gherkin: '' };
    const body = buildIssueBody(story);
    expect(body).toContain('**Story 1.1.1**');
    expect(body).toContain('As a Member');
  });

  it('includes Gherkin when present', () => {
    const story = { id: '1.1.1', title: 'As a Member.', gherkin: 'Scenario: X\n  Given Y' };
    const body = buildIssueBody(story);
    expect(body).toContain('Acceptance Criteria (Gherkin)');
    expect(body).toContain('Scenario: X');
  });

  it('omits Gherkin section when empty', () => {
    const story = { id: '1.1.1', title: 'As a Member.', gherkin: '' };
    const body = buildIssueBody(story);
    expect(body).not.toContain('Gherkin');
  });
});
