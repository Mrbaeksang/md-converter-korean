// Markdown Converter with Korean Support
// 한글 깨짐 없는 변환 기능 구현

import { marked } from 'marked';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// html2pdf를 동적으로 import
const loadHtml2Pdf = () => {
    return import('html2pdf.js').then(module => module.default);
};

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
marked.setOptions({
    breaks: true,
    gfm: true,
    // @ts-expect-error - sanitize는 deprecated지만 아직 사용 가능
    sanitize: false,
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
        
        // 인라인 스타일 적용 - 더 안전한 너비 설정
        container.style.width = '100%';
        container.style.maxWidth = '750px'; // 좀 더 좁게 설정하여 여백 확보
        container.style.padding = '30px';
        container.style.background = 'white';
        container.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
        container.style.fontSize = '14px';
        container.style.lineHeight = '1.6';
        container.style.color = 'black';
        container.style.boxSizing = 'border-box';
        
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
        
        // 표 처리 - 페이지 경계에서 잘리지 않도록 처리
        const MAX_ROWS_PER_PAGE = 20; // A4 한 페이지에 들어갈 수 있는 최대 데이터 행 수
        
        // 먼저 모든 표에 기본 스타일과 페이지 분할 방지 적용
        container.querySelectorAll('table').forEach(table => {
            (table as HTMLElement).style.borderCollapse = 'collapse';
            (table as HTMLElement).style.width = '100%';
            (table as HTMLElement).style.margin = '15px 0';
            (table as HTMLElement).style.tableLayout = 'fixed';
            (table as HTMLElement).style.wordBreak = 'break-word';
            
            // 작은 테이블은 페이지를 넘어가지 않도록 설정
            const rows = table.querySelectorAll('tr');
            if (rows.length <= 10) {
                // 10행 이하의 작은 표는 통째로 다음 페이지로
                (table as HTMLElement).style.pageBreakInside = 'avoid';
                (table as HTMLElement).style.breakInside = 'avoid';
                (table as HTMLElement).style.pageBreakBefore = 'auto';
                (table as HTMLElement).style.display = 'table';
                
                // 표 전체를 감싸는 컨테이너 생성
                const tableWrapper = document.createElement('div');
                tableWrapper.style.pageBreakInside = 'avoid';
                tableWrapper.style.breakInside = 'avoid';
                tableWrapper.style.marginBottom = '20px';
                
                // 표를 wrapper로 감싸기
                const parent = table.parentElement;
                if (parent) {
                    parent.insertBefore(tableWrapper, table);
                    tableWrapper.appendChild(table);
                }
            }
            
            // 셀 스타일
            table.querySelectorAll('th, td').forEach(cell => {
                (cell as HTMLElement).style.border = '1px solid black';
                (cell as HTMLElement).style.padding = '8px';
                (cell as HTMLElement).style.wordBreak = 'break-word';
                (cell as HTMLElement).style.overflowWrap = 'break-word';
            });
            
            // 헤더 스타일
            table.querySelectorAll('th').forEach(th => {
                (th as HTMLElement).style.background = '#f0f0f0';
                (th as HTMLElement).style.fontWeight = 'bold';
            });
        });
        
        // 긴 표 분할 처리
        container.querySelectorAll('table').forEach((table, tableIndex) => {
            const rows = Array.from(table.querySelectorAll('tr'));
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');
            
            let headerRow: Element | null = null;
            let dataRows: Element[] = [];
            
            if (thead) {
                headerRow = thead.querySelector('tr');
                dataRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
            } else {
                // thead가 없는 경우 첫 번째 행을 헤더로 간주
                if (rows.length > 0) {
                    const firstRow = rows[0];
                    const firstCells = firstRow.querySelectorAll('th');
                    if (firstCells.length > 0) {
                        headerRow = firstRow;
                        dataRows = rows.slice(1);
                    } else {
                        dataRows = rows;
                    }
                }
            }
            
            // 테이블이 너무 길면 분할 (10행 초과인 경우만)
            if (dataRows.length > MAX_ROWS_PER_PAGE && rows.length > 10) {
                console.log(`테이블 ${tableIndex + 1} 분할 필요: ${dataRows.length}개 행`);
                
                const tableParent = table.parentElement;
                if (!tableParent) return;
                
                // 테이블 캡션이 있으면 저장
                const caption = table.querySelector('caption');
                const captionText = caption ? caption.textContent || '' : '';
                
                // 분할된 테이블들을 저장할 배열
                const splitTables: HTMLTableElement[] = [];
                let partNumber = 1;
                
                // 데이터 행을 MAX_ROWS_PER_PAGE씩 분할
                for (let i = 0; i < dataRows.length; i += MAX_ROWS_PER_PAGE) {
                    const partRows = dataRows.slice(i, Math.min(i + MAX_ROWS_PER_PAGE, dataRows.length));
                    
                    // 새 테이블 생성
                    const newTable = document.createElement('table');
                    newTable.className = table.className;
                    
                    // 스타일 적용
                    (newTable as HTMLElement).style.borderCollapse = 'collapse';
                    (newTable as HTMLElement).style.width = '100%';
                    (newTable as HTMLElement).style.margin = '15px 0';
                    (newTable as HTMLElement).style.tableLayout = 'fixed';
                    (newTable as HTMLElement).style.wordBreak = 'break-word';
                    
                    // 분할된 테이블 사이에 페이지 구분
                    if (partNumber > 1) {
                        (newTable as HTMLElement).style.pageBreakBefore = 'always';
                        (newTable as HTMLElement).style.marginTop = '30px';
                    }
                    
                    // 캡션 추가 (파트 번호 포함)
                    if (captionText) {
                        const newCaption = document.createElement('caption');
                        newCaption.textContent = dataRows.length > MAX_ROWS_PER_PAGE 
                            ? `${captionText} (${partNumber}/${Math.ceil(dataRows.length / MAX_ROWS_PER_PAGE)})`
                            : captionText;
                        newCaption.style.marginBottom = '10px';
                        newCaption.style.fontWeight = 'bold';
                        newCaption.style.fontSize = '1.1em';
                        newTable.appendChild(newCaption);
                    }
                    
                    // 헤더 복제
                    if (headerRow) {
                        const newThead = document.createElement('thead');
                        const headerClone = headerRow.cloneNode(true) as HTMLElement;
                        newThead.appendChild(headerClone);
                        newTable.appendChild(newThead);
                    }
                    
                    // 바디 생성
                    const newTbody = document.createElement('tbody');
                    partRows.forEach(row => {
                        const rowClone = row.cloneNode(true) as HTMLElement;
                        newTbody.appendChild(rowClone);
                    });
                    newTable.appendChild(newTbody);
                    
                    splitTables.push(newTable);
                    partNumber++;
                }
                
                // 원본 테이블을 첫 번째 분할 테이블로 교체
                if (splitTables.length > 0) {
                    tableParent.replaceChild(splitTables[0], table);
                    
                    // 나머지 분할 테이블들을 순서대로 추가
                    let previousTable = splitTables[0];
                    for (let i = 1; i < splitTables.length; i++) {
                        if (previousTable.nextSibling) {
                            tableParent.insertBefore(splitTables[i], previousTable.nextSibling);
                        } else {
                            tableParent.appendChild(splitTables[i]);
                        }
                        previousTable = splitTables[i];
                    }
                    
                    // 분할된 모든 테이블에 스타일 적용
                    splitTables.forEach(splitTable => {
                        applyTableStyles(splitTable);
                    });
                }
            }
        });
        
        // 테이블 스타일 적용 함수 (분할된 테이블용)
        function applyTableStyles(table: Element) {
            // 기본 스타일은 이미 위에서 적용했으므로 추가 스타일만
            (table as HTMLElement).style.pageBreakInside = 'auto';
        }
        
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
                (codeBlock as HTMLElement).style.overflowWrap = 'break-word';
                (codeBlock as HTMLElement).style.maxWidth = '100%';
            }
        });
        
        // 단락과 리스트 아이템 오버플로우 처리
        container.querySelectorAll('p, li').forEach(element => {
            (element as HTMLElement).style.wordBreak = 'break-word';
            (element as HTMLElement).style.overflowWrap = 'break-word';
        });
        
        // 이미지 크기 제한
        container.querySelectorAll('img').forEach(img => {
            (img as HTMLElement).style.maxWidth = '100%';
            (img as HTMLElement).style.height = 'auto';
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
            margin: [15, 15, 15, 15], // 상, 우, 하, 좌 여백 (mm 단위) - 충분한 여백 확보
            filename: 'document.pdf',
            image: { 
                type: 'jpeg', 
                quality: 0.98
            },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true, // 로깅 활성화
                backgroundColor: '#FFFFFF',
                width: 750, // 컨테이너 너비에 맞춤
                windowWidth: 850 // 뷰포트 너비
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' as const
            },
            pagebreak: { 
                mode: ['avoid-all', 'css', 'legacy'], // 다양한 페이지 브레이크 모드 적용
                avoid: ['tr', 'pre', 'code', '.code-block', 'td', 'th'] // 테이블 셀도 잘림 방지
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
    let plainText = markdown;
    
    // CSS 미디어 쿼리 및 스타일 블록 제거 (멀티라인 처리)
    plainText = plainText.replace(/@media[\s\S]*?\{[\s\S]*?\}[\s]*\}/gm, '');
    plainText = plainText.replace(/\.[\w-]+\s*\{[^}]*\}/gm, ''); // 클래스 스타일 제거
    
    // HTML 블록 제거 (style, script, button 등)
    plainText = plainText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    plainText = plainText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    plainText = plainText.replace(/<button[^>]*onclick[^>]*>[\s\S]*?<\/button>/gi, '');
    
    // 모든 HTML 태그 제거
    plainText = plainText.replace(/<[^>]+>/g, '');
    
    // 마크다운 이미지 구문을 텍스트로 변환
    plainText = plainText.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
    
    // 마크다운 링크를 텍스트로 변환
    plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // 마크다운 강조 구문 제거
    plainText = plainText.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold**
    plainText = plainText.replace(/\*([^*]+)\*/g, '$1'); // *italic*
    plainText = plainText.replace(/__([^_]+)__/g, '$1'); // __bold__
    plainText = plainText.replace(/_([^_]+)_/g, '$1'); // _italic_
    plainText = plainText.replace(/~~([^~]+)~~/g, '$1'); // ~~strikethrough~~
    
    // 마크다운 제목 마커 제거
    plainText = plainText.replace(/^#{1,6}\s+/gm, '');
    
    // 블록쿼트 마커 제거
    plainText = plainText.replace(/^>\s*/gm, '');
    
    // 인라인 코드 백틱 제거
    plainText = plainText.replace(/`([^`]+)`/g, '$1');
    
    // 코드 블록 마커 제거
    plainText = plainText.replace(/^```[^\n]*\n/gm, '');
    plainText = plainText.replace(/^```$/gm, '');
    
    // 테이블 구분자 정리
    plainText = plainText.replace(/^\|?[\s-|:]+\|?$/gm, '');
    
    // HTML 엔티티 디코딩
    plainText = plainText
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    
    // 연속된 공백과 줄바꿈 정리
    plainText = plainText
        .replace(/\n{3,}/g, '\n\n') // 3개 이상의 줄바꿈을 2개로
        .replace(/[ \t]+/g, ' ') // 연속된 공백을 하나로
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
        alert('표가 없습니다!\n\n표를 만들려면:\n1. | 기호로 열을 구분해서 작성하세요\n2. 예시: | 이름 | 나이 | 직업 |\n\n자세한 사용법은 상단의 "설명서"를 확인해주세요.');
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