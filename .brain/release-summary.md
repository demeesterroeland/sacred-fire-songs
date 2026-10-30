# Release Notes: Musician Setlist PDF Export (Story 4.2.1 / Issue #18)

## Overview
Adds printable ceremony setlist PDF export for musicians using ChordSheetJS and jsPDF. Musicians can now export any setlist into a clean, firelight-optimized PDF songbook with one click.

## Features
- **Firelight-Optimized Styling**: High-contrast charcoal text with terracotta accent chords for dim/ceremony lighting.
- **Transposition & Capo Support**: Automatically applies per-song transposition overrides and capo settings.
- **Structured Ceremony Layout**: Setlist cover/header, automatic pagination, running `(continued)` headers on page breaks, and section markers.
- **UI Integration**: Added quick-action "Export PDF" printer button to the playlist header and an option in the playlist context menu with toast feedback.
- **BDD & TDD Verified**: Living specification in `docs/testing/setlist-pdf-export.feature` and 12 unit tests in `testing/unit/tests/pdfExport.test.ts`.
