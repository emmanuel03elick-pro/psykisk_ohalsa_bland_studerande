let data = await dbQuery('SELECT * FROM student_depression');

let depression = data.filter(x => x.depression === 1);
let notDepressed = data.filter(x => x.depression === 0);

addMdToPage(`## Sömnvanor och depression`);

let sleepLabels = { 4: '4', 5.5: '5.5', 7.5: '7.5', 9: '9' };

let sleepGroups = [4, 5.5, 7.5, 9].map(s_val => {
  let group = data.filter(x => x.sleep_duration === s_val);
  let dep = group.filter(x => x.depression === 1);
  return {
    sömn: sleepLabels[s_val],
    antal: group.length,
    deprimerade: dep.length,
    andelDep: +(dep.length / group.length * 100).toFixed(1)
  };
});

tableFromData({
  data: sleepGroups,
  columnNames: ['Sömn per natt', 'Antal studenter', 'Deprimerade', 'Andel deprimerade (%)'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});


drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(sleepGroups.map(x => ({ sömn: x.sömn, andelDep: x.andelDep })), 'sömn', 'andelDep'),
  options: {
    height: 400,
    title: 'Andel deprimerade per sömnkategori (%)',
    chartArea: { left: 60, right: 20 },
    vAxis: { minValue: 0, maxValue: 100, title: 'Andel deprimerade (%)' },
    colors: ['#e05ce0'],
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});

addMdToPage(`
Studenter som sover minst (<5h) har den högsta andelen depression. Mönstret pekar på att sömnbrist är starkt förknippad med psykisk ohälsa.

`);

let sleepsDep = depression.map(x => x.sleep_duration);
let sleepsNoDep = notDepressed.map(x => x.sleep_duration);

addMdToPage(`#### Kostvanor och depression`);

// Dietary habits
let dietLabels = { 0: 'Ohälsosam', 1: 'Måttlig', 2: 'Hälsosam' };
let dietGroups = [0, 1, 2].map(d => {
  let group = data.filter(x => x.dietary_habits === d);
  let dep = group.filter(x => x.depression === 1);
  return {
    kost: dietLabels[d],
    antal: group.length,
    deprimerade: dep.length,
    andelDep: +(dep.length / group.length * 100).toFixed(1),
  };
});

//addMdToPage(`### Kostvanor och depression`);

tableFromData({
  data: dietGroups,
  columnNames: ['Kostvanor', 'Antal', 'Deprimerade', 'Andel deprimerade (%)'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});

drawGoogleChart({
  type: 'BarChart',
  data: makeChartFriendly(dietGroups.map(x => ({ kost: x.kost, andelDep: x.andelDep })), 'kost', 'andelDep'),
  options: {
    height: 300,
    title: 'Andel deprimerade per kostkategori (%)',
    chartArea: { left: 100, right: 20 },
    hAxis: { minValue: 0, maxValue: 100 },
    colors: ['#5ca05c'],
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});

addMdToPage(`Studenter med ohälsosamma matvanor är mer benägna att rapportera depression. Det kan vara ett dubbelriktat samband — depression kan leda till sämre kostvanor, och vice versa.`);


addMdToPage(`
Resultaten visar att både sömnvanor och kost hänger ihop med depression bland studenter. När det gäller sömn ser man att de som sover minst (runt 4 timmar per natt) har den högsta andelen depression, medan de som sover mer (cirka 9 timmar) har en lägre andel. Det tyder på att för lite sömn är kopplat till sämre psykiskt mående.

Även kostvanor visar ett tydligt mönster. Studenter med ohälsosam kost har den högsta andelen depression, medan de med hälsosam kost har den lägsta. De som äter “mitt emellan” ligger också på en mellannivå.

Sammanfattningsvis verkar både tillräcklig sömn och hälsosamma matvanor hänga ihop med bättre psykiskt mående.
`);
