# Repository Rules & Guidelines

## 1. Changelog & History Maintenance
- **Automatic History Updates**: Whenever adding new features, fixing bugs, refactoring components, or altering UI/styles in this codebase:
  1. Document all changes in [`doc/history.md`](doc/history.md).
  2. Keep [`README.md`](README.md) and relevant documentation synchronized with feature and release states.
- **Date Format & Placement**:
  - In `doc/history.md`, group entries under the current date using the format `# DD.MM.YY` (e.g., `# 18.09.26`) placed chronologically at the top of the file directly beneath the frontmatter tags comment block.
  - Record detailed release notes and comprehensive per-change descriptions directly in `doc/history.md` and companion walkthrough files in `doc/prompts/`.
- **Entry Structure**:
  - Title the main change in bold with a clear feature/fix description.
  - Detail specific modifications with bullet points mentioning affected file paths, selectors/IDs, and technical/design decisions.
  - Preserve existing frontmatter tag comments at the top of the file.

## 2. Mandatory Prompt, Plan & Walkthrough Archiving
- **Automatic Per-Turn Full Conversation Updates**:
  - After **EVERY SINGLE** chat prompt-response cycle, you MUST update the session's comprehensive conversation archive (`doc/prompts/<Prefix>. <Session Title>.md`) by appending the new turn contents to it.
  - **DO NOT** create a new file for each individual prompt turn (avoid creating fragmented files like `<Prefix>.3`, `<Prefix>.4`, `<Prefix>.5`, etc.).
  - Append the current turn's verbatim user request, complete internal thinking (`### Thinking`), and full final response (`### AI Response`) directly to the end of the session archive file, separated by horizontal rules (`---`).
  - **No Summarization — Complete Unabridged Retention**: Do NOT summarize, condense, truncate, or omit conversation turns, user inputs, thinking reasoning, or assistant outputs. Keep everything in full detail so that complete context is preserved across the entire project lifecycle.
- **Mandatory Secret Redaction & Placeholder Replacement**:
  - **Zero Secrets in Archives & Docs**: Whenever API keys, database passwords, JWT tokens (such as Supabase `anon` or `service_role` keys), OAuth secrets, or personal access tokens appear in user requests, internal thinking, code diffs, or AI responses, you MUST sanitize them by replacing them with descriptive placeholders (e.g., `<YOUR_SUPABASE_URL>`, `<YOUR_SUPABASE_ANON_KEY>`, `[REDACTED_SECRET]`).
  - Never allow raw secrets, keys, or sensitive credentials to be stored or committed in `doc/prompts/`, `doc/history.md`, or any markdown files.
- **Session Continuity & Updating Past Archives**:
  - Whenever an existing conversation or chat thread is continued, resumed, or revisited, you MUST locate and update the corresponding existing archive in `doc/prompts/<Prefix>. <Session Title>.md` by appending the new turns directly to it.
  - **DO NOT** create a new major sequence number or split an ongoing dialogue across multiple files when resuming or updating an existing chat.
  - If a past archive file was missed or is missing earlier turns from the current conversation, retroactively synchronize and append all missing turns so that the file contains the complete, uninterrupted history.
- **Fractional Suffixes Reserved for Plans & Walkthroughs Only**:
  - Minor/fractional prefixes (e.g., `<Prefix>.1`, `<Prefix>.2`, etc.) are reserved **exclusively** for companion implementation plans and walkthroughs:
    - Primary chat session: `doc/prompts/<Prefix>. <Session Title>.md` (contains all turns sequentially)
    - Implementation plan: `doc/prompts/<Prefix>.1 Implementation Plan - <Plan Title>.md`
    - Walkthrough document: `doc/prompts/<Prefix>.2 Walkthrough - <Title>.md`
    - Subsequent plans/walkthroughs within the same session: `<Prefix>.3 Implementation Plan - ...`, `<Prefix>.4 Walkthrough - ...`, etc.
- **Mandatory Dual-Write on Every Turn**:
  - **Implementation Plans**: Whenever creating or updating an implementation plan artifact (`implementation_plan.md`), you MUST simultaneously write a copy to `doc/prompts/<Prefix>.<N> Implementation Plan - <Plan Title>.md` before pausing for user review.
  - **Walkthroughs**: Whenever creating or updating a walkthrough artifact (`walkthrough.md`), you MUST simultaneously write a copy to `doc/prompts/<Prefix>.<N> Walkthrough - <Title>.md` upon completing execution.
  - **Full Conversation Archive**: Update and append the active turn to `doc/prompts/<Prefix>. <Session Title>.md` immediately upon generating the response on every turn.
- **Target Location**: All prompt, plan, and walkthrough records reside in the [`doc/prompts`](doc/prompts) directory.
- **Prefix Sequencing Strategy**:
  - Inspect existing files in `doc/prompts/` to identify the current major sequence integer (e.g. `1.`, `2.`, `3.`, `4.`, `5.`, etc.).
  - Increment the sequence integer ONLY when starting an entirely distinct, new conversation session that does not belong to a pre-existing thread.
  - Keep all conversation turns for that session inside the main file `doc/prompts/<Prefix>. <Session Title>.md`.
- **Chat Archive Fidelity & Sanitization**:
  - Reproduce the conversation in full (user request blocks verbatim, with sensitive keys redacted).
  - Include the model's unabridged internal thinking/reasoning parts (`### Thinking`) alongside the complete final response (`### AI Response`).
  - Verify that all API keys and secrets have been replaced with placeholders before writing.
  - Preserve the frontmatter tags comment block at the top of the archive file.

## 3. Code Quality & Styling Standards
- Follow the established vanilla JavaScript and CSS conventions across the repository (`index.html`, `index.css`, `index.js`).
- Avoid introducing unnecessary third-party runtime frameworks or heavy libraries unless explicitly requested.
- Maintain responsive design, glassmorphism, smooth animations, and dark theme consistency across all interactive modules, cards, and modal components.

## 4. Commit Message & Chat Summary Generation
- **Commit Message & Description Suggestion**:
  - At the end of every response, summarize the work completed across the chat session (referencing the active prompt archive in `doc/prompts/<Prefix>. <Session Title>.md`).
  - Suggest a ready-to-use Git commit message with a structured commit description at the very end of the response.
