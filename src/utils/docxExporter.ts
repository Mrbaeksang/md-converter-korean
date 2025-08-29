import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';

// 마크다운 파서 타입 정의
interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'blockquote' | 'hr';
  content?: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  rows?: string[][];
  language?: string;
}

// 전처리 함수 - HTML 블록 제거
function preprocessMarkdown(markdown: string): string {
  console.log('Preprocessing markdown, original length:', markdown.length);
  
  // 1. 인라인 스타일과 스크립트 태그 블록 제거
  markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // 2. 멀티라인 HTML 블록 제거 (div, button 등)
  markdown = markdown.replace(/<(div|button|span|form|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // 3. self-closing 태그 제거
  markdown = markdown.replace(/<[^>]+\/>/g, '');
  
  // 4. 나머지 HTML 태그 제거 (a, img 등 인라인 태그)
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, '');
  
  // 5. HTML 엔티티 디코딩
  markdown = markdown.replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // 6. 연속된 빈 줄 정리 (3개 이상의 빈 줄을 2개로)
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  console.log('Preprocessing complete, new length:', markdown.length);
  return markdown;
}

// 마크다운 파싱 함수
function parseMarkdown(markdown: string): ParsedElement[] {
  console.log('parseMarkdown called with length:', markdown.length);
  
  // 전처리 적용 - HTML 블록 제거
  markdown = preprocessMarkdown(markdown);
  console.log('After preprocessing, length:', markdown.length);
  
  const elements: ParsedElement[] = [];
  const lines = markdown.split('\n');
  console.log('Split into lines:', lines.length);
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // 빈 줄 건너뛰기
    if (!line.trim()) {
      i++;
      continue;
    }

    // 제목 처리
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2]
      });
      i++;
      continue;
    }

    // 수평선
    if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      elements.push({ type: 'hr' });
      i++;
      continue;
    }

    // 코드 블록
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      
      let codeSafetyCounter = 0;
      const maxCodeLines = 1000; // 코드 블록 최대 라인 수
      
      while (i < lines.length && !lines[i].startsWith('```') && codeSafetyCounter < maxCodeLines) {
        codeSafetyCounter++;
        codeLines.push(lines[i]);
        i++;
      }
      
      if (codeSafetyCounter >= maxCodeLines) {
        console.warn('Code block exceeded maximum lines');
      }
      
      elements.push({
        type: 'code',
        content: codeLines.join('\n'),
        language
      });
      
      // 종료 ``` 스킵
      if (i < lines.length && lines[i].startsWith('```')) {
        i++;
      }
      continue;
    }

    // 인용구
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s*/, ''));
        i++;
      }
      elements.push({
        type: 'blockquote',
        content: quoteLines.join('\n')
      });
      continue;
    }

    // 순서 있는 목록
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].match(/^\d+\.\s/) || lines[i].match(/^\s{2,}/))) {
        if (lines[i].match(/^\d+\.\s/)) {
          // 새로운 목록 항목
          const item = lines[i].replace(/^\d+\.\s+/, '');
          listItems.push(item);
        } else if (lines[i].match(/^\s{2,}/) && listItems.length > 0) {
          // 이전 항목의 연속 (들여쓰기된 내용)
          const continuation = lines[i].trim();
          if (continuation) {
            listItems[listItems.length - 1] += ' ' + continuation;
          }
        } else {
          break;
        }
        i++;
      }
      elements.push({
        type: 'list',
        ordered: true,
        items: listItems
      });
      continue;
    }

    // 순서 없는 목록
    if (line.match(/^\s*[-*+]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].match(/^\s*[-*+]\s/) || lines[i].match(/^\s{2,}/))) {
        if (lines[i].match(/^\s*[-*+]\s/)) {
          // 새로운 목록 항목
          const item = lines[i].replace(/^\s*[-*+]\s+/, '');
          listItems.push(item);
        } else if (lines[i].match(/^\s{2,}/) && listItems.length > 0) {
          // 이전 항목의 연속 (들여쓰기된 내용)
          const continuation = lines[i].trim();
          if (continuation) {
            listItems[listItems.length - 1] += ' ' + continuation;
          }
        } else {
          break;
        }
        i++;
      }
      elements.push({
        type: 'list',
        ordered: false,
        items: listItems
      });
      continue;
    }

    // 표 - 구분선 확인으로 검증
    if (line.includes('|') && i + 1 < lines.length) {
      // 다음 줄이 구분선인지 확인
      const nextLine = lines[i + 1];
      const isSeparator = nextLine && /^\s*\|?\s*(:?-+:?\s*\|?)+\s*$/.test(nextLine);
      
      if (isSeparator) {
        const rows: string[][] = [];
        
        // 헤더 행 파싱
        const headerCells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
        
        if (headerCells.length > 0) {
          rows.push(headerCells);
          i += 2; // 헤더와 구분선 건너뛰기
          
          // 데이터 행들 파싱
          while (i < lines.length && lines[i].includes('|')) {
            const cells = lines[i].split('|')
              .map(cell => cell.trim())
              .filter(cell => cell.length > 0);
            
            if (cells.length > 0) {
              // 열 개수 일치 확인 (허용 오차 ±1)
              if (Math.abs(cells.length - headerCells.length) <= 1) {
                rows.push(cells);
              }
            }
            i++;
          }
          
          // 유효한 테이블인 경우만 추가
          if (rows.length > 1) { // 헤더 + 최소 1개 데이터 행
            elements.push({
              type: 'table',
              rows
            });
            console.log(`Table parsed with ${rows.length} rows`);
          }
          continue;
        }
      }
    }

    // 일반 단락
    if (line.trim()) {
      const paragraphLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim() && 
             !lines[i].match(/^(#{1,6}|\d+\.|\s*[-*+]\s|>|```|\||---|~~~)/)) {
        paragraphLines.push(lines[i]);
        i++;
      }
      const content = paragraphLines.join(' ').trim();
      if (content) {
        elements.push({
          type: 'paragraph',
          content: content
        });
      }
      continue;
    }

    i++;
  }
  
  console.log('parseMarkdown completed with elements:', elements.length);
  console.log('Elements:', elements.map(e => ({ type: e.type, content: e.content?.substring(0, 50) })));
  return elements;
}

// 인라인 마크다운 처리
function processInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let remaining = text;
  const maxIterations = 1000; // 무한 루프 방지
  let iterations = 0;
  
  // 이모지 제거 (선택사항 - 원하면 유지 가능)
  // remaining = remaining.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '');
  
  while (remaining.length > 0 && iterations < maxIterations) {
    iterations++;
    let matched = false;
    
    // 코드 먼저 처리 (백틱이 다른 패턴과 충돌하지 않도록)
    const codeMatch = remaining.match(/`([^`]*?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      const index = codeMatch.index;
      if (index > 0) {
        runs.push(new TextRun(remaining.slice(0, index)));
      }
      runs.push(new TextRun({
        text: codeMatch[1] || '',
        font: 'Courier New',
        shading: {
          type: 'clear',
          fill: 'E8E8E8'
        }
      }));
      remaining = remaining.slice(index + codeMatch[0].length);
      matched = true;
    }
    // 굵게
    else if (!matched) {
      const boldMatch = remaining.match(/\*\*([^*]+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        const index = boldMatch.index;
        if (index > 0) {
          runs.push(new TextRun(remaining.slice(0, index)));
        }
        runs.push(new TextRun({
          text: boldMatch[1] || '',
          bold: true
        }));
        remaining = remaining.slice(index + boldMatch[0].length);
        matched = true;
      }
    }
    // 기울임 (굵게 처리 후 확인)
    if (!matched) {
      const italicMatch = remaining.match(/\*([^*]+?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        const index = italicMatch.index;
        if (index > 0) {
          runs.push(new TextRun(remaining.slice(0, index)));
        }
        runs.push(new TextRun({
          text: italicMatch[1] || '',
          italics: true
        }));
        remaining = remaining.slice(index + italicMatch[0].length);
        matched = true;
      }
    }
    
    // 매칭되는 패턴이 없으면 나머지 텍스트 처리하고 종료
    if (!matched) {
      runs.push(new TextRun(remaining));
      break;
    }
  }
  
  // 무한 루프 방지를 위해 남은 텍스트가 있으면 그대로 추가
  if (iterations >= maxIterations && remaining.length > 0) {
    console.warn('Max iterations reached in processInlineMarkdown, adding remaining text as-is');
    runs.push(new TextRun(remaining));
  }

  return runs.length > 0 ? runs : [new TextRun(text || '')];
}

// DOCX 문서 생성
export async function markdownToDocx(markdown: string): Promise<void> {
  console.log('=== markdownToDocx STARTED ===');
  console.log('Input markdown length:', markdown.length);
  console.log('First 500 chars of markdown:', markdown.substring(0, 500));
  
  try {
    console.log('Starting parseMarkdown...');
    const elements = parseMarkdown(markdown);
    console.log('parseMarkdown completed, elements count:', elements.length);
    console.log('Element types:', elements.map(e => e.type));
    
    // 긴 텍스트 처리를 위한 청크 처리
    const processInChunks = async () => {
      const children: (Paragraph | Table)[] = [];
      console.log('Starting element processing...');

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        console.log(`Processing element ${i}/${elements.length}, type: ${element.type}`);
        
        // 주기적으로 브라우저가 응답할 수 있도록 함
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        switch (element.type) {
          case 'heading': {
            const headingLevel = element.level === 1 ? HeadingLevel.HEADING_1 :
                               element.level === 2 ? HeadingLevel.HEADING_2 :
                               element.level === 3 ? HeadingLevel.HEADING_3 :
                               element.level === 4 ? HeadingLevel.HEADING_4 :
                               element.level === 5 ? HeadingLevel.HEADING_5 :
                               HeadingLevel.HEADING_6;
            
            children.push(
              new Paragraph({
                text: element.content || '',
                heading: headingLevel,
                spacing: {
                  before: 240,
                  after: 120
                }
              })
            );
            break;
          }

          case 'paragraph':
            if (element.content) {
              children.push(
                new Paragraph({
                  children: processInlineMarkdown(element.content),
                  spacing: {
                    after: 120
                  }
                })
              );
            }
            break;

          case 'list':
            if (element.items) {
              element.items.forEach((item) => {
                children.push(
                  new Paragraph({
                    children: processInlineMarkdown(item),
                    bullet: element.ordered ? undefined : {
                      level: 0
                    },
                    numbering: element.ordered ? {
                      reference: 'default-numbering',
                      level: 0
                    } : undefined
                  })
                );
              });
            }
            break;

          case 'blockquote':
            if (element.content) {
              children.push(
                new Paragraph({
                  children: processInlineMarkdown(element.content),
                  indent: {
                    left: convertInchesToTwip(0.5)
                  },
                  border: {
                    left: {
                      color: '999999',
                      space: 10,
                      style: BorderStyle.SINGLE,
                      size: 6
                    }
                  },
                  spacing: {
                    after: 120
                  }
                })
              );
            }
            break;

          case 'code':
            if (element.content) {
              const codeLines = element.content.split('\n');
              codeLines.forEach(line => {
                children.push(
                  new Paragraph({
                    children: [new TextRun({
                      text: line || ' ',
                      font: 'Courier New'
                    })],
                    shading: {
                      type: 'clear',
                      fill: 'F0F0F0'
                    },
                    spacing: {
                      after: 0
                    }
                  })
                );
              });
              // 코드 블록 후 간격 추가
              children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
            }
            break;

          case 'hr':
            children.push(
              new Paragraph({
                text: '',
                border: {
                  bottom: {
                    color: 'auto',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6
                  }
                }
              })
            );
            break;

          case 'table':
            console.log('Processing table with rows:', element.rows?.length);
            if (element.rows && element.rows.length > 0) {
              console.log('Creating Word table...');
              // 실제 Word 표 생성
              const table = new Table({
                rows: element.rows.map((row, rowIndex) => 
                  new TableRow({
                    children: row.map(cell => 
                      new TableCell({
                        children: [new Paragraph({
                          children: processInlineMarkdown(cell),
                          alignment: AlignmentType.LEFT
                        })],
                        shading: rowIndex === 0 ? {
                          type: 'clear',
                          fill: 'E8E8E8'
                        } : undefined,
                        width: {
                          size: 100 / row.length,
                          type: WidthType.PERCENTAGE
                        }
                      })
                    )
                  })
                ),
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE
                }
              });
              
              children.push(table);
              // 표 후 간격 추가
              children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
              console.log('Table added successfully');
            }
            break;
          
          default:
            console.log('Unknown element type:', element.type);
            break;
        }
      }

      console.log('All elements processed, total children:', children.length);
      return children;
    };

    // 문서 생성
    console.log('Calling processInChunks...');
    const children = await processInChunks();
    console.log('Document children created, count:', children.length);
    console.log('Children types:', children.map(c => c.constructor.name));
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          }
        }
      },
      children: children
    }],
    styles: {
      default: {
        document: {
          run: {
            font: '맑은 고딕',
            size: 22 // 11pt
          },
          paragraph: {
            spacing: {
              line: 360 // 1.5배 줄간격
            }
          }
        }
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: '맑은 고딕',
            size: 32,
            bold: true
          }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: '맑은 고딕',
            size: 28,
            bold: true
          }
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: '맑은 고딕',
            size: 24,
            bold: true
          }
        }
      ]
    }
  });

    // 파일 저장
    console.log('Packing document to blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Blob created, size:', blob.size);
    
    console.log('Saving file...');
    saveAs(blob, 'document.docx');
    console.log('=== DOCX EXPORT COMPLETED ===');
  } catch (error) {
    console.error('=== ERROR in markdownToDocx ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}