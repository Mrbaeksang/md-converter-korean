import React from 'react';
import type { PreviewFormat } from './PreviewPanel';

interface PreviewTabsProps {
  currentFormat: PreviewFormat;
  onFormatChange: (format: PreviewFormat) => void;
  isMobile: boolean;
}

export const PreviewTabs: React.FC<PreviewTabsProps> = ({
  currentFormat,
  onFormatChange,
  isMobile
}) => {
  const tabs: { format: PreviewFormat; label: string; icon: string }[] = [
    { format: 'html', label: 'HTML', icon: '🌐' },
    { format: 'pdf', label: 'PDF', icon: '📄' },
    { format: 'excel', label: 'Excel', icon: '📊' },
    { format: 'docx', label: 'DOCX', icon: '📝' },
    { format: 'ppt', label: 'PPT', icon: '🎯' }
  ];

  return (
    <div className={`preview-tabs ${isMobile ? 'mobile' : ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.format}
          className={`preview-tab ${currentFormat === tab.format ? 'active' : ''}`}
          onClick={() => onFormatChange(tab.format)}
          title={`${tab.label} 미리보기`}
        >
          {isMobile ? tab.icon : (
            <>
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
};