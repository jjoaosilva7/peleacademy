"""Gera os dois diagramas de caso de uso (notação UML 2) do Pelé Academia em JPEG."""
import math, pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle, Circle, FancyArrowPatch

SAIDA = pathlib.Path(__file__).parent
AZUL = "#0b1f3a"
OURO = "#eda335"
CINZA = "#55657a"
plt.rcParams["font.family"] = "DejaVu Sans"


def ator(ax, x, y, nome, escala=1.0, cor=AZUL):
    """Boneco palito (ator UML) centrado em (x, y) com o nome embaixo."""
    r = 2.2 * escala
    ax.add_patch(Circle((x, y + 6 * escala), r, fill=False, lw=1.8, ec=cor))
    ax.plot([x, x], [y + 6 * escala - r, y - 1 * escala], color=cor, lw=1.8)            # tronco
    ax.plot([x - 3.2 * escala, x + 3.2 * escala], [y + 2 * escala, y + 2 * escala], color=cor, lw=1.8)  # braços
    ax.plot([x, x - 2.6 * escala], [y - 1 * escala, y - 5.5 * escala], color=cor, lw=1.8)  # perna
    ax.plot([x, x + 2.6 * escala], [y - 1 * escala, y - 5.5 * escala], color=cor, lw=1.8)  # perna
    ax.text(x, y - 7.5 * escala, nome, ha="center", va="top", fontsize=12, fontweight="bold", color=cor)
    return (x, y + 1.0 * escala)  # ponto de ancoragem das associações


def borda_elipse(cx, cy, w, h, px, py):
    dx, dy = px - cx, py - cy
    if dx == 0 and dy == 0:
        return cx, cy
    t = 1 / math.sqrt((dx / (w / 2)) ** 2 + (dy / (h / 2)) ** 2)
    return cx + dx * t, cy + dy * t


def desenhar(arquivo, sistema, atores, casos, associacoes, relacoes, caixa=(24, 4, 74, 92), figsize=(16, 9.5)):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_xlim(0, 120)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.axis("off")

    # Fronteira do sistema
    bx, by, bw, bh = caixa
    ax.add_patch(Rectangle((bx, by), bw, bh, fill=True, fc="#f7f9fc", ec=AZUL, lw=1.6))
    ax.text(bx + bw / 2, by + bh - 2.2, sistema, ha="center", va="top", fontsize=15, fontweight="bold", color=AZUL)

    # Casos de uso
    for cid, (rotulo, cx, cy, w, h) in casos.items():
        ax.add_patch(Ellipse((cx, cy), w, h, fc="white", ec=AZUL, lw=1.5))
        ax.text(cx, cy, rotulo, ha="center", va="center", fontsize=11.5, color=AZUL, linespacing=1.15)

    # Atores
    ancoras = {}
    for nome, (x, y, escala) in atores.items():
        ancoras[nome] = ator(ax, x, y, nome, escala)

    # Associações (linha cheia)
    for nome, cid in associacoes:
        ax_, ay_ = ancoras[nome]
        rotulo, cx, cy, w, h = casos[cid]
        ex, ey = borda_elipse(cx, cy, w, h, ax_, ay_)
        ax.plot([ax_, ex], [ay_, ey], color=CINZA, lw=1.3, zorder=1)

    # Include / extend (tracejada com seta aberta)
    for origem, destino, tipo, *cond in relacoes:
        r1, x1, y1, w1, h1 = casos[origem]
        r2, x2, y2, w2, h2 = casos[destino]
        sx, sy = borda_elipse(x1, y1, w1, h1, x2, y2)
        ex, ey = borda_elipse(x2, y2, w2, h2, x1, y1)
        seta = FancyArrowPatch((sx, sy), (ex, ey), arrowstyle="->", mutation_scale=16, lw=1.3, ls=(0, (5, 4)), color=AZUL, zorder=2)
        ax.add_patch(seta)
        mx, my = (sx + ex) / 2, (sy + ey) / 2
        texto = "«" + tipo + "»" + ("\n{" + cond[0] + "}" if cond else "")
        ax.text(mx, my, texto, ha="center", va="center", fontsize=10.5, color=AZUL, style="italic",
                bbox=dict(boxstyle="round,pad=0.25", fc="white", ec="none"), zorder=3)

    fig.tight_layout(pad=0.4)
    fig.savefig(SAIDA / arquivo, dpi=220, pil_kwargs={"quality": 92}, facecolor="white")
    plt.close(fig)
    print("gerado", arquivo)


# ---------------------------------------------------------------------------
# Diagrama 1 · Captação: cadastro, inscrição na peneira e avaliação
# ---------------------------------------------------------------------------
desenhar(
    "diagrama-1-captacao.jpg",
    "Pelé Academia · Captação de atletas (cadastro, peneira e avaliação)",
    atores={
        "Candidato": (9, 54, 1.0),
        "Responsável": (112, 68, 1.0),
        "Apps de rota\n(Uber, Moovit, Waze)": (112, 36, 0.9),
        "Olheiro / Avaliador": (112, 12, 1.0),
    },
    casos={
        "conta": ("Criar conta\nde atleta", 38, 84, 20, 10),
        "idade": ("Validar idade\ne categoria", 66, 84, 19, 10),
        "resp": ("Registrar responsável\ne consentimento (LGPD)", 66, 68, 23, 10),
        "peneiras": ("Consultar peneiras\nabertas", 38, 68, 20, 10),
        "inscrever": ("Inscrever-se\nna peneira", 38, 52, 20, 10),
        "vagas": ("Verificar vagas,\ncategoria e duplicidade", 66, 52, 22, 10),
        "rota": ("Ver como chegar\nao CT", 66, 36, 19, 10),
        "cancelar": ("Cancelar\ninscrição", 38, 36, 17, 9),
        "avaliar": ("Avaliar candidato\nna peneira", 66, 18, 20, 10),
        "nota": ("Calcular nota final\ne sugerir decisão", 38, 16, 22, 10),
        "cartao": ("Aprovar e gerar\ncartão inicial", 90, 26, 19, 10),
    },
    associacoes=[
        ("Candidato", "conta"), ("Candidato", "peneiras"), ("Candidato", "inscrever"), ("Candidato", "cancelar"),
        ("Responsável", "resp"),
        ("Apps de rota\n(Uber, Moovit, Waze)", "rota"),
        ("Olheiro / Avaliador", "avaliar"), ("Olheiro / Avaliador", "cartao"),
    ],
    relacoes=[
        ("conta", "idade", "include"),
        ("resp", "conta", "extend", "menor de 18 anos"),
        ("inscrever", "vagas", "include"),
        ("rota", "inscrever", "extend"),
        ("avaliar", "nota", "include"),
        ("cartao", "avaliar", "extend", "nota final ≥ 7"),
    ],
    caixa=(22, 3, 81, 94),
)

# ---------------------------------------------------------------------------
# Diagrama 2 · Manutenção: treino, cartão, bem-estar e rede de cuidado
# ---------------------------------------------------------------------------
desenhar(
    "diagrama-2-manutencao.jpg",
    "Pelé Academia · Manutenção do atleta (treino, cartão, bem-estar e cuidado)",
    atores={
        "Atleta": (9, 78, 1.0),
        "Treinador /\nEquipe técnica": (9, 36, 1.0),
        "Fisioterapeuta": (112, 30, 1.0),
        "Psicólogo(a)": (112, 10, 1.0),
    },
    casos={
        "checkin": ("Fazer check-in\nde bem-estar", 38, 84, 20, 10),
        "indice": ("Calcular índice\nde bem-estar", 66, 84, 19, 10),
        "evolucao": ("Ver evolução\ndo cartão", 38, 70, 19, 10),
        "avaliar": ("Avaliar treino\n(atributos e falhas)", 38, 56, 21, 10),
        "notatreino": ("Calcular nota\ndo treino", 66, 56, 18, 9),
        "sugerir": ("Sugerir\nencaminhamento", 90, 70, 19, 9),
        "atualizar": ("Atualizar atributos\ne overall do cartão", 91, 42, 21, 10),
        "carga": ("Acompanhar carga\nde treino (sRPE)", 38, 42, 21, 10),
        "jogo": ("Registrar jogo\ne estatísticas", 38, 28, 20, 10),
        "validar": ("Validar placar\ne estatísticas", 66, 28, 19, 9),
        "encaminhar": ("Encaminhar ao\ncuidado (agendar)", 38, 14, 20, 10),
    },
    associacoes=[
        ("Atleta", "checkin"), ("Atleta", "evolucao"),
        ("Treinador /\nEquipe técnica", "avaliar"), ("Treinador /\nEquipe técnica", "carga"),
        ("Treinador /\nEquipe técnica", "jogo"), ("Treinador /\nEquipe técnica", "encaminhar"),
        ("Fisioterapeuta", "encaminhar"), ("Psicólogo(a)", "encaminhar"),
    ],
    relacoes=[
        ("checkin", "indice", "include"),
        ("avaliar", "notatreino", "include"),
        ("notatreino", "atualizar", "include"),
        ("sugerir", "notatreino", "extend", "3 treinos < 6,5"),
        ("sugerir", "indice", "extend", "3 check-ins ≤ 2,5"),
        ("jogo", "validar", "include"),
    ],
    caixa=(22, 3, 81, 94),
)
