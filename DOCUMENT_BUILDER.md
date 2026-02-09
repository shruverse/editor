# Document Builder

A fully functional document builder with automatic page management built using open-source technologies.

## Features

### Rich Text Editing

- **Bold** (Ctrl/Cmd + B)
- **Italic** (Ctrl/Cmd + I)
- **Underline** (Ctrl/Cmd + U)
- Heading 1 (H1)
- Heading 2 (H2)
- Block quotes

### Automatic Page Management

- Pages are automatically created when content exceeds the page height
- Standard US Letter size (8.5" × 11")
- Vertical page switching - click any page to edit it
- Visual indication of active page
- Smooth scrolling between pages

### Technology Stack

All libraries used are 100% open-source:

- **Slate.js** - Customizable rich text editor framework (MIT License)
- **React** - UI library (MIT License)
- **slate-react** - React bindings for Slate (MIT License)
- **slate-history** - Undo/redo functionality (MIT License)

## Running the Application

```bash
npm start
```

The application will open at http://localhost:3000

## How to Use

1. Start typing in the first page
2. Use the toolbar buttons to format your text
3. When content exceeds the page height, a new page is automatically created
4. Click on any page to switch to it and continue editing
5. The active page is highlighted with a blue border

## Future Enhancements

- Export to PDF
- Font size and family selection
- Text alignment options
- Lists (ordered and unordered)
- Images and media
- Tables
- Page numbering
- Print preview
