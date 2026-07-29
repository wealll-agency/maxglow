import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const css = fs.readFileSync('C:/Users/User/OneDrive/Desktop/style.css', 'utf8');
    fs.mkdirSync('C:/Users/User/OneDrive/Desktop/maxglow/frontend/public/assets/css', { recursive: true });
    fs.writeFileSync('C:/Users/User/OneDrive/Desktop/maxglow/frontend/public/assets/css/style.css', css);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
