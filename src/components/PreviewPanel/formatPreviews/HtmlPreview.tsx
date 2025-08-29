import React, { useRef } from 'react';
import { markdownToHtml } from '../../../utils/converter';

interface HtmlPreviewProps {
  markdown: string;
  isEditMode: boolean;
  onContentChange?: (markdown: string) => void;
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({
  markdown,
  isEditMode,
  onContentChange
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const html = markdownToHtml(markdown);

  const handleInput = () => {
    if (!contentRef.current || !onContentChange) return;
    
    // 여기서 HTML을 마크다운으로 역변환해야 함
    // 일단 간단하게 텍스트만 추출
    const text = contentRef.current.innerText;
    onContentChange(text);
  };

  return (
    <>
      {/* 미리보기 안내 메시지 */}
      <div className="preview-notice html-notice">
        <span className="notice-icon">ℹ️</span>
        <span className="notice-text">
          HTML 미리보기는 실제 내보낸 파일과 스타일이 다를 수 있습니다 (CSS 적용 여부에 따라 차이 발생)
        </span>
      </div>
      
      <div 
        ref={contentRef}
        className="preview-content html-preview"
        contentEditable={isEditMode}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: html }}
        suppressContentEditableWarning={true}
      />
    </>
  );
};