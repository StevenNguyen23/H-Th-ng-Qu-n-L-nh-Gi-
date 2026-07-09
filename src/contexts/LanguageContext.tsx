import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'VIET' | 'ENG';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  VIET: {
    'systemName': 'Hệ Thống Quản Lý Đánh Giá Học Sinh',
    'systemSubname': 'Student Management and Assessment System',
    'adminTitle': 'Admin Dashboard',
    'teacherTitle': 'Teacher Dashboard',
    'reportsTitle': 'Báo Cáo Đánh Giá',
    'newTest': 'Tạo bài thi mới',
    'logout': 'Đăng xuất',
    'login': 'Đăng nhập',
    'register': 'Đăng ký',
    'email': 'Email',
    'password': 'Mật khẩu',
    'cancel': 'Hủy',
    'delete': 'Xóa',
    'confirmDelete': 'Xác nhận xóa',
    'deleteWarning': 'Bạn có chắc chắn muốn xóa? Dữ liệu sẽ không thể khôi phục.',
    'loading': 'Đang tải...',
    'noData': 'Chưa có dữ liệu.',
    'student': 'Học sinh',
    'teacher': 'Giáo viên',
    'specialist': 'Chuyên viên',
    'admin': 'Quản trị viên',
    'status': 'Trạng thái',
    'graded': 'Đã chấm',
    'evaluating': 'Đang đánh giá',
    'viewDetails': 'Xem chi tiết',
    'resume': 'Tiếp tục',
    'role': 'Vai trò',
    'name': 'Họ và tên',
    'schoolType': 'Khối',
    'actions': 'Thao tác',
    'features': 'Tính năng',
    'placementTestAccess': 'Quyền Placement Test',
    'allowPlacementTest': 'Cho phép tạo và chấm bài',
    'save': 'Lưu',
    'simulateLogin': 'Mô phỏng Đăng nhập:',
    'backToDashboard': 'Quay lại Dashboard',
    'parent': 'Phụ huynh',
    'startTest': 'Bắt đầu làm bài',
    'currentGrade': 'Lớp hiện tại',
    'targetLevel': 'Cấp độ hướng tới',
    'manageTests': 'Quản lý bài thi (Dashboard)',
    'noPermissionPlacementTest': 'Bạn không có quyền tạo bài Placement Test.',
    'loginTeacherToCreate': 'Vui lòng đăng nhập bằng tài khoản giáo viên để tạo bài kiểm tra cho học sinh.',
    'overviewStats': 'Thống kê tổng quan',
    'evaluatedStudents': 'Học sinh đã đánh giá',
    'activeTeachers': 'Giáo viên hoạt động',
    'deactivatedAccounts': 'Tài khoản bị khóa',
    'accountList': 'Danh sách tài khoản',
    'systemActivity': 'Hoạt động hệ thống',
    'auditLogs': 'Nhật ký hoạt động',
    'fileManagement': 'Quản lý tệp',
    'createNewAccount': 'Tạo tài khoản mới',
    'permanentDelete': 'Xóa vĩnh viễn',
    'confirmPermanentDelete': 'Xác nhận xóa vĩnh viễn',
    'cannotUndo': 'Hành động này không thể hoàn tác.',
    'notGraded': 'Chưa chấm',
    'completed': 'Hoàn thành',
    'gradeInterview': 'Chấm điểm phỏng vấn',
    'viewReport': 'Xem báo cáo',
    'permissionDenied': 'Bạn chưa được cấp quyền',
    'contactAdminForPermission': 'Vui lòng liên hệ Admin để được cấp quyền tạo và chấm bài Placement Test.',
    'target': 'Mục tiêu',
    'loginError': 'Lỗi khi đăng nhập.',
    'registerError': 'Lỗi khi đăng ký.',
    'fullName': 'Họ và Tên',

    'timeRemaining': 'Thời gian còn lại',
    'questionList': 'Bảng câu hỏi',
    'submitting': 'Đang nộp bài...',
    'submitTest': 'Nộp Bài',
    'back': 'Trở về',
    'next': 'Tiếp theo',
    'finish': 'Hoàn thành',
    'multipleChoice': 'Trắc nghiệm',
    'fillIn': 'Điền từ',

    'cancelUppercase': 'HỦY',
    'deleteUppercase': 'XÓA',
    'permanentDeleteUppercase': 'XÓA VĨNH VIỄN',
    'waitingInterview': 'Chờ phỏng vấn',
    'readingScore': 'Điểm đọc hiểu',
    'totalScore': 'Tổng điểm',
    'level': 'Trình độ',
    'details': 'Chi tiết',
    'searchPlaceholder': 'Tìm kiếm bằng tên hoặc email...',
    'all': 'Tất cả',
    'primary': 'Tiểu học',
    'secondary': 'Trung học',
    'deleteUser': 'Xóa người dùng',
    'deleteConfirmPrompt': 'Bạn có chắc chắn muốn xóa bài thi này? Dữ liệu sẽ không thể khôi phục.',
    'errorCreatingUser': 'Lỗi khi tạo người dùng.',
  },
  ENG: {
    'systemName': 'Student Management and Assessment System',
    'systemSubname': 'Hệ Thống Quản Lý Đánh Giá Học Sinh',
    'adminTitle': 'Admin Dashboard',
    'teacherTitle': 'Teacher Dashboard',
    'reportsTitle': 'Assessment Reports',
    'newTest': 'Create New Test',
    'logout': 'Logout',
    'login': 'Login',
    'register': 'Register',
    'email': 'Email',
    'password': 'Password',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'confirmDelete': 'Confirm Deletion',
    'deleteWarning': 'Are you sure you want to delete? Data cannot be recovered.',
    'loading': 'Loading...',
    'noData': 'No data available.',
    'student': 'Student',
    'teacher': 'Teacher',
    'specialist': 'Specialist',
    'admin': 'Admin',
    'status': 'Status',
    'graded': 'Graded',
    'evaluating': 'Evaluating',
    'viewDetails': 'View Details',
    'resume': 'Resume',
    'role': 'Role',
    'name': 'Full Name',
    'schoolType': 'Level',
    'actions': 'Actions',
    'features': 'Features',
    'placementTestAccess': 'Placement Test Access',
    'allowPlacementTest': 'Allow creating and grading',
    'save': 'Save',
    'simulateLogin': 'Simulate Login:',
    'backToDashboard': 'Back to Dashboard',
    'parent': 'Parent',
    'startTest': 'Start Test',
    'currentGrade': 'Current Grade',
    'targetLevel': 'Target Level',
    'manageTests': 'Manage Tests (Dashboard)',
    'noPermissionPlacementTest': 'You do not have permission to create Placement Tests.',
    'loginTeacherToCreate': 'Please log in with a teacher account to create a test for students.',
    'overviewStats': 'Overview Statistics',
    'evaluatedStudents': 'Evaluated Students',
    'activeTeachers': 'Active Teachers',
    'deactivatedAccounts': 'Deactivated Accounts',
    'accountList': 'Account List',
    'systemActivity': 'System Activity',
    'auditLogs': 'Audit Logs',
    'fileManagement': 'File Management',
    'createNewAccount': 'Create New Account',
    'permanentDelete': 'Permanent Delete',
    'confirmPermanentDelete': 'Confirm Permanent Deletion',
    'cannotUndo': 'This action cannot be undone.',
    'notGraded': 'Not Graded',
    'completed': 'Completed',
    'gradeInterview': 'Grade Interview',
    'viewReport': 'View Report',
    'permissionDenied': 'Permission Denied',
    'contactAdminForPermission': 'Please contact the Admin to get permission to create and grade Placement Tests.',
    'target': 'Target',
    'loginError': 'Login error.',
    'registerError': 'Registration error.',
    'fullName': 'Full Name',

    'timeRemaining': 'Time Remaining',
    'questionList': 'Question List',
    'submitting': 'Submitting...',
    'submitTest': 'Submit Test',
    'back': 'Back',
    'next': 'Next',
    'finish': 'Finish',
    'multipleChoice': 'Multiple Choice',
    'fillIn': 'Fill-in',

    'cancelUppercase': 'CANCEL',
    'deleteUppercase': 'DELETE',
    'permanentDeleteUppercase': 'PERMANENT DELETE',
    'waitingInterview': 'Waiting for interview',
    'readingScore': 'Reading Score',
    'totalScore': 'Total Score',
    'level': 'Level',
    'details': 'Details',
    'searchPlaceholder': 'Search by name or email...',
    'all': 'All',
    'primary': 'Primary',
    'secondary': 'Secondary',
    'deleteUser': 'Delete User',
    'deleteConfirmPrompt': 'Are you sure you want to delete this test? Data cannot be recovered.',
    'errorCreatingUser': 'Error creating user.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'VIET' || saved === 'ENG') ? saved : 'VIET';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
