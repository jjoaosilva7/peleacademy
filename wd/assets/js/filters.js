/*
 * filters.js · filtros em tempo real da rede de talentos: nome, posição, estado (região)
 * e "só quem eu sigo". Cada mudança nos campos redesenha a lista sem recarregar a página.
 */
window.PA = window.PA || {};

(function () {
  'use strict';

  var campos = {};

  /** Remove acentos e caixa para a busca por nome ser tolerante. */
  function normalizar(texto) {
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /** Devolve os atletas que passam pelos filtros atuais. */
  PA.filtrar = function (atletas) {
    var termo = normalizar(campos.busca.value.trim());
    var posicao = campos.posicao.value;
    var uf = campos.uf.value;
    var soSeguindo = campos.soSeguindo.checked;
    return atletas.filter(function (a) {
      if (termo && normalizar(a.nome + ' ' + (a.apelido || '')).indexOf(termo) === -1) return false;
      if (posicao && a.posicao !== posicao) return false;
      if (uf && a.uf !== uf) return false;
      if (soSeguindo && a.seguidores.indexOf(PA.USUARIO_ATUAL) === -1) return false;
      return true;
    });
  };

  /** Preenche os selects com as opções dos dados e liga os escutadores de mudança. */
  PA.iniciarFiltros = function (aoMudar) {
    campos.busca = document.getElementById('filtro-busca');
    campos.posicao = document.getElementById('filtro-posicao');
    campos.uf = document.getElementById('filtro-uf');
    campos.soSeguindo = document.getElementById('so-seguindo');

    PA.POSICOES.forEach(function (p) {
      campos.posicao.appendChild(new Option(p, p));
    });
    // Só os estados que têm atletas, em ordem alfabética
    var ufs = PA.ATLETAS.map(function (a) { return a.uf; }).filter(function (uf, i, lista) { return lista.indexOf(uf) === i; }).sort();
    ufs.forEach(function (uf) {
      campos.uf.appendChild(new Option(uf, uf));
    });

    campos.busca.addEventListener('input', aoMudar);
    campos.posicao.addEventListener('change', aoMudar);
    campos.uf.addEventListener('change', aoMudar);
    campos.soSeguindo.addEventListener('change', aoMudar);

    document.getElementById('limpar-filtros').addEventListener('click', function () {
      campos.busca.value = '';
      campos.posicao.value = '';
      campos.uf.value = '';
      campos.soSeguindo.checked = false;
      aoMudar();
      PA.avisar('Filtros limpos.', 'info');
      campos.busca.focus();
    });
  };
})();
