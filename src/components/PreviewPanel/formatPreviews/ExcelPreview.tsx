import React from 'react';

interface ExcelPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  markdown,
  isEditMode
  // TODO: onContentChange 편집 기능 구현 예정
}) => {
  // 마크다운에서 테이블만 추출
  const extractTables = (md: string) => {
    const lines = md.split('\n');
    const tables: string[] = [];
    let currentTable: string[] = [];
    let inTable = false;

    for (const line of lines) {
      if (line.includes('|')) {
        inTable = true;
        currentTable.push(line);
      } else if (inTable && line.trim() === '') {
        if (currentTable.length > 0) {
          tables.push(currentTable.join('\n'));
          currentTable = [];
        }
        inTable = false;
      }
    }
    
    if (currentTable.length > 0) {
      tables.push(currentTable.join('\n'));
    }

    return tables;
  };

  const tables = extractTables(markdown);

  if (tables.length === 0) {
    return (
      <div className="preview-content excel-preview">
        <div className="no-tables-message">
          <p>📊 표가 없습니다</p>
          <p className="hint">마크다운에서 표를 작성하면 여기에 나타납니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-content excel-preview">
      {/* 미리보기 안내 메시지 */}
      <div className="preview-notice excel-notice">
        <span className="notice-icon">ℹ️</span>
        <span className="notice-text">
          Excel은 마크다운의 표(table)만 추출하여 각 시트로 변환합니다. 다른 내용은 포함되지 않습니다.
        </span>
      </div>
      
      <div className="excel-sheets">
        {tables.map((table, index) => (
          <div key={index} className="excel-sheet">
            <div className="sheet-tab">Sheet {index + 1}</div>
            <div 
              className="sheet-content"
              contentEditable={isEditMode}
              dangerouslySetInnerHTML={{ __html: parseTableToHtml(table) }}
              suppressContentEditableWarning={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// 마크다운 테이블을 HTML로 변환
function parseTableToHtml(tableMarkdown: string): string {
  const lines = tableMarkdown.split('\n').filter(line => line.trim());
  if (lines.length < 2) return '';

  let html = '<table class="excel-table">';
  
  lines.forEach((line, index) => {
    // 구분선 건너뛰기
    if (line.match(/^\|?[\s-|:]+\|?$/)) return;
    
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '');
    
    if (cells.length > 0) {
      html += '<tr>';
      const tag = index === 0 ? 'th' : 'td';
      cells.forEach(cell => {
        html += `<${tag}>${cell}</${tag}>`;
      });
      html += '</tr>';
    }
  });
  
  html += '</table>';
  return html;
}