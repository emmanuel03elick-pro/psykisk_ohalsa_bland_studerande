
export function shapiroWilk(x) {
  const n = x.length;
  const sorted = [...x].sort((a, b) => a - b);
  const mean = x.reduce((s, v) => s + v, 0) / n;

  // Beräkna SS (sum of squares)
  const ss = x.reduce((s, v) => s + (v - mean) ** 2, 0);

  // Approximerade a-koefficienter (fungerar för n <= 50)
  const a = [
    0, 0.7071, 0.6872, 0.6646, 0.6431, 0.6233,
    0.6052, 0.5888, 0.5739, 0.5601, 0.5475
  ];

  let W_num = 0;
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const coef = a[i + 1] || 0;
    W_num += coef * (sorted[n - 1 - i] - sorted[i]);
  }

  const W = (W_num ** 2) / ss;

  // Approximera p-värde via normalapproximation
  const mu = -1.2725 + 1.0521 * Math.log(n);
  const sigma = 1.0308 - 0.26763 * Math.log(n);
  const z = (Math.log(1 - W) - mu) / sigma;
  const p = 1 - normalCDF(z);

  return { W: +W.toFixed(4), p: +p.toFixed(4) };
}

// Hjälpfunktion: kumulativ normalfördelning
export function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 +
    t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}


// T-test

export function tTest(group1, group2) {
  const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr => {
    const m = mean(arr);
    return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  };

  const n1 = group1.length, n2 = group2.length;
  const m1 = mean(group1), m2 = mean(group2);
  const v1 = variance(group1), v2 = variance(group2);

  // t-statistika (Welch's t-test, kräver ej lika varians)
  const t = (m1 - m2) / Math.sqrt(v1 / n1 + v2 / n2);

  // Frihetsgrader (Welch–Satterthwaite)
  const df = (v1 / n1 + v2 / n2) ** 2 /
    ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));

  // Approximera p-värde
  const p = 2 * (1 - tCDF(Math.abs(t), df));

  return {
    t: +t.toFixed(4),
    df: +df.toFixed(1),
    p: +p.toFixed(4),
    mean1: +m1.toFixed(2),
    mean2: +m2.toFixed(2)
  };
}

// Approximation av t-fördelningens CDF
export function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

export function incompleteBeta(x, a, b) {
  // Enkel Lanczos-approximation
  let result = 0;
  for (let i = 0; i < 100; i++) {
    result += Math.pow(x, a + i) * Math.pow(1 - x, b) / (a + i);
  }
  return result;
}

