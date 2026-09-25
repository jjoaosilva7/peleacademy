"""Prints responsivos (390 / 768 / 1280) e vídeo de demonstração (≤ 3 min, com trecho só por teclado) do Pelé Academia."""
import pathlib, subprocess, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4173"
AQUI = pathlib.Path(__file__).parent
PRINTS = AQUI / "prints"
PRINTS.mkdir(exist_ok=True)
VIDEO_DIR = AQUI / "video-bruto"
VIDEO_DIR.mkdir(exist_ok=True)

SEM_ABERTURA = "window.__semAbertura = true;"


def sessao(usuario):
    return f"try {{ localStorage.setItem('pele-academia:sessao:v1', JSON.stringify('{usuario}')); }} catch (e) {{}}"


TELAS = [
    ("entrar", "/#/entrar", None),
    ("cadastro", "/#/cadastro", None),
    ("candidato-inicio", "/#/atleta", "u-kaua"),
    ("candidato-peneiras", "/#/atleta/peneiras", "u-kaua"),
    ("atleta-inicio", "/#/atleta", "u-joao"),
    ("atleta-checkin", "/#/atleta/check-in", "u-joao"),
    ("atleta-evolucao", "/#/atleta/evolucao", "u-joao"),
    ("atleta-talentos", "/#/atleta/talentos", "u-joao"),
    ("atleta-perfil", "/#/atleta/perfil", "u-joao"),
    ("atleta-cuidado", "/#/atleta", "u-lucas"),
    ("equipe-painel", "/#/equipe", "u-carla"),
    ("equipe-treino", "/#/equipe/treino", "u-carla"),
    ("equipe-times", "/#/equipe/times", "u-carla"),
    ("equipe-jogos", "/#/equipe/jogos", "u-carla"),
    ("equipe-peneiras", "/#/equipe/peneiras", "u-carla"),
    ("equipe-atletas", "/#/equipe/atletas", "u-carla"),
]
LARGURAS = [(390, 844, "mobile"), (768, 1024, "tablet"), (1280, 800, "desktop")]


def prints(p):
    nav = p.chromium.launch()
    for largura, altura, nome in LARGURAS:
        for tela, rota, usuario in TELAS:
            ctx = nav.new_context(viewport={"width": largura, "height": altura}, device_scale_factor=2 if largura < 800 else 1,
                                  is_mobile=largura < 800, has_touch=largura < 800, locale="pt-BR")
            ctx.add_init_script(SEM_ABERTURA + (sessao(usuario) if usuario else ""))
            pg = ctx.new_page()
            pg.goto(BASE + rota)
            pg.wait_for_timeout(900)
            largura_doc = pg.evaluate("document.documentElement.scrollWidth")
            if largura_doc > largura:
                print(f"  ATENÇÃO: rolagem horizontal em {tela} @ {largura}px ({largura_doc})")
            pg.screenshot(path=str(PRINTS / f"{nome}-{tela}.png"), full_page=(largura >= 800))
            ctx.close()
        print(f"prints {nome} ok")
    nav.close()


def legenda(pg, texto):
    pg.evaluate("""(t) => {
      let el = document.getElementById('legenda-video');
      if (!el) { el = document.createElement('div'); el.id = 'legenda-video';
        el.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;background:rgba(11,31,58,.92);color:#fff;padding:10px 18px;border-radius:999px;font:600 16px Instrument Sans,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);pointer-events:none;max-width:90vw;text-align:center';
        document.body.appendChild(el); }
      el.textContent = t; el.style.display = t ? 'block' : 'none';
    }""", texto)


def pausa(pg, ms):
    pg.wait_for_timeout(ms)


def video(p):
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={"width": 1280, "height": 720}, record_video_dir=str(VIDEO_DIR), record_video_size={"width": 1280, "height": 720}, locale="pt-BR")
    pg = ctx.new_page()
    inicio = time.time()

    # 1 · abertura animada + tela de entrar
    pg.goto(BASE + "/#/entrar")
    pausa(pg, 5200)
    legenda(pg, "Pelé Academia · MVP · Grupo Zenyth · tela de entrar com login de atleta e equipe")
    pausa(pg, 2500)

    # 2 · equipe: painel, avaliar treino, times, jogos
    pg.get_by_role("button", name="Técnica e olheira").first.click() if pg.get_by_role("button", name="Técnica e olheira").count() else pg.get_by_text("Carla").first.click()
    pausa(pg, 800)
    pg.get_by_role("button", name="Entrar", exact=True).first.click()
    pausa(pg, 2200)
    legenda(pg, "Equipe · painel com alertas de cuidado, encaminhamentos e próximas peneiras")
    pausa(pg, 3000)
    pg.mouse.wheel(0, 500); pausa(pg, 1500); pg.mouse.wheel(0, -500); pausa(pg, 600)

    pg.goto(BASE + "/#/equipe/treino"); pausa(pg, 1800)
    legenda(pg, "Avaliação rápida de treino: eventos, falhas e nota calculada na hora")
    pausa(pg, 2500)
    for rotulo in ("Gol", "Gol", "Assistência"):
        botao = pg.get_by_role("button", name=rotulo, exact=True)
        if botao.count():
            botao.first.click(); pausa(pg, 700)
    pausa(pg, 1500)
    pg.mouse.wheel(0, 400); pausa(pg, 1500)

    pg.goto(BASE + "/#/equipe/times"); pausa(pg, 1800)
    legenda(pg, "Times equilibrados por setor e overall")
    botao = pg.get_by_role("button", name="Montar times")
    if botao.count():
        botao.first.click(); pausa(pg, 2200)
    pg.mouse.wheel(0, 400); pausa(pg, 1500)

    pg.goto(BASE + "/#/equipe/jogos"); pausa(pg, 1800)
    legenda(pg, "Registro de jogos com validação das estatísticas")
    pausa(pg, 2500)

    # 3 · atleta em alerta: rede de cuidado
    pg.evaluate("localStorage.setItem('pele-academia:sessao:v1', JSON.stringify('u-lucas'))")
    pg.goto(BASE + "/#/atleta"); pg.reload(); pausa(pg, 5200)
    legenda(pg, "Atleta com 3 treinos ruins: o app sugere fisioterapeuta ou psicólogo e agenda")
    pausa(pg, 3000)
    pg.mouse.wheel(0, 500); pausa(pg, 1800)

    # 4 · atleta da academia: cartão e evolução
    pg.evaluate("localStorage.setItem('pele-academia:sessao:v1', JSON.stringify('u-joao'))")
    pg.evaluate("window.__semAbertura = true")
    pg.goto(BASE + "/#/atleta/evolucao"); pg.reload(); pausa(pg, 5200)
    legenda(pg, "Cartão do jogador: overall calculado pela posição e evolução treino a treino")
    pausa(pg, 3000)
    pg.mouse.wheel(0, 500); pausa(pg, 1800)

    # 5 · candidato: peneiras e como chegar
    pg.evaluate("localStorage.setItem('pele-academia:sessao:v1', JSON.stringify('u-kaua'))")
    pg.goto(BASE + "/#/atleta/peneiras"); pg.reload(); pausa(pg, 5200)
    legenda(pg, "Candidato: peneiras da categoria e Como chegar com Uber, Moovit, Waze ou Maps")
    pausa(pg, 2000)
    botao = pg.get_by_role("button", name="Como chegar")
    if botao.count():
        botao.first.click(); pausa(pg, 2500)
        pg.keyboard.press("Escape"); pausa(pg, 800)

    # 6 · trecho só por teclado (sem mouse)
    pg.evaluate("localStorage.removeItem('pele-academia:sessao:v1')")
    pg.goto(BASE + "/#/entrar"); pg.reload(); pausa(pg, 5200)
    legenda(pg, "Navegação só pelo teclado: Tab, setas, Enter e Esc · foco visível em dourado")
    pausa(pg, 1500)
    for _ in range(3):
        pg.keyboard.press("Tab"); pausa(pg, 600)
    pg.keyboard.press("Enter"); pausa(pg, 1200)          # atalho de conta de demonstração (se for o foco)
    for _ in range(6):
        pg.keyboard.press("Tab"); pausa(pg, 500)
    pg.keyboard.press("Enter"); pausa(pg, 2500)
    for _ in range(5):
        pg.keyboard.press("Tab"); pausa(pg, 600)
    pg.keyboard.press("Enter"); pausa(pg, 2500)
    for _ in range(4):
        pg.keyboard.press("Tab"); pausa(pg, 500)
    legenda(pg, "Obrigado! Pelé Academia · Onde o legado entra em campo")
    pausa(pg, 2500)

    print("duração aproximada:", round(time.time() - inicio), "s")
    ctx.close()
    nav.close()
    bruto = next(VIDEO_DIR.glob("*.webm"))
    saida = AQUI / "demo-pele-academia.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(bruto), "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(saida)], check=True)
    print("vídeo:", saida, saida.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    import sys
    with sync_playwright() as p:
        if "video" in sys.argv:
            video(p)
        else:
            prints(p)
