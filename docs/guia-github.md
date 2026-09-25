# Guia rápido · GitHub por integrante (FED)

A rubrica exige **uma branch e um Pull Request mesclado por integrante**; quem não tiver branch mesclada fica sem nota. Este é o roteiro para deixar o repositório do jeito certo em poucos minutos.

## 1. Criar o repositório e subir a `main`

```bash
cd pele-academia
git init
git add .
git commit -m "chore: estrutura inicial do MVP Pelé Academia (Sprint 3)"
git branch -M main
git remote add origin https://github.com/jjoaosilva7/peleacademy.git
git push -u origin main
```

No GitHub: **Settings → Collaborators** e adicione os outros dois integrantes.

## 2. Cada integrante cria a própria branch e faz commits com o próprio usuário

Divisão sugerida (a mesma da tabela de contribuições do README):

| Integrante | Branch | Pastas que commita |
| --- | --- | --- |
| Guilherme de Paula Correia | `feature/entrada-e-cadastro` | `src/app/paginas/auth/`, `src/app/componentes/abertura/`, `src/styles/` |
| João Vitor Barbosa Silva | `feature/area-do-atleta` | `src/app/paginas/atleta/`, `src/app/lib/mobilidade.ts`, `src/app/componentes/dominio/` |
| Lucas Rodrigues de Carvalho | `feature/area-da-equipe` | `src/app/paginas/equipe/`, `src/app/lib/desempenho.ts`, `src/app/lib/cuidado.ts` |

Como a `main` já tem tudo, o jeito mais simples de cada um ter commits reais na própria branch é **cada integrante fazer uma melhoria pequena e verdadeira** na sua área (um texto, um ajuste de espaçamento, um comentário de documentação, um teste) e commitar:

```bash
git config user.name "Seu Nome"
git config user.email "seu-email-do-github@exemplo.com"

git checkout main && git pull
git checkout -b feature/area-do-atleta
# ... edita os arquivos da sua área ...
git add src/app/paginas/atleta
git commit -m "feat(atleta): ajusta textos da tela de peneiras e do Como chegar"
git push -u origin feature/area-do-atleta
```

Dica: faça 2 ou 3 commits por branch (ex.: um de código, um de documentação) para o gráfico de commits ficar claro.

## 3. Abrir o Pull Request

No GitHub aparece o botão **Compare & pull request**. Título no padrão `feat(área): o que foi feito`, descrição curta com as telas afetadas e um print. Marque outro integrante como **Reviewer**.

## 4. Revisar e mesclar

O revisor abre o PR, lê o diff, deixa um comentário e clica em **Approve**. Depois, **Merge pull request → Confirm merge** (pode apagar a branch em seguida; o histórico fica).

Repita para as três branches. Ordem sugerida: entrada-e-cadastro → area-do-atleta → area-da-equipe. Se der conflito, `git checkout main && git pull && git checkout sua-branch && git merge main`, resolva e faça push.

## 5. Prints para o PDF da entrega

- **Gráfico de commits:** `Insights → Network` (ou `Insights → Contributors`). Print da tela inteira mostrando as três branches entrando na `main`.
- **Lista de PRs:** aba `Pull requests → Closed` mostrando os três PRs mesclados, com autor e revisor.
- Salve em `docs/fed/prints/github-network.png` e `docs/fed/prints/github-prs.png` e coloque no PDF (`docs/fed/`).

## 6. Deploy na Vercel

1. https://vercel.com → **Add New → Project** → importe o repositório.
2. Framework: **Vite** (detecta sozinho). Build: `npm run build`. Output: `dist`.
3. Se for usar login Google/Apple de verdade, cadastre `VITE_GOOGLE_CLIENT_ID` etc. em **Settings → Environment Variables** (sem isso o app usa as contas de demonstração).
4. **Deploy**. Copie a URL para o README, o PDF e o Teams. Teste em aba anônima.
5. Rode o Lighthouse na URL da Vercel (`npx lighthouse https://SUA-URL.vercel.app/#/entrar --view`) e troque o print em `docs/fed/lighthouse/` se quiser o relatório com a URL pública.

## 7. Protótipo

O grupo não usou Figma: o protótipo navegável foi feito com o Claude e está publicado no link que consta no README (seção Links). Se o professor exigir um arquivo do Figma, os PNGs de `docs/fed/prints/` podem ser arrastados para um arquivo novo no Figma em poucos minutos.
