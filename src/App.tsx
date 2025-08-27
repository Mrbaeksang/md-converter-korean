import { useState, useEffect } from 'react';
import { markdownToHtml, exportAs } from './utils/converter';
import type { ExportFormat } from './utils/converter';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  useEffect(() => {
    // localStorage에서 저장된 내용 불러오기
    const saved = localStorage.getItem('markdown-content');
    if (saved) {
      setMarkdown(saved);
    }
    
    // 최근 파일 목록 불러오기
    const recent = localStorage.getItem('recent-files');
    if (recent) {
      setRecentFiles(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    // 마크다운 변경 시 자동 저장
    localStorage.setItem('markdown-content', markdown);
    
    // 단어/문자 수 계산
    const words = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = markdown.length;
    setWordCount({ words, chars });
  }, [markdown]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdown(content);
        
        // 최근 파일 목록 업데이트
        const updatedFiles = [file.name, ...recentFiles.filter(f => f !== file.name)].slice(0, 5);
        setRecentFiles(updatedFiles);
        localStorage.setItem('recent-files', JSON.stringify(updatedFiles));
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleExport = (format: string) => {
    exportAs(format as ExportFormat, markdown);
  };

  const handleNewDocument = () => {
    if (confirm('현재 문서를 지우고 새 문서를 작성하시겠습니까?')) {
      setMarkdown('');
    }
  };

  const handleSaveDocument = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (type: string) => {
    const templates: Record<string, string> = {
      readme: `# Project Title

## Description
프로젝트에 대한 간단한 설명

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
사용 방법 설명

## License
MIT`,
      blog: `# Blog Post Title

*Date: ${new Date().toLocaleDateString('ko-KR')}*

## Introduction
블로그 포스트 소개

## Main Content
본문 내용

## Conclusion
결론`,
      report: `# 보고서 제목

## 요약
보고서 요약

## 본문
상세 내용

## 결론
최종 결론`
    };
    
    if (templates[type]) {
      setMarkdown(templates[type]);
    }
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <div className="navbar">
        <div className="navbar-brand">📝 MD Converter Korean</div>
        <div className="navbar-buttons">
          <button className="nav-btn" onClick={handleNewDocument}>새 문서</button>
          <label className="nav-btn">
            가져오기
            <input 
              type="file" 
              accept=".md,.markdown,.txt,.csv" 
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="nav-btn primary" onClick={handleSaveDocument}>저장</button>
          <button className="nav-btn">⚙️</button>
        </div>
      </div>
      
      {/* Main Container */}
      <div className="main-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">📁 최근 파일</div>
            <div id="recentFiles">
              {recentFiles.length === 0 ? (
                <div className="sidebar-item">파일 없음</div>
              ) : (
                recentFiles.map((file, index) => (
                  <div key={index} className="sidebar-item">{file}</div>
                ))
              )}
            </div>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">📝 템플릿</div>
            <div className="sidebar-item" onClick={() => loadTemplate('readme')}>README</div>
            <div className="sidebar-item" onClick={() => loadTemplate('blog')}>블로그</div>
            <div className="sidebar-item" onClick={() => loadTemplate('report')}>보고서</div>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">⬆️ 가져오기</div>
            <label className="sidebar-item">
              로컬 파일
              <input 
                type="file" 
                accept=".md,.markdown,.txt,.csv" 
                onChange={handleFileImport}
                style={{ display: 'none' }}
              />
            </label>
            <div className="sidebar-item">URL에서</div>
            <div className="sidebar-item">GitHub에서</div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="content-area">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="panel-header">
              <span>마크다운 편집기</span>
              <span>단어: {wordCount.words} | 문자: {wordCount.chars}</span>
            </div>
            <textarea 
              className="editor-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# 마크다운을 입력하세요..."
            />
          </div>
          
          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="panel-header">
              <span>미리보기</span>
              <span>
                <button onClick={() => {}}>👁️</button>
              </span>
            </div>
            <div 
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bottom-bar">
        <div className="export-buttons">
          <button className="export-btn" onClick={() => handleExport('html')}>HTML</button>
          <button className="export-btn" onClick={() => handleExport('styled-html')}>Styled HTML</button>
          <button className="export-btn" onClick={() => handleExport('pdf')}>PDF</button>
          <button className="export-btn" onClick={() => handleExport('docx')}>DOCX</button>
          <button className="export-btn" onClick={() => handleExport('excel')}>엑셀</button>
          <button className="export-btn" onClick={() => handleExport('txt')}>TXT</button>
        </div>
        <div className="status-info">
          <span>UTF-8 ✓</span>
          <span>한글 감지 ✓</span>
          <span>자동 저장: ON</span>
        </div>
      </div>
    </div>
  );
}

export default App;