// Markdown Converter with Korean Support
// 한글 깨짐 없는 변환 기능 구현

import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Type definitions
export type ExportFormat = 'html' | 'styled-html' | 'pdf' | 'docx' | 'excel' | 'txt';

// marked.js 설정
marked.setOptions({
    breaks: true,
    gfm: true,
    // @ts-ignore - sanitize는 deprecated지만 아직 사용 가능
    sanitize: false
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
    <style>
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
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

// PDF Export with Korean font support
export async function exportPdf(markdown: string): Promise<void> {
    const html = markdownToHtml(markdown);
    
    // 임시 div 생성
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.fontFamily = 'Noto Sans KR, sans-serif';
    document.body.appendChild(tempDiv);
    
    const opt = {
        margin: 10,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' as const
        }
    };
    
    try {
        await html2pdf().set(opt).from(tempDiv).save();
    } catch (error) {
        console.error('PDF 생성 실패:', error);
        alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
        document.body.removeChild(tempDiv);
    }
}

// Text Export
export function exportTxt(markdown: string): void {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + markdown], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'document.txt');
}

// Excel Export (테이블만)
export function exportExcel(markdown: string): void {
    const html = markdownToHtml(markdown);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const tables = tempDiv.getElementsByTagName('table');
    
    if (tables.length === 0) {
        alert('변환할 테이블이 없습니다.');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    for (let i = 0; i < tables.length; i++) {
        const ws = XLSX.utils.table_to_sheet(tables[i]);
        XLSX.utils.book_append_sheet(wb, ws, `Sheet${i + 1}`);
    }
    
    XLSX.writeFile(wb, 'tables.xlsx');
}

// DOCX Export
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function exportDocx(_markdown: string): Promise<void> {
    alert('DOCX 변환 기능은 개발 중입니다.');
    // TODO: docx.js를 사용한 구현
}

// Export function
export function exportAs(format: ExportFormat, markdown: string): void {
    if (!markdown) {
        alert('변환할 내용을 입력해주세요.');
        return;
    }
    
    switch(format) {
        case 'html':
            exportHtml(markdown, false);
            break;
        case 'styled-html':
            exportHtml(markdown, true);
            break;
        case 'pdf':
            exportPdf(markdown);
            break;
        case 'docx':
            exportDocx(markdown);
            break;
        case 'excel':
            exportExcel(markdown);
            break;
        case 'txt':
            exportTxt(markdown);
            break;
        default:
            alert('지원하지 않는 형식입니다.');
    }
}