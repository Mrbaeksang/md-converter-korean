// Markdown Converter with Korean Support
// 한글 깨짐 없는 변환 기능 구현

import { marked } from 'marked';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { markdownToDocx } from './docxExporter';

// html2pdf를 동적으로 import
const loadHtml2Pdf = () => {
    return import('html2pdf.js').then(module => module.default);
};

// Type definitions
export type ExportFormat = 'html' | 'styled-html' | 'pdf' | 'docx' | 'excel' | 'txt';

// marked.js 설정
marked.setOptions({
    breaks: true,
    gfm: true,
    // @ts-expect-error - sanitize는 deprecated지만 아직 사용 가능
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

// PDF Export with Korean font support
export async function exportPdf(markdown: string): Promise<void> {
    if (!markdown || markdown.trim() === '') {
        alert('PDF로 변환할 내용이 없습니다.');
        return;
    }
    
    try {
        // html2pdf 동적 로드
        const html2pdf = await loadHtml2Pdf();
        
        const html = markdownToHtml(markdown);
        
        // PDF용 컨테이너 생성 - 간단하게 구성
        const container = document.createElement('div');
        
        // 직접 HTML과 스타일 삽입
        container.innerHTML = html;
        
        // 인라인 스타일 적용
        container.style.width = '794px'; // A4 width at 96 DPI
        container.style.padding = '40px';
        container.style.background = 'white';
        container.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
        container.style.fontSize = '14px';
        container.style.lineHeight = '1.6';
        container.style.color = 'black';
        
        // 모든 요소에 스타일 적용
        const allElements = container.querySelectorAll('*');
        allElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.color = 'black';
            element.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
        });
        
        // h1 스타일
        container.querySelectorAll('h1').forEach(h1 => {
            (h1 as HTMLElement).style.fontSize = '24px';
            (h1 as HTMLElement).style.fontWeight = 'bold';
            (h1 as HTMLElement).style.borderBottom = '2px solid black';
            (h1 as HTMLElement).style.paddingBottom = '10px';
            (h1 as HTMLElement).style.marginTop = '20px';
            (h1 as HTMLElement).style.marginBottom = '20px';
        });
        
        // h2 스타일
        container.querySelectorAll('h2').forEach(h2 => {
            (h2 as HTMLElement).style.fontSize = '20px';
            (h2 as HTMLElement).style.fontWeight = 'bold';
            (h2 as HTMLElement).style.borderBottom = '1px solid #666';
            (h2 as HTMLElement).style.paddingBottom = '5px';
            (h2 as HTMLElement).style.marginTop = '18px';
            (h2 as HTMLElement).style.marginBottom = '18px';
        });
        
        // table 스타일
        container.querySelectorAll('table').forEach(table => {
            (table as HTMLElement).style.borderCollapse = 'collapse';
            (table as HTMLElement).style.width = '100%';
            (table as HTMLElement).style.margin = '15px 0';
        });
        
        container.querySelectorAll('th, td').forEach(cell => {
            (cell as HTMLElement).style.border = '1px solid black';
            (cell as HTMLElement).style.padding = '8px';
        });
        
        container.querySelectorAll('th').forEach(th => {
            (th as HTMLElement).style.background = '#f0f0f0';
            (th as HTMLElement).style.fontWeight = 'bold';
        });
        
        // 코드 블록 스타일 + 페이지 잘림 방지
        container.querySelectorAll('pre, code').forEach(codeBlock => {
            (codeBlock as HTMLElement).style.pageBreakInside = 'avoid';
            (codeBlock as HTMLElement).style.breakInside = 'avoid';
            (codeBlock as HTMLElement).style.display = 'block';
            if (codeBlock.tagName === 'PRE') {
                (codeBlock as HTMLElement).style.backgroundColor = '#f4f4f4';
                (codeBlock as HTMLElement).style.padding = '15px';
                (codeBlock as HTMLElement).style.borderRadius = '5px';
                (codeBlock as HTMLElement).style.whiteSpace = 'pre-wrap';
                (codeBlock as HTMLElement).style.wordBreak = 'break-word';
            }
        });
        
        // DOM에 추가
        document.body.appendChild(container);
        
        // 웹폰트 로드 대기
        console.log('웹폰트 로드 중...');
        
        // Google Fonts 로드
        if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        // 폰트 로드 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const opt = {
            margin: 10,
            filename: 'document.pdf',
            image: { 
                type: 'jpeg', 
                quality: 0.98
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true, // 로깅 활성화
                backgroundColor: '#FFFFFF'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' as const
            },
            pagebreak: { 
                mode: 'avoid-all', // 요소가 페이지 경계에서 잘리지 않도록
                avoid: ['tr', 'pre', 'code', '.code-block'] // 테이블 행과 코드 블록 잘림 방지
            }
        };
        
        console.log('PDF 생성 시작...');
        await html2pdf().set(opt).from(container).save();
        console.log('PDF 생성 완료');
        
        // container 제거
        document.body.removeChild(container);
        
    } catch (error) {
        console.error('PDF 생성 실패:', error);
        alert(`PDF 생성 중 오류가 발생했습니다: ${error}`);
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

// Excel Export - 표만 추출해서 엑셀로 변환
export function exportExcel(markdown: string): void {
    const wb = XLSX.utils.book_new();
    
    // 모든 값을 문자열로 처리 (숫자 변환 안 함)
    const parseValue = (text: string): string => {
        return text.replace(/\*\*/g, ''); // Bold 마크다운만 제거
    };
    
    // 마크다운에서 테이블만 추출
    const extractTables = (markdown: string): { name: string, data: string[][] }[] => {
        const tables: { name: string, data: string[][] }[] = [];
        const lines = markdown.split('\n');
        let tableCount = 0;
        let lastHeader = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 헤더 추출 (테이블 이름용)
            if (line.trim().match(/^#{1,6}\s+(.+)$/)) {
                lastHeader = line.trim().replace(/^#{1,6}\s+/, '');
            }
            
            // 테이블 시작 감지
            if (line.includes('|')) {
                const tableData: string[][] = [];
                let j = i;
                
                while (j < lines.length) {
                    const currentLine = lines[j];
                    const trimmed = currentLine.trim();
                    
                    // 테이블 끝 감지: |가 없거나 빈 줄
                    if (!currentLine.includes('|')) {
                        // 빈 줄이면 계속 진행, 아니면 테이블 끝
                        if (trimmed !== '') {
                            break;
                        }
                        j++;
                        break;
                    }
                    
                    // 구분선 건너뛰기
                    if (trimmed.match(/^\|?[\s-|:]+\|?$/)) {
                        j++;
                        continue;
                    }
                    
                    // 테이블 행 파싱
                    const cells = trimmed
                        .split('|')
                        .map(cell => cell.trim())
                        .filter(cell => cell !== '');
                    
                    if (cells.length > 0) {
                        tableData.push(cells);
                    }
                    j++;
                }
                
                if (tableData.length > 0) {
                    tableCount++;
                    const tableName = lastHeader || `Table ${tableCount}`;
                    tables.push({ name: tableName, data: tableData });
                    i = j - 1; // 다음 라인으로 이동
                }
            }
        }
        
        return tables;
    };
    
    const tables = extractTables(markdown);
    
    console.log(`찾은 테이블 개수: ${tables.length}`);
    tables.forEach(t => console.log(`- ${t.name}: ${t.data.length}행`));
    
    if (tables.length === 0) {
        alert('마크다운에서 표를 찾을 수 없습니다.');
        return;
    }
    
    // 시트 이름 중복 방지를 위한 Set
    const usedSheetNames = new Set<string>();
    
    // 각 테이블을 별도 시트로 추가
    tables.forEach((table, index) => {
        const wsData: (string | number | undefined)[][] = [];
        const columnWidths: number[] = [];
        
        // 테이블 데이터 처리
        table.data.forEach((row, rowIndex) => {
            wsData[rowIndex] = [];
            row.forEach((cell, colIndex) => {
                const value = parseValue(cell);
                wsData[rowIndex][colIndex] = value;
                
                // 열 너비 계산 (한글 고려)
                const width = Math.min(value.length * 1.5 + 4, 50);
                if (!columnWidths[colIndex] || columnWidths[colIndex] < width) {
                    columnWidths[colIndex] = width;
                }
            });
        });
        
        // 워크시트 생성
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // 열 너비 설정
        ws['!cols'] = columnWidths.map(w => ({ wch: w || 15 }));
        
        // 시트 이름 (최대 31자, 특수문자 제거, 중복 방지)
        const sheetName = table.name
            .replace(/[:/*?[\]]/g, '')
            .substring(0, 28)  // 번호 추가할 공간 확보
            || `Table ${index + 1}`;
        
        // 중복 이름 처리
        let finalSheetName = sheetName;
        let counter = 1;
        while (usedSheetNames.has(finalSheetName)) {
            counter++;
            finalSheetName = `${sheetName} (${counter})`;
        }
        usedSheetNames.add(finalSheetName);
        
        XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
    });
    
    // Excel 파일 저장
    XLSX.writeFile(wb, 'document.xlsx', { 
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
}

// DOCX Export
export async function exportDocx(markdown: string): Promise<void> {
    await markdownToDocx(markdown);
}

// Export function
export async function exportAs(format: ExportFormat, markdown: string): Promise<void> {
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
            await exportPdf(markdown);
            break;
        case 'docx':
            await exportDocx(markdown);
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