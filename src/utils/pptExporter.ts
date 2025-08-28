import PptxGenJS from 'pptxgenjs';

interface SlideContent {
  title?: string;
  content: string[];
  type: 'title' | 'content' | 'list' | 'code' | 'table';
  level?: number;
}

// HTML 태그 제거 함수
function stripHtmlTags(text: string): string {
  // HTML 엔티티 디코딩
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  let decodedText = textArea.value;
  
  // HTML 태그 제거
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
  
  return decodedText;
}

// 마크다운을 슬라이드로 파싱
function parseMarkdownToSlides(markdown: string): SlideContent[] {
  const slides: SlideContent[] = [];
  
  // 수평선(---)으로 슬라이드 구분
  const slideTexts = markdown.split(/^---+$/m);
  
  slideTexts.forEach((slideText, index) => {
    const lines = slideText.trim().split('\n');
    if (lines.length === 0 || !lines[0]) return;
    
    // 첫 번째 슬라이드이고 # 으로 시작하면 타이틀 슬라이드
    if (index === 0 && lines[0].startsWith('# ')) {
      const title = stripHtmlTags(lines[0].replace(/^#\s+/, ''));
      const subtitle = lines.slice(1).join('\n').trim();
      
      slides.push({
        type: 'title',
        title: title,
        content: subtitle ? [subtitle] : []
      });
    } 
    // ## 으로 시작하면 섹션 슬라이드
    else if (lines[0].startsWith('## ')) {
      const title = stripHtmlTags(lines[0].replace(/^##\s+/, ''));
      const content: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 목록 항목 처리
        if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
          content.push(stripHtmlTags(line.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '')));
        } 
        // 일반 텍스트
        else if (line) {
          content.push(stripHtmlTags(line));
        }
      }
      
      // 목록이 많으면 리스트 슬라이드로, 아니면 콘텐츠 슬라이드로
      const listItems = content.filter(c => lines.find(l => l.includes(c) && (l.match(/^[-*+]\s/) || l.match(/^\d+\.\s/))));
      
      slides.push({
        type: listItems.length > content.length / 2 ? 'list' : 'content',
        title: title,
        content: content
      });
    }
    // 코드 블록
    else if (lines[0].startsWith('```')) {
      const codeLines: string[] = [];
      let i = 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      if (codeLines.length > 0) {
        slides.push({
          type: 'code',
          title: '코드',
          content: codeLines
        });
      }
    }
    // 일반 콘텐츠 슬라이드
    else {
      const content: string[] = [];
      let title = '';
      
      lines.forEach((line, i) => {
        const trimmedLine = line.trim();
        
        // ### 이하의 제목들
        if (trimmedLine.match(/^#{3,6}\s/)) {
          if (i === 0) {
            title = stripHtmlTags(trimmedLine.replace(/^#{3,6}\s+/, ''));
          } else {
            content.push(stripHtmlTags(trimmedLine.replace(/^#{3,6}\s+/, '')));
          }
        }
        // 목록 항목
        else if (trimmedLine.match(/^[-*+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
          content.push(stripHtmlTags(trimmedLine.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '')));
        }
        // 일반 텍스트
        else if (trimmedLine) {
          content.push(stripHtmlTags(trimmedLine));
        }
      });
      
      if (content.length > 0 || title) {
        slides.push({
          type: 'content',
          title: title || '내용',
          content: content
        });
      }
    }
  });
  
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
  
  if (slides.length === 0) {
    // 빈 슬라이드라도 하나는 생성
    const slide = pres.addSlide();
    slide.addText('내용이 없습니다', {
      x: 1,
      y: 3,
      w: 8,
      h: 1,
      fontSize: 24,
      fontFace: '맑은 고딕',
      color: '666666',
      align: 'center'
    });
  }
  
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
        slide.addText(slideContent.content.join('\n'), {
          x: 1,
          y: 3,
          w: 8,
          h: 1.5,
          fontSize: 18,
          fontFace: '맑은 고딕',
          color: '666666',
          align: 'center',
          valign: 'top'
        });
      }
    } 
    else if (slideContent.type === 'list') {
      // 리스트 슬라이드
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
      
      const bullets = slideContent.content.map(item => ({
        text: item,
        options: { bullet: true, indentLevel: 0 }
      }));
      
      slide.addText(bullets, {
        x: 0.8,
        y: 1.3,
        w: 8.4,
        h: 3.8,
        fontSize: 16,
        fontFace: '맑은 고딕',
        color: '444444',
        bullet: { type: 'bullet' },
        lineSpacing: 32,
        valign: 'top'
      });
    }
    else if (slideContent.type === 'code') {
      // 코드 슬라이드
      slide.addText('코드', {
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
      
      slide.addText(slideContent.content.join('\n'), {
        x: 0.5,
        y: 1.1,
        w: 9,
        h: 4.2,
        fontSize: 12,
        fontFace: 'Courier New',
        color: '333333',
        fill: { color: 'F5F5F5' },
        line: { color: 'DDDDDD', width: 1 },
        margin: 8,
        valign: 'top'
      });
    }
    else {
      // 일반 콘텐츠 슬라이드
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
      const content = slideContent.content.join('\n\n');
      
      if (content) {
        slide.addText(content, {
          x: 0.5,
          y: yStart,
          w: 9,
          h: 5.625 - yStart - 0.3,
          fontSize: 16,
          fontFace: '맑은 고딕',
          color: '444444',
          lineSpacing: 24,
          valign: 'top',
          wrap: true
        });
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