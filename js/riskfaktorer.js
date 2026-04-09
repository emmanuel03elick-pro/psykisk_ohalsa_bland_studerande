// STATISTIKFUNKTIONER

function shapiroWilk(x) {
  const n = x.length;
  if (n < 3) return { W: 1, p: 1 };

  const sorted = [...x].sort((a, b) => a - b);
  const mean = x.reduce((s, v) => s + v, 0) / n;
  const ss = x.reduce((s, v) => s + (v - mean) ** 2, 0);

  const a = [0, 0.7071, 0.6872, 0.6646, 0.6431, 0.6233, 0.6052, 0.5888, 0.5739, 0.5601, 0.5475];
  let W_num = 0;
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const coef = a[i + 1] || 0;
    W_num += coef * (sorted[n - 1 - i] - sorted[i]);
  }
  const W = (W_num ** 2) / ss;

  const mu = -1.2725 + 1.0521 * Math.log(n);
  const sigma = 1.0308 - 0.26763 * Math.log(n);
  const z = (Math.log(1 - W) - mu) / sigma;
  const p = 1 - normalCDF(z);

  return { W: +W.toFixed(4), p: +p.toFixed(4) };
}

function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

function tTest(group1, group2) {
  const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr => {
    const m = mean(arr);
    return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  };
  const n1 = group1.length, n2 = group2.length;
  const m1 = mean(group1), m2 = mean(group2);
  const v1 = variance(group1), v2 = variance(group2);

  const t = (m1 - m2) / Math.sqrt(v1 / n1 + v2 / n2);
  const df = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  const p = 2 * (1 - tCDF(Math.abs(t), df));

  return {
    t: +t.toFixed(4),
    df: +df.toFixed(1),
    p: +p.toFixed(4),
    mean1: +m1.toFixed(2),
    mean2: +m2.toFixed(2)
  };
}

function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

function incompleteBeta(x, a, b) {
  let result = 0;
  for (let i = 0; i < 100; i++) {
    result += Math.pow(x, a + i) * Math.pow(1 - x, b) / (a + i);
  }
  return result;
}

function normalPdf(x, mean, sd) {
  if (sd === 0) return 0;
  return (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
}


// HUVUDANALYS

let data = await dbQuery('SELECT * FROM student_depression');

addMdToPage(`## Statistisk analys: Suicidala tankar och familjehistorik`);

addMdToPage(`
Här undersöker vi skillnader i **akademisk press** mellan grupperna med statistiska tester.
Analysen följer denna ordning för varje faktor:
1. Kontroll av normalfördelning (Shapiro-Wilk)
2. Hypotesprövning (Welch’s t-test)
3. p-värde och tolkning
4. Visualisering (histogram + normalkurvor)
`);

// SUICIDALA TANKAR 
addMdToPage(`### Suicidala tankar`);

let suicidalYes = data.filter(x => x.suicidal_thoughts === 1);
let suicidalNo = data.filter(x => x.suicidal_thoughts === 0);

let pressureYes = suicidalYes.map(x => x.academic_pressure);
let pressureNo = suicidalNo.map(x => x.academic_pressure);

// Shapiro-Wilk
addMdToPage(`#### Kontroll av normalfördelning (Shapiro-Wilk)`);
let shapiroYes = shapiroWilk(pressureYes);
let shapiroNo = shapiroWilk(pressureNo);

addMdToPage(`
| Grupp                        | W-värde | p-värde | Tolkning |
|------------------------------|---------|---------|----------|
| Har haft suicidala tankar    | ${shapiroYes.W} | ${shapiroYes.p} | ${shapiroYes.p < 0.05 ? ' Avviker från normalfördelning' : '✅ Normalfördelad'} |
| Har ej haft suicidala tankar | ${shapiroNo.W}  | ${shapiroNo.p}  | ${shapiroNo.p < 0.05 ? ' Avviker från normalfördelning' : '✅ Normalfördelad'} |
`);

// t-test
addMdToPage(`#### Hypotesprövning (Welch’s t-test)`);
let tResultSuicidal = tTest(pressureYes, pressureNo);

addMdToPage(`
| Mått                  | (JA)suicidala | suicidala(NEJ)|
|-----------------------|----------------------|--------------------------|
| Medelvärde            | **${tResultSuicidal.mean1}** | **${tResultSuicidal.mean2}** |
| t-värde               | ${tResultSuicidal.t} | |
| Frihetsgrader (df)    | ${tResultSuicidal.df} | |
| **p-värde**           | **${tResultSuicidal.p}** | |
`);

// Tolkning
addMdToPage(`#### p-värde och tolkning`);
addMdToPage(`
**Slutsats:** p-värdet är **${tResultSuicidal.p}**.  
${tResultSuicidal.p < 0.05
    ? 'Eftersom p < 0,05 **förkastar vi nollhypotesen**. Det finns en **statistiskt signifikant skillnad** i akademisk press.'
    : 'p ≥ 0,05 → Skillnaden är **inte statistiskt signifikant**.'}
`);

// Histogram
addMdToPage(`#### `);
let meanYes = tResultSuicidal.mean1;
let sdYes = Math.sqrt(pressureYes.reduce((s, v) => s + (v - meanYes) ** 2, 0) / (pressureYes.length - 1));
let meanNo = tResultSuicidal.mean2;
let sdNo = Math.sqrt(pressureNo.reduce((s, v) => s + (v - meanNo) ** 2, 0) / (pressureNo.length - 1));

let chartDataSuic = [['Akademisk press', 'Har suicidala tankar', 'Ej suicidala tankar', 'Normalkurva - Ja', 'Normalkurva - Nej']];
const bins = [0, 1, 2, 3, 4, 5];

for (let i = 0; i < bins.length; i++) {
  let binCenter = bins[i] + 0.5;
  let countYes = pressureYes.filter(v => v >= bins[i] && v < bins[i] + 1).length;
  let countNo = pressureNo.filter(v => v >= bins[i] && v < bins[i] + 1).length;
  let normYes = normalPdf(binCenter, meanYes, sdYes) * pressureYes.length;
  let normNo = normalPdf(binCenter, meanNo, sdNo) * pressureNo.length;
  chartDataSuic.push([binCenter, countYes, countNo, normYes, normNo]);
}

drawGoogleChart({
  type: 'ComboChart',
  data: chartDataSuic,
  options: {
    height: 450,
    title: 'Fördelning av akademisk press – Suicidala tankar',
    hAxis: { title: 'Akademisk press (0–5)' },
    vAxis: { title: 'Antal studenter' },
    seriesType: 'bars',
    series: {
      2: { type: 'line', curveType: 'function', color: '#e53935', lineWidth: 3 },
      3: { type: 'line', curveType: 'function', color: '#1e88e5', lineWidth: 3 }
    },
    legend: { position: 'top' },
    animation: { startup: true, duration: 800 }
  }
});

//  FAMILJEHISTORIK 
addMdToPage(`### Familjehistorik av psykisk ohälsa`);

let famYes = data.filter(x => x.family_history === 1);
let famNo = data.filter(x => x.family_history === 0);

let pressureFamYes = famYes.map(x => x.academic_pressure);
let pressureFamNo = famNo.map(x => x.academic_pressure);

// Shapiro-Wilk
addMdToPage(`#### Kontroll av normalfördelning (Shapiro-Wilk)`);
let shapiroFamYes = shapiroWilk(pressureFamYes);
let shapiroFamNo = shapiroWilk(pressureFamNo);

addMdToPage(`
| Grupp                        | W-värde | p-värde | Tolkning |
|------------------------------|---------|---------|----------|
| Har familjehistorik          | ${shapiroFamYes.W} | ${shapiroFamYes.p} | ${shapiroFamYes.p < 0.05 ? ' Avviker' : ' Normalfördelad'} |
| Ingen familjehistorik        | ${shapiroFamNo.W}  | ${shapiroFamNo.p}  | ${shapiroFamNo.p < 0.05 ? ' Avviker' : ' Normalfördelad'} |
`);

// t-test
addMdToPage(`#### Hypotesprövning (Welch’s t-test)`);
let tResultFam = tTest(pressureFamYes, pressureFamNo);

addMdToPage(`
| Mått                  |(JA)familjehistorik |familjehistorik(NEJ) |
|-----------------------|---------------------|------------------------|
| Medelvärde            | **${tResultFam.mean1}** | **${tResultFam.mean2}** |
| t-värde               | ${tResultFam.t}     | |
| **p-värde**           | **${tResultFam.p}** | |
`);

// Tolkning
addMdToPage(`#### p-värde och tolkning`);
addMdToPage(`
**Slutsats:** p-värdet är **${tResultFam.p}**.  
${tResultFam.p < 0.05
    ? 'Eftersom p < 0,05 **förkastar vi nollhypotesen**. Det finns en **statistiskt signifikant skillnad**.'
    : 'p ≥ 0,05 → Skillnaden är **inte statistiskt signifikant**.'}
`);

// Histogram
addMdToPage(`#### `);
let meanFamYes = tResultFam.mean1;
let sdFamYes = Math.sqrt(pressureFamYes.reduce((s, v) => s + (v - meanFamYes) ** 2, 0) / (pressureFamYes.length - 1));
let meanFamNo = tResultFam.mean2;
let sdFamNo = Math.sqrt(pressureFamNo.reduce((s, v) => s + (v - meanFamNo) ** 2, 0) / (pressureFamNo.length - 1));

let chartDataFam = [['Akademisk press', 'Har familjehistorik', 'Ingen familjehistorik', 'Normalkurva - Ja', 'Normalkurva - Nej']];

for (let i = 0; i < bins.length; i++) {
  let binCenter = bins[i] + 0.5;
  let countYes = pressureFamYes.filter(v => v >= bins[i] && v < bins[i] + 1).length;
  let countNo = pressureFamNo.filter(v => v >= bins[i] && v < bins[i] + 1).length;
  let normYes = normalPdf(binCenter, meanFamYes, sdFamYes) * pressureFamYes.length;
  let normNo = normalPdf(binCenter, meanFamNo, sdFamNo) * pressureFamNo.length;
  chartDataFam.push([binCenter, countYes, countNo, normYes, normNo]);
}

drawGoogleChart({
  type: 'ComboChart',
  data: chartDataFam,
  options: {
    height: 450,
    title: 'Fördelning av akademisk press – Familjehistorik',
    hAxis: { title: 'Akademisk press (0–5)' },
    vAxis: { title: 'Antal studenter' },
    seriesType: 'bars',
    series: {
      2: { type: 'line', curveType: 'function', color: '#e53935', lineWidth: 3 },
      3: { type: 'line', curveType: 'function', color: '#1e88e5', lineWidth: 3 }
    },
    legend: { position: 'top' },
    animation: { startup: true, duration: 800 }
  }
});

// SAMMANFATTNING 
addMdToPage(`## Sammanfattning`);

addMdToPage(`
**Huvudresultat:**

• Studenter som **haft suicidala tankar** har signifikant högre akademisk press (p = ${tResultSuicidal.p}) jämfört med de som inte har det.  
• Studenter med **familjehistorik** av psykisk ohälsa har ${tResultFam.p < 0.05 ? 'signifikant' : 'inte signifikant'} högre akademisk press (p = ${tResultFam.p}).

**Slutsats:**  
Suicidala tankar är den starkaste riskfaktorn i denna analys, både när det gäller depression och upplevd akademisk press. Familjehistorik visar en svagare effekt.

Dessa resultat pekar på att studenter med suicidala tankar är en särskilt utsatt grupp som behöver extra stöd.
`);

