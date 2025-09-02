import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>개인정보처리방침</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>최종 업데이트: {new Date().toLocaleDateString('ko-KR')}</p>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>1. 개인정보 수집 및 이용</h2>
        <p>
          MD Converter Korean (이하 "본 서비스")은 사용자의 개인정보를 수집하지 않습니다. 
          모든 마크다운 변환 작업은 사용자의 브라우저에서 로컬로 처리되며, 
          서버로 전송되거나 저장되지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>2. 쿠키 사용</h2>
        <p>
          본 서비스는 다음과 같은 목적으로 쿠키를 사용합니다:
        </p>
        <ul>
          <li>사용자 경험 개선을 위한 로컬 스토리지 활용 (마지막 작성 내용 임시 저장)</li>
          <li>Google Analytics를 통한 익명 사용 통계 수집</li>
          <li>Google AdSense 광고 표시 (광고 개인화를 위한 쿠키 포함)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>3. Google Analytics</h2>
        <p>
          본 서비스는 Google Analytics를 사용하여 익명화된 사용 통계를 수집합니다. 
          수집되는 정보는 다음과 같습니다:
        </p>
        <ul>
          <li>방문자 수 및 페이지뷰</li>
          <li>사용자의 대략적인 지역 정보 (국가/도시 수준)</li>
          <li>사용 중인 브라우저 및 운영체제</li>
          <li>참조 사이트 정보</li>
        </ul>
        <p>
          Google Analytics는 개인을 식별할 수 있는 정보를 수집하지 않으며, 
          IP 주소는 익명화되어 처리됩니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>4. Google AdSense</h2>
        <p>
          본 서비스는 Google AdSense를 통해 광고를 표시합니다. 
          Google은 광고 개인화를 위해 쿠키를 사용할 수 있으며, 
          사용자는 Google 광고 설정 페이지(
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            www.google.com/settings/ads
          </a>
          )에서 개인화 광고를 비활성화할 수 있습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>5. 제3자 서비스</h2>
        <p>본 서비스는 다음의 제3자 서비스를 사용합니다:</p>
        <ul>
          <li>Google Analytics - 사용 통계 분석</li>
          <li>Google AdSense - 광고 표시</li>
          <li>Vercel Analytics - 성능 모니터링</li>
        </ul>
        <p>
          각 서비스의 개인정보처리방침은 해당 서비스 제공자의 웹사이트에서 확인하실 수 있습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>6. 데이터 보안</h2>
        <p>
          본 서비스는 사용자의 개인정보를 수집하거나 저장하지 않으므로, 
          데이터 유출의 위험이 없습니다. 모든 문서 변환 작업은 
          사용자의 브라우저에서만 처리되며, 외부로 전송되지 않습니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>7. 아동의 개인정보</h2>
        <p>
          본 서비스는 13세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 
          13세 미만의 아동은 부모 또는 법적 보호자의 동의 하에 서비스를 이용해야 합니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>8. 개인정보처리방침 변경</h2>
        <p>
          본 개인정보처리방침은 필요에 따라 변경될 수 있으며, 
          중요한 변경사항이 있을 경우 서비스 내 공지를 통해 알려드립니다.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>9. 문의</h2>
        <p>
          개인정보처리방침에 대한 문의사항이 있으시면 다음으로 연락주시기 바랍니다:
        </p>
        <p>
          이메일: <a href="mailto:qortkdgus95@gmail.com">qortkdgus95@gmail.com</a><br/>
          연락처: 010-8767-1264
        </p>
      </section>

      <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '14px' }}>
          © 2024 MD Converter Korean. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;