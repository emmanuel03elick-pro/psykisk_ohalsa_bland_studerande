let data = await csvLoad('/csv/student_depression.db', ';');

createMenu('Students mental health study', [
  { name: 'Överblick', script: 'start.js' },
  { name: 'Akademisk Press', script: 'akademiskPress.js' },
  { name: 'Sömn & Kost', script: 'somn_kost.js' },
  { name: 'Financial stress', script: 'financial.js' },
  { name: 'Suicidala tankar & Familjehistorik', script: 'tankar.js' },
  { name: 'Riskfaktorer', script: 'riskfaktorer.js' }

]);
