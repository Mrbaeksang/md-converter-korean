# 📝 MD 변환기 by Mrbaeksang(devcom.kr)

> 💡 **사용법을 까먹으셨나요?** 언제든지 상단의 **설명서** 버튼을 다시 누르면 이 화면을 볼 수 있습니다!

## ☕ 개발자에게 커피 후원하기
이 도구가 도움이 되셨다면 개발자는 행복합니다 😊
개발자에게 커피 한 잔은 큰 힘이 됩니다!

<div style="display: flex; gap: 16px; margin: 20px 0; flex-wrap: wrap; align-items: center;">
  <!-- 모바일: 카카오페이 링크 버튼 -->
  <a href="https://qr.kakaopay.com/2810060110000071236650569c404083" target="_blank" rel="noopener noreferrer" class="mobile-only" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #FEE500 0%, #FFEB00 100%); border-radius: 8px; text-decoration: none; color: #3C1E1E; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    💛 카카오페이로 커피 후원하기
  </a>
  
  <!-- PC: 카카오페이 QR -->
  <div class="desktop-only" style="display: none; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="/src/assets/kakao-qr.png" alt="카카오페이 QR" style="width: 160px; height: 160px; border-radius: 8px;" />
    <span style="font-size: 14px; color: #3C1E1E; font-weight: 600;">💛 카카오페이 QR</span>
    <span style="font-size: 12px; color: #6b7280;">스캔하여 후원하기</span>
  </div>

  <!-- 모바일: Buy Me a Coffee 링크 버튼 -->
  <a href="https://buymeacoffee.com/mrbaeksang" target="_blank" rel="noopener noreferrer" class="mobile-only" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #FFDD00 0%, #FBB034 100%); border-radius: 8px; text-decoration: none; color: #141414; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    ☕ Buy Me a Coffee
  </a>
  
  <!-- PC: Buy Me a Coffee QR + 링크 -->
  <div class="desktop-only" style="display: none; flex-direction: column; align-items: center; gap: 8px;">
    <div style="padding: 16px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <a href="https://buymeacoffee.com/mrbaeksang" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
        <img src="/src/assets/buymeacoffee-qr.png" alt="Buy Me a Coffee QR" style="width: 160px; height: 160px; border-radius: 8px; cursor: pointer;" />
      </a>
      <a href="https://buymeacoffee.com/mrbaeksang" target="_blank" rel="noopener noreferrer" style="font-size: 14px; color: #141414; font-weight: 600; text-decoration: none;">☕ Buy Me a Coffee</a>
      <span style="font-size: 12px; color: #6b7280;">스캔 또는 클릭</span>
    </div>
  </div>
</div>

<style>
@media (max-width: 768px) {
  .mobile-only { display: inline-flex !important; }
  .desktop-only { display: none !important; }
}
@media (min-width: 769px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: flex !important; }
}
</style>

---

## 🚀 3분 안에 마스터하기!

### 🎯 직접 작성하기
왼쪽 편집기에 아래 마크다운 문법으로 직접 작성하고, 오른쪽에서 실시간으로 확인하세요!

### 📱 ChatGPT/Claude/Gemini 활용하기
1. **아래 서비스 중 하나를 클릭해서 접속하세요:**
   - 🤖 [ChatGPT (클릭)](https://chatgpt.com/)
   - 🧠 [Claude (클릭)](https://claude.ai/)
   - ✨ [Gemini (클릭)](https://gemini.google.com/)
2. **"마크다운 형식으로 작성해줘"** 라고 요청
3. 답변 전체 복사 → 왼쪽 편집기에 **붙여넣기(Ctrl+V)**
4. 원하는 형식으로 **다운로드** 클릭!

> 💡 **예시 프롬프트:** 
> - "2025년 사업계획서를 **마크다운 형식**으로 작성해줘"
> - "회의록을 **마크다운 표**를 포함해서 정리해줘"
> - "프레젠테이션용 내용을 **# 제목별로 구분**해서 작성해줘"

---

## 📖 5초만에 배우는 마크다운 문법

마크다운은 **일반 텍스트에 간단한 기호**를 추가해서 서식을 만드는 방법입니다:

<table>
<tr>
  <th>입력하면</th>
  <th>결과</th>
  <th>설명</th>
</tr>
<tr>
  <td><code># 제목</code></td>
  <td><h1 style="margin:0;font-size:1.5em;">큰 제목</h1></td>
  <td>PPT에서는 새 슬라이드로!</td>
</tr>
<tr>
  <td><code>## 부제목</code></td>
  <td><h2 style="margin:0;font-size:1.2em;">중간 제목</h2></td>
  <td>섹션 구분</td>
</tr>
<tr>
  <td><code>**굵게**</code></td>
  <td><strong>굵게</strong></td>
  <td>중요한 내용 강조</td>
</tr>
<tr>
  <td><code>- 항목</code></td>
  <td>• 항목</td>
  <td>목록 만들기</td>
</tr>
<tr>
  <td><code>1. 첫째</code></td>
  <td>1. 첫째</td>
  <td>순서 있는 목록</td>
</tr>
</table>

### 💎 고급 기능 (표 만들기)
```markdown
| 이름 | 나이 | 직업 |
|------|------|------|
| 김철수 | 30 | 개발자 |
| 이영희 | 25 | 디자이너 |
```

위처럼 입력하면 깔끔한 표가 완성됩니다! 엑셀로 내보내면 이 표만 추출됩니다.

---

## 📥 내보내기 형식 완벽 가이드

| 형식 | 아이콘 | 최적 용도 | 특징 | 파일명 |
|:---:|:---:|---|---|---|
| **HTML** | 📄 | 블로그/웹사이트 | 순수 HTML 코드<br>복사해서 붙여넣기 가능 | document.html |
| **Styled HTML** | 🎨 | 이메일/완성 문서 | 디자인 포함<br>바로 열어볼 수 있음 | document_styled.html |
| **PDF** | 📑 | 공식 문서/인쇄 | A4 사이즈<br>한글 폰트 완벽 지원<br>⏳ 10초 정도 소요 | document.pdf |
| **DOCX** | 📝 | 보고서/과제 | Word에서 편집 가능<br>표와 목록 자동 변환 | document.docx |
| **PPT** | 🎯 | 발표 자료 | `#` 제목마다 새 슬라이드<br>16:9 화면 비율 | presentation.pptx |
| **엑셀** | 📊 | 데이터 정리 | 표만 추출<br>각 표는 별도 시트로 | document.xlsx |
| **TXT** | 📋 | 메모장 | 모든 서식 제거<br>순수 텍스트만 | document.txt |

---

## 💡 실전 사용 팁

### 🎯 PPT 만들기 꿀팁
- `#` 하나 = 새 슬라이드 (제목)
- `##` 둘 = 같은 슬라이드 내 부제목
- 긴 내용은 자동으로 다음 슬라이드로 분할됩니다

### 📊 엑셀용 표 작성법
- 표만 있는 문서를 만들면 깔끔한 엑셀 파일 완성
- 여러 개의 표는 각각 다른 시트로 저장됨

### 📝 Word 문서 팁
- 모든 마크다운 서식이 Word 스타일로 자동 변환
- 목차는 Word에서 "참조 → 목차" 메뉴로 추가 가능

---

## 🔒 보안 & 프라이버시
> **100% 안전한 브라우저 내 처리**
> 
> ✅ 서버 전송 없음 - 모든 변환은 여러분의 브라우저에서만  
> ✅ 완벽한 프라이버시 - 작성 내용은 어디에도 저장되지 않음  
> ✅ 오프라인 작동 - 한 번 열면 인터넷 없어도 OK  
> ✅ 광고/추적 없음 - 순수한 도구로만 제공

---

## 🆘 자주 묻는 질문

**Q: 한글이 깨져요!**  
A: 모든 파일은 UTF-8로 저장되어 한글이 절대 깨지지 않습니다. 혹시 깨진다면 열어보는 프로그램 설정을 확인해주세요.

**Q: 이미지는 어떻게 넣나요?**  
A: 현재는 텍스트만 지원합니다. 이미지는 Word나 PPT로 변환 후 직접 추가해주세요.

**Q: 파일이 저장되나요?**  
A: 브라우저를 새로고침해도 작성 중인 내용은 자동 저장됩니다. (로컬 저장소 이용)

**Q: 모바일에서도 되나요?**  
A: 네! 모바일에서는 상단 탭으로 편집/미리보기를 전환하며 사용하세요.

---

## 🔗 링크
<div style="display: flex; gap: 16px; margin: 20px 0; flex-wrap: wrap;">
  <a href="https://devcom.kr" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #141414; transition: all 0.2s;">
    🌐 개발자 사이트
  </a>
  <a href="mailto:qortkdgus95@gmail.com" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #141414; transition: all 0.2s;">
    ✉️ 문의/버그 제보
  </a>
  <a href="https://www.instagram.com/baek.__.sang/" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #141414; transition: all 0.2s;">
    📷 인스타그램
  </a>
</div>

---

## 💜 이용 후 만족하셨나요?
소중한 지인들에게 이 사이트를 공유해주세요!

<button onclick="navigator.clipboard.writeText('https://md-converter-korean.vercel.app/').then(() => alert('사이트 주소가 복사되었습니다! 지인들에게 공유해주세요 😊')).catch(() => alert('복사에 실패했습니다. 주소: https://md-converter-korean.vercel.app/'))" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  📤 사이트 주소 복사하기
</button>

---

<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
  © 2025 Mrbaeksang. All rights reserved.<br/>
  본 사이트와 모든 소스코드의 저작권은 Mrbaeksang에게 있습니다.
</div>