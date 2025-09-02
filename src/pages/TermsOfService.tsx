import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>이용약관</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>발효일: {new Date().toLocaleDateString('ko-KR')}</p>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>1. 서비스 소개</h2>
        <p>
          MD Converter Korean (이하 "본 서비스")은 마크다운 문서를 다양한 형식(HTML, PDF, DOCX, PPT, Excel, TXT)으로 
          변환하는 무료 웹 기반 도구입니다. 모든 변환 작업은 사용자의 브라우저에서 로컬로 처리되며, 
          서버에 데이터를 저장하지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>2. 이용약관 동의</h2>
        <p>
          본 서비스를 이용함으로써 귀하는 본 이용약관에 동의하는 것으로 간주됩니다. 
          본 약관에 동의하지 않는 경우 서비스 이용을 중단해 주시기 바랍니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>3. 서비스 이용</h2>
        <h3>3.1 무료 이용</h3>
        <p>본 서비스는 모든 사용자에게 무료로 제공됩니다.</p>
        
        <h3>3.2 사용 제한</h3>
        <p>다음과 같은 행위는 금지됩니다:</p>
        <ul>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>다른 사용자의 서비스 이용을 방해하는 행위</li>
          <li>서비스를 이용한 영리 목적의 무단 재배포</li>
          <li>서비스의 소스 코드를 무단으로 역공학하는 행위</li>
          <li>불법적이거나 부적절한 콘텐츠 변환</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>4. 지적재산권</h2>
        <h3>4.1 서비스 소유권</h3>
        <p>
          본 서비스의 모든 권리는 © Mrbaeksang에게 있습니다. 
          서비스의 디자인, 로고, 소스 코드는 저작권법의 보호를 받습니다.
        </p>
        
        <h3>4.2 사용자 콘텐츠</h3>
        <p>
          사용자가 변환하는 모든 콘텐츠의 저작권은 원 저작자에게 있습니다. 
          본 서비스는 사용자의 콘텐츠를 저장하거나 소유하지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>5. 책임 제한</h2>
        <h3>5.1 서비스 제공</h3>
        <p>
          본 서비스는 "있는 그대로" 제공되며, 명시적이거나 묵시적인 어떠한 보증도 하지 않습니다.
        </p>
        
        <h3>5.2 손해 배상</h3>
        <p>
          서비스 제공자는 서비스 이용으로 인해 발생하는 직접적, 간접적, 우발적, 특수한 손해에 대해 
          책임을 지지 않습니다. 여기에는 다음이 포함되나 이에 국한되지 않습니다:
        </p>
        <ul>
          <li>데이터 손실 또는 손상</li>
          <li>서비스 중단으로 인한 손실</li>
          <li>변환 오류로 인한 문서 품질 저하</li>
          <li>제3자 서비스 장애</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>6. 광고</h2>
        <p>
          본 서비스는 Google AdSense를 통해 광고를 표시할 수 있습니다. 
          광고 콘텐츠는 Google에 의해 제공되며, 서비스 제공자는 광고 내용에 대해 책임지지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>7. 개인정보보호</h2>
        <p>
          개인정보 처리에 관한 사항은 별도의 개인정보처리방침에 따릅니다. 
          본 서비스는 사용자의 문서나 개인정보를 수집하거나 저장하지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>8. 서비스 변경 및 중단</h2>
        <p>
          서비스 제공자는 다음의 권리를 보유합니다:
        </p>
        <ul>
          <li>사전 통지 없이 서비스를 수정, 업데이트 또는 개선</li>
          <li>일시적 또는 영구적으로 서비스 중단</li>
          <li>서비스의 일부 기능 제한 또는 제거</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>9. 약관 변경</h2>
        <p>
          본 이용약관은 필요에 따라 변경될 수 있으며, 변경된 약관은 서비스에 게시된 시점부터 효력이 발생합니다. 
          중요한 변경사항이 있을 경우 서비스 내 공지를 통해 알려드립니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>10. 준거법 및 관할</h2>
        <p>
          본 약관은 대한민국 법률에 따라 해석되고 집행됩니다. 
          본 약관과 관련된 분쟁은 서울중앙지방법원을 제1심 관할법원으로 합니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>11. 문의</h2>
        <p>
          서비스 이용약관에 대한 문의사항이 있으시면 다음으로 연락주시기 바랍니다:
        </p>
        <p>
          이메일: <a href="mailto:qortkdgus95@gmail.com">qortkdgus95@gmail.com</a><br/>
          연락처: 010-8767-1264
        </p>
      </section>

      <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '14px' }}>
          © 2024 MD Converter Korean. All rights reserved © Mrbaeksang
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;