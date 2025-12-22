# UI Specification

Detailed user interface design for the Subtitle Encoding Converter.

## Design System

- **Framework**: Svelte
- **CSS**: Bulma (clean defaults, no component library needed)
- **Theme**: Light mode (Bulma default)

## Main Window

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Subtitle Converter                               [─]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │         Drop .srt files here                     │  │
│  │                                                  │  │
│  │         📁 or click to browse                    │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ File          │ Encoding     │ Lang │ Status     │  │
│  ├───────────────┼──────────────┼──────┼────────────┤  │
│  │ movie1.srt    │ [Win-1250 ▼] │ [sr] │ ✓ Done     │  │
│  │ movie2.srt    │ [ISO-8859 ▼] │ [sr] │ ✓ Done     │  │
│  │ movie3.srt    │ [UTF-8    ▼] │ [sr] │ ⊘ Skipped  │  │
│  │ movie4.srt    │ [Win-1250 ▼] │ [sr] │ ⟳ Working  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [Convert All]                           4 files       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Components

### Drop Zone

Bulma file upload component with drag-and-drop support.

**States:**
- Default: "Drop .srt files here"
- Hover (dragging): Blue border, "Release to add files"
- Invalid file: Red border, "Only .srt files supported"

### File List

Bulma table with columns:
- **File**: Filename (truncated if long)
- **Encoding**: Dropdown (auto-detected, user can override)
- **Lang**: Dropdown for output language code (v2 feature)
- **Status**: Icon + text

### Encoding Dropdown

Per-file dropdown showing detected encoding. User can override if detection is wrong.

Options:
- Windows-1250 (Central European)
- Windows-1251 (Cyrillic)
- ISO-8859-2 (Latin-2)
- ISO-8859-5 (Cyrillic)
- UTF-8
- KOI8-R

Auto-selected based on detection confidence. Low confidence = show warning icon.

### Language Dropdown (v2)

Select output language for Plex naming.

Options:
- sr (Serbian)
- hr (Croatian)
- bs (Bosnian)
- sl (Slovenian)
- en (English)
- Custom...

Output filename: `movie.utf8.{lang}.srt`

### Status Indicators

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Pending | ○ | Gray | Queued for conversion |
| Processing | ⟳ | Blue | Converting now |
| Done | ✓ | Green | Successfully converted |
| Skipped | ⊘ | Yellow | Already UTF-8 |
| Error | ✕ | Red | Conversion failed |

### Convert Button

Bulma primary button. Disabled until files are added.

**States:**
- "Convert All" (default)
- "Converting..." (during processing, disabled)
- "Done!" (after completion, for 2 seconds)

## Interactions

### Adding Files

1. Drag files onto drop zone, OR
2. Click drop zone to open file picker
3. Files appear in list with auto-detected encoding
4. Non-.srt files rejected with toast notification

### Converting

1. User clicks "Convert All"
2. Files process sequentially
3. Status updates in real-time
4. Output files created next to originals
5. Toast notification on completion

### Error Handling

- File read error → Show in status column, red icon
- Write permission denied → Toast with suggestion
- Unknown encoding → Default to Windows-1250, show warning

## Responsive Behavior

- Minimum window size: 400x300px
- File list scrolls if many files
- Filename column truncates with ellipsis

## Accessibility

- Keyboard navigation for all controls
- Focus indicators on interactive elements
- Screen reader labels for status icons
