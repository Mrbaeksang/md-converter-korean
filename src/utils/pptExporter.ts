import PptxGenJS from 'pptxgenjs';

interface SlideContent {
  title?: string;
  content: string[];
  type: 'title' | 'content' | 'list' | 'code' | 'table' | 'mixed';
  level?: number;
  tableData?: string[][];
}

// 마크다운 및 HTML 태그 제거 함수
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
  decodedText = decodedText.replace(/\n{3,}/g, '\n\n'); // 3개 이상의 줄바꿈을 2개로
  decodedText = decodedText.replace(/\s+/g, ' ').trim();
  
  return decodedText;
}

// 테이블인지 확인하는 함수
function isTableLine(line: string): boolean {
  return line.includes('|') && !line.match(/^\|?[\s\-:]+\|?$/);
}

// 테이블 구분선인지 확인
function isTableSeparator(line: string): boolean {
  return !!line.match(/^\|?[\s\-:]+\|?$/);
}

// 마크다운을 슬라이드로 파싱 - PDF와 유사한 논리적 구조
function parseMarkdownToSlides(markdown: string): SlideContent[] {
  const slides: SlideContent[] = [];
  const lines = markdown.split('\n');
  
  // 첫 번째 H1을 찾아서 타이틀 슬라이드로 만들기
  let titleSlideCreated = false;
  let currentSlideContent: string[] = [];
  let currentSlideTitle = '';
  let currentSlideType: 'content' | 'list' | 'table' | 'mixed' = 'content';
  let inTable = false;
  let tableRows: string[][] = [];
  let listItems: string[] = [];
  
  // 최대 콘텐츠 라인 수 (한 슬라이드에 들어갈 수 있는 최대 항목)
  const MAX_CONTENT_LINES = 8;
  const MAX_LIST_ITEMS = 7;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 빈 줄 처리
    if (!trimmedLine) {
      // 테이블이 끝났는지 확인
      if (inTable && tableRows.length > 0) {
        // 테이블 슬라이드 생성
        if (currentSlideTitle || tableRows.length > 0) {
          slides.push({
            type: 'table',
            title: currentSlideTitle || '표',
            content: [],
            tableData: tableRows
          });
        }
        tableRows = [];
        inTable = false;
        currentSlideTitle = '';
        currentSlideContent = [];
      }
      continue;
    }
    
    // # 타이틀 슬라이드 (첫 번째 H1만)
    if (trimmedLine.startsWith('# ') && !titleSlideCreated) {
      // 이전 슬라이드 저장
      if (currentSlideContent.length > 0 || listItems.length > 0) {
        slides.push({
          type: listItems.length > 0 ? 'list' : currentSlideType,
          title: currentSlideTitle,
          content: listItems.length > 0 ? listItems : currentSlideContent
        });
        currentSlideContent = [];
        listItems = [];
      }
      
      const title = stripMarkdownAndHtml(trimmedLine.substring(2));
      const subtitleLines: string[] = [];
      
      // 다음 H1 또는 H2까지 서브타이틀로 수집 (최대 3줄)
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
        content: subtitleLines
      });
      
      titleSlideCreated = true;
      currentSlideTitle = '';
      currentSlideContent = [];
      i = j - 1; // 처리한 라인까지 건너뛰기
    }
    
    // ## H2 - 새 섹션 (슬라이드 구분점)
    else if (trimmedLine.startsWith('## ')) {
      // 이전 슬라이드 저장
      if (currentSlideContent.length > 0 || listItems.length > 0 || tableRows.length > 0) {
        if (tableRows.length > 0) {
          slides.push({
            type: 'table',
            title: currentSlideTitle || '표',
            content: [],
            tableData: tableRows
          });
          tableRows = [];
          inTable = false;
        } else if (listItems.length > 0) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems
          });
          listItems = [];
        } else if (currentSlideContent.length > 0) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent
          });
        }
      }
      
      // 새 슬라이드 시작
      currentSlideTitle = stripMarkdownAndHtml(trimmedLine.substring(3));
      currentSlideContent = [];
      currentSlideType = 'content';
    }
    
    // # H1 (타이틀이 아닌 경우) - 섹션 제목으로 처리
    else if (trimmedLine.startsWith('# ') && titleSlideCreated) {
      // 이전 슬라이드 저장
      if (currentSlideContent.length > 0 || listItems.length > 0 || tableRows.length > 0) {
        if (tableRows.length > 0) {
          slides.push({
            type: 'table',
            title: currentSlideTitle || '표',
            content: [],
            tableData: tableRows
          });
          tableRows = [];
          inTable = false;
        } else if (listItems.length > 0) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems
          });
          listItems = [];
        } else if (currentSlideContent.length > 0) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent
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
        // 리스트가 있으면 먼저 저장
        if (listItems.length > 0) {
          currentSlideContent.push(...listItems);
          listItems = [];
        }
        currentSlideContent.push(''); // 간격 추가
        currentSlideContent.push('【' + subtitle + '】'); // 소제목 강조
      }
    }
    
    // 테이블 처리
    else if (isTableLine(trimmedLine)) {
      if (!inTable) {
        // 현재 콘텐츠가 있으면 먼저 슬라이드로 저장
        if (currentSlideContent.length > 0 || listItems.length > 0) {
          slides.push({
            type: listItems.length > 0 ? 'list' : currentSlideType,
            title: currentSlideTitle,
            content: listItems.length > 0 ? listItems : currentSlideContent
          });
          currentSlideContent = [];
          listItems = [];
          // 테이블은 현재 타이틀 유지
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
    else if (isTableSeparator(trimmedLine) && inTable) {
      // 구분선은 건너뛰기
      continue;
    }
    
    // 코드 블록
    else if (trimmedLine.startsWith('```')) {
      // 현재 콘텐츠 저장
      if (currentSlideContent.length > 0 || listItems.length > 0) {
        slides.push({
          type: listItems.length > 0 ? 'list' : currentSlideType,
          title: currentSlideTitle,
          content: listItems.length > 0 ? listItems : currentSlideContent
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
          content: codeLines
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
        
        // 리스트가 너무 길면 새 슬라이드로
        if (listItems.length >= MAX_LIST_ITEMS) {
          slides.push({
            type: 'list',
            title: currentSlideTitle,
            content: listItems
          });
          listItems = [];
          // 타이틀은 유지
        }
      }
    }
    
    // <style> 태그 시작 감지 - 전체 블록 건너뛰기
    else if (trimmedLine.toLowerCase().includes('<style')) {
      // <style> 블록 끝까지 건너뛰기
      while (i < lines.length && !lines[i].toLowerCase().includes('</style>')) {
        i++;
      }
      i++; // </style> 라인도 건너뛰기
    }
    
    // <script> 태그 시작 감지 - 전체 블록 건너뛰기
    else if (trimmedLine.toLowerCase().includes('<script')) {
      // <script> 블록 끝까지 건너뛰기
      while (i < lines.length && !lines[i].toLowerCase().includes('</script>')) {
        i++;
      }
      i++; // </script> 라인도 건너뛰기
    }
    
    // CSS 미디어 쿼리 감지 - 건너뛰기
    else if (trimmedLine.includes('@media') || trimmedLine.includes('@keyframes') || trimmedLine.includes('@font-face')) {
      // CSS 블록 끝까지 건너뛰기 (중첩된 중괄호 처리)
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
    
    // JavaScript 함수 호출 감지 (onclick 핸들러 등) - 건너뛰기
    else if (trimmedLine.match(/^(alert|console|window|document)\s*\(/) || 
             trimmedLine.match(/^on\w+\s*=/) ||
             trimmedLine.includes('addEventListener')) {
      // JavaScript 코드 라인 건너뛰기
      continue;
    }
    
    // HTML button with onclick - 완전히 건너뛰기
    else if (trimmedLine.includes('<button') && trimmedLine.includes('onclick')) {
      // onclick이 있는 버튼은 여러 줄에 걸칠 수 있음
      if (!trimmedLine.includes('</button>')) {
        // 버튼 끝까지 건너뛰기
        while (i < lines.length && !lines[i].includes('</button>')) {
          i++;
        }
      }
      continue; // 버튼 전체 건너뛰기
    }
    
    // HTML div, a 등의 블록 요소 감지 - 내용 추출 시도
    else if (trimmedLine.match(/<(div|a)\s[^>]*>/i) && !trimmedLine.includes('style=')) {
      // style 속성이 없는 간단한 HTML만 처리
      const extractedText = stripMarkdownAndHtml(trimmedLine);
      if (extractedText && extractedText.length > 0 && !extractedText.match(/^\s*$/)) {
        // 의미 있는 텍스트가 있을 때만 추가
        if (listItems.length > 0) {
          currentSlideContent.push(...listItems);
          listItems = [];
        }
        currentSlideContent.push(extractedText);
        
        // 내용 체크
        if (currentSlideContent.length >= MAX_CONTENT_LINES) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent
          });
          currentSlideContent = [];
          if (currentSlideTitle) {
            currentSlideTitle = currentSlideTitle + ' (계속)';
          }
        }
      }
    }
    
    // 복잡한 HTML 태그 (style 속성 포함) - 건너뛰기
    else if (trimmedLine.includes('style="') || trimmedLine.includes("style='")) {
      continue;
    }
    
    // catch 등 JavaScript 구문이 포함된 라인 건너뛰기
    else if (trimmedLine.includes('.catch(') || trimmedLine.includes('.then(') || 
             trimmedLine.includes('=>') || trimmedLine.includes('rgba(') ||
             trimmedLine.includes('gradient(')) {
      continue;
    }
    
    // 일반 텍스트
    else if (trimmedLine && !trimmedLine.match(/^---+$/)) {
      // 리스트가 있었으면 먼저 저장
      if (listItems.length > 0) {
        currentSlideContent.push(...listItems);
        listItems = [];
      }
      
      const text = stripMarkdownAndHtml(trimmedLine);
      if (text) {
        currentSlideContent.push(text);
        
        // 내용이 너무 많으면 새 슬라이드로
        if (currentSlideContent.length >= MAX_CONTENT_LINES) {
          slides.push({
            type: currentSlideType,
            title: currentSlideTitle,
            content: currentSlideContent
          });
          currentSlideContent = [];
          // 타이틀은 유지 (계속)
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
        content: [],
        tableData: tableRows
      });
    } else if (listItems.length > 0) {
      slides.push({
        type: 'list',
        title: currentSlideTitle,
        content: listItems
      });
    } else if (currentSlideContent.length > 0) {
      slides.push({
        type: currentSlideType,
        title: currentSlideTitle,
        content: currentSlideContent
      });
    }
  }
  
  // 슬라이드가 없으면 기본 슬라이드 생성
  if (slides.length === 0) {
    slides.push({
      type: 'content',
      title: '내용',
      content: ['슬라이드 내용이 없습니다.']
    });
  }
  
  return slides;
}

// PPT 생성 및 내보내기
export async function markdownToPpt(markdown: string): Promise<void> {
  console.log('Starting PPT export...');
  
  const pres = new PptxGenJS();
  
  // 프레젠테이션 설정
  pres.author = 'MD 변환기 by Mrbaeksang';
  pres.company = 'devcom.kr';
  pres.title = 'Markdown Presentation';
  
  // 레이아웃 정의 - 표준 16:9 비율
  pres.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pres.layout = 'LAYOUT_16x9';
  
  // 슬라이드 파싱
  const slides = parseMarkdownToSlides(markdown);
  console.log(`Parsed ${slides.length} slides`);
  
  // 각 슬라이드 생성
  slides.forEach((slideContent, index) => {
    const slide = pres.addSlide();
    
    // 배경색 설정
    slide.background = { color: 'FFFFFF' };
    
    if (slideContent.type === 'title') {
      // 타이틀 슬라이드
      slide.addText(slideContent.title || '', {
        x: 0.5,
        y: 1.8,
        w: 9,
        h: 1,
        fontSize: 40,
        fontFace: '맑은 고딕',
        color: '333333',
        align: 'center',
        bold: true,
        valign: 'middle'
      });
      
      if (slideContent.content.length > 0) {
        const subtitle = slideContent.content.join('\n');
        slide.addText(subtitle, {
          x: 1,
          y: 3,
          w: 8,
          h: 1.5,
          fontSize: 18,
          fontFace: '맑은 고딕',
          color: '666666',
          align: 'center',
          valign: 'top',
          wrap: true
        });
      }
    }
    
    else if (slideContent.type === 'table' && slideContent.tableData) {
      // 테이블 슬라이드
      if (slideContent.title) {
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.7,
          fontSize: 28,
          fontFace: '맑은 고딕',
          color: '333333',
          bold: true,
          valign: 'middle'
        });
      }
      
      // 테이블 데이터 변환 (PptxGenJS 형식)
      const tableData: Array<Array<{text: string, options: object}>> = slideContent.tableData.map((row, rowIndex) => 
        row.map(cell => ({
          text: cell,
          options: {
            fontSize: rowIndex === 0 ? 13 : 11, // 첫 행(헤더)는 더 크게
            fontFace: '맑은 고딕',
            color: rowIndex === 0 ? '333333' : '444444',
            bold: rowIndex === 0, // 첫 행은 볼드
            align: 'center',
            valign: 'middle'
          }
        }))
      );
      
      // 테이블 추가
      slide.addTable(tableData, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4,
        border: { type: 'solid', color: 'CCCCCC', pt: 1 },
        fill: { color: 'F9F9F9' },
        fontFace: '맑은 고딕',
        fontSize: 11,
        color: '444444',
        align: 'center',
        valign: 'middle',
        autoPage: false // 테이블이 너무 크면 자르기
      });
    }
    
    else if (slideContent.type === 'list') {
      // 리스트 슬라이드 - 오버플로우 처리
      if (slideContent.title) {
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.7,
          fontSize: 28,
          fontFace: '맑은 고딕',
          color: '333333',
          bold: true,
          valign: 'middle'
        });
      }
      
      const yStart = slideContent.title ? 1.3 : 0.5;
      const availableHeight = 5.625 - yStart - 0.3;
      const fontSize = 16;
      const lineSpacing = 32;
      
      // 한 슬라이드에 들어갈 수 있는 리스트 아이템 수 계산
      const maxItemsPerSlide = Math.floor((availableHeight * 72) / lineSpacing);
      
      const items = slideContent.content;
      
      // 각 아이템의 추정 줄 수 계산
      const estimatedLines = items.reduce((total, item) => {
        // 한글 기준 한 줄에 약 35-40자
        const wrappedLines = Math.ceil(item.length / 35);
        return total + wrappedLines;
      }, 0);
      
      // 오버플로우가 발생하면 여러 슬라이드로 분할
      if (estimatedLines > maxItemsPerSlide || items.length > maxItemsPerSlide) {
        let currentItems: string[] = [];
        let currentLineCount = 0;
        let slideIndex = 0;
        const allSlides: Array<{ title: string; items: string[] }> = [];
        
        for (const item of items) {
          const wrappedLines = Math.ceil(item.length / 35);
          
          // 현재 아이템을 추가했을 때 초과하는지 확인
          if ((currentLineCount + wrappedLines > maxItemsPerSlide || currentItems.length >= maxItemsPerSlide) && currentItems.length > 0) {
            // 현재까지의 내용으로 슬라이드 생성
            if (slideIndex === 0) {
              // 첫 번째 슬라이드는 이미 생성됨
              const bullets = currentItems.map(item => ({
                text: item,
                options: { bullet: true, indentLevel: 0 }
              }));
              
              slide.addText(bullets, {
                x: 0.8,
                y: yStart,
                w: 8.4,
                h: availableHeight,
                fontSize: fontSize,
                fontFace: '맑은 고딕',
                color: '444444',
                bullet: { type: 'bullet' },
                lineSpacing: lineSpacing,
                valign: 'top'
              });
            } else {
              // 추가 슬라이드 생성을 위해 저장
              allSlides.push({
                title: `${slideContent.title} (계속 ${slideIndex + 1})`,
                items: [...currentItems]
              });
            }
            
            currentItems = [];
            currentLineCount = 0;
            slideIndex++;
          }
          
          currentItems.push(item);
          currentLineCount += wrappedLines;
        }
        
        // 남은 아이템 처리
        if (currentItems.length > 0) {
          if (slideIndex === 0) {
            // 첫 번째 슬라이드에 모든 내용이 들어감
            const bullets = currentItems.map(item => ({
              text: item,
              options: { bullet: true, indentLevel: 0 }
            }));
            
            slide.addText(bullets, {
              x: 0.8,
              y: yStart,
              w: 8.4,
              h: availableHeight,
              fontSize: fontSize,
              fontFace: '맑은 고딕',
              color: '444444',
              bullet: { type: 'bullet' },
              lineSpacing: lineSpacing,
              valign: 'top'
            });
          } else {
            // 추가 슬라이드 필요
            allSlides.push({
              title: `${slideContent.title} (계속 ${slideIndex + 1})`,
              items: [...currentItems]
            });
          }
        }
        
        // 추가 슬라이드 생성
        for (const additionalSlide of allSlides) {
          const newSlide = pres.addSlide();
          newSlide.background = { color: 'FFFFFF' };
          
          // 제목 추가
          newSlide.addText(additionalSlide.title, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.7,
            fontSize: 28,
            fontFace: '맑은 고딕',
            color: '333333',
            bold: true,
            valign: 'middle'
          });
          
          // 리스트 아이템 추가
          const bullets = additionalSlide.items.map((item: string) => ({
            text: item,
            options: { bullet: true, indentLevel: 0 }
          }));
          
          newSlide.addText(bullets, {
            x: 0.8,
            y: 1.3,
            w: 8.4,
            h: 3.8,
            fontSize: fontSize,
            fontFace: '맑은 고딕',
            color: '444444',
            bullet: { type: 'bullet' },
            lineSpacing: lineSpacing,
            valign: 'top'
          });
        }
      } else {
        // 오버플로우 없음 - 기존처럼 처리
        const bullets = slideContent.content.map(item => ({
          text: item,
          options: { bullet: true, indentLevel: 0 }
        }));
        
        slide.addText(bullets, {
          x: 0.8,
          y: yStart,
          w: 8.4,
          h: availableHeight,
          fontSize: fontSize,
          fontFace: '맑은 고딕',
          color: '444444',
          bullet: { type: 'bullet' },
          lineSpacing: lineSpacing,
          valign: 'top'
        });
      }
    }
    
    else if (slideContent.type === 'code') {
      // 코드 슬라이드
      slide.addText(slideContent.title || '코드', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 24,
        fontFace: '맑은 고딕',
        color: '333333',
        bold: true,
        valign: 'middle'
      });
      
      const codeContent = slideContent.content.join('\n');
      slide.addText(codeContent, {
        x: 0.5,
        y: 1.1,
        w: 9,
        h: 4.2,
        fontSize: 11,
        fontFace: 'Consolas, Courier New',
        color: '333333',
        fill: { color: 'F5F5F5' },
        line: { color: 'DDDDDD', width: 1 },
        margin: 10,
        valign: 'top',
        wrap: false
      });
    }
    
    else {
      // 일반 콘텐츠 슬라이드 - 텍스트 오버플로우 처리
      if (slideContent.title) {
        slide.addText(slideContent.title, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.7,
          fontSize: 28,
          fontFace: '맑은 고딕',
          color: '333333',
          bold: true,
          valign: 'middle'
        });
      }
      
      const yStart = slideContent.title ? 1.2 : 0.5;
      const availableHeight = 5.625 - yStart - 0.3;
      const fontSize = 16;
      const lineSpacing = 24;
      
      // 한 슬라이드에 들어갈 수 있는 대략적인 줄 수 계산
      // 한글 16pt 폰트 + 24pt 간격으로 계산
      const maxLinesPerSlide = Math.floor((availableHeight * 72) / lineSpacing); // 인치를 포인트로 변환
      
      // 콘텐츠를 줄 단위로 분할
      const lines = slideContent.content;
      
      // 텍스트가 슬라이드 높이를 초과하는지 확인
      const estimatedLines = lines.reduce((total, line) => {
        // 긴 줄은 자동 줄바꿈을 고려 (한글 기준 한 줄에 약 35-40자)
        const wrappedLines = Math.ceil(line.length / 35);
        return total + wrappedLines + 1; // 단락 간 빈 줄 추가
      }, 0);
      
      // 오버플로우가 발생하면 여러 슬라이드로 분할
      if (estimatedLines > maxLinesPerSlide) {
        let currentLines: string[] = [];
        let currentLineCount = 0;
        let slideIndex = 0;
        const allSlides: Array<{ title: string; content: string[] }> = [];
        
        for (const line of lines) {
          const wrappedLines = Math.ceil(line.length / 35);
          
          // 현재 줄을 추가했을 때 초과하는지 확인
          if (currentLineCount + wrappedLines + 1 > maxLinesPerSlide && currentLines.length > 0) {
            // 현재까지의 내용으로 슬라이드 생성
            if (slideIndex === 0) {
              // 첫 번째 슬라이드는 이미 생성됨
              const content = currentLines.join('\n\n');
              slide.addText(content, {
                x: 0.5,
                y: yStart,
                w: 9,
                h: availableHeight,
                fontSize: fontSize,
                fontFace: '맑은 고딕',
                color: '444444',
                lineSpacing: lineSpacing,
                valign: 'top',
                wrap: true
              });
            } else {
              // 추가 슬라이드 생성을 위해 저장
              allSlides.push({
                title: `${slideContent.title} (계속 ${slideIndex + 1})`,
                content: [...currentLines]
              });
            }
            
            currentLines = [];
            currentLineCount = 0;
            slideIndex++;
          }
          
          currentLines.push(line);
          currentLineCount += wrappedLines + 1;
        }
        
        // 남은 콘텐츠 처리
        if (currentLines.length > 0) {
          if (slideIndex === 0) {
            // 첫 번째 슬라이드에 모든 내용이 들어감
            const content = currentLines.join('\n\n');
            slide.addText(content, {
              x: 0.5,
              y: yStart,
              w: 9,
              h: availableHeight,
              fontSize: fontSize,
              fontFace: '맑은 고딕',
              color: '444444',
              lineSpacing: lineSpacing,
              valign: 'top',
              wrap: true
            });
          } else {
            // 추가 슬라이드 필요
            allSlides.push({
              title: `${slideContent.title} (계속 ${slideIndex + 1})`,
              content: [...currentLines]
            });
          }
        }
        
        // 추가 슬라이드 생성
        for (const additionalSlide of allSlides) {
          const newSlide = pres.addSlide();
          newSlide.background = { color: 'FFFFFF' };
          
          // 제목 추가
          newSlide.addText(additionalSlide.title, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.7,
            fontSize: 28,
            fontFace: '맑은 고딕',
            color: '333333',
            bold: true,
            valign: 'middle'
          });
          
          // 내용 추가
          const content = additionalSlide.content.join('\n\n');
          newSlide.addText(content, {
            x: 0.5,
            y: 1.2,
            w: 9,
            h: 4.125,
            fontSize: fontSize,
            fontFace: '맑은 고딕',
            color: '444444',
            lineSpacing: lineSpacing,
            valign: 'top',
            wrap: true
          });
        }
      } else {
        // 오버플로우 없음 - 기존처럼 처리
        const content = slideContent.content.join('\n\n');
        
        if (content) {
          slide.addText(content, {
            x: 0.5,
            y: yStart,
            w: 9,
            h: availableHeight,
            fontSize: fontSize,
            fontFace: '맑은 고딕',
            color: '444444',
            lineSpacing: lineSpacing,
            valign: 'top',
            wrap: true
          });
        }
      }
    }
    
    // 슬라이드 번호 추가 (타이틀 슬라이드 제외)
    if (slideContent.type !== 'title') {
      slide.addText(`${index + 1}`, {
        x: 9.2,
        y: 5.2,
        w: 0.5,
        h: 0.3,
        fontSize: 10,
        fontFace: '맑은 고딕',
        color: '999999',
        align: 'center',
        valign: 'middle'
      });
    }
  });
  
  // 파일 저장
  console.log('Saving PPT file...');
  await pres.writeFile({ fileName: 'presentation.pptx' });
  console.log('PPT export completed');
}