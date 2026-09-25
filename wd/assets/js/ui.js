/*
 * ui.js · componentes de interface reutilizáveis: avisos (toasts), abas e marcação
 * do link ativo no menu. Não conhece os dados do feed nem as regras de validação.
 */
window.PA = window.PA || {};

(function () {
  'use strict';

  /** Cria (uma vez) o contêiner de avisos, com aria-live para leitores de tela. */
  function contenedorDeAvisos() {
    var caixa = document.getElementById('avisos');
    if (!caixa) {
      caixa = document.createElement('div');
      caixa.id = 'avisos';
      caixa.className = 'avisos';
      caixa.setAttribute('aria-live', 'polite');
      document.body.appendChild(caixa);
    }
    return caixa;
  }

  /**
   * Mostra um aviso dinâmico (toast) e o remove sozinho depois de alguns segundos.
   * tipo: 'sucesso' | 'erro' | 'info'
   */
  PA.avisar = function (texto, tipo) {
    var caixa = contenedorDeAvisos();
    var aviso = document.createElement('div');
    aviso.className = 'aviso ' + (tipo || 'info');
    aviso.setAttribute('role', 'status');

    var mensagem = document.createElement('span');
    mensagem.textContent = texto;

    var fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar aviso');
    fechar.textContent = '×';
    fechar.addEventListener('click', function () { aviso.remove(); });

    aviso.appendChild(mensagem);
    aviso.appendChild(fechar);
    caixa.appendChild(aviso);
    setTimeout(function () { aviso.remove(); }, 4500);
  };

  /**
   * Abas acessíveis: os botões com [role=tab] dentro do contêiner alternam a classe/atributo
   * aria-selected e chamam aoMudar(id). As setas do teclado também trocam de aba.
   */
  PA.abas = function (contenedor, aoMudar) {
    var botoes = Array.prototype.slice.call(contenedor.querySelectorAll('[role=tab]'));

    function selecionar(botao) {
      botoes.forEach(function (b) {
        var ativo = b === botao;
        b.setAttribute('aria-selected', String(ativo));
        b.tabIndex = ativo ? 0 : -1;
      });
      aoMudar(botao.dataset.aba);
    }

    botoes.forEach(function (botao, indice) {
      botao.addEventListener('click', function () { selecionar(botao); });
      botao.addEventListener('keydown', function (evento) {
        var proximo = null;
        if (evento.key === 'ArrowRight') proximo = botoes[(indice + 1) % botoes.length];
        if (evento.key === 'ArrowLeft') proximo = botoes[(indice - 1 + botoes.length) % botoes.length];
        if (proximo) {
          evento.preventDefault();
          proximo.focus();
          selecionar(proximo);
        }
      });
    });
  };

  /** Marca no menu o link da página atual (aria-current="page"). */
  PA.marcarPaginaAtual = function () {
    var atual = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topo nav a').forEach(function (link) {
      if (link.getAttribute('href') === atual) link.setAttribute('aria-current', 'page');
    });
  };

  /** Escapa texto para montar HTML com segurança. */
  PA.escapar = function (texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  document.addEventListener('DOMContentLoaded', PA.marcarPaginaAtual);
})();
