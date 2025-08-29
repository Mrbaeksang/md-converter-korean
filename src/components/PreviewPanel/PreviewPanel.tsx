import React, { useState } from 'react';
import { PreviewTabs } from './PreviewTabs';
import { HtmlPreview } from './formatPreviews/HtmlPreview';
import { PdfPreview } from './formatPreviews/PdfPreview';
import { ExcelPreview } from './formatPreviews/ExcelPreview';
import { DocxPreview } from './formatPreviews/DocxPreview';
import { PptPreview } from './formatPreviews/PptPreview';
import './PreviewPanel.css';

export type PreviewFormat = 'html' | 'pdf' | 'excel' | 'docx' | 'ppt';

interface PreviewPanelProps {
  markdown: string;
  isMobile: boolean;
  mobileView?: 'editor' | 'preview';
  onMarkdownChange?: (markdown: string) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  markdown,
  isMobile,
  mobileView,
  onMarkdownChange
}) => {
  const [format, setFormat] = useState<PreviewFormat>('html');

  const renderPreview = () => {
    const props = {
      markdown,
      isEditMode: false, // 읽기 전용
      onContentChange: onMarkdownChange
    };

    switch (format) {
      case 'pdf':
        return <PdfPreview {...props} />;
      case 'excel':
        return <ExcelPreview {...props} />;
      case 'docx':
        return <DocxPreview {...props} />;
      case 'ppt':
        return <PptPreview {...props} />;
      case 'html':
      default:
        return <HtmlPreview {...props} />;
    }
  };

  return (
    <div className={`preview-panel ${isMobile && mobileView === 'preview' ? 'mobile-show' : ''}`}>
      <div className="panel-header">
        <span>미리보기</span>
      </div>
      
      <PreviewTabs 
        currentFormat={format} 
        onFormatChange={setFormat}
        isMobile={isMobile}
      />
      
      <div className="preview-content-wrapper">
        {renderPreview()}
      </div>
    </div>
  );
};