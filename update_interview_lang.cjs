const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewGrading.tsx', 'utf8');
content = content.replace("import { Check, ChevronLeft, Save } from 'lucide-react';", "import { Check, ChevronLeft, Save } from 'lucide-react';\nimport { useLanguage } from '../contexts/LanguageContext';");
content = content.replace("const [isSaving, setIsSaving] = useState(false);", "const [isSaving, setIsSaving] = useState(false);\n  const { t } = useLanguage();");
content = content.replace(/>Quay lại</g, ">{t('back')}<");
content = content.replace(/>Đang tải...</g, ">{t('loading')}<");
content = content.replace(/>Lưu đánh giá</g, ">{t('save')}<");
fs.writeFileSync('src/components/InterviewGrading.tsx', content);
