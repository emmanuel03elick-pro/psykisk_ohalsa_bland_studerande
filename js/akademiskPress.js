let data = await dbQuery('SELECT * FROM student_depression');

let depression = data.filter(x => x.depression == 1);
let notDepressed = data.filter(x => x.depression == 0);

addMdToPage(`## Akademisk press och depression`);


let pressureGroups = [1, 2, 3, 4, 5].map(p => ({
  press: `press ${p}`,
  depression: data.filter(x => x.academic_pressure === p && x.depression === 1).length,
  notDepressed: data.filter(x => x.academic_pressure === p && x.depression === 0).length,
  andelDep: +(data.filter(x => x.academic_pressure === p && x.depression === 1).length /
    data.filter(x => x.academic_pressure === p).length * 100).toFixed(1),

}));

tableFromData({
  data: pressureGroups,
  columnNames: ['Akademisk press', 'Deprimerade', 'Ej deprimerade', 'Andel deprimerade (%)'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(
    pressureGroups.map(x => ({ press: x.press, andelDep: x.andelDep })),
    'press', 'andelDep'
  ),
  options: {
    height: 400,
    title: 'Andel deprimerade per nivå av akademisk press (%)',
    chartArea: { left: 60, right: 20 },
    vAxis: { minValue: 0, maxValue: 100, title: 'Andel deprimerade (%)' },
    colors: ['#5ce0e0'],
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});

addMdToPage(`
Det finns ett tydligt samband: ju högre akademisk press, desto större andel studenter som rapporterar depression.
 
`);


// --- 3. Fördelning över olika timintervaller ---
addMdToPage(`### Andel deprimerade per timintervall`);

// Skapa timintervaller
let intervals = [
  { label: '0-2 timmar', min: 0, max: 2 },
  { label: '2-4 timmar', min: 2, max: 4 },
  { label: '4-6 timmar', min: 4, max: 6 },
  { label: '6-8 timmar', min: 6, max: 8 },
  { label: '8-10 timmar', min: 8, max: 10 },
  { label: '10+ timmar', min: 10, max: 100 }
];

let intervalData = intervals.map(interval => {
  let groupData = data.filter(x => x.work_study_hours >= interval.min && x.work_study_hours < interval.max);
  let depressedCount = groupData.filter(x => x.depression === 1).length;
  let totalCount = groupData.length;
  let depressionRate = totalCount > 0 ? (depressedCount / totalCount * 100).toFixed(1) : 0;

  return {
    intervall: interval.label,
    total: totalCount,
    deprimerade: depressedCount,
    andelDep: depressionRate
  };
});

tableFromData({
  data: intervalData,
  columnNames: ['Timmar per dag', 'Antal studenter', 'Deprimerade', 'Andel deprimerade (%)'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});


addMdToPage(`
Resultaten visar ett tydligt samband mellan akademisk belastning och depression bland studenter. Ju högre akademisk press studenter upplever, desto större andel rapporterar att de är deprimerade. Vid låg press är det en relativt liten andel som mår dåligt, medan det vid hög press är en mycket stor andel.

Samma mönster syns när man tittar på studietid per dag. Andelen deprimerade ökar successivt ju fler timmar studenter studerar. De som studerar kortare tid har lägre andel depression, medan de som studerar många timmar per dag har betydligt högre andel. 
`);

