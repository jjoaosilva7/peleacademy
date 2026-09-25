/*
 * validation.js · validação interativa dos formulários de cadastro e de entrar.
 * As regras são as mesmas do app (e do gêmeo lógico em Python): idade de 7 a 20 anos,
 * categoria pela idade, e-mail válido, senha com letras e números, responsável e
 * consentimento para menores de 18. As mensagens aparecem ao lado do campo e num resumo.
 */
window.PA = window.PA || {};

(function () {
  'use strict';

  var IDADE_MINIMA = 7, IDADE_MAXIMA = 20, MAIORIDADE = 18;

  /* ---------- Regras puras (sem DOM) ---------- */

  PA.calcularIdade = function (nascimentoIso) {
    var hoje = new Date();
    var nasc = new Date(nascimentoIso + 'T00:00:00');
    if (isNaN(nasc.getTime())) return null;
    var idade = hoje.getFullYear() - nasc.getFullYear();
    var mesAntes = hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate());
    return mesAntes ? idade - 1 : idade;
  };

  PA.categoriaPorIdade = function (idade) {
    if (idade === null || idade < IDADE_MINIMA || idade > IDADE_MAXIMA) return null;
    if (idade <= 11) return 'Sub-11 Futsal';
    if (idade <= 13) return 'Sub-13 Futsal';
    if (idade <= 15) return 'Sub-15';
    if (idade <= 17) return 'Sub-17';
    return 'Sub-20';
  };

  PA.validarEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  };

  PA.validarSenha = function (senha) {
    if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
    if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return 'Use letras e números na senha.';
    return null;
  };

  /** Valida todos os campos do cadastro. Devolve { campo: mensagem }. */
  PA.validarCadastro = function (d) {
    var erros = {};
    if (d.nome.trim().split(/\s+/).length < 2) erros.nome = 'Informe nome e sobrenome.';
    if (d.apelido.trim().length > 16) erros.apelido = 'Use um apelido com até 16 caracteres.';
    var idade = PA.calcularIdade(d.nascimento);
    if (!d.nascimento || idade === null) erros.nascimento = 'Informe a data de nascimento.';
    else if (idade < IDADE_MINIMA || idade > IDADE_MAXIMA) erros.nascimento = 'A academia atende atletas de ' + IDADE_MINIMA + ' a ' + IDADE_MAXIMA + ' anos (idade informada: ' + idade + ').';
    if (!d.posicao) erros.posicao = 'Escolha sua posição.';
    if (!d.cidade.trim()) erros.cidade = 'Informe sua cidade.';
    if (!d.uf) erros.uf = 'Escolha o estado.';
    if (!PA.validarEmail(d.email)) erros.email = 'Informe um e-mail válido, como nome@exemplo.com.';
    var erroSenha = PA.validarSenha(d.senha);
    if (erroSenha) erros.senha = erroSenha;
    if (!d.confirmarSenha) erros.confirmarSenha = 'Repita a senha.';
    else if (d.confirmarSenha !== d.senha) erros.confirmarSenha = 'As senhas não são iguais.';
    if (idade !== null && idade >= IDADE_MINIMA && idade < MAIORIDADE) {
      if (d.responsavelNome.trim().split(/\s+/).length < 2) erros.responsavelNome = 'Informe o nome completo do responsável.';
      if (!PA.validarEmail(d.responsavelEmail)) erros.responsavelEmail = 'Informe o e-mail do responsável.';
      var digitos = d.responsavelTelefone.replace(/\D/g, '');
      if (digitos.length < 10 || digitos.length > 11) erros.responsavelTelefone = 'Informe o telefone com DDD (10 ou 11 dígitos).';
      if (!d.consentimento) erros.consentimento = 'Atletas menores de 18 anos precisam da autorização do responsável.';
    }
    return erros;
  };

  /* ---------- Ligação com o DOM ---------- */

  /** Mostra ou esconde a mensagem de erro de um campo e marca aria-invalid. */
  function mostrarErro(form, campo, mensagem) {
    var entrada = form.elements[campo];
    var caixa = form.querySelector('[data-erro="' + campo + '"]');
    if (!caixa) return;
    caixa.textContent = mensagem || '';
    caixa.classList.toggle('visivel', Boolean(mensagem));
    if (entrada) {
      if (mensagem) entrada.setAttribute('aria-invalid', 'true');
      else entrada.removeAttribute('aria-invalid');
    }
  }

  function lerCadastro(form) {
    var f = form.elements;
    return {
      nome: f.nome.value, apelido: f.apelido.value, nascimento: f.nascimento.value, posicao: f.posicao.value,
      cidade: f.cidade.value, uf: f.uf.value, email: f.email.value, senha: f.senha.value, confirmarSenha: f.confirmarSenha.value,
      responsavelNome: f.responsavelNome.value, responsavelEmail: f.responsavelEmail.value,
      responsavelTelefone: f.responsavelTelefone.value, consentimento: f.consentimento.checked,
    };
  }

  function iniciarCadastro(form) {
    var campos = ['nome', 'apelido', 'nascimento', 'posicao', 'cidade', 'uf', 'email', 'senha', 'confirmarSenha', 'responsavelNome', 'responsavelEmail', 'responsavelTelefone', 'consentimento'];
    var resumo = document.getElementById('resumo-erros');
    var blocoResponsavel = document.getElementById('bloco-responsavel');
    var categoriaViva = document.getElementById('categoria-viva');
    var tentouEnviar = false;

    PA.POSICOES.forEach(function (p) { form.elements.posicao.appendChild(new Option(p, p)); });
    PA.UFS.forEach(function (uf) { form.elements.uf.appendChild(new Option(uf, uf)); });

    function aplicarErros(erros) {
      campos.forEach(function (campo) { mostrarErro(form, campo, erros[campo]); });
      var lista = Object.keys(erros);
      resumo.classList.toggle('visivel', lista.length > 0);
      resumo.innerHTML = lista.length ? 'Corrija ' + lista.length + (lista.length === 1 ? ' campo:' : ' campos:') +
        '<ul>' + lista.map(function (c) { return '<li>' + PA.escapar(erros[c]) + '</li>'; }).join('') + '</ul>' : '';
    }

    /** Mostra a categoria e o bloco do responsável assim que a data é digitada (revelação progressiva). */
    function atualizarPelaIdade() {
      var idade = PA.calcularIdade(form.elements.nascimento.value);
      var categoria = PA.categoriaPorIdade(idade);
      categoriaViva.textContent = categoria ? 'Categoria: ' + categoria + ' (' + idade + ' anos)' : '';
      categoriaViva.classList.toggle('oculto', !categoria);
      var menor = idade !== null && idade >= IDADE_MINIMA && idade < MAIORIDADE;
      blocoResponsavel.classList.toggle('oculto', !menor);
    }

    form.elements.nascimento.addEventListener('input', atualizarPelaIdade);
    form.elements.nascimento.addEventListener('change', atualizarPelaIdade);

    // Depois da primeira tentativa, cada campo é revalidado enquanto o usuário digita
    form.addEventListener('input', function () {
      if (tentouEnviar) aplicarErros(PA.validarCadastro(lerCadastro(form)));
    });

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      tentouEnviar = true;
      var dados = lerCadastro(form);
      var erros = PA.validarCadastro(dados);
      aplicarErros(erros);
      var primeiro = Object.keys(erros)[0];
      if (primeiro) {
        form.elements[primeiro].focus();
        PA.avisar('Alguns campos precisam de atenção.', 'erro');
        return;
      }
      var overallInicial = dados.posicao === 'Goleiro' ? 52 : { Atacante: 53, Meia: 52, Volante: 49, Zagueiro: 47, Lateral: 50 }[dados.posicao];
      var sucesso = document.getElementById('cadastro-sucesso');
      sucesso.textContent = 'Conta criada para ' + dados.nome.trim() + '. Categoria ' + PA.categoriaPorIdade(PA.calcularIdade(dados.nascimento)) +
        '. Seu cartão começa com overall ' + overallInicial + ': daqui pra frente, só a nota do treinador muda os números.';
      sucesso.classList.add('visivel');
      sucesso.focus();
      PA.avisar('Cadastro concluído. Bem-vindo à Pelé Academia!', 'sucesso');
      form.reset();
      atualizarPelaIdade();
      aplicarErros({});
    });
  }

  function iniciarEntrar(form) {
    var tentouEnviar = false;

    function validar() {
      var erros = {};
      if (!PA.validarEmail(form.elements.email.value)) erros.email = 'Informe um e-mail válido, como nome@exemplo.com.';
      if (!form.elements.senha.value) erros.senha = 'Informe sua senha.';
      mostrarErro(form, 'email', erros.email);
      mostrarErro(form, 'senha', erros.senha);
      return erros;
    }

    form.addEventListener('input', function () { if (tentouEnviar) validar(); });

    // Atalhos das contas de demonstração preenchem o formulário
    document.querySelectorAll('[data-demo]').forEach(function (botao) {
      botao.addEventListener('click', function () {
        var conta = PA.CONTAS_DEMO[Number(botao.dataset.demo)];
        form.elements.email.value = conta.email;
        form.elements.senha.value = conta.senha;
        form.elements.tipo.value = conta.tipo;
        PA.avisar('Dados de ' + conta.nome.split(' ')[0] + ' preenchidos. Toque em Entrar.', 'info');
        form.elements.email.focus();
      });
    });

    document.getElementById('mostrar-senha').addEventListener('click', function () {
      var campo = form.elements.senha;
      var mostrar = campo.type === 'password';
      campo.type = mostrar ? 'text' : 'password';
      this.setAttribute('aria-pressed', String(mostrar));
      this.textContent = mostrar ? 'Ocultar senha' : 'Mostrar senha';
    });

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      tentouEnviar = true;
      var erros = validar();
      var primeiro = Object.keys(erros)[0];
      if (primeiro) {
        form.elements[primeiro].focus();
        return;
      }
      var email = form.elements.email.value.trim().toLowerCase();
      var conta = PA.CONTAS_DEMO.filter(function (c) { return c.email === email; })[0];
      var geral = document.getElementById('erro-geral');
      if (!conta || conta.senha !== form.elements.senha.value) {
        geral.textContent = 'E-mail ou senha incorretos. Confira e tente de novo.';
        geral.classList.add('visivel');
        PA.avisar('Não foi possível entrar.', 'erro');
        return;
      }
      if (conta.tipo !== form.elements.tipo.value) {
        geral.textContent = conta.tipo === 'equipe' ? 'Esta conta é da equipe da academia. Selecione "Equipe" para entrar.' : 'Esta conta é de atleta. Selecione "Atleta" para entrar.';
        geral.classList.add('visivel');
        return;
      }
      geral.classList.remove('visivel');
      PA.avisar('Olá, ' + conta.nome.split(' ')[0] + '. Bom te ver por aqui.', 'sucesso');
      setTimeout(function () { location.href = 'index.html'; }, 900);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var cadastro = document.getElementById('form-cadastro');
    var entrar = document.getElementById('form-entrar');
    if (cadastro) iniciarCadastro(cadastro);
    if (entrar) iniciarEntrar(entrar);
  });
})();
