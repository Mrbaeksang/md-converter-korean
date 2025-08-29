import React, { useEffect, useState, useRef } from 'react';
import { markdownToHtml } from '../../../utils/converter';

interface PdfPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  markdown,
  isEditMode
  // TODO: onContentChange 편집 기능 구현 예정
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = markdownToHtml(markdown);
    
    // 테이블 열 개수 감지를 위한 임시 컨테이너
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 테이블 열 개수 감지
    let maxColumns = 0;
    tempDiv.querySelectorAll('table').forEach(table => {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const columns = firstRow.querySelectorAll('th, td').length;
        maxColumns = Math.max(maxColumns, columns);
      }
    });
    
    // 8열 이상이면 가로 모드
    const isLandscape = maxColumns >= 8;
    setOrientation(isLandscape ? 'landscape' : 'portrait');
    
    // 페이지 높이 계산 (A4 기준, 더 정확한 계산)
    // 1mm = 3.7795275591 pixels at 96 DPI
    const MM_TO_PX = 3.7795275591;
    const A4_HEIGHT_MM = 297;
    const MARGIN_TOP_MM = 20;
    const CONTENT_HEIGHT = (A4_HEIGHT_MM - MARGIN_TOP_MM * 2) * MM_TO_PX; // 257mm = 971px
    
    const pageHeight = isLandscape ? 680 : CONTENT_HEIGHT;
    
    // 측정용 컨테이너 생성
    if (measureRef.current) {
      measureRef.current.innerHTML = html;
      const CONTENT_WIDTH = isLandscape ? 1008 : 680; // px
      measureRef.current.style.width = `${CONTENT_WIDTH}px`;
      
      const elements = Array.from(measureRef.current.children);
      const pageContents: string[] = [];
      let currentPageElements: HTMLElement[] = [];
      let currentHeight = 0;
      
      elements.forEach((element) => {
        const el = element as HTMLElement;
        const height = el.offsetHeight || 50; // 기본 높이
        
        // 테이블이나 pre 태그는 페이지를 넘지 않도록
        const isUnbreakable = el.tagName === 'TABLE' || el.tagName === 'PRE';
        
        if (currentHeight + height > pageHeight && currentPageElements.length > 0 && !isUnbreakable) {
          // 현재 페이지 저장
          const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
          pageContents.push(pageHtml);
          
          // 새 페이지 시작
          currentPageElements = [el];
          currentHeight = height;
        } else {
          currentPageElements.push(el);
          currentHeight += height;
        }
      });
      
      // 마지막 페이지 추가
      if (currentPageElements.length > 0) {
        const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
        pageContents.push(pageHtml);
      }
      
      setPages(pageContents.length > 0 ? pageContents : [html]);
    } else {
      // measureRef가 없으면 단일 페이지로
      setPages([html]);
    }
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
          width: orientation === 'landscape' ? '1122px' : '794px',
          left: '-9999px'
        }}
      />
      
      <div className={`pdf-container ${orientation}`}>
        {pages.map((pageHtml, index) => (
          <div 
            key={index} 
            className={`pdf-page ${orientation === 'landscape' ? 'landscape' : ''}`}
            style={orientation === 'landscape' ? { width: '1122px' } : {}}
          >
            {pages.length > 1 && (
              <div className="page-number">{index + 1} / {pages.length}</div>
            )}
            <div 
              className="pdf-content"
              contentEditable={isEditMode}
              dangerouslySetInnerHTML={{ __html: pageHtml }}
              suppressContentEditableWarning={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};