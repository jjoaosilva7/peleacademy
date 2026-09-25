"""Testa as páginas do WD (Vanilla JS) com Playwright: sem erros de console e interações funcionando."""
import pathlib, sys
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PRINTS = pathlib.Path(__file__).resolve().parent / "prints"
PRINTS.mkdir(exist_ok=True)
erros = []

def checar(cond, msg):
    print(("OK   " if cond else "FALHA") + " " + msg)
    if not cond:
        erros.append(msg)

with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={"width": 1280, "height": 900})
    pagina = ctx.new_page()
    console = []
    pagina.on("console", lambda m: console.append((m.type, m.text)) if m.type in ("error", "warning") else None)
    pagina.on("pageerror", lambda e: console.append(("pageerror", str(e))))

    # ---------- index.html (feed) ----------
    pagina.goto((RAIZ / "index.html").as_uri())
    pagina.wait_for_selector("#lista-atletas .atleta")
    total = pagina.locator("#lista-atletas .atleta").count()
    checar(total == 16, f"feed mostra 16 atletas (mostrou {total})")
    checar(pagina.locator("#contagem").inner_text() == "16 atletas", "contagem inicial '16 atletas'")

    pagina.select_option("#filtro-posicao", "Goleiro")
    checar(pagina.locator("#lista-atletas .atleta").count() == 2, "filtro por posição Goleiro → 2")
    pagina.select_option("#filtro-uf", "RJ")
    checar(pagina.locator("#lista-atletas .atleta").count() == 2, "Goleiro + RJ → 2")
    pagina.select_option("#filtro-posicao", "")
    n_rj = pagina.locator("#lista-atletas .atleta").count()
    checar(n_rj == 9, f"só RJ → 9 (deu {n_rj})")
    pagina.fill("#filtro-busca", "rafa")
    checar(pagina.locator("#lista-atletas .atleta").count() == 1, "busca 'rafa' → 1")
    pagina.fill("#filtro-busca", "zzz")
    checar(pagina.locator("#vazio").is_visible(), "estado vazio visível sem resultados")
    pagina.click("#limpar-filtros")
    checar(pagina.locator("#lista-atletas .atleta").count() == 16, "limpar filtros → 16")
    checar(pagina.locator(".aviso").count() >= 1, "toast ao limpar filtros")

    # abas
    pagina.click('[data-aba="candidatos"]')
    checar(pagina.locator("#lista-atletas .atleta").count() == 5, "aba candidatos → 5")
    pagina.click('[data-aba="academia"]')
    checar(pagina.locator("#lista-atletas .atleta").count() == 11, "aba academia → 11")
    pagina.keyboard.press("ArrowLeft")
    checar(pagina.locator('[data-aba="todos"]').get_attribute("aria-selected") == "true", "seta ← volta para aba Todos")

    # votos em tag (usuário atual u-joao; atleta a-lucas tag 1 'Arranque' sem votos)
    botao_tag = pagina.locator('[data-acao="votar"][data-atleta="a-lucas"][data-tag="1"]')
    checar(botao_tag.locator(".votos").inner_text() == "0", "tag Arranque começa com 0")
    botao_tag.click()
    checar(botao_tag.get_attribute("aria-pressed") == "true" and botao_tag.locator(".votos").inner_text() == "1", "voto na tag → pressed + 1")
    botao_tag.click()
    checar(botao_tag.get_attribute("aria-pressed") == "false" and botao_tag.locator(".votos").inner_text() == "0", "desfazer voto → 0")
    proprio = pagina.locator('[data-acao="votar"][data-atleta="a-joao"]').first
    checar(proprio.is_disabled(), "não vota nos próprios atributos")

    # seguir
    seguir = pagina.locator('[data-acao="seguir"][data-atleta="a-rafael"]')
    cartao = pagina.locator('.atleta[data-id="a-rafael"]')
    checar(seguir.inner_text() == "Seguir" and cartao.locator("[data-seguidores]").inner_text() == "0 seguidores", "Rafa começa com 0 seguidores")
    seguir.click()
    checar(seguir.inner_text() == "Seguindo" and cartao.locator("[data-seguidores]").inner_text() == "1 seguidor", "seguir → 'Seguindo' e 1 seguidor")
    pagina.check("#so-seguindo")
    n_sigo = pagina.locator("#lista-atletas .atleta").count()
    checar(n_sigo == 4, f"só quem eu sigo → 4 (deu {n_sigo})")
    seguir.click()
    checar(pagina.locator("#lista-atletas .atleta").count() == 3, "deixar de seguir com filtro ligado → 3")
    pagina.uncheck("#so-seguindo")
    pagina.screenshot(path=str(PRINTS / "index-desktop.png"), full_page=True)

    # ---------- cadastro.html ----------
    pagina.goto((RAIZ / "cadastro.html").as_uri())
    pagina.click('button[type="submit"]')
    checar(pagina.locator("#resumo-erros").is_visible(), "resumo de erros aparece ao enviar vazio")
    checar(pagina.locator('[data-erro="nome"]').inner_text() != "", "erro no nome")
    checar(pagina.locator("#nome").get_attribute("aria-invalid") == "true", "aria-invalid no nome")
    pagina.fill("#nome", "Maria Clara Souza")
    checar(pagina.locator('[data-erro="nome"]').inner_text() == "", "erro do nome some ao digitar (revalidação)")
    pagina.fill("#nascimento", "2010-05-20")
    checar(pagina.locator("#categoria-viva").is_visible() and "Sub-17" in pagina.locator("#categoria-viva").inner_text(), "categoria viva Sub-17 para 16 anos")
    checar(pagina.locator("#bloco-responsavel").is_visible(), "bloco do responsável aparece para menor")
    pagina.fill("#nascimento", "2000-01-01")
    checar("7 a 20 anos" in pagina.locator('[data-erro="nascimento"]').inner_text(), "erro de idade fora da faixa")
    pagina.fill("#nascimento", "2010-05-20")
    pagina.select_option("#posicao", "Goleiro")
    pagina.fill("#cidade", "Resende")
    pagina.select_option("#uf", "RJ")
    pagina.fill("#email", "maria@exemplo.com")
    pagina.fill("#senha", "pele2026")
    pagina.fill("#confirmarSenha", "pele2027")
    checar("não são iguais" in pagina.locator('[data-erro="confirmarSenha"]').inner_text(), "senhas diferentes acusadas")
    pagina.fill("#confirmarSenha", "pele2026")
    pagina.fill("#responsavelNome", "Ana Souza")
    pagina.fill("#responsavelEmail", "ana@exemplo.com")
    pagina.fill("#responsavelTelefone", "24999990000")
    pagina.check("#consentimento")
    pagina.click('button[type="submit"]')
    checar(pagina.locator("#cadastro-sucesso").is_visible() and "overall 52" in pagina.locator("#cadastro-sucesso").inner_text(), "cadastro concluído com overall 52 (goleiro)")
    checar(not pagina.locator("#resumo-erros").is_visible(), "resumo de erros some no sucesso")
    pagina.screenshot(path=str(PRINTS / "cadastro-desktop.png"), full_page=True)

    # ---------- entrar.html ----------
    pagina.goto((RAIZ / "entrar.html").as_uri())
    pagina.click('button[type="submit"]')
    checar(pagina.locator('[data-erro="email"]').inner_text() != "", "login vazio acusa e-mail")
    pagina.fill("#email", "joao@exemplo.com")
    pagina.fill("#senha", "errada")
    pagina.click('button[type="submit"]')
    checar("incorretos" in pagina.locator("#erro-geral").inner_text(), "senha errada → erro geral")
    pagina.click('[data-demo="3"]')
    checar(pagina.locator('input[name="tipo"][value="equipe"]').is_checked(), "demo Carla marca tipo equipe")
    pagina.check('input[name="tipo"][value="atleta"]')
    pagina.click('button[type="submit"]')
    checar("equipe" in pagina.locator("#erro-geral").inner_text().lower(), "tipo errado → mensagem de tipo")
    pagina.click("#mostrar-senha")
    checar(pagina.locator("#senha").get_attribute("type") == "text" and pagina.locator("#mostrar-senha").inner_text() == "Ocultar senha", "mostrar senha alterna")
    pagina.click('[data-demo="1"]')
    pagina.screenshot(path=str(PRINTS / "entrar-desktop.png"), full_page=True)
    pagina.click('button[type="submit"]')
    checar(pagina.locator(".aviso.sucesso").count() == 1, "login correto → toast de sucesso")
    pagina.wait_for_url("**/index.html", timeout=3000)
    checar(pagina.url.endswith("index.html"), "redireciona para o feed")

    # ---------- responsivo ----------
    for largura, nome in ((390, "mobile"), (768, "tablet")):
        ctx2 = nav.new_context(viewport={"width": largura, "height": 844})
        pg2 = ctx2.new_page()
        for arquivo in ("index", "cadastro", "entrar"):
            pg2.goto((RAIZ / f"{arquivo}.html").as_uri())
            pg2.wait_for_timeout(200)
            overflow = pg2.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            checar(not overflow, f"{arquivo}.html sem rolagem horizontal em {largura}px")
            pg2.screenshot(path=str(PRINTS / f"{arquivo}-{nome}.png"), full_page=False)
        ctx2.close()

    ruido = [c for c in console if "fonts.googleapis" not in c[1] and "net::ERR" not in c[1]]
    checar(not ruido, f"sem erros de console (ignorando fontes bloqueadas): {ruido}")
    nav.close()

print("\nRESULTADO:", "tudo OK" if not erros else f"{len(erros)} falha(s)")
sys.exit(1 if erros else 0)
