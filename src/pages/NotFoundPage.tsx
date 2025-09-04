import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* 404 Error Section */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span className="material-symbols-outlined">home</span>
            메인 페이지로 돌아가기
          </Link>
        </div>

        {/* Service Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            MD 변환기 서비스 소개
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-blue-600 mb-3">
                🚀 주요 기능
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                  <span>마크다운을 다양한 형식으로 변환 (Word, PDF, Excel, PPT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                  <span>한글 인코딩 완벽 지원 - 깨짐 없는 변환</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                  <span>실시간 미리보기 기능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                  <span>모든 처리가 브라우저에서 - 100% 보안</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-blue-600 mb-3">
                💡 이런 분들께 추천합니다
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm mt-1">arrow_forward</span>
                  <span>ChatGPT 결과물을 문서로 저장하고 싶은 분</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm mt-1">arrow_forward</span>
                  <span>마크다운 문서를 프레젠테이션으로 변환하려는 분</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm mt-1">arrow_forward</span>
                  <span>기술 문서를 PDF로 배포하려는 개발자</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm mt-1">arrow_forward</span>
                  <span>한글 깨짐 없이 안전하게 변환하고 싶은 모든 분</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
            자주 찾는 페이지
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/"
              className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow text-center"
            >
              <span className="material-symbols-outlined text-blue-600 text-3xl mb-2">edit_document</span>
              <h4 className="font-semibold text-slate-800">MD 변환기</h4>
              <p className="text-sm text-slate-600 mt-1">마크다운 변환 시작하기</p>
            </Link>
            
            <Link
              to="/privacy"
              className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow text-center"
            >
              <span className="material-symbols-outlined text-green-600 text-3xl mb-2">privacy_tip</span>
              <h4 className="font-semibold text-slate-800">개인정보처리방침</h4>
              <p className="text-sm text-slate-600 mt-1">개인정보 보호 정책</p>
            </Link>
            
            <Link
              to="/terms"
              className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow text-center"
            >
              <span className="material-symbols-outlined text-purple-600 text-3xl mb-2">gavel</span>
              <h4 className="font-semibold text-slate-800">이용약관</h4>
              <p className="text-sm text-slate-600 mt-1">서비스 이용 조건</p>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            도움이 필요하신가요?
          </h3>
          <p className="text-slate-600 mb-6">
            MD 변환기는 완전 무료로 제공되는 오픈소스 프로젝트입니다.<br />
            문제가 있거나 기능 제안이 있으시면 언제든지 연락해 주세요.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/mrbaeksang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="material-symbols-outlined">support</span>
              사용 가이드 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}