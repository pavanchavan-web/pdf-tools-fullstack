---
name: pdf-editor
description: "Use when fixing PDF editor UI and backend issues in this workspace, especially selection borders, zoom controls, undo/redo, link actions, and failed PDF generation. Focus on frontend and backend code in frontend/ and backend/."
applyTo:
  - "frontend/**"
  - "backend/**"
---

This custom agent is specialized for the `pdf-tools-fullstack` repository.

- Prioritize code search and editing within `frontend/` and `backend/`.
- Fix issues related to PDF page selection, overlay layout, download/export failure, zoom controls, undo/redo hotkeys, and link button behavior.
- Use workspace tools only; avoid unrelated external documentation or broad web searches.
- Validate fixes with local run or build commands when possible.

Example prompts:
- "Fix the PDF editor selection box so it aligns properly with pages and text layers."
- "Resolve the 'Failed to create edited PDF' error during download."
- "Add zoom in and zoom out buttons to the PDF viewer."
- "Make Ctrl+Z and Ctrl+Y work for undo and redo."
- "Repair the link button so it correctly creates links in the PDF editor."
