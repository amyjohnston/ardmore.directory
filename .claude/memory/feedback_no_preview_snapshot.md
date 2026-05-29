---
name: feedback_no_preview_snapshot
description: Do not use preview_snapshot; user prefers to review the site in Firefox
metadata:
  type: feedback
---

Do not use the `preview_snapshot` tool during verification. The user prefers to review the site directly in Firefox.

**Why:** User preference — they want to look at the live site in their browser rather than reading accessibility tree output.

**How to apply:** During the verification workflow, skip the snapshot step. Use `preview_screenshot` and `preview_console_logs` instead to confirm things are working.
