import React, { useEffect, useState, useRef } from 'react';
import { markdownToHtml } from '../../../utils/converter';

interface DocxPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({
  markdown,
  isEditMode
  // TODO: onContentChange 편집 기능 구현 예정
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = markdownToHtml(markdown);
    
    // Word의 실제 페이지 높이 계산
    // A4: 297mm, 기본 여백: 상하 각 1인치(25.4mm)
    // 실제 콘텐츠 높이: 297 - 50.8 = 246.2mm
    // 픽셀로 변환: 246.2mm * 3.7795275591 = 930px
    // 하지만 실제 Word는 더 많은 내용을 한 페이지에 담음
    // 실제 측정 결과 약 1100px 정도를 한 페이지로 처리
    const PAGE_HEIGHT = 1100; // 실제 Word와 동일하게 조정
    
    // 측정용 컨테이너에서 높이 계산
    if (measureRef.current) {
      measureRef.current.innerHTML = html;
      measureRef.current.style.width = '672px'; // Word 콘텐츠 너비
      measureRef.current.style.fontFamily = "'Calibri', 'Noto Sans KR', sans-serif";
      measureRef.current.style.fontSize = '11pt';
      measureRef.current.style.lineHeight = '1.5';
      
      // 모든 스타일 적용하여 실제 높이 계산
      const applyWordStyles = (container: HTMLElement) => {
        // 제목 스타일
        container.querySelectorAll('h1').forEach(h => {
          (h as HTMLElement).style.fontSize = '16pt';
          (h as HTMLElement).style.marginTop = '24px';
          (h as HTMLElement).style.marginBottom = '12px';
        });
        container.querySelectorAll('h2').forEach(h => {
          (h as HTMLElement).style.fontSize = '14pt';
          (h as HTMLElement).style.marginTop = '18px';
          (h as HTMLElement).style.marginBottom = '10px';
        });
        container.querySelectorAll('h3').forEach(h => {
          (h as HTMLElement).style.fontSize = '12pt';
          (h as HTMLElement).style.marginTop = '12px';
          (h as HTMLElement).style.marginBottom = '8px';
        });
        
        // 단락 스타일
        container.querySelectorAll('p').forEach(p => {
          (p as HTMLElement).style.marginBottom = '8px';
        });
        
        // 테이블 스타일
        container.querySelectorAll('table').forEach(table => {
          (table as HTMLElement).style.marginTop = '12px';
          (table as HTMLElement).style.marginBottom = '12px';
        });
        
        // 리스트 스타일
        container.querySelectorAll('ul, ol').forEach(list => {
          (list as HTMLElement).style.marginBottom = '8px';
        });
      };
      
      applyWordStyles(measureRef.current);
      
      // 요소별 높이 측정
      const elements = Array.from(measureRef.current.children);
      const pageContents: string[] = [];
      let currentPageElements: HTMLElement[] = [];
      let currentHeight = 0;
      
      elements.forEach((element) => {
        const el = element as HTMLElement;
        const height = el.offsetHeight || 0;
        const marginTop = parseInt(window.getComputedStyle(el).marginTop) || 0;
        const marginBottom = parseInt(window.getComputedStyle(el).marginBottom) || 0;
        const totalHeight = height + marginTop + marginBottom;
        
        // 페이지를 넘는지 확인
        if (currentHeight + totalHeight > PAGE_HEIGHT && currentPageElements.length > 0) {
          // 현재 페이지 저장
          const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
          pageContents.push(pageHtml);
          
          // 새 페이지 시작
          currentPageElements = [el];
          currentHeight = totalHeight;
        } else {
          currentPageElements.push(el);
          currentHeight += totalHeight;
        }
      });
      
      // 마지막 페이지 추가
      if (currentPageElements.length > 0) {
        const pageHtml = currentPageElements.map(e => e.outerHTML).join('');
        pageContents.push(pageHtml);
      }
      
      setPages(pageContents.length > 0 ? pageContents : [html]);
    } else {
      setPages([html]);
    }
  }, [markdown]);

  return (
    <div className="preview-content docx-preview">
      {/* 미리보기 안내 메시지 */}
      <div className="preview-notice">
        <span className="notice-icon">ℹ️</span>
        <span className="notice-text">
          미리보기는 실제 DOCX 파일과 차이가 있을 수 있습니다 (이미지, 특수 서식 등)
        </span>
      </div>
      
      {/* 측정용 숨겨진 컨테이너 */}
      <div 
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: '672px',
          left: '-9999px'
        }}
      />
      
      {/* 페이지들 렌더링 */}
      {pages.map((pageHtml, index) => (
        <div key={index} className="docx-page">
          <div className="docx-header">
            <div className="page-margins"></div>
          </div>
          <div 
            className="docx-content"
            contentEditable={isEditMode}
            dangerouslySetInnerHTML={{ __html: pageHtml }}
            suppressContentEditableWarning={true}
          />
          <div className="docx-footer">
            <span className="page-number">{index + 1} / {pages.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};