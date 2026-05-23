const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/cms/quizzes/page.tsx',
  'src/app/cms/rules/page.tsx',
  'src/app/gamification/items/page.tsx',
  'src/app/gamification/leaderboard/page.tsx',
  'src/app/gamification/missions/page.tsx',
  'src/app/gamification/achievements/page.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace #FFFDF0 (Wrapper background) with transparent or white
    content = content.replace(/bg-\[\#FFFDF0\]/g, 'bg-white');
    content = content.replace(/bg-\[\#FFFDF0\]\/30/g, 'bg-slate-50/50');
    content = content.replace(/bg-\[\#FFFDF0\]\/55/g, 'bg-slate-50');
    
    // Replace #FFFBEB (Card/Inner background) with slate-50
    content = content.replace(/bg-\[\#FFFBEB\]/g, 'bg-slate-50');
    
    // Replace #FEF9C3 (Borders) with slate-100 or slate-200
    content = content.replace(/border-\[\#FEF9C3\]/g, 'border-slate-100');
    content = content.replace(/divide-\[\#FEF9C3\]/g, 'divide-slate-100');
    
    // Extra replacements
    content = content.replace(/text-slate-655/g, 'text-slate-600');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
