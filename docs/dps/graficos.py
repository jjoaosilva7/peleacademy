"""Gráficos da entrega DPS (limites, derivadas e integrais aplicados ao Pelé Academia)."""
import pathlib, math
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SAIDA = pathlib.Path(__file__).parent
AZUL, CEU, OURO, CINZA, VERDE, VERM = "#0b1f3a", "#2f77a6", "#eda335", "#55657a", "#1b6b43", "#b42318"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "axes.edgecolor": CINZA, "axes.labelcolor": AZUL,
                     "xtick.color": CINZA, "ytick.color": CINZA, "axes.spines.top": False, "axes.spines.right": False})

L, O0, k = 85.0, 52.0, 0.06  # teto, overall inicial (meia), taxa por semana


def O(t):
    return L - (L - O0) * np.exp(-k * t)


def dO(t):
    return k * (L - O0) * np.exp(-k * t)


def salvar(fig, nome):
    fig.tight_layout()
    fig.savefig(SAIDA / nome, dpi=200, facecolor="white")
    plt.close(fig)
    print("gerado", nome)


# 1 · O(t) com assíntota, pontos discretos dos treinos e faixas do cartão
t = np.linspace(0, 52, 400)
fig, ax = plt.subplots(figsize=(9.2, 4.6))
ax.axhspan(0, 60, color="#e3eaf2", alpha=0.6, lw=0)
ax.axhspan(60, 75, color="#fbe6c8", alpha=0.5, lw=0)
ax.axhspan(75, 100, color="#dff1e6", alpha=0.6, lw=0)
ax.text(51.5, 56, "Base", ha="right", color=CINZA, fontsize=9)
ax.text(51.5, 71, "Destaque", ha="right", color=CINZA, fontsize=9)
ax.text(51.5, 80.5, "Elite", ha="right", color=CINZA, fontsize=9)
ax.plot(t, O(t), color=AZUL, lw=2.6, label="O(t) = 85 − 33·e^(−0,06t)")
ax.axhline(L, color=OURO, ls="--", lw=1.6, label="assíntota L = 85 (teto)")
# pontos discretos: regra do app, 2 treinos/semana, nota − 6,5 proporcional ao que falta
rng = np.random.default_rng(7)
pts_t, pts_o, o = [], [], O0
for n in range(0, 105):
    semana = n / 2
    nota = 6.5 + (k / 0.15 / 2) * (L - o) + rng.normal(0, 0.35)
    o = o + 0.15 * (nota - 6.5)
    if n % 2 == 0:
        pts_t.append(semana); pts_o.append(o)
ax.scatter(pts_t, pts_o, s=16, color=CEU, zorder=3, label="overall registrado pelo app (2 treinos/semana)")
for tt, rot in ((12, "12 sem · 68,9"), (19.9, "19,9 sem · 75 (Elite)")):
    ax.plot([tt, tt], [40, O(tt)], color=CINZA, lw=0.8, ls=":")
    ax.annotate(rot, (tt, O(tt)), xytext=(tt + 1, O(tt) - 6), fontsize=9, color=AZUL, arrowprops=dict(arrowstyle="-", color=CINZA, lw=0.8))
ax.set_xlim(0, 52); ax.set_ylim(45, 90)
ax.set_xlabel("t (semanas de treino)"); ax.set_ylabel("overall do cartão")
ax.set_title("Evolução do overall: modelo contínuo × registros discretos do app", color=AZUL, fontsize=12, loc="left")
ax.legend(loc="lower right", fontsize=9, frameon=False)
salvar(fig, "fig1-overall.png")

# 2 · derivada O'(t) e limiar de estagnação
fig, ax = plt.subplots(figsize=(9.2, 4.2))
ax.plot(t, dO(t), color=AZUL, lw=2.6, label="O′(t) = 1,98·e^(−0,06t)  (pontos/semana)")
ax.axhline(0.5, color=VERM, ls="--", lw=1.4, label="limiar de estagnação: 0,5 ponto/semana")
t_est = math.log(k * (L - O0) / 0.5) / k
ax.fill_between(t, 0, dO(t), where=t <= 12, color=CEU, alpha=0.25, label="∫₀¹² O′(t) dt = O(12) − O(0) = 16,9 pontos")
ax.plot([t_est], [0.5], "o", color=VERM)
ax.annotate(f"t* ≈ {t_est:.1f} semanas\n→ app sugere novo estímulo", (t_est, 0.5), xytext=(t_est + 2, 1.0), fontsize=9, color=VERM,
            arrowprops=dict(arrowstyle="->", color=VERM, lw=1))
ax.set_xlim(0, 52); ax.set_ylim(0, 2.2)
ax.set_xlabel("t (semanas)"); ax.set_ylabel("velocidade de evolução")
ax.set_title("Derivada: quanto o atleta ganha por semana (rendimentos decrescentes)", color=AZUL, fontsize=12, loc="left")
ax.legend(loc="upper right", fontsize=9, frameon=False)
salvar(fig, "fig2-derivada.png")

# 3 · intensidade da sessão e área = carga sRPE
tm = np.linspace(0, 90, 400)
i = 4 + 5 * np.sin(np.pi * tm / 90)
fig, ax = plt.subplots(figsize=(9.2, 4.2))
ax.fill_between(tm, 0, i, color=CEU, alpha=0.3, label="área = ∫₀⁹⁰ i(t) dt = 360 + 900/π ≈ 646,5 UA")
ax.plot(tm, i, color=AZUL, lw=2.6, label="i(t) = 4 + 5·sen(πt/90)  (esforço percebido)")
ax.plot([0, 90, 90, 0, 0], [0, 0, 7, 7, 0], color=OURO, lw=2, ls="--", label="retângulo sRPE = 7 × 90 = 630 UA (o que o treinador registra)")
ax.set_xlim(0, 90); ax.set_ylim(0, 10.5)
ax.set_xlabel("minuto da sessão"); ax.set_ylabel("esforço (escala 1–10)")
ax.set_title("Integral definida: a carga de uma sessão é a área sob a intensidade", color=AZUL, fontsize=12, loc="left")
ax.legend(loc="upper left", fontsize=9, frameon=False)
salvar(fig, "fig3-carga-sessao.png")

# 4 · cargas semanais e razão aguda/crônica
semanas = ["S1", "S2", "S3", "S4", "S5 (atual)"]
cargas = [950, 1050, 1000, 1000, 1600]
fig, ax = plt.subplots(figsize=(9.2, 4.0))
cores = [CEU] * 4 + [VERM]
ax.bar(semanas, cargas, color=cores, width=0.6)
media = sum(cargas[:4]) / 4
ax.axhline(media, color=CINZA, ls="--", lw=1.2)
ax.text(3.45, media + 30, f"crônica (média S1–S4) = {media:.0f} UA", color=CINZA, fontsize=9, ha="right")
ax.axhline(1.5 * media, color=OURO, ls="--", lw=1.6)
ax.text(3.45, 1.5 * media + 30, "limite 1,5 × crônica = 1 500 UA", color=OURO, fontsize=9, ha="right")
for x, c in enumerate(cargas):
    ax.text(x, c + 25, f"{c}", ha="center", fontsize=9, color=AZUL)
ax.text(4, 1720, f"razão = 1600 / {media:.0f} = {1600 / media:.2f} > 1,5\n→ alerta de carga alta", ha="center", fontsize=9, color=VERM)
ax.set_ylim(0, 1950); ax.set_ylabel("carga semanal (UA) = Σ esforço × minutos")
ax.set_title("Soma de Riemann na prática: carga semanal e razão aguda/crônica", color=AZUL, fontsize=12, loc="left")
salvar(fig, "fig4-carga-semanal.png")

# 5 · valor médio da função no período (12 semanas)
fig, ax = plt.subplots(figsize=(9.2, 3.8))
t12 = np.linspace(0, 12, 200)
ax.fill_between(t12, 0, O(t12), color=CEU, alpha=0.25, label="∫₀¹² O(t) dt ≈ 737,7")
ax.plot(t12, O(t12), color=AZUL, lw=2.4, label="O(t)")
med = (L * 12 - (L - O0) * (1 - math.exp(-k * 12)) / k) / 12
ax.axhline(med, color=OURO, ls="--", lw=1.8, label=f"valor médio = 737,7 / 12 ≈ {med:.1f}")
ax.set_xlim(0, 12); ax.set_ylim(45, 75)
ax.set_xlabel("t (semanas)"); ax.set_ylabel("overall")
ax.set_title("Valor médio de O(t) no trimestre: o número que o app usa para equilibrar times", color=AZUL, fontsize=12, loc="left")
ax.legend(loc="lower right", fontsize=9, frameon=False)
salvar(fig, "fig5-valor-medio.png")

print("t_estagnacao", t_est, "O(12)", O(12), "media12", med, "t_elite", math.log((L - O0) / 10) / k)
