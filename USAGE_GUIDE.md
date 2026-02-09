# Document Builder - Quick Start Guide

## What You've Got

A professional document builder with:

- Rich text formatting toolbar (Bold, Italic, Underline, Headings, Quotes)
- Automatic page creation when content overflows
- Multi-page document support with vertical scrolling
- Click-to-edit any page
- Standard letter-size pages (8.5" × 11")

## Open Source Libraries Used

1. **Slate.js** - The core editor framework (MIT License)
   - Highly customizable and extensible
   - Used by companies like GitBook and Guru
2. **slate-react** - React integration for Slate
3. **slate-history** - Undo/redo support

## How It Works

### Automatic Page Creation

The app monitors the content height of each page. When text exceeds the page boundaries (11 inches), it automatically creates a new page and allows content to flow naturally.

### Page Switching

- Click on any page to make it active and editable
- The active page has a blue border
- Inactive pages show a preview of their content

### Toolbar Features

- **B** - Bold text
- **I** - Italic text
- **U** - Underline text
- **H1** - Large heading
- **H2** - Medium heading
- **"** - Block quote

## Running the App

```bash
npm start
```

Opens at: http://localhost:3000

## Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build` folder.
