/*
 * feed.js · rede de talentos: desenha a lista de atletas, confirma tags de atributos
 * (votos dinâmicos) e alterna "seguir". Usa PA.filtrar (filters.js) para saber
 * quais atletas mostrar e PA.avisar (ui.js) para dar feedback.
 */
window.PA = window.PA || {};

(function () {
  'use strict';

  var lista, contagem, vazio;
  var abaAtiva = 'todos';

  function iniciais(nome) {
    return nome.split(' ').filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }

  function faixa(overall) {
    if (overall >= 75) return 'elite';
    if (overall >= 60) return 'destaque';
    return 'base';
  }

  function nomeCurto(atleta) {
    return atleta.apelido || atleta.nome;
  }

  /** Monta o HTML de um atleta (a vitrine estilo produto do app). */
  function htmlDoAtleta(atleta, indice) {
    var eu = PA.USUARIO_ATUAL;
    var segue = atleta.seguidores.indexOf(eu) !== -1;
    var souEu = 'u-' + atleta.id.slice(2) === eu;
    var tags = atleta.tags.map(function (t, i) {
      var votou = t.votos.indexOf(eu) !== -1;
      return '<li><button type="button" class="tag" data-acao="votar" data-atleta="' + atleta.id + '" data-tag="' + i + '" aria-pressed="' + votou + '"' +
        (souEu ? ' disabled title="Você não confirma os próprios atributos"' : '') + '>' +
        PA.escapar(t.nome) + ' <span class="votos" aria-label="' + t.votos.length + ' confirmações">' + t.votos.length + '</span></button></li>';
    }).join('');

    return '<li class="atleta" data-id="' + atleta.id + '">' +
      '<div class="atleta-foto f' + (indice % 4) + '">' +
        '<span class="silhueta" role="img" aria-label="' + PA.escapar(atleta.nome) + ', sem foto">' + iniciais(atleta.nome) + '</span>' +
        '<span class="overall ' + faixa(atleta.overall) + '" aria-label="Overall ' + atleta.overall + '">' + atleta.overall + '</span>' +
      '</div>' +
      '<div class="atleta-corpo">' +
        '<h3>' + PA.escapar(nomeCurto(atleta)) + '</h3>' +
        '<p class="meta">' + PA.SIGLA[atleta.posicao] + ' · ' + atleta.idade + ' anos · ' + PA.escapar(atleta.categoria) + ' · ' + PA.escapar(atleta.cidade) + ' (' + atleta.uf + ')' +
          (atleta.status === 'candidato' ? ' · candidato' : '') + '</p>' +
        '<ul class="tags" aria-label="Pontos fortes de ' + PA.escapar(atleta.nome) + '">' + tags + '</ul>' +
        '<div class="acoes">' +
          '<span class="seguidores" data-seguidores>' + atleta.seguidores.length + ' seguidor' + (atleta.seguidores.length === 1 ? '' : 'es') + '</span>' +
          (souEu ? '<span class="meta">Você</span>' :
            '<button type="button" class="botao botao-contorno" data-acao="seguir" data-atleta="' + atleta.id + '" aria-pressed="' + segue + '">' + (segue ? 'Seguindo' : 'Seguir') + '</button>') +
        '</div>' +
      '</div>' +
    '</li>';
  }

  /** Aplica os filtros e a aba atual e redesenha a lista (sem recarregar a página). */
  PA.desenharFeed = function () {
    var filtrados = PA.filtrar(PA.ATLETAS).filter(function (a) {
      if (abaAtiva === 'academia') return a.status === 'academia';
      if (abaAtiva === 'candidatos') return a.status === 'candidato';
      return true;
    });
    lista.innerHTML = filtrados.map(htmlDoAtleta).join('');
    contagem.textContent = filtrados.length + (filtrados.length === 1 ? ' atleta' : ' atletas');
    vazio.classList.toggle('oculto', filtrados.length > 0);
  };

  /** Alterna a confirmação de um atributo pelo usuário atual (voto único por pessoa). */
  function votar(atletaId, indiceTag) {
    var atleta = PA.ATLETAS.filter(function (a) { return a.id === atletaId; })[0];
    var tagAlvo = atleta.tags[indiceTag];
    var posicao = tagAlvo.votos.indexOf(PA.USUARIO_ATUAL);
    if (posicao === -1) {
      tagAlvo.votos.push(PA.USUARIO_ATUAL);
      PA.avisar('Você confirmou "' + tagAlvo.nome + '" de ' + nomeCurto(atleta) + '.', 'sucesso');
    } else {
      tagAlvo.votos.splice(posicao, 1);
      PA.avisar('Confirmação de "' + tagAlvo.nome + '" removida.', 'info');
    }
    // Atualiza só o botão da tag, sem redesenhar a lista inteira
    var botao = lista.querySelector('[data-acao="votar"][data-atleta="' + atletaId + '"][data-tag="' + indiceTag + '"]');
    botao.setAttribute('aria-pressed', String(posicao === -1));
    var contador = botao.querySelector('.votos');
    contador.textContent = tagAlvo.votos.length;
    contador.setAttribute('aria-label', tagAlvo.votos.length + ' confirmações');
  }

  /** Alterna seguir / deixar de seguir e atualiza o contador de seguidores. */
  function seguir(atletaId) {
    var atleta = PA.ATLETAS.filter(function (a) { return a.id === atletaId; })[0];
    var posicao = atleta.seguidores.indexOf(PA.USUARIO_ATUAL);
    var agoraSegue = posicao === -1;
    if (agoraSegue) atleta.seguidores.push(PA.USUARIO_ATUAL);
    else atleta.seguidores.splice(posicao, 1);

    var cartao = lista.querySelector('.atleta[data-id="' + atletaId + '"]');
    var botao = cartao.querySelector('[data-acao="seguir"]');
    botao.setAttribute('aria-pressed', String(agoraSegue));
    botao.textContent = agoraSegue ? 'Seguindo' : 'Seguir';
    cartao.querySelector('[data-seguidores]').textContent = atleta.seguidores.length + ' seguidor' + (atleta.seguidores.length === 1 ? '' : 'es');
    PA.avisar(agoraSegue ? 'Agora você segue ' + nomeCurto(atleta) + '.' : 'Você deixou de seguir ' + nomeCurto(atleta) + '.', agoraSegue ? 'sucesso' : 'info');

    // Se o filtro "só quem eu sigo" estiver ligado, a lista precisa refletir a mudança
    if (document.getElementById('so-seguindo').checked) PA.desenharFeed();
  }

  document.addEventListener('DOMContentLoaded', function () {
    lista = document.getElementById('lista-atletas');
    contagem = document.getElementById('contagem');
    vazio = document.getElementById('vazio');
    if (!lista) return; // esta página não tem feed

    // Um único escutador para todos os botões da lista (delegação de eventos)
    lista.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[data-acao]');
      if (!botao) return;
      if (botao.dataset.acao === 'votar') votar(botao.dataset.atleta, Number(botao.dataset.tag));
      if (botao.dataset.acao === 'seguir') seguir(botao.dataset.atleta);
    });

    PA.abas(document.getElementById('abas-feed'), function (aba) {
      abaAtiva = aba;
      PA.desenharFeed();
    });

    PA.iniciarFiltros(PA.desenharFeed);
    PA.desenharFeed();
  });
})();
