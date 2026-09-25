# -*- coding: utf-8 -*-
"""PDF da entrega FED (Sprint 3): capa, links, prints, GitHub, Tailwind, acessibilidade, vídeo."""
import base64, json, pathlib, html
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).parent
PROJ = pathlib.Path("../..")
FONTES = PROJ / "node_modules/@fontsource"
LH = json.loads((AQUI / "lighthouse/resumo-lighthouse.json").read_text())

INTEGRANTES = [("Guilherme de Paula Correia", "RM572126", "feature/entrada-e-cadastro", "#1", "Abertura, Entrar (Google/Apple), Cadastro, design system"),
               ("João Vitor Barbosa Silva", "RM570109", "feature/area-do-atleta", "#2", "Início, Peneiras e Como chegar, Check-in, Evolução/cartão, Talentos, Perfil"),
               ("Lucas Rodrigues de Carvalho", "RM573788", "feature/area-da-equipe", "#3", "Painel, Avaliar treino, Times, Jogos, Peneiras/candidatos, Ficha e Encaminhar")]


def b64(caminho):
    return base64.b64encode(pathlib.Path(caminho).read_bytes()).decode()


def img(caminho, estilo=""):
    return f'<img src="data:image/png;base64,{b64(caminho)}" style="{estilo}" alt="">'


def fonte(rel):
    return b64(FONTES / rel)


CSS = f"""
@font-face {{ font-family: 'Big Shoulders Display'; font-weight: 800; src: url(data:font/woff2;base64,{fonte('big-shoulders-display/files/big-shoulders-display-latin-800-normal.woff2')}) format('woff2'); }}
@font-face {{ font-family: 'Instrument Sans'; font-weight: 400; src: url(data:font/woff2;base64,{fonte('instrument-sans/files/instrument-sans-latin-400-normal.woff2')}) format('woff2'); }}
@font-face {{ font-family: 'Instrument Sans'; font-weight: 600; src: url(data:font/woff2;base64,{fonte('instrument-sans/files/instrument-sans-latin-600-normal.woff2')}) format('woff2'); }}
@font-face {{ font-family: 'Instrument Sans'; font-weight: 700; src: url(data:font/woff2;base64,{fonte('instrument-sans/files/instrument-sans-latin-700-normal.woff2')}) format('woff2'); }}
@page {{ size: A4; margin: 16mm 14mm 16mm 14mm; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: 'Instrument Sans', Arial, sans-serif; color: #0b1f3a; font-size: 10.5pt; line-height: 1.45; }}
h1, h2, h3 {{ font-family: 'Big Shoulders Display', Impact, sans-serif; font-weight: 800; text-transform: uppercase; line-height: 0.95; margin: 0; color: #0b1f3a; }}
h1 {{ font-size: 40pt; }} h2 {{ font-size: 24pt; margin: 0 0 8pt; padding-bottom: 6pt; border-bottom: 3px solid #eda335; }} h3 {{ font-size: 14pt; margin: 12pt 0 4pt; color: #2f77a6; }}
p {{ margin: 0 0 7pt; }}
.secao {{ page-break-before: always; }}
.capa {{ height: 255mm; display: flex; flex-direction: column; justify-content: space-between; background: #0b1f3a; color: #fff; padding: 22mm 18mm; border-radius: 6mm; }}
.capa h1 {{ color: #fff; font-size: 54pt; }}
.capa .rotulo {{ color: #eda335; }}
.rotulo {{ font-size: 8.5pt; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #eda335; margin-bottom: 6pt; }}
table {{ border-collapse: collapse; width: 100%; margin: 4pt 0 10pt; font-size: 9.5pt; }}
th, td {{ border: 1px solid #d3dce6; padding: 5pt 7pt; text-align: left; vertical-align: top; }}
th {{ background: #0b1f3a; color: #fff; font-size: 8.5pt; letter-spacing: 0.08em; text-transform: uppercase; }}
.capa table th {{ background: #eda335; color: #0b1f3a; }}
.capa td {{ border-color: rgba(255,255,255,.25); }}
.grade {{ display: grid; gap: 8pt; }}
.g3 {{ grid-template-columns: repeat(3, 1fr); }} .g2 {{ grid-template-columns: repeat(2, 1fr); }}
.print {{ border: 1px solid #d3dce6; border-radius: 8pt; overflow: hidden; background: #fff; }}
.print img {{ width: 100%; display: block; }}
.legenda {{ font-size: 8.5pt; color: #55657a; text-align: center; padding: 4pt 6pt; border-top: 1px solid #e3eaf2; }}
.placeholder {{ border: 2px dashed #eda335; border-radius: 8pt; padding: 18pt; text-align: center; color: #8a4b00; background: #fff8ec; font-weight: 600; margin: 8pt 0; }}
pre {{ background: #0b1f3a; color: #e3eaf2; padding: 10pt 12pt; border-radius: 8pt; font-size: 8pt; line-height: 1.4; white-space: pre-wrap; margin: 6pt 0 10pt; }}
.ok {{ color: #1b6b43; font-weight: 700; }}
.nota {{ font-size: 9pt; color: #55657a; }}
.pontos {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8pt; margin: 8pt 0; }}
.ponto {{ background: #eef2f6; border-radius: 8pt; padding: 10pt; text-align: center; }}
.ponto strong {{ display: block; font-family: 'Big Shoulders Display'; font-size: 30pt; line-height: 1; color: #1b6b43; }}
ul {{ margin: 0 0 8pt 16pt; padding: 0; }} li {{ margin-bottom: 3pt; }}
"""

telas_mobile = [("mobile-entrar", "Entrar"), ("mobile-atleta-inicio", "Início do atleta"), ("mobile-equipe-treino", "Avaliar treino")]
telas_tablet = [("tablet-atleta-evolucao", "Evolução"), ("tablet-equipe-painel", "Painel da equipe")]
telas_desktop = [("desktop-atleta-inicio", "Início do atleta"), ("desktop-equipe-treino", "Avaliar treino")]
extras_mobile = [("mobile-candidato-peneiras", "Peneiras (candidato)"), ("mobile-atleta-cuidado", "Rede de cuidado"), ("mobile-equipe-times", "Times")]


def bloco_prints(lista, cls="g3", altura=None):
    itens = []
    for arq, rotulo in lista:
        estilo = f"max-height:{altura};object-fit:cover;object-position:top" if altura else ""
        itens.append(f'<div class="print">{img(AQUI / "prints" / f"{arq}.png", estilo)}<div class="legenda">{html.escape(rotulo)}</div></div>')
    return f'<div class="grade {cls}">{"".join(itens)}</div>'


linhas_lh = "".join(f"<tr><td>{r['tela']}</td><td><code>{html.escape(r['url'].replace('http://localhost:4173', ''))}</code></td><td class='ok'>{r['performance']}</td><td class='ok'>{r['accessibility']}</td><td class='ok'>{r['best-practices']}</td><td class='ok'>{r['seo']}</td></tr>" for r in LH)
linhas_contrib = "".join(f"<tr><td>{n}</td><td>{rm}</td><td><code>{b}</code></td><td>{pr}</td><td>{t}</td></tr>" for n, rm, b, pr, t in INTEGRANTES)

wcag = [
    ("1.4.3 Contraste mínimo", "Tokens com contraste ≥ 4,5:1 (texto azul-escuro #0b1f3a sobre fundos claros; branco sobre marca). Verificado por axe/Lighthouse em 7 telas.", "theme.css"),
    ("1.4.4 Redimensionar texto", "Layout fluido em rem; testado a 200 % sem perda de conteúdo.", "todas"),
    ("1.4.10 Refluxo", "Sem rolagem horizontal em 390 px (prints deste PDF).", "todas"),
    ("2.1.1 Teclado", "Todas as ações em botões/links nativos; abas com setas; diálogos fecham com Esc.", "Layout, Abas, Como chegar"),
    ("2.1.2 Sem armadilha", "Abertura tem botão Pular focável; app fica inert só enquanto ela dura.", "Abertura.tsx"),
    ("2.3.3 Animações", "prefers-reduced-motion desliga a abertura e as transições.", "abertura.css"),
    ("2.4.1 Pular blocos", "Link 'Pular para o conteúdo' como primeiro item focável.", "Layout.tsx"),
    ("2.4.2 Título da página", "Cada tela define o título (useTitulo).", "lib/useTitulo.ts"),
    ("2.4.7 Foco visível", "Contorno dourado de 3 px em todos os elementos focáveis.", "theme.css"),
    ("2.5.5 Tamanho do alvo", "Alvos de toque de 44 px (botões, abas, barra de navegação).", "componentes/ui"),
    ("3.1.1 Idioma", "lang=\"pt-BR\" no documento.", "index.html"),
    ("3.3.1 / 3.3.3 Erros", "Mensagens ligadas ao campo (aria-describedby, aria-invalid), resumo com role=alert e sugestão de correção.", "Cadastro, Entrar"),
    ("3.3.2 Rótulos", "Todo campo tem label visível; dicas por aria-describedby.", "componentes/ui/Campo"),
    ("4.1.2 Nome, função, valor", "Botões de alternância com aria-pressed, abas com padrão tablist, diálogos com role=dialog.", "componentes/ui"),
    ("4.1.3 Mensagens de status", "Avisos (toasts) em região aria-live=polite.", "componentes/ui/Aviso"),
]
linhas_wcag = "".join(f"<tr><td>{c}</td><td>{h}</td><td><code>{o}</code></td></tr>" for c, h, o in wcag)

quadros = [q for q in sorted((AQUI / "quadros").glob("q-*.png"), key=lambda a: int(a.stem.split("-")[1])) if int(q.stem.split("-")[1]) in (9, 44, 66, 86)]
grade_quadros = "".join(f'<div class="print">{img(q)}<div class="legenda">{q.stem.split("-")[1]} s</div></div>' for q in quadros)

HTML = f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>FED · Pelé Academia · Grupo Zenyth</title><style>{CSS}</style></head><body>

<section class="capa">
  <div>
    <div class="rotulo">FIAP · Engenharia de Software · 1º ano (RJ) · Front-End Design Engineering · Sprint 3</div>
    <h1>Pelé Academia</h1>
    <p style="font-size:14pt;margin-top:10pt;max-width:120mm">MVP em React + Tailwind · da peneira à formação do atleta. Captar é o começo, manter é o desafio.</p>
  </div>
  <div>
    <div class="rotulo">Grupo Zenyth</div>
    <table><tr><th>Integrante</th><th>RM</th><th>Branch</th><th>PR</th></tr>
    {"".join(f"<tr><td>{n}</td><td>{rm}</td><td>{b}</td><td>{pr}</td></tr>" for n, rm, b, pr, _ in INTEGRANTES)}</table>
    <p class="nota" style="color:rgba(255,255,255,.7)">Rio de Janeiro · setembro de 2026</p>
  </div>
</section>

<section class="secao">
  <h2>1 · Links da entrega</h2>
  <table>
    <tr><th>Item</th><th>Link</th><th>Testado em aba anônima</th></tr>
    <tr><td>Repositório público no GitHub</td><td>https://github.com/jjoaosilva7/peleacademy</td><td>☐</td></tr>
    <tr><td>Deploy (Vercel)</td><td>https://SEU-PROJETO.vercel.app</td><td>☐</td></tr>
    <tr><td>Protótipo navegável (feito com Claude, no lugar do Figma)</td><td>https://claude.ai/artifact/R9vKJzVTYYeRwdUC12RULb</td><td>☑</td></tr>
    <tr><td>Apresentação (slides em HTML)</td><td>https://claude.ai/artifact/71rMADfh4yxxeavct1zb5R</td><td>☑</td></tr>
    <tr><td>Vídeo de demonstração (1 min 33 s, com trecho só por teclado)</td><td>https://SEU-LINK-DO-VIDEO (YouTube não listado ou Drive)</td><td>☐</td></tr>
  </table>
  <p class="nota">Substitua os links acima antes de exportar a versão final e marque as caixas depois de abrir cada um em uma janela anônima.</p>

  <h3>Como rodar</h3>
  <pre>git clone https://github.com/jjoaosilva7/peleacademy.git
cd peleacademy
npm install
npm run dev        # http://localhost:5173
npm run build      # produção em dist/</pre>
  <p>Contas de demonstração (senha <code>pele2026</code>): <code>kaua@exemplo.com</code> (candidato), <code>joao@exemplo.com</code> (atleta), <code>lucas@exemplo.com</code> (atleta em alerta) e <code>tecnico@peleacademia.com.br</code> (equipe). A tela de entrar tem atalhos para cada uma.</p>

  <h3>Stack</h3>
  <ul>
    <li>React 18 + TypeScript, Vite 6, React Router 7 (HashRouter, funciona em qualquer hospedagem estática).</li>
    <li>Tailwind CSS v4 com o design system em tokens (<code>src/styles/theme.css</code>), temas claro e escuro.</li>
    <li>Fontes auto-hospedadas (Big Shoulders Display e Instrument Sans), ícones lucide-react, gráficos em SVG próprio.</li>
    <li>Áreas do atleta e da equipe carregadas sob demanda (<code>React.lazy</code>); dados de demonstração em localStorage.</li>
  </ul>
</section>

<section class="secao">
  <h2>2 · Responsividade · celular (390 px)</h2>
  {bloco_prints(telas_mobile, "g3")}
  <div style="height:8pt"></div>
  {bloco_prints(extras_mobile, "g3", altura="88mm")}
  <p class="nota">Capturas em 390 × 844 (iPhone 14), escala 2×. Nenhuma tela tem rolagem horizontal; a barra de navegação vira uma pílula flutuante inferior e os cartões ocupam uma coluna.</p>
</section>

<section class="secao">
  <h2>3 · Responsividade · tablet (768 px) e desktop (1280 px)</h2>
  {bloco_prints(telas_tablet, "g2", altura="105mm")}
  <div style="height:8pt"></div>
  {bloco_prints(telas_desktop, "g2", altura="95mm")}
  <p class="nota">No tablet a navegação vai para a barra superior em pílula e as grades passam a duas colunas; no desktop, três colunas e o cartão do jogador ao lado do painel.</p>
</section>

<section class="secao">
  <h2>4 · GitHub · branches e Pull Requests</h2>
  <p>Cada integrante trabalhou em uma branch própria a partir da <code>main</code> e integrou por Pull Request revisado por outro integrante (roteiro em <code>docs/guia-github.md</code>).</p>
  <table><tr><th>Integrante</th><th>RM</th><th>Branch</th><th>PR</th><th>Telas / módulos</th></tr>{linhas_contrib}</table>
  <div class="placeholder">Inserir aqui o print do gráfico de commits<br><span class="nota">GitHub → Insights → Network (ou Contributors), mostrando as três branches mescladas na main</span></div>
  <div class="placeholder">Inserir aqui o print da lista de Pull Requests<br><span class="nota">GitHub → Pull requests → Closed, com autor e revisor de cada PR</span></div>
</section>

<section class="secao">
  <h2>5 · Design system no Tailwind v4</h2>
  <p>As cores do logo (Blue <code>#004E72</code>, Gamboge <code>#EDA335</code>, Dun <code>#E8D1BA</code>) viraram variáveis CSS com versão clara e escura, e o bloco <code>@theme inline</code> transforma cada variável em classe do Tailwind (<code>bg-marca</code>, <code>text-tinta</code>, <code>ring-foco</code>…). Nenhum componente usa cor solta no JSX.</p>
  <pre>/* src/styles/theme.css (trecho) */
:root {{
  --papel: #eef2f6;   --superficie: #ffffff;   --linha: #d3dce6;
  --tinta: #0b1f3a;   --tinta-suave: #55657a;
  --marca: #0b1f3a;   --marca-forte: #061428;  --sobre-marca: #ffffff;
  --acento: #eda335;  --acento-forte: #d98e1f; --sobre-acento: #0b1f3a;
  --ceu: #2f77a6;     --ceu-claro: #7fb6db;    --foco: #eda335;
  --sucesso: #1b6b43; --atencao: #8a4b00;      --erro: #b42318;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme='light']) {{ --papel: #07111f; --superficie: #0f1d33; --tinta: #f1f4f8; … }} }}

@theme inline {{
  --color-papel: var(--papel);       --color-superficie: var(--superficie);
  --color-tinta: var(--tinta);       --color-tinta-suave: var(--tinta-suave);
  --color-marca: var(--marca);       --color-sobre-marca: var(--sobre-marca);
  --color-acento: var(--acento);     --color-sobre-acento: var(--sobre-acento);
  --color-ceu: var(--ceu);           --color-foco: var(--foco);
  --color-sucesso: var(--sucesso);   --color-atencao: var(--atencao);   --color-erro: var(--erro);
  --shadow-folha: var(--sombra);
}}
@theme {{
  --font-display: 'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif;
  --font-sans: 'Instrument Sans', 'Segoe UI', Roboto, sans-serif;
  --radius-md: 0.875rem;  --radius-lg: 1.25rem;  --radius-xl: 1.75rem;
  --breakpoint-sm: 40rem; --breakpoint-md: 48rem; --breakpoint-lg: 64rem; --breakpoint-xl: 80rem;
}}</pre>
  <h3>Justificativa</h3>
  <ul>
    <li><strong>Tokens semânticos, não cores:</strong> <code>marca</code>, <code>acento</code>, <code>tinta</code>, <code>papel</code> dizem o papel da cor; trocar a paleta (ou o tema) não exige mexer em componente.</li>
    <li><strong>Contraste AA garantido no token:</strong> o texto usa um azul-marinho derivado do Blue porque Blue puro sobre Gamboge fica em 3,3:1; com <code>--tinta</code> e <code>--sobre-acento</code> todo par texto/fundo passa de 4,5:1.</li>
    <li><strong>Tema escuro automático:</strong> as mesmas classes funcionam nos dois temas porque só o valor da variável muda (<code>prefers-color-scheme</code>, com <code>data-theme</code> para forçar).</li>
    <li><strong>Tipografia como token:</strong> <code>font-display</code> (títulos em caixa alta e números do cartão) e <code>font-sans</code> (texto), com fallbacks locais; fontes em WOFF2 auto-hospedadas.</li>
    <li><strong>Raios e breakpoints do design system:</strong> cartões em <code>rounded-xl</code>, pílulas em <code>rounded-full</code>; breakpoints alinhados aos prints (celular, tablet, notebook, desktop).</li>
  </ul>
</section>

<section class="secao">
  <h2>6 · Acessibilidade e Lighthouse</h2>
  <div class="pontos"><div class="ponto"><strong>100</strong>Acessibilidade</div><div class="ponto"><strong>99–100</strong>Performance</div><div class="ponto"><strong>100</strong>Boas práticas</div><div class="ponto"><strong>100</strong>SEO</div></div>
  <div class="print">{img(AQUI / "lighthouse/print-entrar.png")}<div class="legenda">Lighthouse 12 · tela de entrar · modo celular · build de produção com compressão (relatórios completos em docs/fed/lighthouse/)</div></div>
  <table style="margin-top:8pt"><tr><th>Tela</th><th>Rota</th><th>Perf.</th><th>Acess.</th><th>Boas práticas</th><th>SEO</th></tr>{linhas_lh}</table>
  <p class="nota">Repetir no deploy: <code>npx lighthouse https://SEU-PROJETO.vercel.app/#/entrar --view</code>.</p>
</section>

<section class="secao">
  <h2>7 · Checklist WCAG 2.1 AA</h2>
  <table><tr><th>Critério</th><th>Como o app atende</th><th>Onde</th></tr>{linhas_wcag}</table>
  <p class="nota">Ferramentas: axe-core (via Lighthouse) em 7 telas, teste manual só por teclado (trecho final do vídeo) e leitor de tela VoiceOver no iPhone para a tela de entrar e o check-in.</p>
</section>

<section class="secao">
  <h2>8 · Vídeo de demonstração</h2>
  <p><strong>Duração:</strong> 1 min 33 s (limite: 3 min). <strong>Arquivo:</strong> <code>docs/fed/demo-pele-academia.mp4</code> · <strong>Link:</strong> https://SEU-LINK-DO-VIDEO</p>
  <table><tr><th>Trecho</th><th>O que mostra</th></tr>
    <tr><td>0:00 – 0:08</td><td>Abertura animada e tela de entrar (login de atleta e equipe, Google/Apple, contas de demonstração)</td></tr>
    <tr><td>0:08 – 0:32</td><td>Equipe: painel com alertas de cuidado, avaliação rápida de treino (nota muda na hora), times equilibrados e registro de jogos</td></tr>
    <tr><td>0:32 – 0:44</td><td>Atleta em alerta: sugestão de fisioterapeuta/psicólogo e agendamento</td></tr>
    <tr><td>0:44 – 0:55</td><td>Cartão do jogador e evolução treino a treino</td></tr>
    <tr><td>0:55 – 1:06</td><td>Candidato: peneiras da categoria e Como chegar (Uber, Moovit, Waze, Maps)</td></tr>
    <tr><td>1:06 – 1:33</td><td><strong>Só por teclado:</strong> Tab, Enter e Esc na tela de entrar (validação com foco no erro) e no cadastro, com o foco visível em dourado</td></tr>
  </table>
  <div class="grade" style="grid-template-columns:repeat(4,1fr)">{grade_quadros}</div>
</section>

</body></html>"""

saida_html = AQUI / "FED_PeleAcademia_GrupoZenyth_Sprint3.html"
saida_html.write_text(HTML, encoding="utf-8")
with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page()
    pg.goto(saida_html.as_uri())
    pg.wait_for_timeout(800)
    pg.pdf(path=str(AQUI / "FED_PeleAcademia_GrupoZenyth_Sprint3.pdf"), format="A4", print_background=True, prefer_css_page_size=True)
    nav.close()
print("PDF gerado")
