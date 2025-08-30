import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import { markdownToHtml } from './converter';

// HTML을 파싱해서 DOCX 요소로 변환
function parseHtmlToDocx(html: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  
  // DOMParser를 사용해 HTML 파싱
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  
  // 재귀적으로 노드 처리
  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && elements.length > 0 && elements[elements.length - 1] instanceof Paragraph) {
        // 마지막 요소가 Paragraph면 텍스트 추가
        const lastPara = elements[elements.length - 1] as Paragraph;
        const children = lastPara.root[1].root;
        children.push(new TextRun(text));
      } else if (text) {
        // 새 Paragraph 생성
        elements.push(new Paragraph({
          children: [new TextRun(text)],
          spacing: { after: 120 }
        }));
      }
      return;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const level = parseInt(tagName.substring(1));
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1 :
                           level === 2 ? HeadingLevel.HEADING_2 :
                           level === 3 ? HeadingLevel.HEADING_3 :
                           level === 4 ? HeadingLevel.HEADING_4 :
                           level === 5 ? HeadingLevel.HEADING_5 :
                           HeadingLevel.HEADING_6;
        
        elements.push(new Paragraph({
          text: element.textContent || '',
          heading: headingLevel,
          spacing: { before: 240, after: 120 }
        }));
        break;
      }
      
      case 'p': {
        const runs = parseInlineElements(element);
        elements.push(new Paragraph({
          children: runs,
          spacing: { after: 120 }
        }));
        break;
      }
      
      case 'ul':
      case 'ol': {
        const isOrdered = tagName === 'ol';
        const items = element.querySelectorAll('li');
        items.forEach((li) => {
          elements.push(new Paragraph({
            children: parseInlineElements(li as HTMLElement),
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? {
              reference: 'default-numbering',
              level: 0
            } : undefined
          }));
        });
        break;
      }
      
      case 'blockquote': {
        const runs = parseInlineElements(element);
        elements.push(new Paragraph({
          children: runs,
          indent: { left: convertInchesToTwip(0.5) },
          border: {
            left: {
              color: '999999',
              space: 10,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          spacing: { after: 120 }
        }));
        break;
      }
      
      case 'pre': {
        const codeElement = element.querySelector('code') || element;
        const codeText = codeElement.textContent || '';
        const lines = codeText.split('\n');
        
        lines.forEach(line => {
          elements.push(new Paragraph({
            children: [new TextRun({
              text: line || ' ',
              font: 'Courier New'
            })],
            shading: {
              type: 'clear',
              fill: 'F0F0F0'
            },
            spacing: { after: 0 }
          }));
        });
        
        // 코드 블록 후 간격
        elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
        break;
      }
      
      case 'hr': {
        elements.push(new Paragraph({
          text: '',
          border: {
            bottom: {
              color: 'auto',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          }
        }));
        break;
      }
      
      case 'table': {
        const rows: TableRow[] = [];
        const tableRows = element.querySelectorAll('tr');
        
        tableRows.forEach((tr) => {
          const cells: TableCell[] = [];
          const tableCells = tr.querySelectorAll('th, td');
          
          tableCells.forEach((cell) => {
            const isHeader = cell.tagName.toLowerCase() === 'th';
            cells.push(new TableCell({
              children: [new Paragraph({
                children: parseInlineElements(cell as HTMLElement),
                alignment: AlignmentType.LEFT
              })],
              shading: isHeader ? {
                type: 'clear',
                fill: 'E0E0E0'
              } : undefined
            }));
          });
          
          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
          }
        });
        
        if (rows.length > 0) {
          elements.push(new Table({
            rows: rows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            }
          }));
        }
        break;
      }
      
      case 'br': {
        // 줄바꿈 처리
        if (elements.length > 0 && elements[elements.length - 1] instanceof Paragraph) {
          const lastPara = elements[elements.length - 1] as Paragraph;
          const children = lastPara.root[1].root;
          children.push(new TextRun({ text: '', break: 1 }));
        } else {
          elements.push(new Paragraph({ text: '' }));
        }
        break;
      }
      
      default: {
        // 다른 요소들은 자식 노드들을 재귀적으로 처리
        Array.from(element.childNodes).forEach(child => {
          processNode(child);
        });
      }
    }
  }
  
  // 인라인 요소 파싱
  function parseInlineElements(element: HTMLElement): TextRun[] {
    const runs: TextRun[] = [];
    
    function processInlineNode(node: Node, bold = false, italic = false): void {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          runs.push(new TextRun({
            text: text,
            bold: bold,
            italics: italic
          }));
        }
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      
      switch (tag) {
        case 'strong':
        case 'b':
          Array.from(el.childNodes).forEach(child => {
            processInlineNode(child, true, italic);
          });
          break;
          
        case 'em':
        case 'i':
          Array.from(el.childNodes).forEach(child => {
            processInlineNode(child, bold, true);
          });
          break;
          
        case 'code':
          runs.push(new TextRun({
            text: el.textContent || '',
            font: 'Courier New',
            shading: {
              type: 'clear',
              fill: 'E0E0E0'
            }
          }));
          break;
          
        case 'a':
          runs.push(new TextRun({
            text: el.textContent || '',
            underline: {}
          }));
          break;
          
        case 'br':
          runs.push(new TextRun({ text: '', break: 1 }));
          break;
          
        default:
          Array.from(el.childNodes).forEach(child => {
            processInlineNode(child, bold, italic);
          });
      }
    }
    
    Array.from(element.childNodes).forEach(child => {
      processInlineNode(child);
    });
    
    return runs.length > 0 ? runs : [new TextRun(element.textContent || '')];
  }
  
  // 모든 최상위 노드 처리
  Array.from(body.childNodes).forEach(node => {
    processNode(node);
  });
  
  return elements;
}

// DOCX 문서 생성 (HTML 변환 방식)
export async function markdownToDocx(markdown: string): Promise<void> {
  console.log('=== markdownToDocx (New HTML-based) STARTED ===');
  
  try {
    // 1. Markdown을 HTML로 변환
    const html = markdownToHtml(markdown);
    console.log('HTML conversion completed');
    
    // 2. HTML을 DOCX 요소로 파싱
    const children = parseHtmlToDocx(html);
    console.log('Parsed elements count:', children.length);
    
    // 3. Document 생성
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }],
      numbering: {
        config: [{
          reference: 'default-numbering',
          levels: [{
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }
              }
            }
          }]
        }]
      }
    });
    
    // 4. 파일 생성 및 저장
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'document.docx');
    console.log('DOCX file saved successfully');
    
  } catch (error) {
    console.error('Error in markdownToDocx:', error);
    throw error;
  }
}