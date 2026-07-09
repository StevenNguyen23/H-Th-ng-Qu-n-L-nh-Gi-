const fs = require('fs');

let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const vietAdditions = `
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
`;

const engAdditions = `
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
`;

content = content.replace("    'fillIn': 'Điền từ',\n  },", "    'fillIn': 'Điền từ',\n" + vietAdditions + "  },");
content = content.replace("    'fillIn': 'Fill-in',\n  }", "    'fillIn': 'Fill-in',\n" + engAdditions + "  }");

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
