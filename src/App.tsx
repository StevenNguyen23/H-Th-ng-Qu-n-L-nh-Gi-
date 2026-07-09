import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Test from './components/Test';
import TeacherLogin from './components/TeacherLogin';
import TeacherDashboard from './components/TeacherDashboard';
import InterviewGrading from './components/InterviewGrading';
import FinalReport from './components/FinalReport';
import ReviewMode from './components/ReviewMode';
import CambridgeEval from './components/CambridgeEval';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/test" element={<Test />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/eval" element={<CambridgeEval />} />
        <Route path="/teacher/grade/:id" element={<InterviewGrading />} />
        <Route path="/report/:id" element={<FinalReport />} />
        <Route path="/review/:id" element={<ReviewMode />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
