# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based markdown converter web application specifically designed for Korean language support. It provides various export formats (HTML, PDF, DOCX, PPT, Excel, TXT) without any server backend - all processing happens in the browser.

## Commands

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (TypeScript check + Vite build)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Testing
No test commands currently configured. Tests would need to be added if required.

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** as build tool
- **Marked.js** for markdown parsing
- **Export Libraries**:
  - `html2pdf.js` for PDF generation
  - `docx` for Word documents
  - `pptxgenjs` for PowerPoint presentations
  - `xlsx` for Excel spreadsheets
  - `file-saver` for download handling

### Key Components

**Main Application** (`src/App.tsx`):
- Manages markdown editor state with localStorage persistence
- Dual-pane layout: editor on left, preview on right
- Mobile-responsive with tab switching between editor/preview
- Handles file import/export orchestration

**Converter Module** (`src/utils/converter.ts`):
- Core markdown-to-HTML conversion using marked.js
- Export format handlers with UTF-8 BOM for Korean support
- Dynamic imports for heavy libraries (docx, ppt exporters)
- Table extraction logic for Excel export

**Specialized Exporters**:
- `docxExporter.ts` - Word document generation with proper Korean formatting
- `pptExporter.ts` - PowerPoint slide generation from markdown headers

### Export Format Specifics

- **HTML/Styled HTML**: Direct conversion with optional CSS styling
- **PDF**: Uses html2pdf.js with Noto Sans KR font for Korean support, A4 format
- **DOCX**: Full markdown support including tables, lists, code blocks
- **PPT**: Creates slides based on markdown headers (# = new slide)
- **Excel**: Extracts only tables from markdown, each table becomes a separate sheet
- **TXT**: Plain text extraction removing all formatting

### Korean Language Support

Critical for all exports:
- UTF-8 BOM (`\uFEFF`) prefix on all text exports
- Korean fonts explicitly specified (Noto Sans KR, Malgun Gothic)
- Character encoding properly set in HTML meta tags
- Table column width calculations account for Korean characters

## Important Considerations

- All file exports use `file-saver` library with proper MIME types
- Loading spinners shown during async export operations
- Error boundaries for export failures with user-friendly messages
- Mobile layout switches between editor/preview tabs (not side-by-side)
- Recent files tracking in localStorage (max 5 files)
- Auto-save to localStorage on every markdown change

## License Notice

The codebase is marked as "All rights reserved © Mrbaeksang" - respect copyright when making modifications.