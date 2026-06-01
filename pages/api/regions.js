// GET /api/regions — 전국 읍면동 데이터 서빙
// data/regions.json 이 있으면 nationwide: true, 없으면 nationwide: false
import fs   from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'regions.json');
  if (!fs.existsSync(filePath)) {
    return res.json({ nationwide: false, regions: [] });
  }
  try {
    const regions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ nationwide: true, regions });
  } catch {
    res.json({ nationwide: false, regions: [] });
  }
}
