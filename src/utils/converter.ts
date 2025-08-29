// Markdown Converter with Korean Support
// 한글 깨짐 없는 변환 기능 구현

import { marked } from 'marked';
import { saveAs } from 'file-saver';

// Type definitions
export type ExportFormat = 'html' | 'styled-html' | 'pdf' | 'docx' | 'ppt' | 'excel' | 'txt';

// Custom renderer for links to open in new tab
const renderer = new marked.Renderer();
renderer.link = function({ href, title, tokens }): string {
    const link = href || '';
    // tokens 배열에서 텍스트 추출
    const text = this.parser?.parseInline(tokens) || '';
    const titleAttr = title ? `title="${title}"` : '';
    return `<a href="${link}" target="_blank" rel="noopener noreferrer" ${titleAttr}>${text}</a>`;
};

// marked.js 설정
marked.use({
    breaks: true,  // 단일 줄바꿈을 <br>로 변환
    gfm: true,     // GitHub Flavored Markdown
    renderer: renderer
});

// Markdown을 HTML로 변환
export function markdownToHtml(markdown: string): string {
    return marked.parse(markdown) as string;
}

// HTML Export with UTF-8 BOM
export function exportHtml(markdown: string, styled: boolean = false): void {
    const html = markdownToHtml(markdown);
    const BOM = '\uFEFF';
    
    let fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>`;
    
    if (styled) {
        fullHtml += `
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
    <style>
        body {
            font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 20px;
            margin-bottom: 10px;
        }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background: #f4f4f4;
        }
        blockquote {
            border-left: 4px solid #ccc;
            margin: 15px 0;
            padding-left: 15px;
            color: #666;
        }
    </style>`;
    }
    
    fullHtml += `
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([BOM + fullHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'document.html');
}

// PDF Export - 동적으로 import
export async function exportPdf(markdown: string): Promise<void> {
    try {
        const html = markdownToHtml(markdown);
        
        // pdfExporter.ts 사용 (V2는 삭제됨)
        const { exportToPdf } = await import('./pdfExporter');
        await exportToPdf(html);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('PDF 내보내기 중 오류가 발생했습니다.');
    }
}

// Text Export - Convert markdown to plain text
export function exportTxt(markdown: string): void {
    // 마크다운을 HTML로 변환
    const html = markdownToHtml(markdown);
    
    // 임시 div를 생성하여 HTML을 텍스트로 변환
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 텍스트 콘텐츠 추출 (HTML 태그 제거)
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // 연속된 공백 정리
    plainText = plainText
        .replace(/\n{3,}/g, '\n\n') // 3개 이상의 줄바꿈을 2개로
        .replace(/[ ]{2,}/g, ' ')   // 연속된 공백을 하나로
        .trim();
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + plainText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'document.txt');
}

// Excel Export - 동적으로 import
export async function exportExcel(markdown: string): Promise<void> {
    try {
        const { exportToExcel } = await import('./excelExporter');
        await exportToExcel(markdown);
    } catch (error) {
        console.error('Excel export error:', error);
        alert('엑셀 내보내기 중 오류가 발생했습니다.');
    }
}

// DOCX Export - 동적으로 import
export async function exportDocx(markdown: string): Promise<void> {
    try {
        console.log('Starting DOCX export...');
        console.log('Importing docxExporter module...');
        const { markdownToDocx } = await import('./docxExporter');
        console.log('docxExporter module loaded successfully');
        console.log('Calling markdownToDocx function...');
        await markdownToDocx(markdown);
        console.log('DOCX export completed successfully');
    } catch (error) {
        console.error('DOCX export error details:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        alert('DOCX 내보내기 중 오류가 발생했습니다. 다른 형식을 시도해주세요.');
        throw error;
    }
}

// PPT Export
export async function exportPpt(markdown: string): Promise<void> {
    try {
        console.log('Starting PPT export...');
        console.log('Importing pptExporter module...');
        const { markdownToPpt } = await import('./pptExporter');
        console.log('pptExporter module loaded successfully');
        console.log('Calling markdownToPpt function...');
        await markdownToPpt(markdown);
        console.log('PPT export completed successfully');
    } catch (error) {
        console.error('PPT export error details:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        alert('PPT 내보내기 중 오류가 발생했습니다. 다른 형식을 시도해주세요.');
        throw error;
    }
}

// Export function
export async function exportAs(format: ExportFormat, markdown: string): Promise<void> {
    console.log(`exportAs called with format: ${format}`);
    
    if (!markdown) {
        alert('변환할 내용을 입력해주세요.');
        return;
    }
    
    console.log(`Processing export for format: ${format}`);
    
    try {
        switch(format) {
            case 'html':
                console.log('Exporting as HTML...');
                exportHtml(markdown, false);
                break;
            case 'styled-html':
                console.log('Exporting as Styled HTML...');
                exportHtml(markdown, true);
                break;
            case 'pdf':
                console.log('Exporting as PDF...');
                await exportPdf(markdown);
                break;
            case 'docx':
                console.log('Exporting as DOCX...');
                await exportDocx(markdown);
                break;
            case 'ppt':
                console.log('Exporting as PPT...');
                await exportPpt(markdown);
                break;
            case 'excel':
                console.log('Exporting as Excel...');
                exportExcel(markdown);
                break;
            case 'txt':
                console.log('Exporting as TXT...');
                exportTxt(markdown);
                break;
            default:
                console.error(`Unsupported format: ${format}`);
                alert('지원하지 않는 형식입니다.');
        }
        console.log(`Export function completed for ${format}`);
    } catch (error) {
        console.error(`Error in exportAs switch for ${format}:`, error);
        throw error;
    }
}