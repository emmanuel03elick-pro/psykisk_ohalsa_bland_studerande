let data = await dbQuery('SELECT * FROM student_depression');

let depression = data.filter(x => x.depression == 1);
let notDepressed = data.filter(x => x.depression == 0);

addMdToPage(`## Financial och depression`);


let fsLevels = [1, 2, 3, 4, 5].map(Nivå => ({
  press: `Nivå ${Nivå}`,
  depression: data.filter(x => x.financial_stress === Nivå && x.depression === 1).length,
  notDepressed: data.filter(x => x.financial_stress === Nivå && x.depression === 0).length,
  andelDep: +(data.filter(x => x.financial_stress === Nivå && x.depression === 1).length /
    data.filter(x => x.financial_stress === Nivå).length * 100).toFixed(1),

}));

tableFromData({
  data: fsLevels,
  columnNames: ['Ekonomisk press', 'Deprimerade', 'Ej deprimerade', 'Andel deprimerade (%)'],
  numberFormatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
});

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(
    fsLevels.map(x => ({ press: x.press, andelDep: x.andelDep })),
    'press', 'andelDep'
  ),
  options: {
    height: 400,
    title: 'Andel deprimerade per nivå av ekonomisk press (%)',
    chartArea: { left: 60, right: 20 },
    vAxis: { minValue: 0, maxValue: 100, title: 'Andel deprimerade (%)' },
    colors: ['#5ce0e0'],
    legend: 'none',
    animation: { startup: true, duration: 800, easing: 'out' },
  },
});

addMdToPage(`
Vi ser ett tydligt mönster: ju högre ekonomisk stress, desto högre andel deprimerade studenter.
 
`);

addMdToPage(`
Resultatet visar ett tydligt samband mellan ekonomisk stress och depression hos studenter. Ju högre nivå av ekonomisk press, desto större andel av studenterna är deprimerade. Vid låg ekonomisk stress (nivå 1) är ungefär en tredjedel deprimerade, medan andelen ökar steg för steg med varje nivå. Vid den högsta nivån av ekonomisk stress (nivå 5) är över 80 procent deprimerade.

Detta tyder på att ekonomiska svårigheter har en stark koppling till psykisk ohälsa. Enkelt uttryckt: ju mer ekonomisk stress en student upplever, desto större är risken att må dåligt psykiskt. 
`);
