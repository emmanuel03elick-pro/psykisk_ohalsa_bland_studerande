let data = await dbQuery('SELECT * FROM student_depression');


addMdToPage(`## Suicidala tankar & Familjehistorik `);

// Suicidala tankar
addMdToPage(`### Suicidala tankar`);

let suicidal = data.filter(x => x.suicidal_thoughts == 1);
let notSuicidal = data.filter(x => x.suicidal_thoughts == 0);
let deprSuicidal = suicidal.filter(x => x.depression == 1);
let deprNotSuicidal = notSuicidal.filter(x => x.depression == 1);

let suicidalData = [
  { grupp: 'Haft suicidala tankar', antal: suicidal.length, deprimerade: deprSuicidal.length, andel: (deprSuicidal.length / suicidal.length * 100).toFixed(1) + '%' },
  { grupp: 'Ej suicidala tankar', antal: notSuicidal.length, deprimerade: deprNotSuicidal.length, andel: (deprNotSuicidal.length / notSuicidal.length * 100).toFixed(1) + '%' },
];

tableFromData({
  data: suicidalData,
  columnNames: ['Grupp', 'Antal', 'Varav deprimerade', 'Andel deprimerade'],
});

drawGoogleChart({
  type: 'BarChart',
  data: makeChartFriendly([
    { grupp: 'Haft suicidala tankar', andel: parseFloat(suicidalData[0].andel) },
    { grupp: 'Ej suicidala tankar', andel: parseFloat(suicidalData[1].andel) },
  ], 'Grupp', 'Andel deprimerade (%)'),
  options: {
    height: 300,
    title: 'Andel deprimerade – suicidala tankar (Ja/Nej)',
    chartArea: { left: 200, right: 20 },
    hAxis: { minValue: 0, maxValue: 100 },
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});

// Familjehistorik
addMdToPage(`### Familjehistorik av psykisk ohälsa`);

let famYes = data.filter(x => x.family_history == 1);
let famNo = data.filter(x => x.family_history == 0);
let deprFamYes = famYes.filter(x => x.depression == 1);
let deprFamNo = famNo.filter(x => x.depression == 1);

let famData = [
  { grupp: 'Familjehistorik: Ja', antal: famYes.length, deprimerade: deprFamYes.length, andel: (deprFamYes.length / famYes.length * 100).toFixed(1) + '%' },
  { grupp: 'Familjehistorik: Nej', antal: famNo.length, deprimerade: deprFamNo.length, andel: (deprFamNo.length / famNo.length * 100).toFixed(1) + '%' },
];

tableFromData({
  data: famData,
  columnNames: ['Grupp', 'Antal', 'Varav deprimerade', 'Andel deprimerade'],
});

drawGoogleChart({
  type: 'BarChart',
  data: makeChartFriendly([
    { grupp: 'Familjehistorik: Ja', andel: parseFloat(famData[0].andel) },
    { grupp: 'Familjehistorik: Nej', andel: parseFloat(famData[1].andel) },
  ], 'Grupp', 'Andel deprimerade (%)'),
  options: {
    height: 300,
    title: 'Andel deprimerade – familjehistorik av psykisk ohälsa',
    chartArea: { left: 200, right: 20 },
    hAxis: { minValue: 0, maxValue: 100 },
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});
addMdToPage(`Studenter med familjehistorik av psykisk ohälsa visar en markant högre andel depression. Ärftlighet verkar spela en viktig roll.`);

addMdToPage(`
Resultatet visar att vissa riskfaktorer har ett tydligt samband med depression hos studenter. Framför allt syns en stor skillnad mellan studenter som har haft suicidala tankar och de som inte har det. Bland dem som har haft suicidala tankar är cirka 79 % deprimerade, medan motsvarande andel bland dem utan sådana tankar är ungefär 23 %. Detta tyder på en mycket stark koppling mellan suicidala tankar och depression.

När det gäller familjehistorik av psykisk ohälsa är sambandet svagare men fortfarande tydligt. Cirka 61 % av studenter med familjehistorik är deprimerade, jämfört med ungefär 56 % bland dem utan sådan bakgrund.

Sammanfattningsvis visar resultaten att suicidala tankar är en mycket stark riskfaktor för depression, medan ärftlighet också spelar en roll, men i mindre utsträckning. 
`);