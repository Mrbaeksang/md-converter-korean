// Markdown Converter with Korean Support
// 한글 깨짐 없는 변환 기능 구현

// marked.js 라이브러리 로드
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// 라이브러리 초기화
async function initLibraries() {
    try {
        // marked.js - Markdown parser
        await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
        
        // html2pdf.js - PDF 생성 (한글 폰트 포함)
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        
        // docx - Word 문서 생성
        await loadScript('https://unpkg.com/docx@7.1.1/build/index.js');
        
        // SheetJS - Excel 생성
        await loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
        
        console.log('모든 라이브러리 로드 완료');
    } catch (error) {
        console.error('라이브러리 로드 실패:', error);
    }
}

// Markdown을 HTML로 변환
function markdownToHtml(markdown) {
    if (typeof marked !== 'undefined') {
        // marked 옵션 설정
        marked.setOptions({
            breaks: true,
            gfm: true,
            tables: true,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        });
        
        return marked.parse(markdown);
    }
    
    // marked가 로드되지 않은 경우 기본 변환
    return basicMarkdownToHtml(markdown);
}

// 기본 Markdown 변환 (fallback)
function basicMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*)\*\*\*/gim, '<b><i>$1</i></b>');
    html = html.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
    html = html.replace(/\*(.*)\*/gim, '<i>$1</i>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Code blocks
    html = html.replace(/```([^`]*)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');
    
    // Line breaks
    html = html.replace(/\n/gim, '<br>');
    
    return html;
}

// HTML Export with UTF-8 BOM
function exportHtml(markdown, styled = false) {
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
    downloadFile(blob, 'document.html');
}

// PDF Export with Korean font support
async function exportPdf(markdown) {
    const html = markdownToHtml(markdown);
    
    if (typeof html2pdf === 'undefined') {
        alert('PDF 변환 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
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
            orientation: 'portrait'
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
function exportTxt(markdown) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + markdown], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, 'document.txt');
}

// Excel Export (테이블만)
function exportExcel(markdown) {
    if (typeof XLSX === 'undefined') {
        alert('Excel 변환 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
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
async function exportDocx(markdown) {
    alert('DOCX 변환 기능은 개발 중입니다.');
    // TODO: docx.js를 사용한 구현
}

// 파일 다운로드 헬퍼
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export 함수들을 전역으로 노출
window.exportAs = function(format) {
    const markdown = document.getElementById('editor').value;
    
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
};

// 페이지 로드 시 라이브러리 초기화
window.addEventListener('load', initLibraries);