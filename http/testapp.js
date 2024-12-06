// app.mjs
import express from 'express'; // 최신 import 문법
import { join } from 'path'; // ES 모듈에서 path 가져오기
import { fileURLToPath } from 'url'; // ES 모듈에서 __dirname 대체

const app = express();
const PORT = 3000;

// __dirname 대체 (ES 모듈에서는 기본적으로 __dirname이 없음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
console.log(__dirname);
// 정적 파일 경로 설정
app.use(express.static(join(__dirname, 'public')));

// 기본 라우트
app.get('/', async (req, res) => {
  res.sendFile(join(__dirname, 'market', 'market.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
