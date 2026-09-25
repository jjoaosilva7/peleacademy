/*
 * data.js · dados de exemplo da rede de talentos (os mesmos perfis do MVP Visual).
 * Em produção estes dados viriam de uma API; aqui ficam em memória para o feed ser navegável.
 */
window.PA = window.PA || {};

PA.USUARIO_ATUAL = 'u-joao'; // quem está usando a página (usado para votos e "seguir")

PA.POSICOES = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];
PA.SIGLA = { Goleiro: 'GOL', Zagueiro: 'ZAG', Lateral: 'LAT', Volante: 'VOL', Meia: 'MEI', Atacante: 'ATA' };
PA.UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function tag(nome, votos) {
  return { nome: nome, votos: votos.slice() };
}

PA.ATLETAS = [
  { id: 'a-joao', nome: 'João Silva', apelido: 'Joãozinho', posicao: 'Meia', idade: 17, categoria: 'Sub-17', cidade: 'Resende', uf: 'RJ', status: 'academia', overall: 76, seguidores: ['u-kaua', 'u-carla'], tags: [tag('Visão de jogo', ['u-carla', 'u-lucas']), tag('Passe em profundidade', ['u-carla']), tag('Drible curto', [])] },
  { id: 'a-lucas', nome: 'Lucas Ferreira', apelido: 'Lukinha', posicao: 'Atacante', idade: 16, categoria: 'Sub-17', cidade: 'Rio de Janeiro', uf: 'RJ', status: 'academia', overall: 68, seguidores: ['u-joao'], tags: [tag('Boa finalização', ['u-joao']), tag('Arranque', []), tag('Jogo aéreo', ['u-carla'])] },
  { id: 'a-rafael', nome: 'Rafael Costa', apelido: 'Rafa', posicao: 'Zagueiro', idade: 17, categoria: 'Sub-17', cidade: 'Barra Mansa', uf: 'RJ', status: 'academia', overall: 62, seguidores: [], tags: [tag('Desarme', ['u-bruno']), tag('Jogo aéreo', [])] },
  { id: 'a-bruno', nome: 'Bruno Lima', apelido: 'Brunão', posicao: 'Volante', idade: 16, categoria: 'Sub-17', cidade: 'São Paulo', uf: 'SP', status: 'academia', overall: 68, seguidores: ['u-joao'], tags: [tag('Marcação', ['u-joao', 'u-carla']), tag('Passe longo', [])] },
  { id: 'a-thiago', nome: 'Thiago Nunes', apelido: 'Paredão', posicao: 'Goleiro', idade: 16, categoria: 'Sub-17', cidade: 'Petrópolis', uf: 'RJ', status: 'academia', overall: 71, seguidores: ['u-lucas'], tags: [tag('Reflexo', ['u-lucas', 'u-joao']), tag('Saída do gol', [])] },
  { id: 'a-felipe', nome: 'Felipe Araújo', apelido: 'Felipinho', posicao: 'Lateral', idade: 16, categoria: 'Sub-17', cidade: 'Niterói', uf: 'RJ', status: 'academia', overall: 68, seguidores: [], tags: [tag('Velocidade', ['u-carla']), tag('Apoio ao ataque', [])] },
  { id: 'a-diego', nome: 'Diego Ramos', apelido: null, posicao: 'Atacante', idade: 16, categoria: 'Sub-17', cidade: 'Resende', uf: 'RJ', status: 'academia', overall: 72, seguidores: ['u-carla'], tags: [tag('Velocidade', ['u-joao']), tag('Um contra um', [])] },
  { id: 'a-samuel', nome: 'Samuel Duarte', apelido: null, posicao: 'Volante', idade: 17, categoria: 'Sub-17', cidade: 'Belo Horizonte', uf: 'MG', status: 'academia', overall: 69, seguidores: [], tags: [tag('Desarme', []), tag('Fôlego', ['u-carla'])] },
  { id: 'a-henrique', nome: 'Henrique Moraes', apelido: 'Rique', posicao: 'Meia', idade: 16, categoria: 'Sub-17', cidade: 'Taubaté', uf: 'SP', status: 'academia', overall: 72, seguidores: ['u-lucas'], tags: [tag('Criatividade', ['u-lucas']), tag('Drible curto', [])] },
  { id: 'a-gabriel', nome: 'Gabriel Souza', apelido: null, posicao: 'Lateral', idade: 19, categoria: 'Sub-20', cidade: 'Belo Horizonte', uf: 'MG', status: 'academia', overall: 63, seguidores: [], tags: [tag('Cruzamento', []), tag('Velocidade', ['u-carla'])] },
  { id: 'a-enzo', nome: 'Enzo Martins', apelido: 'Enzinho', posicao: 'Meia', idade: 12, categoria: 'Sub-13 Futsal', cidade: 'Resende', uf: 'RJ', status: 'academia', overall: 68, seguidores: ['u-joao'], tags: [tag('Drible curto', ['u-joao']), tag('Criatividade', [])] },
  { id: 'a-kaua', nome: 'Kauã Pereira', apelido: null, posicao: 'Meia', idade: 16, categoria: 'Sub-17', cidade: 'Rio de Janeiro', uf: 'RJ', status: 'candidato', overall: 52, seguidores: [], tags: [tag('Drible curto', []), tag('Chute de fora', [])] },
  { id: 'a-miguel', nome: 'Miguel Rocha', apelido: null, posicao: 'Zagueiro', idade: 17, categoria: 'Sub-17', cidade: 'Juiz de Fora', uf: 'MG', status: 'candidato', overall: 47, seguidores: [], tags: [tag('Jogo aéreo', [])] },
  { id: 'a-pedro', nome: 'Pedro Henrique Dias', apelido: null, posicao: 'Lateral', idade: 16, categoria: 'Sub-17', cidade: 'Campinas', uf: 'SP', status: 'candidato', overall: 50, seguidores: [], tags: [tag('Velocidade', []), tag('Cruzamento', [])] },
  { id: 'a-arthur', nome: 'Arthur Almeida', apelido: null, posicao: 'Goleiro', idade: 14, categoria: 'Sub-15', cidade: 'Niterói', uf: 'RJ', status: 'candidato', overall: 52, seguidores: [], tags: [tag('Reflexo', [])] },
  { id: 'a-davi', nome: 'Davi Santos', apelido: null, posicao: 'Atacante', idade: 15, categoria: 'Sub-15', cidade: 'Salvador', uf: 'BA', status: 'candidato', overall: 54, seguidores: [], tags: [tag('Arranque', [])] },
];

PA.CONTAS_DEMO = [
  { email: 'kaua@exemplo.com', senha: 'pele2026', nome: 'Kauã Pereira', tipo: 'atleta' },
  { email: 'joao@exemplo.com', senha: 'pele2026', nome: 'João Silva', tipo: 'atleta' },
  { email: 'lucas@exemplo.com', senha: 'pele2026', nome: 'Lucas Ferreira', tipo: 'atleta' },
  { email: 'tecnico@peleacademia.com.br', senha: 'pele2026', nome: 'Carla Mendes', tipo: 'equipe' },
];
