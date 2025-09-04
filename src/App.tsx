import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainApp from './pages/MainApp';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/privacy" element={<PrivacyPolicyWrapper />} />
        <Route path="/terms" element={<TermsOfServiceWrapper />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function PrivacyPolicyWrapper() {
  return (
    <div className="policy-page">
      <nav style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← 메인으로 돌아가기
        </Link>
      </nav>
      <PrivacyPolicy />
    </div>
  );
}

function TermsOfServiceWrapper() {
  return (
    <div className="policy-page">
      <nav style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#4b5563', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← 메인으로 돌아가기
        </Link>
      </nav>
      <TermsOfService />
    </div>
  );
}

export default App;