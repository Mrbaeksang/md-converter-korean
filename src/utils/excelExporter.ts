// Excel Export Module
// 표만 추출해서 엑셀로 변환

import * as XLSX from 'xlsx';

export function exportToExcel(markdown: string): void {
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