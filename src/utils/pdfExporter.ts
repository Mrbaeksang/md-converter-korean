// PDF Export Module with Korean Support
// 한글 깨짐 없는 PDF 변환 기능

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// A4 실제 크기 정의
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// 여백 설정 (mm)
const MARGIN_TOP = 25;    // 상단 여백
const MARGIN_BOTTOM = 25; // 하단 여백  
const MARGIN_LEFT = 20;   // 좌측 여백
const MARGIN_RIGHT = 20;  // 우측 여백

// DPI 기반 변환 (96 DPI 기준)
const MM_TO_PX = 3.7795275591;

// 픽셀 단위로 변환된 크기
const PAGE_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;   // 794px
const PAGE_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;  // 1123px

// 콘텐츠 영역 크기 (여백 제외)
const CONTENT_WIDTH_PX = (A4_WIDTH_MM - MARGIN_LEFT - MARGIN_RIGHT) * MM_TO_PX;
const CONTENT_HEIGHT_PX = (A4_HEIGHT_MM - MARGIN_TOP - MARGIN_BOTTOM) * MM_TO_PX;

/**
 * A4 페이지 생성
 */
function createA4Page(): HTMLDivElement {
    const page = document.createElement('div');
    page.className = 'pdf-page';
    
    // A4 크기 설정 (전체 페이지)
    page.style.width = `${PAGE_WIDTH_PX}px`;
    page.style.height = `${PAGE_HEIGHT_PX}px`;
    page.style.background = 'white';
    page.style.position = 'relative';
    page.style.overflow = 'hidden';
    page.style.boxSizing = 'border-box';
    page.style.padding = '0'; // 페이지 자체는 패딩 없음
    
    // 콘텐츠 wrapper 생성 (여백 적용)
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'pdf-content-wrapper';
    contentWrapper.style.position = 'absolute';
    contentWrapper.style.top = `${MARGIN_TOP * MM_TO_PX}px`;
    contentWrapper.style.left = `${MARGIN_LEFT * MM_TO_PX}px`;
    contentWrapper.style.width = `${CONTENT_WIDTH_PX}px`;
    contentWrapper.style.height = `${CONTENT_HEIGHT_PX}px`;
    contentWrapper.style.overflow = 'hidden';
    
    // 폰트 및 기본 스타일
    contentWrapper.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', sans-serif";
    contentWrapper.style.fontSize = '12px';
    contentWrapper.style.lineHeight = '1.5';
    contentWrapper.style.color = 'black';
    
    page.appendChild(contentWrapper);
    
    return page;
}

/**
 * HTML을 파싱하여 요소들로 변환
 */
function parseHtmlToElements(html: string): HTMLElement[] {
    const tempDiv = document.createElement('div');
    // HTML을 그대로 사용 (미리보기와 동일하게)
    tempDiv.innerHTML = html;
    
    // 스타일 적용
    tempDiv.style.width = `${CONTENT_WIDTH_PX}px`;
    tempDiv.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', sans-serif";
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.5';
    
    // 모든 요소에 기본 스타일 적용
    tempDiv.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        element.style.color = 'black';
    });
    
    // 빈 단락들은 나중에 필터링에서 제거됨
    
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
        (pre as HTMLElement).style.whiteSpace = 'pre-wrap'; // 공백 보존
        (pre as HTMLElement).style.wordBreak = 'break-all';
    });
    
    tempDiv.querySelectorAll('pre code').forEach(code => {
        (code as HTMLElement).style.backgroundColor = 'transparent'; // pre 안의 code는 배경 제거
        (code as HTMLElement).style.padding = '0';
        (code as HTMLElement).style.fontSize = '11px';
        (code as HTMLElement).style.whiteSpace = 'pre'; // 공백과 줄바꿈 모두 보존
    });
    
    // 인라인 코드 스타일 (pre 밖의 code)
    tempDiv.querySelectorAll('code:not(pre code)').forEach(code => {
        (code as HTMLElement).style.backgroundColor = '#f5f5f5';
        (code as HTMLElement).style.padding = '2px 4px';
        (code as HTMLElement).style.borderRadius = '2px';
        (code as HTMLElement).style.fontSize = '11px';
    });
    
    // BR 태그 처리 및 요소 분리
    const elements: HTMLElement[] = [];
    
    // 모든 최상위 요소 가져오기
    Array.from(tempDiv.children).forEach(child => {
        const element = child as HTMLElement;
        
        // 독립된 BR 태그는 스킵
        if (element.tagName === 'BR') {
            return;
        }
        
        // P 태그 안에 BR이 많으면 분할 고려
        if (element.tagName === 'P') {
            const brCount = (element.innerHTML.match(/<br/gi) || []).length;
            
            // BR이 10개 이상이면 분할
            if (brCount > 10) {
                const parts = element.innerHTML.split(/<br\s*\/?>/gi);
                let currentP = document.createElement('p');
                let lineCount = 0;
                
                parts.forEach((part, index) => {
                    if (part.trim() || index < parts.length - 1) {
                        if (lineCount >= 10 && part.trim()) {
                            // 10줄마다 새 P 태그로 분할
                            if (currentP.innerHTML.trim()) {
                                elements.push(currentP);
                            }
                            currentP = document.createElement('p');
                            lineCount = 0;
                        }
                        
                        if (part.trim()) {
                            currentP.innerHTML += (currentP.innerHTML ? '<br>' : '') + part;
                        } else if (index < parts.length - 1) {
                            currentP.innerHTML += '<br>';
                        }
                        lineCount++;
                    }
                });
                
                if (currentP.innerHTML.trim()) {
                    elements.push(currentP);
                }
            } else {
                // BR이 적으면 그대로 사용
                elements.push(element);
            }
        } else {
            // P 태그가 아닌 다른 요소는 그대로 추가
            elements.push(element);
        }
    });
    
    return elements;
}

/**
 * 요소들을 페이지에 배치
 */
function distributeElementsToPages(elements: HTMLElement[]): HTMLDivElement[] {
    const pages: HTMLDivElement[] = [];
    let currentPage = createA4Page();
    let currentContentWrapper = currentPage.querySelector('.pdf-content-wrapper') as HTMLDivElement;
    let currentHeight = 0;
    
    // 임시 측정용 컨테이너 (실제 콘텐츠 영역과 동일한 스타일)
    const measurer = document.createElement('div');
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.left = '-9999px';
    measurer.style.top = '0';
    measurer.style.width = `${CONTENT_WIDTH_PX}px`;
    measurer.style.fontFamily = "'Noto Sans KR', 'Malgun Gothic', sans-serif";
    measurer.style.fontSize = '12px';
    measurer.style.lineHeight = '1.5';
    measurer.style.boxSizing = 'border-box';
    measurer.style.color = 'black';
    measurer.style.background = 'white';
    document.body.appendChild(measurer);
    
    // 안전 마진 - 페이지 끝부분 여유 공간
    const SAFE_MARGIN = 30; // 페이지 끝에서 30px 여유 (BR 많은 콘텐츠 고려)
    const MAX_HEIGHT = CONTENT_HEIGHT_PX - SAFE_MARGIN;
    
    elements.forEach((element, index) => {
        // 요소 높이 측정
        const clone = element.cloneNode(true) as HTMLElement;
        measurer.innerHTML = '';
        measurer.appendChild(clone);
        
        // 레이아웃 재계산 - 강제 리플로우
        void measurer.offsetHeight;
        
        // 실제 높이 측정 - 정확한 계산을 위해 여러 방법 사용
        const rect = clone.getBoundingClientRect();
        
        // BR 태그 개수 세기
        const brCount = (element.innerHTML.match(/<br/gi) || []).length;
        
        // 기본 높이 계산
        let elementHeight = Math.max(
            rect.height || 30,
            clone.offsetHeight || 30,
            clone.scrollHeight || 30,
            30
        );
        
        // BR 태그가 많으면 추가 높이 보정 (BR 하나당 약 18px)
        if (brCount > 0) {
            // BR이 이미 높이에 포함되어 있지 않은 경우 추가
            const minExpectedHeight = (brCount + 1) * 18; // 줄 높이 기준
            if (elementHeight < minExpectedHeight) {
                elementHeight = minExpectedHeight;
            }
        }
        
        const elementType = element.tagName;
        const elementText = element.textContent?.substring(0, 30) || '';
        
        // 최종 높이 (여백 포함)
        const adjustedHeight = elementHeight + 10; // 요소 간 기본 여백
        
        console.log(`요소 ${index} (${elementType}): 높이 ${adjustedHeight}px${brCount > 0 ? ` (BR ${brCount}개)` : ''}, 현재: ${currentHeight}px/${MAX_HEIGHT}px, 내용: "${elementText}..."`);
        
        // 페이지 넘침 체크
        if (currentHeight + adjustedHeight > MAX_HEIGHT && currentHeight > 0) {
            console.log(`  → 페이지 넘김: ${currentHeight} + ${adjustedHeight} = ${currentHeight + adjustedHeight}px > ${MAX_HEIGHT}px`);
            pages.push(currentPage);
            currentPage = createA4Page();
            currentContentWrapper = currentPage.querySelector('.pdf-content-wrapper') as HTMLDivElement;
            currentHeight = 0;
        }
        
        // 요소를 현재 페이지의 콘텐츠 wrapper에 추가
        const actualElement = element.cloneNode(true) as HTMLElement;
        currentContentWrapper.appendChild(actualElement);
        currentHeight += adjustedHeight;
        console.log(`  → 추가 완료. 새 누적 높이: ${currentHeight}px`);
    });
    
    // 마지막 페이지 추가
    if (currentContentWrapper.children.length > 0) {
        pages.push(currentPage);
        console.log(`마지막 페이지 ${pages.length} 추가 (높이: ${currentHeight}px)`);
    }
    
    // 측정용 컨테이너 제거
    document.body.removeChild(measurer);
    
    console.log(`총 ${pages.length} 페이지 생성 완료`);
    
    return pages;
}

/**
 * PDF 내보내기 메인 함수
 */
export async function exportToPdf(html: string): Promise<void> {
    if (!html || html.trim() === '') {
        alert('PDF로 변환할 내용이 없습니다.');
        return;
    }
    
    console.log('=== PDF 변환 시작 ===');
    console.log(`페이지 크기: ${PAGE_WIDTH_PX}px × ${PAGE_HEIGHT_PX}px`);
    console.log(`여백: 상(${MARGIN_TOP}mm) 하(${MARGIN_BOTTOM}mm) 좌(${MARGIN_LEFT}mm) 우(${MARGIN_RIGHT}mm)`);
    console.log(`콘텐츠 영역: ${CONTENT_WIDTH_PX}px × ${CONTENT_HEIGHT_PX}px`);
    
    // HTML 파싱 및 요소 준비
    const elements = parseHtmlToElements(html);
    console.log(`총 ${elements.length}개 요소 파싱됨`);
    
    // 페이지별로 요소 배치
    const pages = distributeElementsToPages(elements);
    
    console.log(`총 ${pages.length} 페이지 생성됨`);
    
    // 임시 컨테이너 생성 (화면에 보이지 않게)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);
    
    // 웹폰트 로드 대기
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // PDF 생성
    const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
    });
    
    // 각 페이지를 캡처하여 PDF에 추가
    for (let i = 0; i < pages.length; i++) {
        console.log(`페이지 ${i + 1}/${pages.length} 처리 중...`);
        
        // 페이지를 컨테이너에 추가
        container.innerHTML = '';
        container.appendChild(pages[i]);
        
        // 캔버스로 변환
        const canvas = await html2canvas(pages[i], {
            scale: 2, // 고해상도
            useCORS: true,
            logging: false,
            backgroundColor: '#FFFFFF',
            windowWidth: PAGE_WIDTH_PX,
            windowHeight: PAGE_HEIGHT_PX
        });
        
        // PDF에 이미지 추가
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
            pdf.addPage();
        }
        
        // 이미지를 페이지 크기에 맞춰 추가
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    }
    
    // 정리
    document.body.removeChild(container);
    
    // PDF 저장
    pdf.save('document.pdf');
    console.log('PDF 생성 완료!');
}