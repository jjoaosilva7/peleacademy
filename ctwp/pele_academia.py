"""
Pelé Academia - gêmeo lógico do MVP Visual (Sprint 3 - CTWP)
Grupo Zenyth - FIAP - 1º Engenharia de Software (RJ)

Este script roda no terminal e espelha exatamente os fluxos, os dados e as regras
do app da Pelé Academia (MVP Visual). Não tem botões nem cores, mas processa os
mesmos dados, na mesma ordem e com as mesmas validações das telas:

  - Entrar / Criar conta de atleta          (telas Entrar e Cadastro)
  - Peneiras e inscrição + "Como chegar"    (tela Peneiras)
  - Check-in do dia                         (tela Check-in)
  - Cartão do jogador e evolução            (telas Início e Evolução)
  - Rede de cuidado (fisio / psicólogo)     (aviso "Vamos cuidar de você")
  - Painel da equipe                        (tela Painel)
  - Avaliar treino, estilo Sofascore        (tela Treino)
  - Montar times equilibrados               (tela Times)
  - Registrar jogo                          (tela Jogos)
  - Avaliar candidato da peneira            (tela Avaliar candidato)

Estruturas de dados usadas: listas (atletas, peneiras, inscrições, treinos, jogos),
dicionários (cada registro e as tabelas de regras) e matrizes (tabela de atributos
por atleta e matriz de notas atleta x treino, no painel).

Executar:  python pele_academia.py
Contas de demonstração (senha pele2026): kaua@exemplo.com (candidato),
joao@exemplo.com (atleta da academia), tecnico@peleacademia.com.br (equipe).
"""

from datetime import date, timedelta

# ---------------------------------------------------------------------------
# Regras e tabelas do sistema (as mesmas do app)
# ---------------------------------------------------------------------------

IDADE_MINIMA = 7
IDADE_MAXIMA = 20
MAIORIDADE = 18
NOTA_APROVACAO = 7.0            # nota da peneira que sugere aprovação
NOTA_BASE_TREINO = 6.5          # toda nota de treino começa aqui
PENALIDADE_FALHA = 0.3
TREINO_BOM = 6.5                # abaixo disso o treino conta como "ruim" na rede de cuidado
SENHA_DEMONSTRACAO = "pele2026"

POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"]
SIGLA_POSICAO = {"Goleiro": "GOL", "Zagueiro": "ZAG", "Lateral": "LAT",
                 "Volante": "VOL", "Meia": "MEI", "Atacante": "ATA"}
SETOR_DA_POSICAO = {"Goleiro": "GOL", "Zagueiro": "DEF", "Lateral": "DEF",
                    "Volante": "MEI", "Meia": "MEI", "Atacante": "ATA"}
PES = ["Direito", "Esquerdo", "Ambos"]
CATEGORIAS = ["Sub-11 Futsal", "Sub-13 Futsal", "Sub-15", "Sub-17", "Sub-20"]
UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
       "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]
CRITERIOS = ["velocidade", "passe", "drible", "finalizacao", "posicionamento", "fisico"]

# Atributos do cartão. Jogador de linha: ataque, defesa, força, habilidade.
# Goleiro: chute, elasticidade, posicionamento. Todo atleta novo começa com estes valores.
ATRIBUTOS_INICIAIS = {"ataque": 55, "defesa": 45, "forca": 45, "habilidade": 55,
                      "chute": 45, "elasticidade": 55, "posicionamento": 50}
ATRIBUTOS_LINHA = ["ataque", "defesa", "forca", "habilidade"]
ATRIBUTOS_GOLEIRO = ["chute", "elasticidade", "posicionamento"]
MINIMO_ATRIBUTO, MAXIMO_ATRIBUTO = 30, 99

# Peso de cada atributo no overall, por posição.
PESOS = {
    "Atacante": {"ataque": 0.45, "habilidade": 0.30, "forca": 0.15, "defesa": 0.10},
    "Meia":     {"habilidade": 0.40, "ataque": 0.30, "defesa": 0.15, "forca": 0.15},
    "Volante":  {"defesa": 0.40, "habilidade": 0.25, "forca": 0.25, "ataque": 0.10},
    "Zagueiro": {"defesa": 0.50, "forca": 0.30, "habilidade": 0.10, "ataque": 0.10},
    "Lateral":  {"defesa": 0.30, "habilidade": 0.30, "forca": 0.20, "ataque": 0.20},
    "Goleiro":  {"elasticidade": 0.45, "posicionamento": 0.40, "chute": 0.15},
}

# Estatísticas do treino (estilo Sofascore): nome e peso na nota.
STATS = {
    "gols": ("Gols", 1.0), "assistencias": ("Assistências", 0.7),
    "finalizacoes": ("Finalizações no alvo", 0.2), "passesDecisivos": ("Passes decisivos", 0.3),
    "dribles": ("Dribles certos", 0.15), "desarmes": ("Desarmes", 0.3),
    "interceptacoes": ("Interceptações", 0.25), "defesas": ("Defesas", 0.4),
    "golsSofridos": ("Gols sofridos", -0.3), "perdas": ("Perdas de bola", -0.15),
}
# As 4 estatísticas principais de cada posição aparecem primeiro na avaliação rápida.
STATS_POR_POSICAO = {
    "Goleiro": ["defesas", "golsSofridos", "interceptacoes", "perdas"],
    "Zagueiro": ["desarmes", "interceptacoes", "gols", "perdas"],
    "Lateral": ["desarmes", "assistencias", "passesDecisivos", "perdas"],
    "Volante": ["desarmes", "interceptacoes", "passesDecisivos", "perdas"],
    "Meia": ["assistencias", "passesDecisivos", "gols", "perdas"],
    "Atacante": ["gols", "finalizacoes", "assistencias", "perdas"],
}
# Pontos a melhorar: nome, atributo descontado (linha), atributo descontado (goleiro).
FALHAS = {
    "passe": ("Passe", "habilidade", "chute"),
    "finalizacao": ("Finalização", "ataque", "chute"),
    "marcacao": ("Marcação", "defesa", "posicionamento"),
    "posicionamento": ("Posicionamento", "defesa", "posicionamento"),
    "intensidade": ("Intensidade", "forca", "elasticidade"),
    "decisao": ("Tomada de decisão", "habilidade", "posicionamento"),
}
NOME_PROFISSIONAL = {"fisio": "Fisioterapeuta", "psicologo": "Psicólogo do esporte"}
HORARIOS_CT = ["08:00", "14:00", "17:30"]
NOMES_TIMES = ["Azul", "Amarelo", "Areia", "Branco"]


# ---------------------------------------------------------------------------
# Funções de apoio (datas, leitura de dados no terminal)
# ---------------------------------------------------------------------------

def hoje_iso():
    return date.today().isoformat()


def somar_dias(data_iso, dias):
    return (date.fromisoformat(data_iso) + timedelta(days=dias)).isoformat()


def dias_entre(inicio_iso, fim_iso):
    return (date.fromisoformat(fim_iso) - date.fromisoformat(inicio_iso)).days


def calcular_idade(nascimento_iso, hoje=None):
    hoje = date.fromisoformat(hoje or hoje_iso())
    nasc = date.fromisoformat(nascimento_iso)
    idade = hoje.year - nasc.year
    if (hoje.month, hoje.day) < (nasc.month, nasc.day):
        idade -= 1
    return idade


def formatar(numero, casas=1):
    """Formata número no padrão brasileiro (vírgula)."""
    return f"{numero:.{casas}f}".replace(".", ",")


def ler_texto(mensagem, obrigatorio=True):
    while True:
        valor = input(mensagem).strip()
        if valor or not obrigatorio:
            return valor
        print("  > Este campo é obrigatório.")


def ler_inteiro(mensagem, minimo=None, maximo=None):
    while True:
        bruto = input(mensagem).strip()
        if not bruto.lstrip("-").isdigit():
            print("  > Digite um número inteiro.")
            continue
        valor = int(bruto)
        if minimo is not None and valor < minimo or maximo is not None and valor > maximo:
            print(f"  > Digite um valor entre {minimo} e {maximo}.")
            continue
        return valor


def ler_decimal(mensagem, minimo, maximo):
    while True:
        bruto = input(mensagem).strip().replace(",", ".")
        try:
            valor = float(bruto)
        except ValueError:
            print("  > Digite um número (use vírgula ou ponto).")
            continue
        if valor < minimo or valor > maximo:
            print(f"  > Digite um valor entre {minimo} e {maximo}.")
            continue
        return valor


def ler_opcao(mensagem, opcoes):
    """Mostra uma lista numerada e devolve o item escolhido."""
    for indice, opcao in enumerate(opcoes, start=1):
        print(f"  {indice}. {opcao}")
    escolha = ler_inteiro(mensagem, 1, len(opcoes))
    return opcoes[escolha - 1]


def ler_data(mensagem):
    while True:
        bruto = input(mensagem + " (AAAA-MM-DD): ").strip()
        try:
            date.fromisoformat(bruto)
            return bruto
        except ValueError:
            print("  > Data inválida. Use o formato AAAA-MM-DD, por exemplo 2010-03-25.")


def ler_sim_nao(mensagem):
    while True:
        resposta = input(mensagem + " (s/n): ").strip().lower()
        if resposta in ("s", "n"):
            return resposta == "s"
        print("  > Responda s ou n.")


def titulo(texto):
    print("\n" + "=" * 60)
    print(texto.upper())
    print("=" * 60)


# ---------------------------------------------------------------------------
# Regras de cadastro, categoria e peneira (tela Cadastro e tela Peneiras)
# ---------------------------------------------------------------------------

def categoria_por_idade(idade):
    if idade < IDADE_MINIMA or idade > IDADE_MAXIMA:
        return None
    if idade <= 11:
        return "Sub-11 Futsal"
    if idade <= 13:
        return "Sub-13 Futsal"
    if idade <= 15:
        return "Sub-15"
    if idade <= 17:
        return "Sub-17"
    return "Sub-20"


def categoria_do_atleta(atleta):
    return categoria_por_idade(calcular_idade(atleta["nascimento"]))


def validar_email(email):
    return "@" in email and "." in email.split("@")[-1] and " " not in email


def validar_senha(senha):
    if len(senha) < 8:
        return "A senha precisa ter pelo menos 8 caracteres."
    if not any(c.isalpha() for c in senha) or not any(c.isdigit() for c in senha):
        return "Use letras e números na senha."
    return None


def validar_cadastro(dados, emails_existentes):
    """Mesmas validações da tela Cadastro. Devolve um dicionário campo -> erro."""
    erros = {}
    if len(dados["nome"].split()) < 2:
        erros["nome"] = "Informe nome e sobrenome."
    if len(dados["apelido"]) > 16:
        erros["apelido"] = "Use um apelido com até 16 caracteres."
    idade = calcular_idade(dados["nascimento"])
    if idade < IDADE_MINIMA or idade > IDADE_MAXIMA:
        erros["nascimento"] = f"A academia atende atletas de {IDADE_MINIMA} a {IDADE_MAXIMA} anos (idade informada: {idade})."
    if not (100 <= dados["alturaCm"] <= 220):
        erros["alturaCm"] = "Informe a altura entre 100 e 220 cm."
    if not (25 <= dados["pesoKg"] <= 150):
        erros["pesoKg"] = "Informe o peso entre 25 e 150 kg."
    if not validar_email(dados["email"]):
        erros["email"] = "Informe um e-mail válido, como nome@exemplo.com."
    elif dados["email"].lower() in emails_existentes:
        erros["email"] = "Já existe uma conta com este e-mail."
    erro_senha = validar_senha(dados["senha"])
    if erro_senha:
        erros["senha"] = erro_senha
    if idade < MAIORIDADE:
        if len(dados["responsavelNome"].split()) < 2:
            erros["responsavelNome"] = "Informe o nome completo do responsável."
        if not validar_email(dados["responsavelEmail"]):
            erros["responsavelEmail"] = "Informe o e-mail do responsável."
        telefone = "".join(c for c in dados["responsavelTelefone"] if c.isdigit())
        if len(telefone) < 10 or len(telefone) > 11:
            erros["responsavelTelefone"] = "Informe o telefone com DDD (10 ou 11 dígitos)."
        if not dados["consentimento"]:
            erros["consentimento"] = "Atletas menores de 18 anos precisam da autorização do responsável."
    return erros


def vagas_restantes(peneira, inscricoes):
    ocupadas = sum(1 for i in inscricoes if i["peneiraId"] == peneira["id"])
    return max(peneira["vagas"] - ocupadas, 0)


def verificar_inscricao(atleta, peneira, inscricoes):
    """Devolve (permitido, motivo) com as mesmas regras da tela Peneiras."""
    if any(i["peneiraId"] == peneira["id"] and i["atletaId"] == atleta["id"] for i in inscricoes):
        return False, "Você já está inscrito nesta peneira."
    if peneira["data"] < hoje_iso():
        return False, "As inscrições desta peneira já encerraram."
    categoria = categoria_do_atleta(atleta)
    if categoria != peneira["categoria"]:
        return False, f"Esta peneira é para a categoria {peneira['categoria']}. A sua é {categoria or 'indefinida'}."
    if vagas_restantes(peneira, inscricoes) == 0:
        return False, "Não há mais vagas nesta peneira."
    return True, ""


def opcoes_de_rota(peneira):
    """Links que o app abre no botão 'Como chegar' (Uber, Moovit, Waze e Google Maps)."""
    lat, lng = peneira["lat"], peneira["lng"]
    nome = peneira["local"].replace(" ", "%20")
    return [
        ("Uber", f"https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]={lat}&dropoff[longitude]={lng}&dropoff[nickname]={nome}"),
        ("Moovit", f"https://moovit.com/?to={nome}&tll={lat}_{lng}&lang=pt"),
        ("Waze", f"https://waze.com/ul?ll={lat},{lng}&navigate=yes"),
        ("Google Maps", f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"),
    ]


# ---------------------------------------------------------------------------
# Avaliação técnica da peneira (tela Avaliar candidato)
# ---------------------------------------------------------------------------

def calcular_nota_final(notas):
    return round(sum(notas[c] for c in CRITERIOS) / len(CRITERIOS), 1)


def sugerir_decisao(nota):
    if nota >= NOTA_APROVACAO:
        return "Recomendado aprovar"
    if nota >= 6:
        return "Avaliar em nova peneira"
    return "Não recomendado"


# ---------------------------------------------------------------------------
# Check-in, bem-estar e carga (tela Check-in)
# ---------------------------------------------------------------------------

def indice_bem_estar(checkin):
    return checkin["sono"] + checkin["dor"] + checkin["cansaco"] + checkin["estresse"]


def classificar_bem_estar(indice):
    if indice >= 14:
        return "Bem-estar bom"
    if indice >= 10:
        return "Bem-estar em atenção"
    return "Bem-estar baixo"


def carga_do_treino(checkin):
    """Carga interna (sRPE): esforço x minutos."""
    return checkin["esforco"] * checkin["minutos"]


def carga_no_periodo(checkins, fim, dias):
    """Soma da carga nos `dias` que terminam em `fim`: a integral definida usada em DPS."""
    inicio = somar_dias(fim, -(dias - 1))
    return sum(carga_do_treino(c) for c in checkins if inicio <= c["data"] <= fim)


def razao_de_carga(checkins):
    aguda = carga_no_periodo(checkins, hoje_iso(), 7)
    cronica = carga_no_periodo(checkins, hoje_iso(), 28) / 4
    if cronica == 0:
        return None
    return round(aguda / cronica, 2)


def classificar_razao(razao):
    if razao is None:
        return "sem dados"
    if razao > 1.5:
        return "alta"
    if razao < 0.8:
        return "baixa"
    return "ideal"


# ---------------------------------------------------------------------------
# Nota de treino, atributos e overall (telas Treino, Início e Evolução)
# ---------------------------------------------------------------------------

def calcular_nota_treino(registro):
    """Nota = 6,5 + soma(estatística x peso) - 0,3 por falha + ajuste do treinador, entre 3 e 10."""
    pelas_stats = sum(STATS[stat][1] * qtd for stat, qtd in registro["stats"].items())
    nota = NOTA_BASE_TREINO + pelas_stats - len(registro["falhas"]) * PENALIDADE_FALHA + registro["ajuste"]
    return round(min(10, max(3, nota)), 1)


def faixa_da_nota(nota):
    if nota >= 8:
        return "elite"
    if nota >= 7:
        return "ótima"
    if nota >= 6.5:
        return "boa"
    if nota >= 6:
        return "regular"
    return "ruim"


def limitar(valor, minimo, maximo):
    return min(maximo, max(minimo, valor))


def somar_limitado(atual, delta, limite_por_evento):
    """Aplica a variação em cada atributo respeitando o limite por evento e os limites 30-99."""
    novo = dict(atual)
    for atributo, variacao in delta.items():
        variacao = limitar(variacao, -limite_por_evento, limite_por_evento)
        novo[atributo] = round(limitar(atual[atributo] + variacao, MINIMO_ATRIBUTO, MAXIMO_ATRIBUTO), 1)
    return novo


def aplicar_treino(atual, registro, posicao):
    """Um treino avaliado move os atributos: bônus por estatística e -0,5 por ponto a melhorar."""
    s = registro["stats"]
    geral = (calcular_nota_treino(registro) - NOTA_BASE_TREINO) * 0.15
    delta = {
        "ataque": geral + 0.6 * s.get("gols", 0) + 0.3 * s.get("assistencias", 0) + 0.15 * s.get("finalizacoes", 0),
        "habilidade": geral + 0.3 * s.get("assistencias", 0) + 0.25 * s.get("passesDecisivos", 0) + 0.2 * s.get("dribles", 0) - 0.15 * s.get("perdas", 0),
        "defesa": geral + 0.3 * s.get("desarmes", 0) + 0.25 * s.get("interceptacoes", 0) + 0.35 * s.get("defesas", 0) - 0.2 * s.get("golsSofridos", 0),
        "forca": geral + 0.1 * s.get("desarmes", 0),
        "chute": geral + 0.25 * s.get("passesDecisivos", 0) - 0.15 * s.get("perdas", 0),
        "elasticidade": geral + 0.35 * s.get("defesas", 0),
        "posicionamento": geral + 0.25 * s.get("interceptacoes", 0) - 0.25 * s.get("golsSofridos", 0),
    }
    for falha in registro["falhas"]:
        atributo = FALHAS[falha][2] if posicao == "Goleiro" else FALHAS[falha][1]
        delta[atributo] -= 0.5
    return somar_limitado(atual, delta, 2)


def aplicar_avaliacao(atual, notas):
    """A avaliação técnica (0 a 10 por critério) puxa cada atributo 25% em direção à nota x 10."""
    alvo = {
        "ataque": (notas["finalizacao"] + notas["velocidade"]) / 2 * 10,
        "defesa": notas["posicionamento"] * 10,
        "forca": notas["fisico"] * 10,
        "habilidade": (notas["passe"] + notas["drible"]) / 2 * 10,
        "chute": (notas["passe"] + notas["finalizacao"]) / 2 * 10,
        "elasticidade": (notas["fisico"] + notas["velocidade"]) / 2 * 10,
        "posicionamento": notas["posicionamento"] * 10,
    }
    delta = {a: (alvo[a] - atual[a]) * 0.25 for a in alvo}
    return somar_limitado(atual, delta, 5)


def atributos_atuais(atleta, treinos):
    """Recalcula os atributos a partir do histórico (avaliações e treinos) em ordem de data."""
    eventos = [(a["data"], 0, ("avaliacao", a["notas"])) for a in atleta["avaliacoes"]]
    for treino in treinos:
        for registro in treino["registros"]:
            if registro["atletaId"] == atleta["id"]:
                eventos.append((treino["data"], 1, ("treino", registro)))
    eventos.sort(key=lambda e: (e[0], e[1]))
    atual = dict(ATRIBUTOS_INICIAIS)
    for _, _, (tipo, dado) in eventos:
        atual = aplicar_avaliacao(atual, dado) if tipo == "avaliacao" else aplicar_treino(atual, dado, atleta["posicao"])
    return atual


def calcular_overall(atributos, posicao):
    return round(sum(atributos[a] * peso for a, peso in PESOS[posicao].items()))


def faixa_do_cartao(overall):
    if overall >= 75:
        return "elite (dourada com brilho)"
    if overall >= 60:
        return "destaque (dourada)"
    return "base (areia)"


def treinos_do_atleta(atleta_id, treinos):
    historico = []
    for treino in sorted(treinos, key=lambda t: t["data"]):
        for registro in treino["registros"]:
            if registro["atletaId"] == atleta_id:
                historico.append((treino["data"], registro, calcular_nota_treino(registro)))
    return historico


def mostrar_cartao(atleta, treinos):
    """Imprime o cartão do jogador como aparece no app."""
    atributos = atributos_atuais(atleta, treinos)
    overall = calcular_overall(atributos, atleta["posicao"])
    lista = ATRIBUTOS_GOLEIRO if atleta["posicao"] == "Goleiro" else ATRIBUTOS_LINHA
    nome = atleta["apelido"] or atleta["nome"].split()[0]
    print("+" + "-" * 34 + "+")
    print(f"| OVR {overall:<3} {SIGLA_POSICAO[atleta['posicao']]:<4} {atleta['nacionalidade']:<20} |")
    print(f"| {nome:^32} |")
    print("| " + "  ".join(f"{a[:3].upper()} {round(atributos[a]):>2}" for a in lista).center(32) + " |")
    print(f"| Moldura: {faixa_do_cartao(overall):<23} |")
    print("+" + "-" * 34 + "+")
    return atributos, overall


# ---------------------------------------------------------------------------
# Rede de cuidado (aviso "Vamos cuidar de você")
# ---------------------------------------------------------------------------

def verificar_cuidado(atleta, treinos):
    """3 treinos seguidos abaixo de 6,5 e/ou sinais nos 3 últimos check-ins → fisio e/ou psicólogo."""
    if atleta["status"] != "academia":
        return None
    ultimos3 = treinos_do_atleta(atleta["id"], treinos)[-3:]
    checkins = sorted(atleta["checkins"], key=lambda c: c["data"])[-3:]
    treinos_ruins = len(ultimos3) == 3 and all(nota < TREINO_BOM for _, _, nota in ultimos3)

    def media(campo):
        return sum(c[campo] for c in checkins) / len(checkins) if checkins else 5

    dor_alta = len(checkins) == 3 and media("dor") <= 2.5
    cansaco_alto = len(checkins) == 3 and media("cansaco") <= 2.5
    cabeca_pesada = len(checkins) == 3 and (media("estresse") <= 2.5 or media("sono") <= 2.5)
    falha_fisica = any(FALHAS[f][1] == "forca" for _, r, _ in ultimos3 for f in r["falhas"])

    profissionais, detalhes = [], []
    if dor_alta:
        detalhes.append("Dor muscular relatada nos últimos 3 check-ins")
    if cansaco_alto:
        detalhes.append("Cansaço alto nos últimos 3 check-ins")
    if cabeca_pesada:
        detalhes.append("Sono ruim ou estresse alto nos últimos 3 check-ins")
    if treinos_ruins:
        detalhes.append("3 treinos seguidos com nota abaixo de 6,5")
    if dor_alta or (treinos_ruins and (falha_fisica or cansaco_alto)):
        profissionais.append("fisio")
    if cabeca_pesada:
        profissionais.append("psicologo")
    if treinos_ruins and not profissionais:
        profissionais.append("psicologo")
    if not profissionais:
        return None
    return {"profissionais": profissionais, "detalhes": detalhes}


# ---------------------------------------------------------------------------
# Times equilibrados (tela Times) e jogos (tela Jogos)
# ---------------------------------------------------------------------------

def montar_times(jogadores, quantidade):
    """Setor por setor, o melhor disponível vai para o time com menos jogadores do setor
    e, no empate, para o time com menor soma de overall. Devolve uma matriz: lista de times,
    cada time é uma lista de jogadores."""
    times = [{"ids": [], "total": 0, "porSetor": {"GOL": 0, "DEF": 0, "MEI": 0, "ATA": 0}} for _ in range(quantidade)]
    for setor in ["GOL", "DEF", "MEI", "ATA"]:
        do_setor = sorted((j for j in jogadores if SETOR_DA_POSICAO[j["posicao"]] == setor),
                          key=lambda j: -j["overall"])
        for jogador in do_setor:
            destino = min(times, key=lambda t: (t["porSetor"][setor], t["total"], len(t["ids"])))
            destino["ids"].append(jogador)
            destino["total"] += jogador["overall"]
            destino["porSetor"][setor] += 1
    return [t["ids"] for t in times]


def media_overall(time):
    return round(sum(j["overall"] for j in time) / len(time), 1) if time else 0


def validar_jogo(gols_pro, estatisticas):
    gols = sum(e["gols"] for e in estatisticas)
    assistencias = sum(e["assistencias"] for e in estatisticas)
    if gols > gols_pro:
        return f"Os jogadores somam {gols} gols, mas o placar tem {gols_pro}. Corrija o placar ou os gols."
    if assistencias > gols_pro:
        return f"Há {assistencias} assistências para {gols_pro} gols. Cada gol tem no máximo uma assistência."
    return None


def totais_do_atleta(atleta_id, jogos):
    totais = {"jogos": 0, "gols": 0, "assistencias": 0, "desarmes": 0, "defesas": 0}
    for jogo in jogos:
        for e in jogo["estatisticas"]:
            if e["atletaId"] == atleta_id:
                totais["jogos"] += 1
                for campo in ("gols", "assistencias", "desarmes", "defesas"):
                    totais[campo] += e[campo]
    return totais


# ---------------------------------------------------------------------------
# Dados de demonstração (os mesmos perfis do app)
# ---------------------------------------------------------------------------

def criar_banco():
    hoje = hoje_iso()

    def atleta(id_, nome, apelido, idade, posicao, pe, cidade, uf, status, numero=None, base=None, pais="Brasil"):
        return {
            "id": id_, "nome": nome, "apelido": apelido, "nacionalidade": pais,
            "nascimento": somar_dias(hoje, -int(idade * 365.25 + 40)), "posicao": posicao, "pe": pe,
            "cidade": cidade, "uf": uf, "status": status, "numero": numero,
            "avaliacoes": [{"data": somar_dias(hoje, -60), "avaliador": "Carla Mendes",
                            "notas": {c: base.get(c, 6.5) for c in CRITERIOS}}] if base else [],
            "checkins": [], "responsavel": None,
        }

    atletas = [
        atleta("a-joao", "João Silva", "Joãozinho", 17, "Meia", "Direito", "Resende", "RJ", "academia", 10,
               {"passe": 8.5, "drible": 8.5, "finalizacao": 8, "velocidade": 7.5, "posicionamento": 7, "fisico": 7}),
        atleta("a-lucas", "Lucas Ferreira", "Lukinha", 16, "Atacante", "Esquerdo", "Rio de Janeiro", "RJ", "academia", 9,
               {"finalizacao": 8, "velocidade": 8}),
        atleta("a-rafael", "Rafael Costa", "Rafa", 17, "Zagueiro", "Direito", "Barra Mansa", "RJ", "academia", 4,
               {"fisico": 8, "posicionamento": 7.5}),
        atleta("a-bruno", "Bruno Lima", "Brunão", 16, "Volante", "Ambos", "São Paulo", "SP", "academia", 5,
               {"passe": 7.5, "posicionamento": 7.5}),
        atleta("a-thiago", "Thiago Nunes", "Paredão", 16, "Goleiro", "Direito", "Petrópolis", "RJ", "academia", 1,
               {"posicionamento": 8, "fisico": 7.5}),
        atleta("a-felipe", "Felipe Araújo", "Felipinho", 16, "Lateral", "Direito", "Niterói", "RJ", "academia", 2,
               {"velocidade": 8}),
        atleta("a-diego", "Diego Ramos", None, 16, "Atacante", "Esquerdo", "Resende", "RJ", "academia", 7,
               {"velocidade": 8.5, "drible": 7.5}, pais="Argentina"),
        atleta("a-igor", "Igor Batista", None, 17, "Lateral", "Esquerdo", "Campos", "RJ", "academia", 6,
               {"velocidade": 7.5, "passe": 7}),
        atleta("a-kaua", "Kauã Pereira", None, 16, "Meia", "Direito", "Rio de Janeiro", "RJ", "candidato"),
        atleta("a-miguel", "Miguel Rocha", None, 17, "Zagueiro", "Esquerdo", "Juiz de Fora", "MG", "candidato"),
    ]

    # Check-ins dos últimos dias (o Lucas vem com dor, cansaço e sono ruim)
    for a in atletas:
        if a["status"] != "academia":
            continue
        for d in range(6, 0, -1):
            ruim = a["id"] == "a-lucas" and d <= 3
            a["checkins"].append({"data": somar_dias(hoje, -d), "sono": 2 if ruim else 4, "dor": 1 if ruim else 4,
                                  "cansaco": 2 if ruim else 4, "estresse": 2 if ruim else 4,
                                  "minutos": 120 if ruim else 75, "esforco": 9 if ruim else 5})

    # Treinos avaliados nos últimos dias
    treinos = []
    for d in range(5, 0, -1):
        registros = []
        for a in atletas:
            if a["status"] != "academia":
                continue
            if a["id"] == "a-lucas" and d <= 3:
                registros.append({"atletaId": a["id"], "stats": {"perdas": 3}, "falhas": ["intensidade", "finalizacao"], "ajuste": -0.5})
            elif a["id"] == "a-joao":
                registros.append({"atletaId": a["id"], "stats": {"assistencias": 1, "passesDecisivos": 2, "gols": 1 if d % 2 else 0}, "falhas": [], "ajuste": 0.5})
            elif a["posicao"] == "Goleiro":
                registros.append({"atletaId": a["id"], "stats": {"defesas": 3, "golsSofridos": 1}, "falhas": [], "ajuste": 0})
            else:
                registros.append({"atletaId": a["id"], "stats": {"desarmes": 2, "passesDecisivos": 1}, "falhas": ["passe"] if d == 2 else [], "ajuste": 0})
        treinos.append({"id": f"t-{d}", "data": somar_dias(hoje, -d), "categoria": "Sub-17", "avaliador": "Carla Mendes", "registros": registros})

    ct = {"local": "CT Pelé Academia", "endereco": "Centro de Excelência Pelé Academia", "cidade": "Resende", "uf": "RJ", "lat": -22.4686, "lng": -44.4466}
    peneiras = [
        {"id": "p-1", "categoria": "Sub-17", "data": somar_dias(hoje, -4), "horario": "09:00", "vagas": 20, **ct},
        {"id": "p-2", "categoria": "Sub-15", "data": somar_dias(hoje, 9), "horario": "09:00", "vagas": 25, **ct},
        {"id": "p-3", "categoria": "Sub-17", "data": somar_dias(hoje, 16), "horario": "08:30", "vagas": 18,
         "local": "Parque Olímpico da Barra", "endereco": "Av. Embaixador Abelardo Bueno, 3401", "cidade": "Rio de Janeiro", "uf": "RJ", "lat": -22.9772, "lng": -43.395},
        {"id": "p-4", "categoria": "Sub-17", "data": somar_dias(hoje, 23), "horario": "09:00", "vagas": 2,
         "local": "Centro Olímpico", "endereco": "Av. Ibirapuera, 1315", "cidade": "São Paulo", "uf": "SP", "lat": -23.5973, "lng": -46.6547},
    ]
    inscricoes = [
        {"peneiraId": "p-1", "atletaId": "a-kaua", "status": "inscrito", "data": somar_dias(hoje, -20)},
        {"peneiraId": "p-1", "atletaId": "a-miguel", "status": "inscrito", "data": somar_dias(hoje, -18)},
        {"peneiraId": "p-3", "atletaId": "a-kaua", "status": "inscrito", "data": somar_dias(hoje, -2)},
    ]
    jogos = [{
        "id": "j-1", "data": somar_dias(hoje, -3), "categoria": "Sub-17", "adversario": "Resende FC Sub-17", "mando": "casa",
        "golsPro": 2, "golsContra": 1,
        "estatisticas": [
            {"atletaId": "a-joao", "gols": 1, "assistencias": 1, "desarmes": 1, "defesas": 0},
            {"atletaId": "a-lucas", "gols": 1, "assistencias": 0, "desarmes": 0, "defesas": 0},
            {"atletaId": "a-thiago", "gols": 0, "assistencias": 0, "desarmes": 0, "defesas": 4},
            {"atletaId": "a-bruno", "gols": 0, "assistencias": 0, "desarmes": 5, "defesas": 0},
        ],
    }]
    usuarios = [
        {"tipo": "atleta", "nome": "Kauã Pereira", "email": "kaua@exemplo.com", "senha": SENHA_DEMONSTRACAO, "atletaId": "a-kaua"},
        {"tipo": "atleta", "nome": "João Silva", "email": "joao@exemplo.com", "senha": SENHA_DEMONSTRACAO, "atletaId": "a-joao"},
        {"tipo": "atleta", "nome": "Lucas Ferreira", "email": "lucas@exemplo.com", "senha": SENHA_DEMONSTRACAO, "atletaId": "a-lucas"},
        {"tipo": "equipe", "nome": "Carla Mendes", "email": "tecnico@peleacademia.com.br", "senha": SENHA_DEMONSTRACAO, "atletaId": None, "cargo": "Técnica e olheira"},
    ]
    return {"usuarios": usuarios, "atletas": atletas, "peneiras": peneiras, "inscricoes": inscricoes,
            "treinos": treinos, "jogos": jogos, "consultas": []}


def buscar_atleta(banco, atleta_id):
    for a in banco["atletas"]:
        if a["id"] == atleta_id:
            return a
    return None


def nome_curto(atleta):
    return atleta["apelido"] or atleta["nome"]


# ---------------------------------------------------------------------------
# Fluxos do atleta
# ---------------------------------------------------------------------------

def fluxo_cadastro(banco):
    titulo("Criar conta de atleta")
    print("Para candidatos de 7 a 20 anos. Os mesmos campos da tela de cadastro do app.\n")
    dados = {
        "nome": ler_texto("Nome completo: "),
        "apelido": ler_texto("Apelido no campo (opcional): ", obrigatorio=False),
        "nacionalidade": ler_opcao("País: ", ["Brasil", "Argentina", "Uruguai", "Paraguai", "Portugal", "Outro"]),
        "nascimento": ler_data("Data de nascimento"),
        "posicao": ler_opcao("Posição: ", POSICOES),
        "pe": ler_opcao("Pé dominante: ", PES),
        "cidade": ler_texto("Cidade: "),
        "uf": ler_opcao("Estado: ", UFS),
        "alturaCm": ler_inteiro("Altura em cm: "),
        "pesoKg": ler_inteiro("Peso em kg: "),
        "email": ler_texto("E-mail: "),
        "senha": ler_texto("Senha (8+ caracteres, letras e números): "),
        "responsavelNome": "", "responsavelEmail": "", "responsavelTelefone": "", "consentimento": True,
    }
    idade = calcular_idade(dados["nascimento"])
    if IDADE_MINIMA <= idade < MAIORIDADE:
        print(f"\nVocê tem {idade} anos. Precisamos dos dados do responsável.")
        dados["responsavelNome"] = ler_texto("Nome do responsável: ")
        dados["responsavelEmail"] = ler_texto("E-mail do responsável: ")
        dados["responsavelTelefone"] = ler_texto("Telefone do responsável com DDD: ")
        dados["consentimento"] = ler_sim_nao("O responsável autoriza o cadastro e o uso dos dados (LGPD)?")

    erros = validar_cadastro(dados, [u["email"].lower() for u in banco["usuarios"]])
    if erros:
        print("\nCorrija os campos abaixo:")
        for campo, erro in erros.items():
            print(f"  - {campo}: {erro}")
        return
    novo_id = f"a-{len(banco['atletas']) + 1}"
    banco["atletas"].append({
        "id": novo_id, "nome": dados["nome"], "apelido": dados["apelido"] or None, "nacionalidade": dados["nacionalidade"],
        "nascimento": dados["nascimento"], "posicao": dados["posicao"], "pe": dados["pe"], "cidade": dados["cidade"],
        "uf": dados["uf"], "status": "candidato", "numero": None, "avaliacoes": [], "checkins": [],
        "responsavel": {"nome": dados["responsavelNome"]} if dados["responsavelNome"] else None,
    })
    banco["usuarios"].append({"tipo": "atleta", "nome": dados["nome"], "email": dados["email"], "senha": dados["senha"], "atletaId": novo_id})
    print(f"\nConta criada. Categoria: {categoria_por_idade(idade)}. Seu cartão começa com overall "
          f"{calcular_overall(ATRIBUTOS_INICIAIS, dados['posicao'])}: só a nota do treinador muda os números.")


def fluxo_peneiras(banco, atleta):
    titulo("Peneiras")
    abertas = [p for p in banco["peneiras"] if p["data"] >= hoje_iso()]
    for indice, p in enumerate(abertas, start=1):
        permitido, motivo = verificar_inscricao(atleta, p, banco["inscricoes"])
        vagas = vagas_restantes(p, banco["inscricoes"])
        print(f"{indice}. {p['categoria']} em {p['cidade']} ({p['uf']}), {p['data']} às {p['horario']}, "
              f"{vagas} de {p['vagas']} vagas. {'Pode se inscrever.' if permitido else motivo}")
    print("0. Voltar")
    escolha = ler_inteiro("Escolha uma peneira para se inscrever: ", 0, len(abertas))
    if escolha == 0:
        return
    peneira = abertas[escolha - 1]
    permitido, motivo = verificar_inscricao(atleta, peneira, banco["inscricoes"])
    if not permitido:
        print(f"Não foi possível: {motivo}")
        return
    banco["inscricoes"].append({"peneiraId": peneira["id"], "atletaId": atleta["id"], "status": "inscrito", "data": hoje_iso()})
    print(f"Inscrição confirmada na peneira {peneira['categoria']} de {peneira['cidade']}. Leve documento com foto e chuteira.")
    fluxo_como_chegar(peneira)


def fluxo_como_chegar(peneira):
    print(f"\nComo chegar: {peneira['local']}, {peneira['endereco']}, {peneira['cidade']} ({peneira['uf']})")
    for nome, link in opcoes_de_rota(peneira):
        print(f"  {nome:<12} {link}")


def fluxo_minhas_inscricoes(banco, atleta):
    titulo("Minhas inscrições")
    minhas = [i for i in banco["inscricoes"] if i["atletaId"] == atleta["id"]]
    if not minhas:
        print("Nenhuma inscrição ainda.")
        return
    for i in minhas:
        p = next(p for p in banco["peneiras"] if p["id"] == i["peneiraId"])
        situacao = i["status"] if i["status"] != "inscrito" else ("em avaliação" if p["data"] < hoje_iso() else "inscrito")
        print(f"- Peneira {p['categoria']}, {p['cidade']}, {p['data']}: {situacao}")
        if situacao == "inscrito":
            fluxo_como_chegar(p)


def fluxo_checkin(banco, atleta):
    titulo("Check-in do dia")
    if any(c["data"] == hoje_iso() for c in atleta["checkins"]):
        print("Você já fez o check-in de hoje.")
        return
    print("Responda de 1 (muito ruim) a 5 (muito bom).")
    checkin = {
        "data": hoje_iso(),
        "sono": ler_inteiro("Como foi seu sono? ", 1, 5),
        "dor": ler_inteiro("Dor muscular (1 = muita dor, 5 = sem dor): ", 1, 5),
        "cansaco": ler_inteiro("Cansaço (1 = exausto, 5 = descansado): ", 1, 5),
        "estresse": ler_inteiro("Estresse (1 = muito estressado, 5 = tranquilo): ", 1, 5),
        "minutos": ler_inteiro("Minutos de treino hoje: ", 0, 300),
        "esforco": ler_inteiro("Esforço percebido (0 a 10): ", 0, 10),
    }
    atleta["checkins"].append(checkin)
    indice = indice_bem_estar(checkin)
    print(f"\nCheck-in salvo. Bem-estar {indice} de 20: {classificar_bem_estar(indice)}. "
          f"Carga do treino: {carga_do_treino(checkin)} UA.")
    razao = razao_de_carga(atleta["checkins"])
    print(f"Carga da semana em relação à média: {formatar(razao, 2) if razao else 'sem dados'} ({classificar_razao(razao)}).")


def fluxo_evolucao(banco, atleta):
    titulo("Minha evolução")
    atributos, overall = mostrar_cartao(atleta, banco["treinos"])
    historico = treinos_do_atleta(atleta["id"], banco["treinos"])
    if historico:
        print("\nNotas de treino (mais recente por último):")
        print("  " + "  ".join(f"{formatar(nota)}({faixa_da_nota(nota)[:3]})" for _, _, nota in historico[-10:]))
        media = sum(n for _, _, n in historico[-10:]) / len(historico[-10:])
        print(f"  Média dos últimos {len(historico[-10:])} treinos: {formatar(media)}")
        contagem = {}
        for _, registro, _ in historico[-10:]:
            for f in registro["falhas"]:
                contagem[f] = contagem.get(f, 0) + 1
        if contagem:
            print("  Onde está pecando: " + ", ".join(f"{FALHAS[f][0]} ({v}x)" for f, v in sorted(contagem.items(), key=lambda x: -x[1])))
    totais = totais_do_atleta(atleta["id"], banco["jogos"])
    print(f"\nTemporada: {totais['jogos']} jogos, {totais['gols']} gols, {totais['assistencias']} assistências, "
          f"{totais['defesas'] if atleta['posicao'] == 'Goleiro' else totais['desarmes']} {'defesas' if atleta['posicao'] == 'Goleiro' else 'desarmes'}.")
    if atleta["checkins"]:
        print(f"Carga dos últimos 7 dias: {carga_no_periodo(atleta['checkins'], hoje_iso(), 7)} UA "
              f"(razão aguda/crônica: {classificar_razao(razao_de_carga(atleta['checkins']))}).")


def fluxo_cuidado(banco, atleta):
    titulo("Rede de cuidado")
    recomendacao = verificar_cuidado(atleta, banco["treinos"])
    marcadas = [c for c in banco["consultas"] if c["atletaId"] == atleta["id"]]
    for c in marcadas:
        print(f"Consulta marcada: {NOME_PROFISSIONAL[c['profissional']]} em {c['data']} às {c['horario']} ({c['origem']}).")
    if not recomendacao:
        print("Tudo certo por aqui: nenhum sinal de alerta nos seus treinos e check-ins.")
        return
    print("Vamos cuidar de você. A comissão sugere conversar com: " +
          " e ".join(NOME_PROFISSIONAL[p].lower() for p in recomendacao["profissionais"]))
    for d in recomendacao["detalhes"]:
        print(f"  - {d}")
    if not ler_sim_nao("Quer agendar um horário no CT agora?"):
        return
    profissional = ler_opcao("Profissional: ", recomendacao["profissionais"])
    dia = ler_opcao("Dia: ", [somar_dias(hoje_iso(), d) for d in (1, 2, 3)])
    horario = ler_opcao("Horário: ", HORARIOS_CT)
    banco["consultas"].append({"atletaId": atleta["id"], "profissional": profissional, "data": dia, "horario": horario, "origem": "marcada pelo atleta"})
    print(f"Consulta com {NOME_PROFISSIONAL[profissional].lower()} marcada para {dia} às {horario}. A comissão técnica já vê no painel.")


def menu_atleta(banco, usuario):
    atleta = buscar_atleta(banco, usuario["atletaId"])
    while True:
        academia = atleta["status"] == "academia"
        titulo(f"{nome_curto(atleta)} - {'atleta da academia' if academia else 'candidato'}, {categoria_do_atleta(atleta)}")
        if academia:
            opcoes = ["Check-in do dia", "Minha evolução e cartão", "Rede de cuidado", "Peneiras", "Sair da conta"]
        else:
            opcoes = ["Peneiras abertas", "Minhas inscrições e como chegar", "Meu cartão", "Sair da conta"]
        escolha = ler_opcao("Opção: ", opcoes)
        if escolha == "Sair da conta":
            return
        if escolha == "Check-in do dia":
            fluxo_checkin(banco, atleta)
        elif escolha == "Minha evolução e cartão":
            fluxo_evolucao(banco, atleta)
        elif escolha == "Rede de cuidado":
            fluxo_cuidado(banco, atleta)
        elif escolha in ("Peneiras", "Peneiras abertas"):
            fluxo_peneiras(banco, atleta)
        elif escolha == "Minhas inscrições e como chegar":
            fluxo_minhas_inscricoes(banco, atleta)
        elif escolha == "Meu cartão":
            mostrar_cartao(atleta, banco["treinos"])


# ---------------------------------------------------------------------------
# Fluxos da equipe técnica
# ---------------------------------------------------------------------------

def elenco_da_categoria(banco, categoria):
    return [a for a in banco["atletas"] if a["status"] == "academia" and categoria_do_atleta(a) == categoria]


def fluxo_painel(banco):
    titulo("Hoje no CT - painel da equipe")
    academia = [a for a in banco["atletas"] if a["status"] == "academia"]
    com_checkin = sum(1 for a in academia if any(c["data"] == hoje_iso() for c in a["checkins"]))
    aguardando = [i for i in banco["inscricoes"] if i["status"] == "inscrito"
                  and next(p for p in banco["peneiras"] if p["id"] == i["peneiraId"])["data"] <= hoje_iso()]
    print(f"Atletas na academia: {len(academia)} | Check-ins de hoje: {com_checkin}/{len(academia)} | "
          f"Candidatos para avaliar: {len(aguardando)} | Consultas marcadas: {len(banco['consultas'])}")

    # Matriz de notas: linhas = atletas, colunas = últimos 5 treinos
    treinos = sorted(banco["treinos"], key=lambda t: t["data"])[-5:]
    print("\nMatriz de notas (atleta x últimos treinos):")
    print(f"{'Atleta':<12}" + "".join(f"{t['data'][5:]:>7}" for t in treinos) + "   OVR  Atenção")
    for a in academia:
        linha = []
        for t in treinos:
            registro = next((r for r in t["registros"] if r["atletaId"] == a["id"]), None)
            linha.append(formatar(calcular_nota_treino(registro)) if registro else "-")
        overall = calcular_overall(atributos_atuais(a, banco["treinos"]), a["posicao"])
        cuidado = verificar_cuidado(a, banco["treinos"])
        alerta = "sugestão: " + ", ".join(NOME_PROFISSIONAL[p].lower() for p in cuidado["profissionais"]) if cuidado else ""
        print(f"{nome_curto(a):<12}" + "".join(f"{n:>7}" for n in linha) + f"   {overall:>3}  {alerta}")
    for c in banco["consultas"]:
        atleta = buscar_atleta(banco, c["atletaId"])
        print(f"Consulta: {nome_curto(atleta)}, {NOME_PROFISSIONAL[c['profissional']].lower()}, {c['data']} às {c['horario']} ({c['origem']}).")


def fluxo_avaliar_treino(banco):
    titulo("Avaliar treino")
    categoria = ler_opcao("Categoria: ", CATEGORIAS)
    elenco = elenco_da_categoria(banco, categoria)
    if not elenco:
        print("Nenhum atleta nesta categoria.")
        return
    registros = []
    for atleta in elenco:
        print(f"\n{nome_curto(atleta)} ({SIGLA_POSICAO[atleta['posicao']]})")
        if not ler_sim_nao("  Treinou hoje?"):
            continue
        stats = {}
        for stat in STATS_POR_POSICAO[atleta["posicao"]]:
            qtd = ler_inteiro(f"  {STATS[stat][0]}: ", 0, 20)
            if qtd:
                stats[stat] = qtd
        falhas = []
        print("  Onde está pecando? (digite os números separados por vírgula, ou Enter para nenhum)")
        chaves = list(FALHAS.keys())
        for i, chave in enumerate(chaves, start=1):
            print(f"    {i}. {FALHAS[chave][0]}")
        escolhidas = input("  Falhas: ").strip()
        for parte in escolhidas.split(","):
            if parte.strip().isdigit() and 1 <= int(parte) <= len(chaves):
                falhas.append(chaves[int(parte) - 1])
        ajuste = ler_decimal("  Ajuste do treinador (-1 a 1): ", -1, 1)
        registro = {"atletaId": atleta["id"], "stats": stats, "falhas": falhas, "ajuste": ajuste}
        nota = calcular_nota_treino(registro)
        print(f"  Nota do treino: {formatar(nota)} ({faixa_da_nota(nota)})")
        registros.append(registro)
    if not registros:
        print("Nenhum atleta avaliado.")
        return
    antes = {a["id"]: calcular_overall(atributos_atuais(a, banco["treinos"]), a["posicao"]) for a in elenco}
    banco["treinos"] = [t for t in banco["treinos"] if not (t["data"] == hoje_iso() and t["categoria"] == categoria)]
    banco["treinos"].append({"id": f"t-{hoje_iso()}", "data": hoje_iso(), "categoria": categoria, "avaliador": "Equipe", "registros": registros})
    subiram = sum(1 for a in elenco if calcular_overall(atributos_atuais(a, banco["treinos"]), a["posicao"]) > antes[a["id"]])
    cairam = sum(1 for a in elenco if calcular_overall(atributos_atuais(a, banco["treinos"]), a["posicao"]) < antes[a["id"]])
    melhor = max(registros, key=calcular_nota_treino)
    print(f"\nTreino salvo com {len(registros)} atletas. Destaque: {nome_curto(buscar_atleta(banco, melhor['atletaId']))}, "
          f"{formatar(calcular_nota_treino(melhor))}. Overall: {subiram} subiram, {cairam} caíram.")


def fluxo_montar_times(banco):
    titulo("Montar times")
    categoria = ler_opcao("Categoria: ", CATEGORIAS)
    elenco = elenco_da_categoria(banco, categoria)
    if not elenco:
        print("Nenhum atleta nesta categoria.")
        return
    quantidade = ler_inteiro("Quantos times (2 a 4)? ", 2, 4)
    jogadores = [{"nome": nome_curto(a), "posicao": a["posicao"],
                  "overall": calcular_overall(atributos_atuais(a, banco["treinos"]), a["posicao"])} for a in elenco]
    if len(jogadores) < quantidade * 2:
        print(f"Selecione pelo menos {quantidade * 2} atletas para montar {quantidade} times.")
        return
    times = montar_times(jogadores, quantidade)
    for indice, time in enumerate(times):
        print(f"\nTime {NOMES_TIMES[indice]} - overall médio {formatar(media_overall(time))}")
        for j in time:
            print(f"  {SIGLA_POSICAO[j['posicao']]} {j['nome']:<12} {j['overall']}")
    medias = [media_overall(t) for t in times]
    print(f"\nDiferença entre o time mais forte e o mais fraco: {formatar(max(medias) - min(medias))}.")


def fluxo_registrar_jogo(banco):
    titulo("Registrar jogo")
    categoria = ler_opcao("Categoria: ", CATEGORIAS)
    elenco = elenco_da_categoria(banco, categoria)
    adversario = ler_texto("Adversário: ")
    mando = ler_opcao("Mando: ", ["casa", "fora"])
    gols_pro = ler_inteiro("Gols da academia: ", 0, 30)
    gols_contra = ler_inteiro("Gols do adversário: ", 0, 30)
    estatisticas = []
    for atleta in elenco:
        if not ler_sim_nao(f"{nome_curto(atleta)} ({SIGLA_POSICAO[atleta['posicao']]}) jogou?"):
            continue
        e = {"atletaId": atleta["id"], "gols": ler_inteiro("  Gols: ", 0, 20), "assistencias": ler_inteiro("  Assistências: ", 0, 20), "desarmes": 0, "defesas": 0}
        if atleta["posicao"] == "Goleiro":
            e["defesas"] = ler_inteiro("  Defesas: ", 0, 30)
        else:
            e["desarmes"] = ler_inteiro("  Desarmes: ", 0, 30)
        estatisticas.append(e)
    if not estatisticas:
        print("Marque quem jogou.")
        return
    erro = validar_jogo(gols_pro, estatisticas)
    if erro:
        print(f"Não foi possível salvar: {erro}")
        return
    banco["jogos"].append({"id": f"j-{len(banco['jogos']) + 1}", "data": hoje_iso(), "categoria": categoria, "adversario": adversario,
                           "mando": mando, "golsPro": gols_pro, "golsContra": gols_contra, "estatisticas": estatisticas})
    print(f"Jogo contra {adversario} registrado ({gols_pro} x {gols_contra}). As estatísticas já estão no perfil de {len(estatisticas)} atletas.")


def fluxo_avaliar_candidato(banco):
    titulo("Avaliar candidato da peneira")
    pendentes = [i for i in banco["inscricoes"] if i["status"] == "inscrito"
                 and next(p for p in banco["peneiras"] if p["id"] == i["peneiraId"])["data"] <= hoje_iso()]
    if not pendentes:
        print("Nenhum candidato aguardando avaliação.")
        return
    nomes = [f"{buscar_atleta(banco, i['atletaId'])['nome']} (peneira {i['peneiraId']})" for i in pendentes]
    escolhido = pendentes[nomes.index(ler_opcao("Candidato: ", nomes))]
    atleta = buscar_atleta(banco, escolhido["atletaId"])
    notas = {c: ler_decimal(f"Nota de {c} (0 a 10): ", 0, 10) for c in CRITERIOS}
    nota_final = calcular_nota_final(notas)
    print(f"Nota final: {formatar(nota_final)}. {sugerir_decisao(nota_final)}.")
    atleta["avaliacoes"].append({"data": hoje_iso(), "avaliador": "Equipe", "notas": notas})
    if ler_sim_nao("Aprovar o candidato para a academia?"):
        escolhido["status"] = "aprovado"
        atleta["status"] = "academia"
        print(f"{atleta['nome']} agora é atleta da Pelé Academia. O menu dele muda para check-in, evolução e cartão.")
    else:
        escolhido["status"] = "reprovado"
        print("Candidato reprovado nesta peneira. Ele pode tentar a próxima.")


def fluxo_encaminhar(banco):
    titulo("Encaminhar atleta")
    academia = [a for a in banco["atletas"] if a["status"] == "academia"]
    atleta = academia[[nome_curto(a) for a in academia].index(ler_opcao("Atleta: ", [nome_curto(a) for a in academia]))]
    profissional = ler_opcao("Profissional: ", list(NOME_PROFISSIONAL.keys()))
    dia = ler_opcao("Dia: ", [somar_dias(hoje_iso(), d) for d in (1, 2, 3)])
    horario = ler_opcao("Horário: ", HORARIOS_CT)
    motivo = ler_texto("Motivo (opcional): ", obrigatorio=False)
    banco["consultas"].append({"atletaId": atleta["id"], "profissional": profissional, "data": dia, "horario": horario,
                               "origem": "encaminhado pela comissão", "motivo": motivo})
    print(f"{nome_curto(atleta)} encaminhado para {NOME_PROFISSIONAL[profissional].lower()} em {dia} às {horario}. Ele vê a consulta no início do app.")


def fluxo_listar_atletas(banco):
    titulo("Atletas - tabela de atributos")
    # Matriz: uma linha por atleta, colunas = atributos da posição
    print(f"{'Atleta':<12}{'POS':<5}{'OVR':>4}  {'Atributos'}")
    for a in banco["atletas"]:
        atributos = atributos_atuais(a, banco["treinos"])
        lista = ATRIBUTOS_GOLEIRO if a["posicao"] == "Goleiro" else ATRIBUTOS_LINHA
        valores = "  ".join(f"{atr[:3].upper()} {round(atributos[atr]):>2}" for atr in lista)
        print(f"{nome_curto(a):<12}{SIGLA_POSICAO[a['posicao']]:<5}{calcular_overall(atributos, a['posicao']):>4}  {valores}  ({a['status']})")


def menu_equipe(banco, usuario):
    while True:
        titulo(f"{usuario['nome']} - {usuario['cargo']}")
        opcoes = ["Painel do dia", "Avaliar treino", "Montar times", "Registrar jogo", "Avaliar candidato da peneira",
                  "Atletas e atributos", "Encaminhar atleta (fisio / psicólogo)", "Sair da conta"]
        escolha = ler_opcao("Opção: ", opcoes)
        if escolha == "Sair da conta":
            return
        {"Painel do dia": fluxo_painel, "Avaliar treino": fluxo_avaliar_treino, "Montar times": fluxo_montar_times,
         "Registrar jogo": fluxo_registrar_jogo, "Avaliar candidato da peneira": fluxo_avaliar_candidato,
         "Atletas e atributos": fluxo_listar_atletas, "Encaminhar atleta (fisio / psicólogo)": fluxo_encaminhar}[escolha](banco)


# ---------------------------------------------------------------------------
# Entrada e menu principal (tela Entrar)
# ---------------------------------------------------------------------------

def fluxo_entrar(banco):
    titulo("Entrar")
    tipo = ler_opcao("Tipo de acesso: ", ["Atleta (candidato ou da academia)", "Equipe técnica"])
    tipo = "equipe" if tipo.startswith("Equipe") else "atleta"
    email = ler_texto("E-mail: ").lower()
    senha = ler_texto("Senha: ")
    conta = next((u for u in banco["usuarios"] if u["email"].lower() == email), None)
    if not conta or conta["senha"] != senha:
        print("E-mail ou senha incorretos. Confira e tente de novo.")
        return
    if conta["tipo"] != tipo:
        print("Esta conta é da equipe da academia. Selecione 'Equipe' para entrar." if conta["tipo"] == "equipe"
              else "Esta conta é de atleta. Selecione 'Atleta' para entrar.")
        return
    print(f"Olá, {conta['nome'].split()[0]}. Bom te ver por aqui.")
    if conta["tipo"] == "equipe":
        menu_equipe(banco, conta)
    else:
        menu_atleta(banco, conta)


def main():
    banco = criar_banco()
    print("PELÉ ACADEMIA - Onde o legado entra em campo")
    print("Gêmeo lógico do MVP Visual. Contas de demonstração (senha pele2026):")
    print("  kaua@exemplo.com (candidato) | joao@exemplo.com (atleta) | lucas@exemplo.com (atleta em alerta) | tecnico@peleacademia.com.br (equipe)")
    while True:
        titulo("Menu principal")
        escolha = ler_opcao("Opção: ", ["Entrar", "Criar conta de atleta", "Encerrar"])
        if escolha == "Entrar":
            fluxo_entrar(banco)
        elif escolha == "Criar conta de atleta":
            fluxo_cadastro(banco)
        else:
            print("Até o próximo treino.")
            break


if __name__ == "__main__":
    main()
