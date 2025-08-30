import React, { useEffect, useState, useRef } from 'react';
import { markdownToHtml } from '../../../utils/converter';

interface PdfPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

// A4 실제 크기 정의
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// 여백 설정 (mm)
const MARGIN_TOP = 25;
const MARGIN_BOTTOM = 25;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;

// DPI 기반 변환 (96 DPI 기준)
const MM_TO_PX = 3.7795275591;

// 콘텐츠 영역 크기 (여백 제외)
const CONTENT_WIDTH_PX = (A4_WIDTH_MM - MARGIN_LEFT - MARGIN_RIGHT) * MM_TO_PX;
const CONTENT_HEIGHT_PX = (A4_HEIGHT_MM - MARGIN_TOP - MARGIN_BOTTOM) * MM_TO_PX;

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  markdown,
  isEditMode
}) => {
  const [pages, setPages] = useState<{ content: string; isLandscape: boolean }[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = markdownToHtml(markdown);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.width = `${CONTENT_WIDTH_PX}px`;
    tempDiv.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', sans-serif";
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.5';
    
    // 모든 요소에 기본 스타일 적용
    tempDiv.querySelectorAll('*').forEach(el => {
      const element = el as HTMLElement;
      element.style.color = 'black';
    });
    
    // 헤딩 스타일
    tempDiv.querySelectorAll('h1').forEach(h1 => {
      (h1 as HTMLElement).style.fontSize = '20px';
      (h1 as HTMLElement).style.marginTop = '16px';
      (h1 as HTMLElement).style.marginBottom = '12px';
      (h1 as HTMLElement).style.borderBottom = '2px solid black';
      (h1 as HTMLElement).style.paddingBottom = '8px';
    });
    
    tempDiv.querySelectorAll('h2').forEach(h2 => {
      (h2 as HTMLElement).style.fontSize = '16px';
      (h2 as HTMLElement).style.marginTop = '14px';
      (h2 as HTMLElement).style.marginBottom = '10px';
      (h2 as HTMLElement).style.borderBottom = '1px solid #666';
      (h2 as HTMLElement).style.paddingBottom = '6px';
    });
    
    tempDiv.querySelectorAll('h3').forEach(h3 => {
      (h3 as HTMLElement).style.fontSize = '14px';
      (h3 as HTMLElement).style.marginTop = '12px';
      (h3 as HTMLElement).style.marginBottom = '8px';
    });
    
    // 단락 스타일
    tempDiv.querySelectorAll('p').forEach(p => {
      (p as HTMLElement).style.marginBottom = '10px';
    });
    
    // 리스트 스타일
    tempDiv.querySelectorAll('ul, ol').forEach(list => {
      (list as HTMLElement).style.marginBottom = '10px';
      (list as HTMLElement).style.paddingLeft = '20px';
    });
    
    // 테이블 스타일
    tempDiv.querySelectorAll('table').forEach(table => {
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.marginTop = '10px';
      (table as HTMLElement).style.marginBottom = '10px';
    });
    
    tempDiv.querySelectorAll('th, td').forEach(cell => {
      (cell as HTMLElement).style.border = '1px solid black';
      (cell as HTMLElement).style.padding = '6px';
      (cell as HTMLElement).style.fontSize = '11px';
    });
    
    tempDiv.querySelectorAll('th').forEach(th => {
      (th as HTMLElement).style.backgroundColor = '#f0f0f0';
      (th as HTMLElement).style.fontWeight = 'bold';
    });
    
    // 코드 블록 스타일
    tempDiv.querySelectorAll('pre').forEach(pre => {
      (pre as HTMLElement).style.backgroundColor = '#f5f5f5';
      (pre as HTMLElement).style.padding = '10px';
      (pre as HTMLElement).style.borderRadius = '4px';
      (pre as HTMLElement).style.marginBottom = '10px';
      (pre as HTMLElement).style.fontSize = '11px';
      (pre as HTMLElement).style.overflow = 'auto';
      (pre as HTMLElement).style.whiteSpace = 'pre-wrap';
      (pre as HTMLElement).style.wordBreak = 'break-all';
    });
    
    tempDiv.querySelectorAll('pre code').forEach(code => {
      (code as HTMLElement).style.backgroundColor = 'transparent';
      (code as HTMLElement).style.padding = '0';
      (code as HTMLElement).style.fontSize = '11px';
      (code as HTMLElement).style.whiteSpace = 'pre';
    });
    
    // 인라인 코드 스타일
    tempDiv.querySelectorAll('code:not(pre code)').forEach(code => {
      (code as HTMLElement).style.backgroundColor = '#f5f5f5';
      (code as HTMLElement).style.padding = '2px 4px';
      (code as HTMLElement).style.borderRadius = '2px';
      (code as HTMLElement).style.fontSize = '11px';
    });
    
    const elements = Array.from(tempDiv.children) as HTMLElement[];
    
    // 테이블 열 개수 감지 (가로 모드 결정)
    let maxColumns = 0;
    tempDiv.querySelectorAll('table').forEach(table => {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const columns = firstRow.querySelectorAll('th, td').length;
        maxColumns = Math.max(maxColumns, columns);
      }
    });
    const isLandscape = maxColumns >= 8;
    
    // 페이지 분할
    const pageContents: { content: string; isLandscape: boolean }[] = [];
    let currentPageElements: HTMLElement[] = [];
    let currentHeight = 0;
    
    // 안전 마진 - 페이지 하단에 여유 공간 확보
    const SAFE_MARGIN = 50;
    const MAX_HEIGHT = CONTENT_HEIGHT_PX - SAFE_MARGIN;
    
    // 측정용 컨테이너에서 높이 측정
    if (measureRef.current) {
      measureRef.current.style.width = `${CONTENT_WIDTH_PX}px`;
      measureRef.current.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', sans-serif";
      measureRef.current.style.fontSize = '12px';
      measureRef.current.style.lineHeight = '1.5';
      
      elements.forEach((element) => {
        // 요소 높이 측정
        measureRef.current!.innerHTML = '';
        const clone = element.cloneNode(true) as HTMLElement;
        measureRef.current!.appendChild(clone);
        
        const rect = clone.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(clone);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const elementHeight = Math.ceil(rect.height + marginTop + marginBottom);
        
        const elementType = element.tagName;
        
        // 큰 요소가 페이지를 크게 넘어가는 경우
        if (elementHeight > MAX_HEIGHT) {
          if (currentHeight > 0) {
            const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
            pageContents.push({ content: pageHtml, isLandscape });
            currentPageElements = [];
            currentHeight = 0;
          }
          
          // 큰 요소를 별도 페이지에
          pageContents.push({ content: element.outerHTML, isLandscape });
          return;
        }
        
        // 테이블인 경우 특별 처리
        if (elementType === 'TABLE' && currentHeight > 0) {
          if (currentHeight > MAX_HEIGHT * 0.6) {
            const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
            pageContents.push({ content: pageHtml, isLandscape });
            currentPageElements = [];
            currentHeight = 0;
          }
        }
        // 일반 요소가 현재 페이지를 넘어가는 경우
        else if (currentHeight > 0 && currentHeight + elementHeight > MAX_HEIGHT) {
          const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
          pageContents.push({ content: pageHtml, isLandscape });
          currentPageElements = [];
          currentHeight = 0;
        }
        
        currentPageElements.push(element);
        currentHeight += elementHeight;
      });
      
      // 마지막 페이지 추가
      if (currentPageElements.length > 0) {
        const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
        pageContents.push({ content: pageHtml, isLandscape });
      }
    }
    
    setPages(pageContents.length > 0 ? pageContents : [{ content: html, isLandscape }]);
  }, [markdown]);

  return (
    <div className="preview-content pdf-preview">
      {/* 미리보기 안내 메시지 */}
      <div className="preview-notice pdf-notice">
        <span className="notice-icon">ℹ️</span>
        <span className="notice-text">
          미리보기는 실제 PDF 파일과 차이가 있을 수 있습니다 (이미지, 폰트 렌더링 등)
        </span>
      </div>
      
      {/* 측정용 숨겨진 컨테이너 */}
      <div 
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          left: '-9999px',
          top: '0'
        }}
      />
      
      <div className="pdf-container">
        {pages.map((page, index) => (
          <div 
            key={index} 
            className={`pdf-page ${page.isLandscape ? 'landscape' : ''}`}
          >
            {pages.length > 1 && (
              <div className="page-number">{index + 1} / {pages.length}</div>
            )}
            <div 
              className="pdf-content"
              contentEditable={isEditMode}
              dangerouslySetInnerHTML={{ __html: page.content }}
              suppressContentEditableWarning={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};