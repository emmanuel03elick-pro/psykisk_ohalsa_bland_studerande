let data = await dbQuery('SELECT * FROM student_depression');

addToPage('<h3>Student Mental Health Study </h3>');


addMdToPage(`
## Översikt
 
Datasetet innehåller enkätsvar från **${data.length.toLocaleString('sv-SE')} 
universitetsstuderande i Indien** och undersöker sambandet mellan depression och
faktorer som studiebörda, sömnvanor, ekonomisk stress och mer.`);


// Filtrera data
let depressed = data.filter(x => x.depression === 1);
let notDepressed = data.filter(x => x.depression === 0);
let men = data.filter(x => x.gender === 1);
let women = data.filter(x => x.gender === 0);

// Beräkna totalt antal
let total = data.length;

// Andel deprimerade totalt
let depRate = ((depressed.length / total) * 100).toFixed(1);


// Lägg till rubrik
addMdToPage(`### Depressionstatistik`);

// Skapa översiktsdata med andelar
let overviewData = [
  { grupp: 'Deprimerade', antal: depressed.length, andel: `${depRate}%` },
  { grupp: 'Inte deprimerade', antal: notDepressed.length, andel: `${((notDepressed.length / total) * 100).toFixed(1)}%` },
  { grupp: 'Samtliga', antal: total, andel: '100%' },
];

// Visa tabell
tableFromData({
  data: overviewData,
  columnNames: ['Grupp', 'Antal', 'Andel av total (%)'],
});


drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(
    [{ grupp: 'Deprimerade', antal: depressed.length }, { grupp: 'Inte deprimerade', antal: notDepressed.length }],
    'Grupp', 'Antal'
  ),
  options: {
    height: 380,
    is3D: true,
    title: `Andel deprimerade: ${depRate}% av ${data.length.toLocaleString('sv-SE')} studenter`,
    colors: ['#f2df0a', '#e05c5c'],
    legend: { position: 'bottom' },

  },
});

addMdToPage(`
**Nästan 3 av 5 studenter** (${depRate}%) rapporterar att de upplever depression. Det är en alarmerande hög siffra.
`);


addMdToPage(`### Åldersfördelning`);

let ages = data.map(x => x.age);
let agesDepressed = depressed.map(x => x.age);
let agesNotDepressed = notDepressed.map(x => x.age);

tableFromData({
  data: [
    { grupp: 'Samtliga', min: s.min(ages), max: s.max(ages), median: s.median(ages), medel: s.mean(ages), sd: s.sampleStandardDeviation(ages) },
    { grupp: 'Deprimerade', min: s.min(agesDepressed), max: s.max(agesDepressed), median: s.median(agesDepressed), medel: s.mean(agesDepressed), sd: s.sampleStandardDeviation(agesDepressed) },
    { grupp: 'Inte deprimerade', min: s.min(agesNotDepressed), max: s.max(agesNotDepressed), median: s.median(agesNotDepressed), medel: s.mean(agesNotDepressed), sd: s.sampleStandardDeviation(agesNotDepressed) },
  ],
  columnNames: ['Grupp', 'Yngst', 'Äldst', 'Medianålder', 'Medelålder', 'sd'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});

addMdToPage(`### Depression per kön`);

let deprWomen = women.filter(x => x.depression == 1);
let deprMen = men.filter(x => x.depression == 1);

let genderData = [
  { kön: 'Kvinnor', deprimerade: deprWomen.length, totalt: women.length, andel: (deprWomen.length / women.length * 100).toFixed(1) + '%' },
  { kön: 'Män', deprimerade: deprMen.length, totalt: men.length, andel: (deprMen.length / men.length * 100).toFixed(1) + '%' },
];

tableFromData({
  data: genderData,
  columnNames: ['Kön', 'Deprimerade', 'Totalt', 'Andel deprimerade'],
});

drawGoogleChart({
  type: 'BarChart',
  data: makeChartFriendly(
    [
      { kön: 'Kvinnor', andel: deprWomen.length / women.length * 100 },
      { kön: 'Män', andel: deprMen.length / men.length * 100 },
    ],
    'Kön', 'Andel deprimerade (%)'
  ),
  options: {
    height: 300,
    title: 'Andel deprimerade per kön (%)',
    chartArea: { left: 100, right: 20 },
    hAxis: { minValue: 0, maxValue: 100 },
    legend: 'none',
  },
});

addMdToPage(`
Resultatet visar att en stor andel av studenterna upplever depression. Av totalt 27 901 studenter är cirka 58,5 % deprimerade, vilket innebär att mer än hälften mår psykiskt dåligt. Detta tyder på att depression är ett omfattande problem i denna grupp.

När man tittar på ålder syns inga stora skillnader, men deprimerade studenter är i genomsnitt något yngre än de som inte är deprimerade. Skillnaden är dock ganska liten, vilket tyder på att depression förekommer i alla åldrar inom studentgruppen.

När det gäller kön är skillnaderna i princip obefintliga. Andelen deprimerade är nästan exakt lika stor bland kvinnor och män (cirka 58,5–58,6 %). Detta visar att depression drabbar båda könen i ungefär samma utsträckning.
`);




