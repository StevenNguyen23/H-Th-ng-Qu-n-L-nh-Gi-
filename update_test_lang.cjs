const fs = require('fs');

let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const vietAdditions = `
    'timeRemaining': 'Thời gian còn lại',
    'questionList': 'Bảng câu hỏi',
    'submitting': 'Đang nộp bài...',
    'submitTest': 'Nộp Bài',
    'back': 'Trở về',
    'next': 'Tiếp theo',
    'finish': 'Hoàn thành',
    'multipleChoice': 'Trắc nghiệm',
    'fillIn': 'Điền từ',
`;

const engAdditions = `
    'timeRemaining': 'Time Remaining',
    'questionList': 'Question List',
    'submitting': 'Submitting...',
    'submitTest': 'Submit Test',
    'back': 'Back',
    'next': 'Next',
    'finish': 'Finish',
    'multipleChoice': 'Multiple Choice',
    'fillIn': 'Fill-in',
`;

content = content.replace("    'fullName': 'Họ và Tên'\n  },", "    'fullName': 'Họ và Tên',\n" + vietAdditions + "  },");
content = content.replace("    'fullName': 'Full Name'\n  }", "    'fullName': 'Full Name',\n" + engAdditions + "  }");

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);

let testContent = fs.readFileSync('src/components/Test.tsx', 'utf8');
testContent = testContent.replace("import { Clock, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';", "import { Clock, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';\nimport { useLanguage } from '../contexts/LanguageContext';");
testContent = testContent.replace("const [studentInfo, setStudentInfo] = useState<any>(null);", "const [studentInfo, setStudentInfo] = useState<any>(null);\n  const { t } = useLanguage();");
testContent = testContent.replace(/>Thời gian còn lại</g, ">{t('timeRemaining')}<");
testContent = testContent.replace(/>Bảng câu hỏi</g, ">{t('questionList')}<");
testContent = testContent.replace(/>Đang nộp bài...</g, ">{t('submitting')}<");
testContent = testContent.replace(/>Nộp Bài</g, ">{t('submitTest')}<");
testContent = testContent.replace(/>Trở về</g, ">{t('back')}<");
testContent = testContent.replace(/>Tiếp theo</g, ">{t('next')}<");
fs.writeFileSync('src/components/Test.tsx', testContent);

