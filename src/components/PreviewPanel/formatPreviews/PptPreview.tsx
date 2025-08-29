import React, { useState } from 'react';

interface PptPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

interface Slide {
  title: string;
  content: string;
  type: 'title' | 'content' | 'list' | 'table' | 'code';
  rawContent?: string[];
  tableData?: string[][];
}

// 마크다운 및 HTML 태그 제거 함수 (pptExporter와 동일)
function stripMarkdownAndHtml(text: string): string {
  if (!text) return '';
  
  // onclick 핸들러가 포함된 전체 버튼 태그 제거
  text = text.replace(/<button[^>]*onclick[^>]*>[\s\S]*?<\/button>/gi, '');
  
  // CSS 미디어 쿼리 및 CSS 규칙 제거
  text = text.replace(/@media[^{]*{[^}]*}/gi, '');
  text = text.replace(/@keyframes[^{]*{[^}]*}/gi, '');
  text = text.replace(/@font-face[^{]*{[^}]*}/gi, '');
  
  // <style> 태그와 내용 제거
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // <script> 태그와 내용 제거
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // JavaScript 함수 호출 제거
  text = text.replace(/\b(alert|console\.log|window\.\w+|document\.\w+)\s*\([^)]*\)/gi, '');
  
  // onclick 등의 인라인 이벤트 핸들러 제거
  text = text.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  text = text.replace(/\s*on\w+\s*=\s*{[^}]*}/gi, '');
  
  // <button>, <a> 태그의 내용만 추출
  text = text.replace(/<button[^>]*>([^<]*)<\/button>/gi, '$1');
  text = text.replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1');
  
  // <div>, <span> 태그 제거 (내용은 유지)
  text = text.replace(/<\/?div[^>]*>/gi, '');
  text = text.replace(/<\/?span[^>]*>/gi, '');
  
  // HTML 엔티티 디코딩
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  let decodedText = textArea.value;
  
  // 마크다운 링크를 텍스트로 변환 [text](url) -> text
  decodedText = decodedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // 마크다운 이미지 제거 ![alt](url) -> alt
  decodedText = decodedText.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // 마크다운 제목 마커 제거 (###, ##, # 등)
  decodedText = decodedText.replace(/^#{1,6}\s+/gm, '');
  
  // 마크다운 강조 제거
  decodedText = decodedText.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold**
  decodedText = decodedText.replace(/\*([^*]+)\*/g, '$1'); // *italic*
  decodedText = decodedText.replace(/__([^_]+)__/g, '$1'); // __bold__
  decodedText = decodedText.replace(/_([^_]+)_/g, '$1'); // _italic_
  decodedText = decodedText.replace(/~~([^~]+)~~/g, '$1'); // ~~strikethrough~~
  
  // 인라인 코드 제거
  decodedText = decodedText.replace(/`([^`]+)`/g, '$1');
  
  // 블록쿼트 마커 제거
  decodedText = decodedText.replace(/^>\s*/gm, '');
  
  // 남은 HTML 태그 모두 제거
  decodedText = decodedText.replace(/<[^>]*>/g, '');
  
  // 특수 HTML 엔티티 변환
  decodedText = decodedText
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // 연속된 공백과 줄바꿈 정리
  decodedText = decodedText.replace(/\n{3,}/g, '\n\n');
  decodedText = decodedText.replace(/\s+/g, ' ').trim();
  
  return decodedText;
}

// 테이블인지 확인하는 함수
function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && 
         !trimmed.match(/^\|?[\s\-:|]+\|?$/) && // 구분선이 아님
         trimmed.replace(/[|\-:\s]/g, '').length > 0; // 실제 내용이 있음
}

// 테이블 구분선인지 확인
function isTableSeparator(line: string): boolean {
  return !!line.match(/^\|?[\s\-:]+\|?$/);
}

// 마크다운을 슬라이드로 파싱 (pptExporter와 동일한 로직)
function parseMarkdownToSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  const lines = markdown.split('\n');
  
  // 첫 번째 H1을 찾아서 타이틀 슬라이드로 만들기
  let titleSlideCreated = false;
  let currentSlideContent: string[] = [];
  let currentSlideTitle = '';
  let currentSlideType: 'content' | 'list' | 'table' | 'code' = 'content';
  let inTable = false;
  let tableRows: string[][] = [];
  let listItems: string[] = [];
  
  // 최대 콘텐츠 라인 수
  const MAX_CONTENT_LINES = 8;
  const MAX_LIST_ITEMS = 7;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 빈 줄 처리
    if (!trimmedLine) {
      if (inTable && tableRows.length > 0) {
        slides.push({
          type: 'table',
          title: currentSlideTitle || '표',
          content: '',
          tableData: tableRows
        });
        tableRows = [];
        inTable = false;
        currentSlideTitle = '';
        currentSlideContent = [];
      }
      continue;
    }
    
    // # 타이틀 슬라이드 (첫 번째 H1만)
    if (trimmedLine.startsWith('# ') && !titleSlideCreated) {
      if (currentSlideContent.length > 0 || listItems.length > 0) {
        slides.push({
          type: listItems.length > 0 ? 'list' : currentSlideType,
          title: currentSlideTitle,
          content: listItems.length > 0 ? listItems.join('\n') : currentSlideContent.join('\n'),
          rawContent: listItems.length > 0 ? listItems : currentSlideContent
        });
        currentSlideContent = [];
        listItems = [];
      }
      
      const title = stripMarkdownAndHtml(trimmedLine.substring(2));
      const subtitleLines: string[] = [];
      
      let j = i + 1;
      while (j < lines.length && subtitleLines.length < 3) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/^#{1,2}\s/)) break;
        if (nextLine && !isTableLine(nextLine) && !nextLine.match(/^---+$/)) {
          subtitleLines.push(stripMarkdownAndHtml(nextLine));
        }
        j++;
      }
      
      slides.push({
        type: 'title',
        title: title,
        content: subtitleLines.join('\n'),
        rawContent: subtitleLines
      });
      
      titleSlideCreated = true;
      currentSlideTitle = '';
      currentSlideContent = [];
      i = j - 1;
    }
    
    // ## H2 - 새 섹션 (슬라이드 구분점)
    else if (trimmedLine.startsWith('## ')) {
      if (currentSlideContent.length > 0 || listItems.length > 0 || tableRows.length > 0) {
        if (tableRows.length > 0) {
          slides.push({
            type: 'table',
            title: currentSlideTitle || '표',
            content: '',
            tableData: tableRows
          });
          tableRows = [];
          inTable = false;
        } else if (listItems.length > 0) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems.join('\n'),
            rawContent: listItems
          });
          listItems = [];
        } else if (currentSlideContent.length > 0) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent.join('\n'),
            rawContent: currentSlideContent
          });
        }
      }
      
      currentSlideTitle = stripMarkdownAndHtml(trimmedLine.substring(3));
      currentSlideContent = [];
      currentSlideType = 'content';
    }
    
    // # H1 (타이틀이 아닌 경우) - 섹션 제목으로 처리
    else if (trimmedLine.startsWith('# ') && titleSlideCreated) {
      if (currentSlideContent.length > 0 || listItems.length > 0 || tableRows.length > 0) {
        if (tableRows.length > 0) {
          slides.push({
            type: 'table',
            title: currentSlideTitle || '표',
            content: '',
            tableData: tableRows
          });
          tableRows = [];
          inTable = false;
        } else if (listItems.length > 0) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems.join('\n'),
            rawContent: listItems
          });
          listItems = [];
        } else if (currentSlideContent.length > 0) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent.join('\n'),
            rawContent: currentSlideContent
          });
        }
      }
      
      currentSlideTitle = stripMarkdownAndHtml(trimmedLine.substring(2));
      currentSlideContent = [];
      currentSlideType = 'content';
    }
    
    // ### H3 이하 - 소제목으로 내용에 포함
    else if (trimmedLine.match(/^#{3,6}\s/)) {
      const subtitle = stripMarkdownAndHtml(trimmedLine);
      if (subtitle) {
        if (listItems.length > 0) {
          currentSlideContent.push(...listItems);
          listItems = [];
        }
        currentSlideContent.push('');
        currentSlideContent.push('【' + subtitle + '】');
      }
    }
    
    // 테이블 처리
    else if (isTableLine(trimmedLine)) {
      if (!inTable) {
        if (currentSlideContent.length > 0 || listItems.length > 0) {
          slides.push({
            type: listItems.length > 0 ? 'list' : currentSlideType,
            title: currentSlideTitle,
            content: listItems.length > 0 ? listItems.join('\n') : currentSlideContent.join('\n'),
            rawContent: listItems.length > 0 ? listItems : currentSlideContent
          });
          currentSlideContent = [];
          listItems = [];
        }
        inTable = true;
      }
      
      const cells = trimmedLine
        .split('|')
        .map(cell => stripMarkdownAndHtml(cell.trim()))
        .filter(cell => cell !== '');
      
      if (cells.length > 0) {
        tableRows.push(cells);
      }
    }
    
    // 테이블 구분선
    else if (isTableSeparator(trimmedLine)) {
      if (inTable) {
        continue;
      }
    }
    
    // 코드 블록
    else if (trimmedLine.startsWith('```')) {
      if (currentSlideContent.length > 0 || listItems.length > 0) {
        slides.push({
          type: listItems.length > 0 ? 'list' : currentSlideType,
          title: currentSlideTitle,
          content: listItems.length > 0 ? listItems.join('\n') : currentSlideContent.join('\n'),
          rawContent: listItems.length > 0 ? listItems : currentSlideContent
        });
        currentSlideContent = [];
        listItems = [];
      }
      
      const lang = trimmedLine.substring(3).trim();
      const codeLines: string[] = [];
      i++;
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      if (codeLines.length > 0) {
        slides.push({
          type: 'code',
          title: currentSlideTitle || lang || '코드',
          content: codeLines.join('\n'),
          rawContent: codeLines
        });
        currentSlideTitle = '';
      }
    }
    
    // 목록 항목
    else if (trimmedLine.match(/^[-*+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
      const item = stripMarkdownAndHtml(
        trimmedLine.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '')
      );
      
      if (item) {
        listItems.push(item);
        
        if (listItems.length >= MAX_LIST_ITEMS) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems.join('\n'),
            rawContent: listItems
          });
          listItems = [];
        }
      }
    }
    
    // HTML 태그 필터링 (pptExporter와 동일)
    else if (trimmedLine.toLowerCase().includes('<style')) {
      while (i < lines.length && !lines[i].toLowerCase().includes('</style>')) {
        i++;
      }
      i++;
    }
    else if (trimmedLine.toLowerCase().includes('<script')) {
      while (i < lines.length && !lines[i].toLowerCase().includes('</script>')) {
        i++;
      }
      i++;
    }
    else if (trimmedLine.includes('@media') || trimmedLine.includes('@keyframes') || trimmedLine.includes('@font-face')) {
      let braceCount = 0;
      let currentLine = trimmedLine;
      do {
        braceCount += (currentLine.match(/{/g) || []).length;
        braceCount -= (currentLine.match(/}/g) || []).length;
        if (braceCount > 0 && i < lines.length - 1) {
          i++;
          currentLine = lines[i].trim();
        }
      } while (braceCount > 0 && i < lines.length - 1);
    }
    else if (trimmedLine.match(/^(alert|console|window|document)\s*\(/) || 
             trimmedLine.match(/^on\w+\s*=/) ||
             trimmedLine.includes('addEventListener')) {
      continue;
    }
    else if (trimmedLine.includes('<button') && trimmedLine.includes('onclick')) {
      if (!trimmedLine.includes('</button>')) {
        while (i < lines.length && !lines[i].includes('</button>')) {
          i++;
        }
      }
      continue;
    }
    else if (trimmedLine.includes('style="') || trimmedLine.includes("style='")) {
      continue;
    }
    else if (trimmedLine.includes('.catch(') || trimmedLine.includes('.then(') || 
             trimmedLine.includes('=>') || trimmedLine.includes('rgba(') ||
             trimmedLine.includes('gradient(')) {
      continue;
    }
    
    // 일반 텍스트
    else if (trimmedLine && !trimmedLine.match(/^---+$/)) {
      if (listItems.length > 0) {
        currentSlideContent.push(...listItems);
        listItems = [];
      }
      
      const text = stripMarkdownAndHtml(trimmedLine);
      if (text) {
        currentSlideContent.push(text);
        
        if (currentSlideContent.length >= MAX_CONTENT_LINES) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent.join('\n'),
            rawContent: currentSlideContent
          });
          currentSlideContent = [];
          if (currentSlideTitle) {
            currentSlideTitle = currentSlideTitle + ' (계속)';
          }
        }
      }
    }
  }
  
  // 마지막 슬라이드 저장
  if (currentSlideContent.length > 0 || listItems.length > 0 || tableRows.length > 0) {
    if (tableRows.length > 0) {
      slides.push({
        type: 'table',
        title: currentSlideTitle || '표',
        content: '',
        tableData: tableRows
      });
    } else if (listItems.length > 0) {
      slides.push({
        type: 'list',
        title: currentSlideTitle,
        content: listItems.join('\n'),
        rawContent: listItems
      });
    } else if (currentSlideContent.length > 0) {
      slides.push({
        type: currentSlideType,
        title: currentSlideTitle,
        content: currentSlideContent.join('\n'),
        rawContent: currentSlideContent
      });
    }
  }
  
  // 슬라이드가 없으면 기본 슬라이드 생성
  if (slides.length === 0) {
    slides.push({
      type: 'content',
      title: '내용',
      content: '슬라이드 내용이 없습니다.'
    });
  }
  
  return slides;
}

export const PptPreview: React.FC<PptPreviewProps> = ({
  markdown
  // isEditMode is not used in current implementation
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = parseMarkdownToSlides(markdown);

  const renderSlideContent = (slide: Slide) => {
    if (slide.type === 'title') {
      return (
        <>
          <h1 className="slide-title slide-title-page">
            {slide.title}
          </h1>
          {slide.content && (
            <div className="slide-subtitle">
              {slide.content}
            </div>
          )}
        </>
      );
    }
    
    if (slide.type === 'table' && slide.tableData) {
      return (
        <>
          <h2 className="slide-title">{slide.title}</h2>
          <div className="slide-table-container">
            <table className="slide-table">
              <thead>
                <tr>
                  {slide.tableData[0]?.map((cell, i) => (
                    <th key={i}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.tableData.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    
    if (slide.type === 'code') {
      return (
        <>
          <h2 className="slide-title">{slide.title}</h2>
          <div className="slide-code">
            <pre>{slide.content}</pre>
          </div>
        </>
      );
    }
    
    if (slide.type === 'list' && slide.rawContent) {
      return (
        <>
          <h2 className="slide-title">{slide.title}</h2>
          <ul className="slide-list">
            {slide.rawContent.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      );
    }
    
    // 일반 콘텐츠
    return (
      <>
        {slide.title && <h2 className="slide-title">{slide.title}</h2>}
        <div className="slide-content">
          {slide.rawContent ? (
            slide.rawContent.map((line, i) => {
              if (line.startsWith('【') && line.endsWith('】')) {
                return <h3 key={i} className="slide-subtitle">{line.slice(1, -1)}</h3>;
              }
              return <p key={i}>{line}</p>;
            })
          ) : (
            <p>{slide.content}</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="preview-content ppt-preview">
      {/* 미리보기 안내 메시지 */}
      <div className="preview-notice ppt-notice">
        <span className="notice-icon">ℹ️</span>
        <span className="notice-text">
          미리보기는 실제 PPT 파일과 차이가 있을 수 있습니다 (폰트, 레이아웃, 애니메이션 등)
        </span>
      </div>
      
      <div className="ppt-container">
        <div className="slide-controls">
          <button 
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            ◀
          </button>
          <span className="slide-counter">
            {currentSlide + 1} / {slides.length}
          </span>
          <button 
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            ▶
          </button>
        </div>

        <div className="slide-viewport">
          <div className={`ppt-slide ${slides[currentSlide]?.type}`}>
            {renderSlideContent(slides[currentSlide])}
          </div>
        </div>

        <div className="slide-thumbnails">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`slide-thumb ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="thumb-number">{index + 1}</div>
              <div className="thumb-title">{slide.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};