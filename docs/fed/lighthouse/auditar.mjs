// Roda o Lighthouse nas telas internas (com sessão de demonstração no localStorage).
import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:4173';
const alvos = [
  { nome: 'entrar', url: `${BASE}/#/entrar`, sessao: null },
  { nome: 'cadastro', url: `${BASE}/#/cadastro`, sessao: null },
  { nome: 'atleta-inicio', url: `${BASE}/#/atleta`, sessao: 'u-joao' },
  { nome: 'atleta-evolucao', url: `${BASE}/#/atleta/evolucao`, sessao: 'u-joao' },
  { nome: 'atleta-peneiras', url: `${BASE}/#/atleta/peneiras`, sessao: 'u-kaua' },
  { nome: 'equipe-painel', url: `${BASE}/#/equipe`, sessao: 'u-carla' },
  { nome: 'equipe-treino', url: `${BASE}/#/equipe/treino`, sessao: 'u-carla' },
];

const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
const browser = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });
const resumo = [];
for (const alvo of alvos) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/#/entrar`, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1500)); // espera os efeitos do React gravarem o estado inicial
  await page.evaluate((sessao) => {
    localStorage.clear();
    window.localStorage.setItem('pele-academia:sessao:v1', JSON.stringify(sessao));
  }, alvo.sessao);
  await new Promise((r) => setTimeout(r, 800));
  await page.close();
  const resultado = await lighthouse(alvo.url, { port: chrome.port, output: ['json', 'html'], logLevel: 'error', disableStorageReset: true });
  const notas = Object.fromEntries(Object.entries(resultado.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const finalUrl = resultado.lhr.finalDisplayedUrl;
  console.log(alvo.nome, finalUrl, notas);
  fs.writeFileSync(`lh-${alvo.nome}.report.json`, resultado.report[0]);
  fs.writeFileSync(`lh-${alvo.nome}.report.html`, resultado.report[1]);
  resumo.push({ tela: alvo.nome, url: finalUrl, ...notas });
}
fs.writeFileSync('resumo-lighthouse.json', JSON.stringify(resumo, null, 2));
await browser.disconnect();
await chrome.kill();
