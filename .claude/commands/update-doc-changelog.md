Update the version, date, and changelog of a documentation file after modifying it.

Target file: $ARGUMENTS

## Steps

### 1. Identify File Type
Determine if the file is `.md`, `.sql`, or `.html`.

### 2. Prepare Metadata
- **New Date**: Today's date (e.g., "Feb 26, 2026").
- **New Version**: Read the current version from the file header and increment the minor version (e.g., 1.2 → 1.3).

### 3. Apply Updates

**For Markdown (`.md`):**
1. Find the line starting with `**Version:**` and update the number.
2. Find the line starting with `**Date:**` and update the date.
3. Locate the "Changelog" table and append a new row:
   `| **{{ new_version }}** | {{ new_date }} | {{ description }} |`

**For SQL (`.sql`):**
1. Find `**Version:**` in the top comment block and update.
2. Find `**Date:**` and update.
3. If a changelog exists in comments, append:
   `{{ new_version }} - {{ new_date }}: {{ description }}`

**For HTML (`.html`):**
1. Find `<!-- Version: X.Y -->` and update.
2. Find `<!-- Date: ... -->` and update.
3. Add a comment line for the change.

### 4. Verify
Confirm the file header shows the new version and date, and the changelog includes the new entry.
