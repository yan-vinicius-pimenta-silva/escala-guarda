let db = null;
    let activeModalId = null;

    // Funções de Modal
    function abrirModal(modalId) {
      document.getElementById(modalId).style.display = 'block';
      activeModalId = modalId;
    }

    function fecharModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
      activeModalId = null;
    }

    // Adicionar evento de teclado global
    document.addEventListener('keydown', function (event) {
      // Se não houver modal aberto, não fazer nada
      if (!activeModalId) return;

      // ESC para fechar o modal
      if (event.key === 'Escape') {
        fecharModal(activeModalId);
        event.preventDefault();
      }

      // ENTER para salvar (exceto em textarea)
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();

        // Mapeamento das funções de salvar para cada modal
        const saveFunctions = {
          'modalEditarDivisao': salvarEdicaoDivisao,
          'modalEditarPosicao': salvarEdicaoPosicao,
          'modalEditarSetor': salvarEdicaoSetor,
          'modalEditarTurno': salvarEdicaoTurno,
          'modalEditarHorario': salvarEdicaoHorario,
          'modalEditarGuarda': salvarEdicaoGuarda,
          'modalEditarEquipe': salvarEdicaoEquipe,
          'modalEditarRP': salvarEdicaoRP,
          'modalEditarRural': salvarEdicaoRural,
          'modalEditarROMU': salvarEdicaoROMU,
          'modalEditarRonda': salvarEdicaoRonda,
          'modalEditarCOI': salvarEdicaoCOI,
          'modalEditarPatrulhaAnjos': salvarEdicaoPatrulhaAnjos,
          'modalEditarPatrulhaVulnerabilidade': salvarEdicaoPatrulhaVulnerabilidade,
          'modalEditarPatrulhaMaria': salvarEdicaoPatrulhaMaria,
          'modalEditarEscala': salvarEdicaoEscala,
          'modalEditarFerias': salvarEdicaoFerias,
          'modalEditarAusencia': salvarEdicaoAusencia
        };

        const saveFunction = saveFunctions[activeModalId];
        if (saveFunction) {
          saveFunction();
        }
      }
    });

    // Fechar modal ao clicar fora
    window.onclick = function (event) {
      if (event.target.classList.contains('modal')) {
        fecharModal(event.target.id);
      }
    }

    // Inicializar SQL.js e criar banco de dados
    async function initDB() {
      const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      db = new SQL.Database();

      // Criar tabelas
      db.run(`
        CREATE TABLE IF NOT EXISTS divisoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posicoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS setores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          divisao_id INTEGER NOT NULL,
          nome TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (divisao_id) REFERENCES divisoes(id)
        );

        CREATE TABLE IF NOT EXISTS turnos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS horarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descricao TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS guardas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          telefone TEXT,
          divisao_id INTEGER,
          posicao_id INTEGER,
          setor_id INTEGER,
          horario_id INTEGER,
          turno_id INTEGER,
          equipe_id INTEGER,
          rp_id INTEGER,
          rural_id INTEGER,
          romu_id INTEGER,
          ronda_id INTEGER,
          coi_id INTEGER,
          patrulha_anjos_id INTEGER,
          patrulha_vulnerabilidade_id INTEGER,
          patrulha_maria_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (divisao_id) REFERENCES divisoes(id),
          FOREIGN KEY (posicao_id) REFERENCES posicoes(id),
          FOREIGN KEY (setor_id) REFERENCES setores(id),
          FOREIGN KEY (horario_id) REFERENCES horarios(id),
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (equipe_id) REFERENCES equipes(id),
          FOREIGN KEY (rp_id) REFERENCES radio_patrulha(id),
          FOREIGN KEY (rural_id) REFERENCES divisao_rural(id),
          FOREIGN KEY (romu_id) REFERENCES romu(id),
          FOREIGN KEY (ronda_id) REFERENCES ronda_comercio(id),
          FOREIGN KEY (coi_id) REFERENCES coi(id),
          FOREIGN KEY (patrulha_anjos_id) REFERENCES patrulha_anjos(id),
          FOREIGN KEY (patrulha_vulnerabilidade_id) REFERENCES patrulha_vulnerabilidade(id),
          FOREIGN KEY (patrulha_maria_id) REFERENCES patrulha_maria(id)
        );

        CREATE TABLE IF NOT EXISTS equipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS equipe_membros (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          equipe_id INTEGER NOT NULL,
          guarda_id INTEGER NOT NULL,
          turno_id INTEGER NOT NULL,
          FOREIGN KEY (equipe_id) REFERENCES equipes(id),
          FOREIGN KEY (guarda_id) REFERENCES guardas(id),
          FOREIGN KEY (turno_id) REFERENCES turnos(id)
        );

        CREATE TABLE IF NOT EXISTS radio_patrulha (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numero TEXT NOT NULL,
          zona TEXT NOT NULL,
          turno_id INTEGER,
          apoio_id INTEGER,
          motorista_id INTEGER,
          encarregado_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (apoio_id) REFERENCES guardas(id),
          FOREIGN KEY (motorista_id) REFERENCES guardas(id),
          FOREIGN KEY (encarregado_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS divisao_rural (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          viatura TEXT NOT NULL,
          motorista_id INTEGER,
          encarregado_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (motorista_id) REFERENCES guardas(id),
          FOREIGN KEY (encarregado_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS romu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          motorista_id INTEGER,
          encarregado_id INTEGER,
          terceiro_id INTEGER,
          turno_id INTEGER,
          dias TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (motorista_id) REFERENCES guardas(id),
          FOREIGN KEY (encarregado_id) REFERENCES guardas(id),
          FOREIGN KEY (terceiro_id) REFERENCES guardas(id),
          FOREIGN KEY (turno_id) REFERENCES turnos(id)
        );

        CREATE TABLE IF NOT EXISTS ronda_comercio (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          motorista_id INTEGER,
          encarregado_id INTEGER,
          turno_id INTEGER,
          dias TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (motorista_id) REFERENCES guardas(id),
          FOREIGN KEY (encarregado_id) REFERENCES guardas(id),
          FOREIGN KEY (turno_id) REFERENCES turnos(id)
        );

        CREATE TABLE IF NOT EXISTS patrulha_anjos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turno_id INTEGER,
          horario_id INTEGER,
          dias TEXT NOT NULL,
          integrante1_id INTEGER,
          integrante2_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (horario_id) REFERENCES horarios(id),
          FOREIGN KEY (integrante1_id) REFERENCES guardas(id),
          FOREIGN KEY (integrante2_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS patrulha_vulnerabilidade (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turno_id INTEGER,
          horario_id INTEGER,
          dias TEXT NOT NULL,
          integrante1_id INTEGER,
          integrante2_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (horario_id) REFERENCES horarios(id),
          FOREIGN KEY (integrante1_id) REFERENCES guardas(id),
          FOREIGN KEY (integrante2_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS patrulha_maria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turno_id INTEGER,
          horario_id INTEGER,
          dias TEXT NOT NULL,
          integrante1_id INTEGER,
          integrante2_id INTEGER,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (horario_id) REFERENCES horarios(id),
          FOREIGN KEY (integrante1_id) REFERENCES guardas(id),
          FOREIGN KEY (integrante2_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS coi (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turno_id INTEGER,
          horario_id INTEGER,
          dias TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (turno_id) REFERENCES turnos(id),
          FOREIGN KEY (horario_id) REFERENCES horarios(id)
        );

        CREATE TABLE IF NOT EXISTS coi_guardas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coi_id INTEGER NOT NULL,
          guarda_id INTEGER NOT NULL,
          FOREIGN KEY (coi_id) REFERENCES coi(id),
          FOREIGN KEY (guarda_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS escalas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guarda_id INTEGER NOT NULL,
          turno_id INTEGER,
          mes INTEGER NOT NULL,
          ano INTEGER NOT NULL,
          dias TEXT NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guarda_id) REFERENCES guardas(id),
          FOREIGN KEY (turno_id) REFERENCES turnos(id)
        );

        CREATE TABLE IF NOT EXISTS ferias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guarda_id INTEGER NOT NULL,
          data_inicio DATE NOT NULL,
          data_fim DATE NOT NULL,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guarda_id) REFERENCES guardas(id)
        );

        CREATE TABLE IF NOT EXISTS ausencias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guarda_id INTEGER NOT NULL,
          data DATE NOT NULL,
          motivo TEXT NOT NULL,
          observacoes TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guarda_id) REFERENCES guardas(id)
        );
      `);

      popularDadosIniciais();
      carregarTodasTabelas();
      mostrarMensagem('Sistema inicializado com sucesso!', 'success');
    }

    // Funções de navegação
    function openTab(tabName) {
      const tabs = document.querySelectorAll('.tab');
      const contents = document.querySelectorAll('.tab-content');

      tabs.forEach(tab => tab.classList.remove('active'));
      contents.forEach(content => content.classList.remove('active'));

      event.target.classList.add('active');
      document.getElementById(tabName).classList.add('active');

      carregarTodasTabelas();
      if (tabName === 'escalas') {
        gerarDiasCheckbox();
      }
    }

    // Mostrar mensagens
    function mostrarMensagem(texto, tipo) {
      const msgDiv = document.getElementById('mensagem');
      msgDiv.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
      setTimeout(() => msgDiv.innerHTML = '', 5000);
    }

    // Função para formatar telefone
    function formatarTelefone(input) {
      let value = input.value.replace(/\D/g, '');
      
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4})/, '($1) $2 $3-$4');
      }
      
      input.value = value;
    }

    function popularDadosIniciais() {
      const guardasExistentes = db.exec('SELECT COUNT(*) FROM guardas');
      if (guardasExistentes.length > 0 && guardasExistentes[0].values[0][0] > 0) {
        return;
      }

      const inserirComId = (query, params) => {
        db.run(query, params);
        return db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      };

      const divisaoAdm = inserirComId('INSERT INTO divisoes (nome) VALUES (?)', ['Administrativo']);
      const divisaoOper = inserirComId('INSERT INTO divisoes (nome) VALUES (?)', ['Operacional']);
      const divisaoEsp = inserirComId('INSERT INTO divisoes (nome) VALUES (?)', ['Especializada']);

      const posicaoInsp = inserirComId('INSERT INTO posicoes (nome) VALUES (?)', ['Inspetor']);
      const posicaoSub = inserirComId('INSERT INTO posicoes (nome) VALUES (?)', ['Subinspetor']);
      const posicaoClasse1 = inserirComId('INSERT INTO posicoes (nome) VALUES (?)', ['Guarda 1ª Classe']);
      const posicaoClasse2 = inserirComId('INSERT INTO posicoes (nome) VALUES (?)', ['Guarda 2ª Classe']);

      const setorOper = inserirComId('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoOper, 'Operações']);
      const setorAdm = inserirComId('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoAdm, 'Atendimento']);
      const setorRural = inserirComId('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoOper, 'Patrulhamento Rural']);
      const setorCom = inserirComId('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoOper, 'Ronda Comércio']);
      const setorCOI = inserirComId('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoEsp, 'COI']);

      const turnoDiurno = inserirComId('INSERT INTO turnos (nome) VALUES (?)', ['Diurno']);
      const turnoNoturno = inserirComId('INSERT INTO turnos (nome) VALUES (?)', ['Noturno']);

      const horarioManha = inserirComId('INSERT INTO horarios (descricao) VALUES (?)', ['07:00 às 13:00']);
      const horarioTarde = inserirComId('INSERT INTO horarios (descricao) VALUES (?)', ['13:00 às 19:00']);
      const horarioNoite = inserirComId('INSERT INTO horarios (descricao) VALUES (?)', ['19:00 às 07:00']);

      const guardas = [
        { nome: 'Ana Paula Silva', telefone: '(12) 9 8123-0001', divisao_id: divisaoOper, posicao_id: posicaoClasse1, setor_id: setorOper, horario_id: horarioManha, turno_id: turnoDiurno },
        { nome: 'Bruno Almeida', telefone: '(12) 9 8123-0002', divisao_id: divisaoOper, posicao_id: posicaoClasse2, setor_id: setorOper, horario_id: horarioTarde, turno_id: turnoDiurno },
        { nome: 'Carla Ferreira', telefone: '(12) 9 8123-0003', divisao_id: divisaoOper, posicao_id: posicaoClasse1, setor_id: setorCom, horario_id: horarioManha, turno_id: turnoDiurno },
        { nome: 'Diego Souza', telefone: '(12) 9 8123-0004', divisao_id: divisaoOper, posicao_id: posicaoClasse2, setor_id: setorCom, horario_id: horarioTarde, turno_id: turnoDiurno },
        { nome: 'Elisa Ramos', telefone: '(12) 9 8123-0005', divisao_id: divisaoOper, posicao_id: posicaoClasse1, setor_id: setorOper, horario_id: horarioNoite, turno_id: turnoNoturno },
        { nome: 'Felipe Costa', telefone: '(12) 9 8123-0006', divisao_id: divisaoOper, posicao_id: posicaoClasse2, setor_id: setorOper, horario_id: horarioNoite, turno_id: turnoNoturno },
        { nome: 'Gabriela Pires', telefone: '(12) 9 8123-0007', divisao_id: divisaoOper, posicao_id: posicaoClasse1, setor_id: setorRural, horario_id: horarioManha, turno_id: turnoDiurno },
        { nome: 'Henrique Lima', telefone: '(12) 9 8123-0008', divisao_id: divisaoOper, posicao_id: posicaoClasse2, setor_id: setorRural, horario_id: horarioTarde, turno_id: turnoDiurno },
        { nome: 'Isabela Mendes', telefone: '(12) 9 8123-0009', divisao_id: divisaoEsp, posicao_id: posicaoSub, setor_id: setorCOI, horario_id: horarioNoite, turno_id: turnoNoturno },
        { nome: 'João Victor', telefone: '(12) 9 8123-0010', divisao_id: divisaoAdm, posicao_id: posicaoClasse1, setor_id: setorAdm, horario_id: horarioManha, turno_id: turnoDiurno },
        { nome: 'Kelly Santos', telefone: '(12) 9 8123-0011', divisao_id: divisaoAdm, posicao_id: posicaoClasse2, setor_id: setorAdm, horario_id: horarioTarde, turno_id: turnoDiurno },
        { nome: 'Lucas Andrade', telefone: '(12) 9 8123-0012', divisao_id: divisaoEsp, posicao_id: posicaoInsp, setor_id: setorCOI, horario_id: horarioNoite, turno_id: turnoNoturno }
      ];

      const guardaIds = guardas.map(guarda => inserirComId(
        'INSERT INTO guardas (nome, telefone, divisao_id, posicao_id, setor_id, horario_id, turno_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [guarda.nome, guarda.telefone, guarda.divisao_id, guarda.posicao_id, guarda.setor_id, guarda.horario_id, guarda.turno_id]
      ));

      const equipeAlpha = inserirComId('INSERT INTO equipes (nome) VALUES (?)', ['Equipe Alpha']);
      const equipeMembros = [
        { guardaId: guardaIds[0], turnoId: turnoDiurno },
        { guardaId: guardaIds[1], turnoId: turnoDiurno },
        { guardaId: guardaIds[2], turnoId: turnoDiurno },
        { guardaId: guardaIds[3], turnoId: turnoDiurno }
      ];
      equipeMembros.forEach(membro => {
        db.run('INSERT INTO equipe_membros (equipe_id, guarda_id, turno_id) VALUES (?, ?, ?)', [equipeAlpha, membro.guardaId, membro.turnoId]);
        db.run('UPDATE guardas SET equipe_id = ? WHERE id = ?', [equipeAlpha, membro.guardaId]);
      });

      const rpId = inserirComId(
        'INSERT INTO radio_patrulha (numero, zona, turno_id, apoio_id, motorista_id, encarregado_id) VALUES (?, ?, ?, ?, ?, ?)',
        ['RP 01', 'Centro', turnoDiurno, guardaIds[4], guardaIds[5], guardaIds[6]]
      );
      [guardaIds[4], guardaIds[5], guardaIds[6]].forEach(id => db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [rpId, id]));

      const ruralId = inserirComId(
        'INSERT INTO divisao_rural (viatura, motorista_id, encarregado_id) VALUES (?, ?, ?)',
        ['VTR 204', guardaIds[6], guardaIds[7]]
      );
      [guardaIds[6], guardaIds[7]].forEach(id => db.run('UPDATE guardas SET rural_id = ? WHERE id = ?', [ruralId, id]));

      const romuId = inserirComId(
        'INSERT INTO romu (motorista_id, encarregado_id, terceiro_id, turno_id, dias) VALUES (?, ?, ?, ?, ?)',
        [guardaIds[0], guardaIds[1], guardaIds[2], turnoNoturno, '2,6,10,14,18']
      );
      [guardaIds[0], guardaIds[1], guardaIds[2]].forEach(id => db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [romuId, id]));

      const rondaId = inserirComId(
        'INSERT INTO ronda_comercio (motorista_id, encarregado_id, turno_id, dias) VALUES (?, ?, ?, ?)',
        [guardaIds[3], guardaIds[4], turnoDiurno, '3,7,11,15,19']
      );
      [guardaIds[3], guardaIds[4]].forEach(id => db.run('UPDATE guardas SET ronda_id = ? WHERE id = ?', [rondaId, id]));

      const coiId = inserirComId(
        'INSERT INTO coi (turno_id, horario_id, dias) VALUES (?, ?, ?)',
        [turnoNoturno, horarioNoite, '1,5,9,13,17']
      );
      [guardaIds[8], guardaIds[11]].forEach(id => {
        db.run('INSERT INTO coi_guardas (coi_id, guarda_id) VALUES (?, ?)', [coiId, id]);
        db.run('UPDATE guardas SET coi_id = ? WHERE id = ?', [coiId, id]);
      });

      const anjosId = inserirComId(
        'INSERT INTO patrulha_anjos (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoDiurno, horarioManha, '2,4,6,8', guardaIds[9], guardaIds[10]]
      );
      [guardaIds[9], guardaIds[10]].forEach(id => db.run('UPDATE guardas SET patrulha_anjos_id = ? WHERE id = ?', [anjosId, id]));

      const vulnerabilidadeId = inserirComId(
        'INSERT INTO patrulha_vulnerabilidade (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoDiurno, horarioTarde, '1,3,5,7', guardaIds[5], guardaIds[7]]
      );
      [guardaIds[5], guardaIds[7]].forEach(id => db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = ? WHERE id = ?', [vulnerabilidadeId, id]));

      const mariaId = inserirComId(
        'INSERT INTO patrulha_maria (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoNoturno, horarioNoite, '9,12,15,18', guardaIds[6], guardaIds[8]]
      );
      [guardaIds[6], guardaIds[8]].forEach(id => db.run('UPDATE guardas SET patrulha_maria_id = ? WHERE id = ?', [mariaId, id]));

      inserirComId(
        'INSERT INTO escalas (guarda_id, turno_id, mes, ano, dias) VALUES (?, ?, ?, ?, ?)',
        [guardaIds[0], turnoDiurno, 9, 2024, '1,2,3,4,5,6,7']
      );
      inserirComId(
        'INSERT INTO ferias (guarda_id, data_inicio, data_fim) VALUES (?, ?, ?)',
        [guardaIds[2], '2024-10-01', '2024-10-15']
      );
      inserirComId(
        'INSERT INTO ausencias (guarda_id, data, motivo, observacoes) VALUES (?, ?, ?, ?)',
        [guardaIds[4], '2024-09-12', 'Consulta médica', 'Retorno previsto às 15h']
      );
    }

    // CADASTRAR DIVISÃO
    function cadastrarDivisao() {
      const nome = document.getElementById('divisao_nome').value;
      if (!nome) {
        mostrarMensagem('Preencha o nome da divisão', 'error');
        return;
      }

      db.run('INSERT INTO divisoes (nome) VALUES (?)', [nome]);
      mostrarMensagem('Divisão cadastrada com sucesso!', 'success');
      document.getElementById('divisao_nome').value = '';
      carregarTabela('divisoes');
      atualizarSelects();
    }

    // CADASTRAR POSIÇÃO
    function cadastrarPosicao() {
      const nome = document.getElementById('posicao_nome').value;
      if (!nome) {
        mostrarMensagem('Preencha o nome da posição', 'error');
        return;
      }

      db.run('INSERT INTO posicoes (nome) VALUES (?)', [nome]);
      mostrarMensagem('Posição cadastrada com sucesso!', 'success');
      document.getElementById('posicao_nome').value = '';
      carregarTabela('posicoes');
      atualizarSelects();
    }

    // CADASTRAR SETOR
    function cadastrarSetor() {
      const divisaoId = document.getElementById('setor_divisao_id').value;
      const nome = document.getElementById('setor_nome').value;

      if (!divisaoId || !nome) {
        mostrarMensagem('Preencha todos os campos', 'error');
        return;
      }

      db.run('INSERT INTO setores (divisao_id, nome) VALUES (?, ?)', [divisaoId, nome]);
      mostrarMensagem('Setor cadastrado com sucesso!', 'success');
      document.getElementById('setor_nome').value = '';
      carregarTabela('setores');
      atualizarSelects();
    }

    // CADASTRAR TURNO
    function cadastrarTurno() {
      const nome = document.getElementById('turno_nome').value;
      if (!nome) {
        mostrarMensagem('Preencha o nome do turno', 'error');
        return;
      }

      db.run('INSERT INTO turnos (nome) VALUES (?)', [nome]);
      mostrarMensagem('Turno cadastrado com sucesso!', 'success');
      document.getElementById('turno_nome').value = '';
      carregarTabela('turnos');
      atualizarSelects();
    }

    // CADASTRAR HORÁRIO
    function cadastrarHorario() {
      const descricao = document.getElementById('horario_descricao').value;
      if (!descricao) {
        mostrarMensagem('Preencha a descrição do horário', 'error');
        return;
      }

      db.run('INSERT INTO horarios (descricao) VALUES (?)', [descricao]);
      mostrarMensagem('Horário cadastrado com sucesso!', 'success');
      document.getElementById('horario_descricao').value = '';
      carregarTabela('horarios');
      atualizarSelects();
    }

    // CADASTRAR GUARDA
    function cadastrarGuarda() {
      const nome = document.getElementById('guarda_nome').value;
      const telefone = document.getElementById('guarda_telefone').value;
      const divisaoId = document.getElementById('guarda_divisao_id').value;
      const posicaoId = document.getElementById('guarda_posicao_id').value;
      const setorId = document.getElementById('guarda_setor_id').value;
      const horarioId = document.getElementById('guarda_horario_id').value;
      const turnoId = document.getElementById('guarda_turno_id').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome do guarda', 'error');
        return;
      }

      // Validar e formatar telefone
      let telefoneFormatado = telefone;
      if (telefone && telefone.length === 15) {
        telefoneFormatado = telefone;
      }

      db.run('INSERT INTO guardas (nome, telefone, divisao_id, posicao_id, setor_id, horario_id, turno_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome, telefoneFormatado, divisaoId || null, posicaoId || null, setorId || null, horarioId || null, turnoId || null]);

      mostrarMensagem('Guarda cadastrado com sucesso!', 'success');
      document.getElementById('guarda_nome').value = '';
      document.getElementById('guarda_telefone').value = '';
      carregarTabela('guardas');
      atualizarSelects();
    }

    // CADASTRAR EQUIPE
    function cadastrarEquipe() {
      const nome = document.getElementById('equipe_nome').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome da equipe', 'error');
        return;
      }

      // Verificar membros
      const membrosDiv = document.getElementById('equipe_membros_container');
      const selects = membrosDiv.querySelectorAll('select');
      const guardasSelecionados = [];

      for (let i = 0; i < 4; i++) {
        const guardaSelect = document.getElementById(`membro_guarda_${i}`);
        const turnoSelect = document.getElementById(`membro_turno_${i}`);

        if (guardaSelect && guardaSelect.value) {
          if (guardasSelecionados.includes(guardaSelect.value)) {
            mostrarMensagem('Não pode selecionar o mesmo guarda mais de uma vez', 'error');
            return;
          }
          guardasSelecionados.push(guardaSelect.value);

          if (!turnoSelect || !turnoSelect.value) {
            mostrarMensagem(`Selecione o turno para o membro ${i + 1}`, 'error');
            return;
          }
        }
      }

      if (guardasSelecionados.length !== 4) {
        mostrarMensagem('Selecione exatamente 4 guardas', 'error');
        return;
      }

      db.run('INSERT INTO equipes (nome) VALUES (?)', [nome]);
      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const equipeId = result.values[0][0];

      for (let i = 0; i < 4; i++) {
        const guardaSelect = document.getElementById(`membro_guarda_${i}`);
        const turnoSelect = document.getElementById(`membro_turno_${i}`);

        if (guardaSelect.value && turnoSelect.value) {
          db.run('INSERT INTO equipe_membros (equipe_id, guarda_id, turno_id) VALUES (?, ?, ?)',
            [equipeId, guardaSelect.value, turnoSelect.value]);
          
          // Atualizar equipe_id do guarda
          db.run('UPDATE guardas SET equipe_id = ? WHERE id = ?', [equipeId, guardaSelect.value]);
        }
      }

      mostrarMensagem('Equipe cadastrada com sucesso!', 'success');
      document.getElementById('equipe_nome').value = '';
      carregarTabela('equipes');
      atualizarSelects();
    }

    // CADASTRAR RÁDIO PATRULHA
    function cadastrarRP() {
      const numero = document.getElementById('rp_numero').value;
      const zona = document.getElementById('rp_zona').value;
      const turnoId = document.getElementById('rp_turno_id').value;
      const apoioId = document.getElementById('rp_apoio_id').value || null;
      const motoristaId = document.getElementById('rp_motorista_id').value || null;
      const encarregadoId = document.getElementById('rp_encarregado_id').value || null;

      if (!numero || !zona || !turnoId) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('INSERT INTO radio_patrulha (numero, zona, turno_id, apoio_id, motorista_id, encarregado_id) VALUES (?, ?, ?, ?, ?, ?)',
        [numero, zona, turnoId, apoioId, motoristaId, encarregadoId]);

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const rpId = result.values[0][0];

      // Atualizar rp_id dos guardas envolvidos
      if (apoioId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [rpId, apoioId]);
      if (motoristaId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [rpId, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [rpId, encarregadoId]);

      mostrarMensagem('Rádio Patrulha cadastrada com sucesso!', 'success');
      document.getElementById('rp_numero').value = '';
      document.getElementById('rp_zona').value = '';
      carregarTabela('radio_patrulha');
      atualizarSelects();
    }

    // CADASTRAR DIVISÃO RURAL
    function cadastrarDivisaoRural() {
      const viatura = document.getElementById('rural_viatura').value;
      const motoristaId = document.getElementById('rural_motorista_id').value || null;
      const encarregadoId = document.getElementById('rural_encarregado_id').value || null;

      if (!viatura) {
        mostrarMensagem('Preencha a identificação da viatura', 'error');
        return;
      }

      db.run('INSERT INTO divisao_rural (viatura, motorista_id, encarregado_id) VALUES (?, ?, ?)',
        [viatura, motoristaId, encarregadoId]);

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const ruralId = result.values[0][0];

      // Atualizar rural_id dos guardas envolvidos
      if (motoristaId) db.run('UPDATE guardas SET rural_id = ? WHERE id = ?', [ruralId, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET rural_id = ? WHERE id = ?', [ruralId, encarregadoId]);

      mostrarMensagem('Divisão Rural cadastrada com sucesso!', 'success');
      document.getElementById('rural_viatura').value = '';
      carregarTabela('divisao_rural');
      atualizarSelects();
    }

    // CADASTRAR ROMU
    function cadastrarROMU() {
      const motoristaId = document.getElementById('romu_motorista_id').value;
      const encarregadoId = document.getElementById('romu_encarregado_id').value;
      const terceiroId = document.getElementById('romu_terceiro_id').value || null;
      const turnoId = document.getElementById('romu_turno_id').value;
      const dias = document.getElementById('romu_dias').value;

      if (!motoristaId || !encarregadoId || !turnoId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('INSERT INTO romu (motorista_id, encarregado_id, terceiro_id, turno_id, dias) VALUES (?, ?, ?, ?, ?)',
        [motoristaId, encarregadoId, terceiroId, turnoId, dias]);

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const romuId = result.values[0][0];

      // Atualizar romu_id dos guardas envolvidos
      if (motoristaId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [romuId, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [romuId, encarregadoId]);
      if (terceiroId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [romuId, terceiroId]);

      mostrarMensagem('ROMU cadastrado com sucesso!', 'success');
      document.getElementById('romu_dias').value = '';
      carregarTabela('romu');
      atualizarSelects();
    }

    // CADASTRAR RONDA COMÉRCIO
    function cadastrarRondaComercio() {
      const motoristaId = document.getElementById('ronda_motorista_id').value;
      const encarregadoId = document.getElementById('ronda_encarregado_id').value;
      const turnoId = document.getElementById('ronda_turno_id').value;
      const dias = document.getElementById('ronda_dias').value;

      if (!motoristaId || !encarregadoId || !turnoId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('INSERT INTO ronda_comercio (motorista_id, encarregado_id, turno_id, dias) VALUES (?, ?, ?, ?)',
        [motoristaId, encarregadoId, turnoId, dias]);

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const rondaId = result.values[0][0];

      // Atualizar ronda_id dos guardas envolvidos
      if (motoristaId) db.run('UPDATE guardas SET ronda_id = ? WHERE id = ?', [rondaId, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET ronda_id = ? WHERE id = ?', [rondaId, encarregadoId]);

      mostrarMensagem('Ronda Comércio cadastrada com sucesso!', 'success');
      document.getElementById('ronda_dias').value = '';
      carregarTabela('ronda_comercio');
      atualizarSelects();
    }

    function cadastrarPatrulhaAnjos() {
      const turnoId = document.getElementById('anjos_turno_id').value;
      const horarioId = document.getElementById('anjos_horario_id').value;
      const dias = document.getElementById('anjos_dias').value;
      const integrante1Id = document.getElementById('anjos_integrante1_id').value || null;
      const integrante2Id = document.getElementById('anjos_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      db.run(
        'INSERT INTO patrulha_anjos (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id]
      );

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const patrulhaId = result.values[0][0];

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_anjos_id = ? WHERE id = ?', [patrulhaId, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_anjos_id = ? WHERE id = ?', [patrulhaId, integrante2Id]);

      mostrarMensagem('Patrulha Anjos da Guarda cadastrada com sucesso!', 'success');
      document.getElementById('anjos_dias').value = '';
      carregarTabela('patrulha_anjos');
      atualizarSelects();
    }

    function cadastrarPatrulhaVulnerabilidade() {
      const turnoId = document.getElementById('vulnerabilidade_turno_id').value;
      const horarioId = document.getElementById('vulnerabilidade_horario_id').value;
      const dias = document.getElementById('vulnerabilidade_dias').value;
      const integrante1Id = document.getElementById('vulnerabilidade_integrante1_id').value || null;
      const integrante2Id = document.getElementById('vulnerabilidade_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      db.run(
        'INSERT INTO patrulha_vulnerabilidade (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id]
      );

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const patrulhaId = result.values[0][0];

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = ? WHERE id = ?', [patrulhaId, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = ? WHERE id = ?', [patrulhaId, integrante2Id]);

      mostrarMensagem('Patrulha Vulnerabilidade Social cadastrada com sucesso!', 'success');
      document.getElementById('vulnerabilidade_dias').value = '';
      carregarTabela('patrulha_vulnerabilidade');
      atualizarSelects();
    }

    function cadastrarPatrulhaMaria() {
      const turnoId = document.getElementById('maria_turno_id').value;
      const horarioId = document.getElementById('maria_horario_id').value;
      const dias = document.getElementById('maria_dias').value;
      const integrante1Id = document.getElementById('maria_integrante1_id').value || null;
      const integrante2Id = document.getElementById('maria_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      db.run(
        'INSERT INTO patrulha_maria (turno_id, horario_id, dias, integrante1_id, integrante2_id) VALUES (?, ?, ?, ?, ?)',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id]
      );

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const patrulhaId = result.values[0][0];

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_maria_id = ? WHERE id = ?', [patrulhaId, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_maria_id = ? WHERE id = ?', [patrulhaId, integrante2Id]);

      mostrarMensagem('Patrulha Maria da Penha cadastrada com sucesso!', 'success');
      document.getElementById('maria_dias').value = '';
      carregarTabela('patrulha_maria');
      atualizarSelects();
    }

    // CADASTRAR COI
    function cadastrarCOI() {
      const turnoId = document.getElementById('coi_turno_id').value;
      const horarioId = document.getElementById('coi_horario_id').value;
      const dias = document.getElementById('coi_dias').value;
      const checkboxes = document.querySelectorAll('#coi_guardas_container input:checked');

      if (!turnoId || !horarioId || !dias || checkboxes.length === 0) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('INSERT INTO coi (turno_id, horario_id, dias) VALUES (?, ?, ?)',
        [turnoId, horarioId, dias]);

      const result = db.exec('SELECT last_insert_rowid() as id')[0];
      const coiId = result.values[0][0];

      checkboxes.forEach(cb => {
        db.run('INSERT INTO coi_guardas (coi_id, guarda_id) VALUES (?, ?)',
          [coiId, cb.value]);
        
        // Atualizar coi_id do guarda
        db.run('UPDATE guardas SET coi_id = ? WHERE id = ?', [coiId, cb.value]);
      });

      mostrarMensagem('COI cadastrado com sucesso!', 'success');
      document.getElementById('coi_dias').value = '';
      checkboxes.forEach(cb => cb.checked = false);
      carregarTabela('coi');
      atualizarSelects();
    }

    // FUNÇÕES PARA ABA ESCALAS
    function alterarTipoEscala() {
      const tipo = document.getElementById('escala_tipo').value;
      
      if (tipo === 'individual') {
        document.getElementById('escala_individual').style.display = 'block';
        document.getElementById('escala_equipe').style.display = 'none';
        document.getElementById('info_guarda').style.display = 'none';
        document.getElementById('info_equipe').style.display = 'none';
      } else {
        document.getElementById('escala_individual').style.display = 'none';
        document.getElementById('escala_equipe').style.display = 'block';
        document.getElementById('info_guarda').style.display = 'none';
        document.getElementById('info_equipe').style.display = 'none';
        
        // Gerar checkboxes de dias para equipe
        gerarDiasCheckboxEquipe();
      }
    }

    function carregarInfoGuardaEscala() {
      const guardaId = document.getElementById('escala_guarda_id').value;
      
      if (!guardaId) {
        document.getElementById('info_guarda').style.display = 'none';
        return;
      }
      
      const query = `
        SELECT 
          COALESCE(e.nome, 'Individual') as equipe,
          COALESCE(t.nome, '-') as turno,
          COALESCE(h.descricao, '-') as horario,
          COALESCE(d.nome, '-') as divisao
        FROM guardas g
        LEFT JOIN equipes e ON g.equipe_id = e.id
        LEFT JOIN turnos t ON g.turno_id = t.id
        LEFT JOIN horarios h ON g.horario_id = h.id
        LEFT JOIN divisoes d ON g.divisao_id = d.id
        WHERE g.id = ?
      `;
      
      const result = db.exec(query, [guardaId]);
      
      if (result.length > 0) {
        const row = result[0].values[0];
        document.getElementById('info_guarda_equipe').value = row[0];
        document.getElementById('info_guarda_turno').value = row[1];
        document.getElementById('info_guarda_horario').value = row[2];
        document.getElementById('info_guarda_divisao').value = row[3];
        document.getElementById('info_guarda').style.display = 'block';
      }
    }

    function carregarInfoEquipeEscala() {
      const equipeId = document.getElementById('escala_equipe_id').value;
      
      if (!equipeId) {
        document.getElementById('info_equipe').style.display = 'none';
        return;
      }
      
      const query = `
        SELECT g.nome, t.nome as turno, h.descricao as horario, d.nome as divisao
        FROM equipe_membros em
        JOIN guardas g ON em.guarda_id = g.id
        LEFT JOIN turnos t ON g.turno_id = t.id
        LEFT JOIN horarios h ON g.horario_id = h.id
        LEFT JOIN divisoes d ON g.divisao_id = d.id
        WHERE em.equipe_id = ?
        ORDER BY g.nome
      `;
      
      const result = db.exec(query, [equipeId]);
      const corpoTabela = document.getElementById('corpo_tabela_membros');
      corpoTabela.innerHTML = '';
      
      if (result.length > 0) {
        result[0].values.forEach(row => {
          corpoTabela.innerHTML += `
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 8px;">${row[0]}</td>
              <td style="padding: 8px;">${row[1] || '-'}</td>
              <td style="padding: 8px;">${row[2] || '-'}</td>
              <td style="padding: 8px;">${row[3] || '-'}</td>
            </tr>
          `;
        });
        document.getElementById('info_equipe').style.display = 'block';
      }
    }

    function gerarDiasCheckboxEquipe() {
      const container = document.getElementById('escala_dias_container_equipe');
      container.innerHTML = '';
      
      for (let dia = 1; dia <= 31; dia++) {
        container.innerHTML += `
          <div class="day-checkbox">
            <input type="checkbox" id="dia_equipe_${dia}" value="${dia}">
            <label for="dia_equipe_${dia}">${dia}</label>
          </div>
        `;
      }
    }

    // VERIFICAR CONFLITO DE ESCALA
    function verificarConflitoEscala() {
      const tipo = document.getElementById('escala_tipo').value;
      
      if (tipo === 'individual') {
        verificarConflitoEscalaIndividual();
      } else {
        verificarConflitoEscalaEquipe();
      }
    }

    function verificarConflitoEscalaIndividual() {
      const guardaId = document.getElementById('escala_guarda_id').value;
      const mes = document.getElementById('escala_mes').value;
      const ano = document.getElementById('escala_ano').value;
      const checkboxes = document.querySelectorAll('#escala_dias_container input:checked');

      if (!guardaId || checkboxes.length === 0) {
        mostrarMensagem('Selecione um guarda e pelo menos um dia', 'error');
        return;
      }

      const dias = Array.from(checkboxes).map(cb => parseInt(cb.value));
      const diasStr = dias.join(',');

      // Verificar conflitos em escalas
      const query = `
        SELECT dias FROM escalas 
        WHERE guarda_id = ? AND mes = ? AND ano = ?
      `;
      const result = db.exec(query, [guardaId, mes, ano]);

      const alertDiv = document.getElementById('conflict_alert');

      if (result.length > 0) {
        const diasExistentes = result[0].values[0][0].split(',').map(d => parseInt(d));
        const conflitos = dias.filter(d => diasExistentes.includes(d));

        if (conflitos.length > 0) {
          alertDiv.innerHTML = `
            <div class="conflict-warning">
              <strong>⚠️ ATENÇÃO: Conflito detectado!</strong>
              <div class="conflict-item">O guarda já está escalado nos dias: ${conflitos.join(', ')}</div>
            </div>
          `;
          return;
        }
      }

      // Verificar férias
      const feriasQuery = `
        SELECT data_inicio, data_fim FROM ferias 
        WHERE guarda_id = ? 
        AND ((data_inicio BETWEEN ? AND ?) OR (data_fim BETWEEN ? AND ?))
      `;

      const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const dataFim = `${ano}-${String(mes).padStart(2, '0')}-31`;

      const feriasResult = db.exec(feriasQuery, [guardaId, dataInicio, dataFim, dataInicio, dataFim]);

      if (feriasResult.length > 0) {
        alertDiv.innerHTML = `
          <div class="conflict-warning">
            <strong>⚠️ ATENÇÃO: Guarda em férias!</strong>
            <div class="conflict-item">O guarda possui férias programadas neste período</div>
          </div>
        `;
        return;
      }

      alertDiv.innerHTML = `
        <div class="alert alert-success">
          ✅ Nenhum conflito detectado! A escala pode ser salva.
        </div>
      `;
    }

    function verificarConflitoEscalaEquipe() {
      const equipeId = document.getElementById('escala_equipe_id').value;
      const mes = document.getElementById('escala_mes_equipe').value;
      const ano = document.getElementById('escala_ano_equipe').value;
      const checkboxes = document.querySelectorAll('#escala_dias_container_equipe input:checked');

      if (!equipeId || checkboxes.length === 0) {
        mostrarMensagem('Selecione uma equipe e pelo menos um dia', 'error');
        return;
      }

      const dias = Array.from(checkboxes).map(cb => parseInt(cb.value));
      const diasStr = dias.join(',');

      // Buscar membros da equipe
      const queryMembros = `
        SELECT guarda_id FROM equipe_membros WHERE equipe_id = ?
      `;
      const resultMembros = db.exec(queryMembros, [equipeId]);
      
      if (resultMembros.length === 0) {
        mostrarMensagem('Equipe não possui membros', 'error');
        return;
      }
      
      const alertDiv = document.getElementById('conflict_alert');
      let conflitos = [];
      
      // Verificar conflitos para cada membro
      resultMembros[0].values.forEach(membro => {
        const guardaId = membro[0];
        
        const queryConflito = `
          SELECT dias FROM escalas 
          WHERE guarda_id = ? AND mes = ? AND ano = ?
        `;
        const result = db.exec(queryConflito, [guardaId, mes, ano]);
        
        if (result.length > 0) {
          const diasExistentes = result[0].values[0][0].split(',').map(d => parseInt(d));
          const conflitosMembro = dias.filter(d => diasExistentes.includes(d));
          
          if (conflitosMembro.length > 0) {
            // Buscar nome do guarda
            const nomeQuery = db.exec('SELECT nome FROM guardas WHERE id = ?', [guardaId]);
            const nome = nomeQuery.length > 0 ? nomeQuery[0].values[0][0] : 'Guarda';
            
            conflitos.push({
              nome: nome,
              dias: conflitosMembro
            });
          }
        }
      });
      
      if (conflitos.length > 0) {
        let html = '<div class="conflict-warning"><strong>⚠️ ATENÇÃO: Conflitos detectados!</strong>';
        
        conflitos.forEach(conflito => {
          html += `<div class="conflict-item">${conflito.nome}: conflito nos dias ${conflito.dias.join(', ')}</div>`;
        });
        
        html += '</div>';
        alertDiv.innerHTML = html;
      } else {
        alertDiv.innerHTML = `
          <div class="alert alert-success">
            ✅ Nenhum conflito detectado! A escala pode ser salva.
          </div>
        `;
      }
    }

    // CADASTRAR ESCALA
    function cadastrarEscala() {
      const tipo = document.getElementById('escala_tipo').value;
      
      if (tipo === 'individual') {
        cadastrarEscalaIndividual();
      } else {
        cadastrarEscalaEquipe();
      }
    }

    function cadastrarEscalaIndividual() {
      const guardaId = document.getElementById('escala_guarda_id').value;
      const turnoId = document.getElementById('escala_turno_id').value;
      const mes = document.getElementById('escala_mes').value;
      const ano = document.getElementById('escala_ano').value;
      const checkboxes = document.querySelectorAll('#escala_dias_container input:checked');

      if (!guardaId || checkboxes.length === 0 || !mes || !ano) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      const dias = Array.from(checkboxes).map(cb => cb.value).join(',');

      db.run('INSERT INTO escalas (guarda_id, turno_id, mes, ano, dias) VALUES (?, ?, ?, ?, ?)',
        [guardaId, turnoId || null, mes, ano, dias]);

      mostrarMensagem('Escala cadastrada com sucesso!', 'success');
      checkboxes.forEach(cb => cb.checked = false);
      document.getElementById('conflict_alert').innerHTML = '';
      carregarTabela('escalas');
      carregarHistorico();
    }

    function cadastrarEscalaEquipe() {
      const equipeId = document.getElementById('escala_equipe_id').value;
      const mes = document.getElementById('escala_mes_equipe').value;
      const ano = document.getElementById('escala_ano_equipe').value;
      const checkboxes = document.querySelectorAll('#escala_dias_container_equipe input:checked');

      if (!equipeId || checkboxes.length === 0 || !mes || !ano) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      const dias = Array.from(checkboxes).map(cb => cb.value).join(',');
      
      // Buscar membros da equipe
      const queryMembros = `
        SELECT em.guarda_id, g.turno_id 
        FROM equipe_membros em
        JOIN guardas g ON em.guarda_id = g.id
        WHERE em.equipe_id = ?
      `;
      const resultMembros = db.exec(queryMembros, [equipeId]);
      
      if (resultMembros.length === 0) {
        mostrarMensagem('Equipe não possui membros', 'error');
        return;
      }
      
      // Cadastrar escala para cada membro
      let escalasCadastradas = 0;
      resultMembros[0].values.forEach(membro => {
        const guardaId = membro[0];
        const turnoId = membro[1];
        
        db.run('INSERT INTO escalas (guarda_id, turno_id, mes, ano, dias) VALUES (?, ?, ?, ?, ?)',
          [guardaId, turnoId || null, mes, ano, dias]);
        
        escalasCadastradas++;
      });
      
      mostrarMensagem(`Escala cadastrada para ${escalasCadastradas} membros da equipe!`, 'success');
      
      // Limpar campos
      checkboxes.forEach(cb => cb.checked = false);
      document.getElementById('conflict_alert').innerHTML = '';
      carregarTabela('escalas');
      carregarHistorico();
    }

    // CADASTRAR FÉRIAS
    function cadastrarFerias() {
      const guardaId = document.getElementById('ferias_guarda_id').value;
      const inicio = document.getElementById('ferias_inicio').value;
      const fim = document.getElementById('ferias_fim').value;

      if (!guardaId || !inicio || !fim) {
        mostrarMensagem('Preencha todos os campos', 'error');
        return;
      }

      // Validar duração (15 ou 30 dias)
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24)) + 1;

      if (dias !== 15 && dias !== 30) {
        mostrarMensagem('As férias devem ter 15 ou 30 dias', 'error');
        return;
      }

      db.run('INSERT INTO ferias (guarda_id, data_inicio, data_fim) VALUES (?, ?, ?)',
        [guardaId, inicio, fim]);
      mostrarMensagem('Férias cadastradas com sucesso!', 'success');
      document.getElementById('ferias_inicio').value = '';
      document.getElementById('ferias_fim').value = '';
      carregarTabela('ferias');
    }

    // CADASTRAR AUSÊNCIA
    function cadastrarAusencia() {
      const guardaId = document.getElementById('ausencia_guarda_id').value;
      const data = document.getElementById('ausencia_data').value;
      const motivo = document.getElementById('ausencia_motivo').value;
      const obs = document.getElementById('ausencia_obs').value;

      if (!guardaId || !data || !motivo) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('INSERT INTO ausencias (guarda_id, data, motivo, observacoes) VALUES (?, ?, ?, ?)',
        [guardaId, data, motivo, obs]);
      mostrarMensagem('Ausência registrada com sucesso!', 'success');
      document.getElementById('ausencia_data').value = '';
      document.getElementById('ausencia_obs').value = '';
      carregarTabela('ausencias');
    }

    // GERAR CHECKBOX DE DIAS
    function gerarDiasCheckbox() {
      const container = document.getElementById('escala_dias_container');
      container.innerHTML = '';

      for (let dia = 1; dia <= 31; dia++) {
        container.innerHTML += `
          <div class="day-checkbox">
            <input type="checkbox" id="dia_${dia}" value="${dia}">
            <label for="dia_${dia}">${dia}</label>
          </div>
        `;
      }
    }

    function obterAtividadesHorariosGuarda(guardaId) {
      const atividades = [];

      const equipeResult = db.exec(
        `SELECT e.nome, t.nome
         FROM guardas g
         JOIN equipes e ON g.equipe_id = e.id
         JOIN equipe_membros em ON e.id = em.equipe_id
         JOIN turnos t ON em.turno_id = t.id
         WHERE g.id = ?
         LIMIT 1`,
        [guardaId]
      );
      if (equipeResult.length > 0) {
        const row = equipeResult[0].values[0];
        atividades.push(`Equipe ${row[0]} (${row[1] || '-'})`);
      }

      const rpResult = db.exec(
        `SELECT rp.numero, t.nome
         FROM guardas g
         JOIN radio_patrulha rp ON g.rp_id = rp.id
         LEFT JOIN turnos t ON rp.turno_id = t.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (rpResult.length > 0) {
        const row = rpResult[0].values[0];
        atividades.push(`Rádio Patrulha ${row[0]} (${row[1] || '-'})`);
      }

      const ruralResult = db.exec(
        `SELECT dr.viatura
         FROM guardas g
         JOIN divisao_rural dr ON g.rural_id = dr.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (ruralResult.length > 0) {
        atividades.push(`Divisão Rural (${ruralResult[0].values[0][0]})`);
      }

      const romuResult = db.exec(
        `SELECT t.nome, r.dias
         FROM guardas g
         JOIN romu r ON g.romu_id = r.id
         LEFT JOIN turnos t ON r.turno_id = t.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (romuResult.length > 0) {
        const row = romuResult[0].values[0];
        atividades.push(`ROMU (${row[0] || '-'} - dias ${row[1]})`);
      }

      const rondaResult = db.exec(
        `SELECT t.nome, rc.dias
         FROM guardas g
         JOIN ronda_comercio rc ON g.ronda_id = rc.id
         LEFT JOIN turnos t ON rc.turno_id = t.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (rondaResult.length > 0) {
        const row = rondaResult[0].values[0];
        atividades.push(`Ronda Comércio (${row[0] || '-'} - dias ${row[1]})`);
      }

      const coiResult = db.exec(
        `SELECT t.nome, h.descricao, c.dias
         FROM guardas g
         JOIN coi c ON g.coi_id = c.id
         LEFT JOIN turnos t ON c.turno_id = t.id
         LEFT JOIN horarios h ON c.horario_id = h.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (coiResult.length > 0) {
        const row = coiResult[0].values[0];
        atividades.push(`COI (${row[0] || '-'} - ${row[1] || '-'} - dias ${row[2]})`);
      }

      const anjosResult = db.exec(
        `SELECT t.nome, h.descricao, p.dias
         FROM guardas g
         JOIN patrulha_anjos p ON g.patrulha_anjos_id = p.id
         LEFT JOIN turnos t ON p.turno_id = t.id
         LEFT JOIN horarios h ON p.horario_id = h.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (anjosResult.length > 0) {
        const row = anjosResult[0].values[0];
        atividades.push(`Patrulha Anjos da Guarda (${row[0] || '-'} - ${row[1] || '-'} - dias ${row[2]})`);
      }

      const vulnerabilidadeResult = db.exec(
        `SELECT t.nome, h.descricao, p.dias
         FROM guardas g
         JOIN patrulha_vulnerabilidade p ON g.patrulha_vulnerabilidade_id = p.id
         LEFT JOIN turnos t ON p.turno_id = t.id
         LEFT JOIN horarios h ON p.horario_id = h.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (vulnerabilidadeResult.length > 0) {
        const row = vulnerabilidadeResult[0].values[0];
        atividades.push(`Patrulha Vulnerabilidade Social (${row[0] || '-'} - ${row[1] || '-'} - dias ${row[2]})`);
      }

      const mariaResult = db.exec(
        `SELECT t.nome, h.descricao, p.dias
         FROM guardas g
         JOIN patrulha_maria p ON g.patrulha_maria_id = p.id
         LEFT JOIN turnos t ON p.turno_id = t.id
         LEFT JOIN horarios h ON p.horario_id = h.id
         WHERE g.id = ?`,
        [guardaId]
      );
      if (mariaResult.length > 0) {
        const row = mariaResult[0].values[0];
        atividades.push(`Patrulha Maria da Penha (${row[0] || '-'} - ${row[1] || '-'} - dias ${row[2]})`);
      }

      return atividades.length > 0 ? atividades.join(' | ') : 'Sem designação';
    }

    // CARREGAR TABELAS
    function carregarTabela(tabela) {
      let query = '';
      let colunas = [];

      switch (tabela) {
        case 'divisoes':
          query = 'SELECT id, nome FROM divisoes ORDER BY nome';
          colunas = ['ID', 'Nome', 'Ações'];
          break;
        case 'posicoes':
          query = 'SELECT id, nome FROM posicoes ORDER BY nome';
          colunas = ['ID', 'Nome', 'Ações'];
          break;
        case 'setores':
          query = `SELECT s.id, d.nome as divisao, s.nome as setor
                   FROM setores s 
                   JOIN divisoes d ON s.divisao_id = d.id 
                   ORDER BY d.nome, s.nome`;
          colunas = ['ID', 'Divisão', 'Setor', 'Ações'];
          break;
        case 'turnos':
          query = 'SELECT id, nome FROM turnos ORDER BY nome';
          colunas = ['ID', 'Nome', 'Ações'];
          break;
        case 'horarios':
          query = 'SELECT id, descricao FROM horarios ORDER BY descricao';
          colunas = ['ID', 'Descrição', 'Ações'];
          break;
        case 'guardas':
          query = `SELECT g.id, g.nome, g.telefone,
                   COALESCE(d.nome, '-') as divisao,
                   COALESCE(p.nome, '-') as posicao,
                   COALESCE(s.nome, '-') as setor,
                   COALESCE(h.descricao, '-') as horario,
                   COALESCE(t.nome, '-') as turno
                   FROM guardas g 
                   LEFT JOIN divisoes d ON g.divisao_id = d.id 
                   LEFT JOIN posicoes p ON g.posicao_id = p.id 
                   LEFT JOIN setores s ON g.setor_id = s.id 
                   LEFT JOIN horarios h ON g.horario_id = h.id 
                   LEFT JOIN turnos t ON g.turno_id = t.id 
                   ORDER BY g.nome`;
          colunas = ['ID', 'Nome', 'Telefone', 'Divisão', 'Posição', 'Setor', 'Horário', 'Turno', 'Atividades/Horários', 'Ações'];
          break;
        case 'equipes':
          query = `SELECT e.id, e.nome, 
                   GROUP_CONCAT(g.nome || ' (' || t.nome || ')', ', ') as membros 
                   FROM equipes e 
                   LEFT JOIN equipe_membros em ON e.id = em.equipe_id 
                   LEFT JOIN guardas g ON em.guarda_id = g.id 
                   LEFT JOIN turnos t ON em.turno_id = t.id 
                   GROUP BY e.id 
                   ORDER BY e.nome`;
          colunas = ['ID', 'Nome', 'Membros (Turno)', 'Ações'];
          break;
        case 'radio_patrulha':
          query = `SELECT rp.id, rp.numero, rp.zona, 
                   COALESCE(t.nome, '-') as turno,
                   COALESCE(a.nome, '-') as apoio,
                   COALESCE(m.nome, '-') as motorista,
                   COALESCE(e.nome, '-') as encarregado
                   FROM radio_patrulha rp 
                   LEFT JOIN turnos t ON rp.turno_id = t.id 
                   LEFT JOIN guardas a ON rp.apoio_id = a.id 
                   LEFT JOIN guardas m ON rp.motorista_id = m.id 
                   LEFT JOIN guardas e ON rp.encarregado_id = e.id 
                   ORDER BY rp.numero`;
          colunas = ['ID', 'Número', 'Zona', 'Turno', 'Apoio/Sargento', 'Motorista', 'Encarregado', 'Ações'];
          break;
        case 'divisao_rural':
          query = `SELECT dr.id, dr.viatura, 
                   COALESCE(m.nome, '-') as motorista,
                   COALESCE(e.nome, '-') as encarregado
                   FROM divisao_rural dr 
                   LEFT JOIN guardas m ON dr.motorista_id = m.id 
                   LEFT JOIN guardas e ON dr.encarregado_id = e.id 
                   ORDER BY dr.viatura`;
          colunas = ['ID', 'Viatura', 'Motorista', 'Encarregado', 'Ações'];
          break;
        case 'romu':
          query = `SELECT r.id, 
                   COALESCE(m.nome, '-') as motorista,
                   COALESCE(e.nome, '-') as encarregado,
                   COALESCE(t.nome, '-') as terceiro,
                   COALESCE(tu.nome, '-') as turno,
                   r.dias
                   FROM romu r 
                   LEFT JOIN guardas m ON r.motorista_id = m.id 
                   LEFT JOIN guardas e ON r.encarregado_id = e.id 
                   LEFT JOIN guardas t ON r.terceiro_id = t.id 
                   LEFT JOIN turnos tu ON r.turno_id = tu.id 
                   ORDER BY r.id`;
          colunas = ['ID', 'Motorista', 'Encarregado', 'Terceiro', 'Turno', 'Dias', 'Ações'];
          break;
        case 'ronda_comercio':
          query = `SELECT rc.id, 
                   COALESCE(m.nome, '-') as motorista,
                   COALESCE(e.nome, '-') as encarregado,
                   COALESCE(t.nome, '-') as turno,
                   rc.dias
                   FROM ronda_comercio rc 
                   LEFT JOIN guardas m ON rc.motorista_id = m.id 
                   LEFT JOIN guardas e ON rc.encarregado_id = e.id 
                   LEFT JOIN turnos t ON rc.turno_id = t.id 
                   ORDER BY rc.id`;
          colunas = ['ID', 'Motorista', 'Encarregado', 'Turno', 'Dias', 'Ações'];
          break;
        case 'coi':
          query = `SELECT c.id, 
                   COALESCE(t.nome, '-') as turno,
                   COALESCE(h.descricao, '-') as horario,
                   c.dias,
                   GROUP_CONCAT(g.nome, ', ') as guardas
                   FROM coi c 
                   LEFT JOIN turnos t ON c.turno_id = t.id 
                   LEFT JOIN horarios h ON c.horario_id = h.id 
                   LEFT JOIN coi_guardas cg ON c.id = cg.coi_id 
                   LEFT JOIN guardas g ON cg.guarda_id = g.id 
                   GROUP BY c.id 
                   ORDER BY c.id`;
          colunas = ['ID', 'Turno', 'Horário', 'Dias', 'Guardas', 'Ações'];
          break;
        case 'patrulha_anjos':
          query = `SELECT p.id,
                   COALESCE(t.nome, '-') as turno,
                   COALESCE(h.descricao, '-') as horario,
                   p.dias,
                   COALESCE(g1.nome, '-') as integrante1,
                   COALESCE(g2.nome, '-') as integrante2
                   FROM patrulha_anjos p
                   LEFT JOIN turnos t ON p.turno_id = t.id
                   LEFT JOIN horarios h ON p.horario_id = h.id
                   LEFT JOIN guardas g1 ON p.integrante1_id = g1.id
                   LEFT JOIN guardas g2 ON p.integrante2_id = g2.id
                   ORDER BY p.id`;
          colunas = ['ID', 'Turno', 'Horário', 'Dias', 'Integrante 1', 'Integrante 2', 'Ações'];
          break;
        case 'patrulha_vulnerabilidade':
          query = `SELECT p.id,
                   COALESCE(t.nome, '-') as turno,
                   COALESCE(h.descricao, '-') as horario,
                   p.dias,
                   COALESCE(g1.nome, '-') as integrante1,
                   COALESCE(g2.nome, '-') as integrante2
                   FROM patrulha_vulnerabilidade p
                   LEFT JOIN turnos t ON p.turno_id = t.id
                   LEFT JOIN horarios h ON p.horario_id = h.id
                   LEFT JOIN guardas g1 ON p.integrante1_id = g1.id
                   LEFT JOIN guardas g2 ON p.integrante2_id = g2.id
                   ORDER BY p.id`;
          colunas = ['ID', 'Turno', 'Horário', 'Dias', 'Integrante 1', 'Integrante 2', 'Ações'];
          break;
        case 'patrulha_maria':
          query = `SELECT p.id,
                   COALESCE(t.nome, '-') as turno,
                   COALESCE(h.descricao, '-') as horario,
                   p.dias,
                   COALESCE(g1.nome, '-') as integrante1,
                   COALESCE(g2.nome, '-') as integrante2
                   FROM patrulha_maria p
                   LEFT JOIN turnos t ON p.turno_id = t.id
                   LEFT JOIN horarios h ON p.horario_id = h.id
                   LEFT JOIN guardas g1 ON p.integrante1_id = g1.id
                   LEFT JOIN guardas g2 ON p.integrante2_id = g2.id
                   ORDER BY p.id`;
          colunas = ['ID', 'Turno', 'Horário', 'Dias', 'Integrante 1', 'Integrante 2', 'Ações'];
          break;
        case 'escalas':
          query = `SELECT e.id, g.nome as guarda, 
                   COALESCE(t.nome, '-') as turno,
                   e.mes || '/' || e.ano as mes_ano,
                   e.dias,
                   e.guarda_id, e.turno_id, e.mes, e.ano
                   FROM escalas e 
                   JOIN guardas g ON e.guarda_id = g.id 
                   LEFT JOIN turnos t ON e.turno_id = t.id 
                   ORDER BY e.ano DESC, e.mes DESC`;
          colunas = ['ID', 'Guarda', 'Turno', 'Mês/Ano', 'Dias', 'Ações'];
          break;
        case 'ferias':
          query = `SELECT f.id, g.nome as guarda, f.data_inicio, f.data_fim,
                   (julianday(f.data_fim) - julianday(f.data_inicio) + 1) as dias,
                   f.guarda_id
                   FROM ferias f 
                   JOIN guardas g ON f.guarda_id = g.id 
                   ORDER BY f.data_inicio DESC`;
          colunas = ['ID', 'Guarda', 'Data Início', 'Data Fim', 'Dias', 'Ações'];
          break;
        case 'ausencias':
          query = `SELECT a.id, g.nome as guarda, a.data, a.motivo, 
                   COALESCE(a.observacoes, '-') as obs,
                   a.guarda_id
                   FROM ausencias a 
                   JOIN guardas g ON a.guarda_id = g.id 
                   ORDER BY a.data DESC`;
          colunas = ['ID', 'Guarda', 'Data', 'Motivo', 'Observações', 'Ações'];
          break;
      }

      const result = db.exec(query);
      const tabelaEl = document.getElementById(`tabela_${tabela}`);

      if (!tabelaEl) return;

      if (result.length === 0) {
        tabelaEl.innerHTML = '<tr><td colspan="10">Nenhum registro encontrado</td></tr>';
        return;
      }

      let html = '<thead><tr>';
      colunas.forEach(col => html += `<th>${col}</th>`);
      html += '</tr></thead><tbody>';

      result[0].values.forEach(row => {
        html += '<tr>';
        if (tabela === 'guardas') {
          for (let i = 0; i < 8; i++) {
            html += `<td>${row[i] || '-'}</td>`;
          }
          const atividades = obterAtividadesHorariosGuarda(row[0]);
          html += `<td>${atividades}</td>`;
        } else {
          // Determinar quantas colunas mostrar
          let displayCols = row.length;
          switch (tabela) {
            case 'equipes':
              displayCols = 3; // ID, Nome, Membros
              break;
            case 'radio_patrulha':
              displayCols = 7; // ID até Encarregado
              break;
            case 'divisao_rural':
              displayCols = 4; // ID, Viatura, Motorista, Encarregado
              break;
            case 'romu':
              displayCols = 6; // ID até Dias
              break;
            case 'ronda_comercio':
              displayCols = 5; // ID até Dias
              break;
            case 'coi':
              displayCols = 5; // ID até Guardas
              break;
            case 'patrulha_anjos':
            case 'patrulha_vulnerabilidade':
            case 'patrulha_maria':
              displayCols = 6; // ID até Integrante 2
              break;
            case 'escalas':
              displayCols = 5; // ID até Dias
              break;
            case 'ferias':
              displayCols = 5; // ID até Dias
              break;
            case 'ausencias':
              displayCols = 5; // ID até Observações
              break;
            default:
              displayCols = colunas.length - 1; // Todas exceto Ações
          }

          for (let i = 0; i < displayCols; i++) {
            html += `<td>${row[i] || '-'}</td>`;
          }
        }

        // Adicionar botões de ação
        html += `<td>
          <button class="btn btn-warning btn-small" onclick="editarItem('${tabela}', ${JSON.stringify(row).replace(/"/g, '&quot;')})">✏️ Editar</button>
          <button class="btn btn-danger btn-small" onclick="excluirItem('${tabela}', ${row[0]})">🗑️ Excluir</button>
        </td>`;

        html += '</tr>';
      });

      html += '</tbody>';
      tabelaEl.innerHTML = html;
    }

    // EDITAR ITEM
    function editarItem(tabela, row) {
      switch (tabela) {
        case 'divisoes':
          document.getElementById('edit_divisao_id').value = row[0];
          document.getElementById('edit_divisao_nome').value = row[1];
          abrirModal('modalEditarDivisao');
          break;

        case 'posicoes':
          document.getElementById('edit_posicao_id').value = row[0];
          document.getElementById('edit_posicao_nome').value = row[1];
          abrirModal('modalEditarPosicao');
          break;

        case 'setores':
          document.getElementById('edit_setor_id').value = row[0];
          document.getElementById('edit_setor_nome').value = row[2];
          atualizarSelects();
          setTimeout(() => {
            document.getElementById('edit_setor_divisao_id').value = row[1];
          }, 100);
          abrirModal('modalEditarSetor');
          break;

        case 'turnos':
          document.getElementById('edit_turno_id').value = row[0];
          document.getElementById('edit_turno_nome').value = row[1];
          abrirModal('modalEditarTurno');
          break;

        case 'horarios':
          document.getElementById('edit_horario_id').value = row[0];
          document.getElementById('edit_horario_descricao').value = row[1];
          abrirModal('modalEditarHorario');
          break;

        case 'guardas':
          document.getElementById('edit_guarda_id').value = row[0];
          document.getElementById('edit_guarda_nome').value = row[1];
          document.getElementById('edit_guarda_telefone').value = row[2] || '';
          atualizarSelects();
          setTimeout(() => {
            // Buscar dados específicos do guarda
            const guardaQuery = db.exec('SELECT divisao_id, posicao_id, setor_id, horario_id, turno_id FROM guardas WHERE id = ?', [row[0]]);
            if (guardaQuery.length > 0) {
              const guardaData = guardaQuery[0].values[0];
              document.getElementById('edit_guarda_divisao_id').value = guardaData[0] || '';
              document.getElementById('edit_guarda_posicao_id').value = guardaData[1] || '';
              document.getElementById('edit_guarda_setor_id').value = guardaData[2] || '';
              document.getElementById('edit_guarda_horario_id').value = guardaData[3] || '';
              document.getElementById('edit_guarda_turno_id').value = guardaData[4] || '';
            }
            
            // Carregar informações vinculadas
            carregarInfoVinculadasGuarda(row[0]);
          }, 100);
          abrirModal('modalEditarGuarda');
          break;

        case 'equipes':
          document.getElementById('edit_equipe_id').value = row[0];
          document.getElementById('edit_equipe_nome').value = row[1];
          atualizarSelects();

          // Buscar membros da equipe
          setTimeout(() => {
            const membrosQuery = db.exec('SELECT guarda_id, turno_id FROM equipe_membros WHERE equipe_id = ?', [row[0]]);
            const container = document.getElementById('edit_equipe_membros_container');
            container.innerHTML = '';

            for (let i = 0; i < 4; i++) {
              container.innerHTML += `
                <div>
                  <label>Membro ${i + 1}:</label>
                  <select id="edit_membro_guarda_${i}" class="guarda-select">
                    <option value="">Selecione um guarda</option>
                  </select>
                  <select id="edit_membro_turno_${i}" class="turno-select">
                    <option value="">Selecione o turno</option>
                  </select>
                </div>
              `;
            }

            // Preencher selects de guardas e turnos
            atualizarSelectGuarda();
            atualizarSelectTurno();

            // Preencher valores
            setTimeout(() => {
              for (let i = 0; i < Math.min(4, membrosQuery.length); i++) {
                const membroData = membrosQuery[0].values[i];
                if (membroData) {
                  document.getElementById(`edit_membro_guarda_${i}`).value = membroData[0];
                  document.getElementById(`edit_membro_turno_${i}`).value = membroData[1];
                }
              }
            }, 200);
          }, 100);
          abrirModal('modalEditarEquipe');
          break;

        case 'radio_patrulha':
          document.getElementById('edit_rp_id').value = row[0];
          document.getElementById('edit_rp_numero').value = row[1];
          document.getElementById('edit_rp_zona').value = row[2];
          atualizarSelects();
          setTimeout(() => {
            const rpQuery = db.exec('SELECT turno_id, apoio_id, motorista_id, encarregado_id FROM radio_patrulha WHERE id = ?', [row[0]]);
            if (rpQuery.length > 0) {
              const rpData = rpQuery[0].values[0];
              document.getElementById('edit_rp_turno_id').value = rpData[0] || '';
              document.getElementById('edit_rp_apoio_id').value = rpData[1] || '';
              document.getElementById('edit_rp_motorista_id').value = rpData[2] || '';
              document.getElementById('edit_rp_encarregado_id').value = rpData[3] || '';
            }
          }, 100);
          abrirModal('modalEditarRP');
          break;

        case 'divisao_rural':
          document.getElementById('edit_rural_id').value = row[0];
          document.getElementById('edit_rural_viatura').value = row[1];
          atualizarSelects();
          setTimeout(() => {
            const ruralQuery = db.exec('SELECT motorista_id, encarregado_id FROM divisao_rural WHERE id = ?', [row[0]]);
            if (ruralQuery.length > 0) {
              const ruralData = ruralQuery[0].values[0];
              document.getElementById('edit_rural_motorista_id').value = ruralData[0] || '';
              document.getElementById('edit_rural_encarregado_id').value = ruralData[1] || '';
            }
          }, 100);
          abrirModal('modalEditarRural');
          break;

        case 'romu':
          document.getElementById('edit_romu_id').value = row[0];
          document.getElementById('edit_romu_dias').value = row[5];
          atualizarSelects();
          setTimeout(() => {
            const romuQuery = db.exec('SELECT motorista_id, encarregado_id, terceiro_id, turno_id FROM romu WHERE id = ?', [row[0]]);
            if (romuQuery.length > 0) {
              const romuData = romuQuery[0].values[0];
              document.getElementById('edit_romu_motorista_id').value = romuData[0] || '';
              document.getElementById('edit_romu_encarregado_id').value = romuData[1] || '';
              document.getElementById('edit_romu_terceiro_id').value = romuData[2] || '';
              document.getElementById('edit_romu_turno_id').value = romuData[3] || '';
            }
          }, 100);
          abrirModal('modalEditarROMU');
          break;

        case 'ronda_comercio':
          document.getElementById('edit_ronda_id').value = row[0];
          document.getElementById('edit_ronda_dias').value = row[4];
          atualizarSelects();
          setTimeout(() => {
            const rondaQuery = db.exec('SELECT motorista_id, encarregado_id, turno_id FROM ronda_comercio WHERE id = ?', [row[0]]);
            if (rondaQuery.length > 0) {
              const rondaData = rondaQuery[0].values[0];
              document.getElementById('edit_ronda_motorista_id').value = rondaData[0] || '';
              document.getElementById('edit_ronda_encarregado_id').value = rondaData[1] || '';
              document.getElementById('edit_ronda_turno_id').value = rondaData[2] || '';
            }
          }, 100);
          abrirModal('modalEditarRonda');
          break;

        case 'patrulha_anjos':
          document.getElementById('edit_anjos_id').value = row[0];
          document.getElementById('edit_anjos_dias').value = row[3];
          atualizarSelects();
          setTimeout(() => {
            const anjosQuery = db.exec('SELECT turno_id, horario_id, integrante1_id, integrante2_id FROM patrulha_anjos WHERE id = ?', [row[0]]);
            if (anjosQuery.length > 0) {
              const anjosData = anjosQuery[0].values[0];
              document.getElementById('edit_anjos_turno_id').value = anjosData[0] || '';
              document.getElementById('edit_anjos_horario_id').value = anjosData[1] || '';
              document.getElementById('edit_anjos_integrante1_id').value = anjosData[2] || '';
              document.getElementById('edit_anjos_integrante2_id').value = anjosData[3] || '';
            }
          }, 100);
          abrirModal('modalEditarPatrulhaAnjos');
          break;

        case 'patrulha_vulnerabilidade':
          document.getElementById('edit_vulnerabilidade_id').value = row[0];
          document.getElementById('edit_vulnerabilidade_dias').value = row[3];
          atualizarSelects();
          setTimeout(() => {
            const vulnerabilidadeQuery = db.exec('SELECT turno_id, horario_id, integrante1_id, integrante2_id FROM patrulha_vulnerabilidade WHERE id = ?', [row[0]]);
            if (vulnerabilidadeQuery.length > 0) {
              const vulnerabilidadeData = vulnerabilidadeQuery[0].values[0];
              document.getElementById('edit_vulnerabilidade_turno_id').value = vulnerabilidadeData[0] || '';
              document.getElementById('edit_vulnerabilidade_horario_id').value = vulnerabilidadeData[1] || '';
              document.getElementById('edit_vulnerabilidade_integrante1_id').value = vulnerabilidadeData[2] || '';
              document.getElementById('edit_vulnerabilidade_integrante2_id').value = vulnerabilidadeData[3] || '';
            }
          }, 100);
          abrirModal('modalEditarPatrulhaVulnerabilidade');
          break;

        case 'patrulha_maria':
          document.getElementById('edit_maria_id').value = row[0];
          document.getElementById('edit_maria_dias').value = row[3];
          atualizarSelects();
          setTimeout(() => {
            const mariaQuery = db.exec('SELECT turno_id, horario_id, integrante1_id, integrante2_id FROM patrulha_maria WHERE id = ?', [row[0]]);
            if (mariaQuery.length > 0) {
              const mariaData = mariaQuery[0].values[0];
              document.getElementById('edit_maria_turno_id').value = mariaData[0] || '';
              document.getElementById('edit_maria_horario_id').value = mariaData[1] || '';
              document.getElementById('edit_maria_integrante1_id').value = mariaData[2] || '';
              document.getElementById('edit_maria_integrante2_id').value = mariaData[3] || '';
            }
          }, 100);
          abrirModal('modalEditarPatrulhaMaria');
          break;

        case 'coi':
          document.getElementById('edit_coi_id').value = row[0];
          document.getElementById('edit_coi_dias').value = row[3];
          atualizarSelects();
          setTimeout(() => {
            const coiQuery = db.exec('SELECT turno_id, horario_id FROM coi WHERE id = ?', [row[0]]);
            if (coiQuery.length > 0) {
              const coiData = coiQuery[0].values[0];
              document.getElementById('edit_coi_turno_id').value = coiData[0] || '';
              document.getElementById('edit_coi_horario_id').value = coiData[1] || '';
            }

            // Buscar guardas do COI
            const guardasQuery = db.exec('SELECT guarda_id FROM coi_guardas WHERE coi_id = ?', [row[0]]);
            const guardasIds = guardasQuery.length > 0 ? guardasQuery[0].values.map(g => g[0]) : [];

            // Gerar checkboxes de guardas
            const container = document.getElementById('edit_coi_guardas_container');
            const guardas = db.exec('SELECT id, nome FROM guardas ORDER BY nome');
            container.innerHTML = '';

            if (guardas.length > 0) {
              guardas[0].values.forEach(guarda => {
                const checked = guardasIds.includes(guarda[0]) ? 'checked' : '';
                container.innerHTML += `
                  <div class="checkbox-item">
                    <input type="checkbox" id="edit_coi_guarda_${guarda[0]}" value="${guarda[0]}" ${checked}>
                    <label for="edit_coi_guarda_${guarda[0]}">${guarda[1]}</label>
                  </div>
                `;
              });
            }
          }, 100);
          abrirModal('modalEditarCOI');
          break;

        case 'escalas':
          document.getElementById('edit_escala_id').value = row[0];
          document.getElementById('edit_escala_dias').value = row[4];
          document.getElementById('edit_escala_mes').value = row[7];
          document.getElementById('edit_escala_ano').value = row[8];
          atualizarSelects();
          setTimeout(() => {
            document.getElementById('edit_escala_guarda_id').value = row[5];
            document.getElementById('edit_escala_turno_id').value = row[6] || '';
          }, 100);
          abrirModal('modalEditarEscala');
          break;

        case 'ferias':
          document.getElementById('edit_ferias_id').value = row[0];
          document.getElementById('edit_ferias_inicio').value = row[2];
          document.getElementById('edit_ferias_fim').value = row[3];
          atualizarSelects();
          setTimeout(() => {
            document.getElementById('edit_ferias_guarda_id').value = row[5];
          }, 100);
          abrirModal('modalEditarFerias');
          break;

        case 'ausencias':
          document.getElementById('edit_ausencia_id').value = row[0];
          document.getElementById('edit_ausencia_data').value = row[2];
          document.getElementById('edit_ausencia_motivo').value = row[3];
          document.getElementById('edit_ausencia_obs').value = row[4] === '-' ? '' : row[4];
          atualizarSelects();
          setTimeout(() => {
            document.getElementById('edit_ausencia_guarda_id').value = row[5];
          }, 100);
          abrirModal('modalEditarAusencia');
          break;
      }
    }

    // Função para carregar informações vinculadas do guarda
    function carregarInfoVinculadasGuarda(guardaId) {
      // Buscar equipe
      const equipeQuery = `
        SELECT e.nome FROM guardas g
        LEFT JOIN equipes e ON g.equipe_id = e.id
        WHERE g.id = ?
      `;
      const equipeResult = db.exec(equipeQuery, [guardaId]);
      const equipeNome = equipeResult.length > 0 && equipeResult[0].values[0][0] 
        ? equipeResult[0].values[0][0] : 'Individual';

      // Buscar Rádio Patrulha
      const rpQuery = `
        SELECT rp.numero FROM guardas g
        LEFT JOIN radio_patrulha rp ON g.rp_id = rp.id
        WHERE g.id = ?
      `;
      const rpResult = db.exec(rpQuery, [guardaId]);
      const rpInfo = rpResult.length > 0 && rpResult[0].values[0][0] 
        ? `RP ${rpResult[0].values[0][0]}` : 'Não participa';

      // Buscar Divisão Rural
      const ruralQuery = `
        SELECT dr.viatura FROM guardas g
        LEFT JOIN divisao_rural dr ON g.rural_id = dr.id
        WHERE g.id = ?
      `;
      const ruralResult = db.exec(ruralQuery, [guardaId]);
      const ruralInfo = ruralResult.length > 0 && ruralResult[0].values[0][0] 
        ? `VTR ${ruralResult[0].values[0][0]}` : 'Não participa';

      // Buscar ROMU
      const romuQuery = `
        SELECT 'ROMU' FROM guardas g
        LEFT JOIN romu r ON g.romu_id = r.id
        WHERE g.id = ?
      `;
      const romuResult = db.exec(romuQuery, [guardaId]);
      const romuInfo = romuResult.length > 0 && romuResult[0].values[0][0] 
        ? 'Participa' : 'Não participa';

      // Buscar Ronda Comércio
      const rondaQuery = `
        SELECT 'Ronda' FROM guardas g
        LEFT JOIN ronda_comercio rc ON g.ronda_id = rc.id
        WHERE g.id = ?
      `;
      const rondaResult = db.exec(rondaQuery, [guardaId]);
      const rondaInfo = rondaResult.length > 0 && rondaResult[0].values[0][0] 
        ? 'Participa' : 'Não participa';

      // Buscar COI
      const coiQuery = `
        SELECT 'COI' FROM guardas g
        LEFT JOIN coi c ON g.coi_id = c.id
        WHERE g.id = ?
      `;
      const coiResult = db.exec(coiQuery, [guardaId]);
      const coiInfo = coiResult.length > 0 && coiResult[0].values[0][0] 
        ? 'Participa' : 'Não participa';

      // Atualizar campos de exibição
      document.getElementById('edit_guarda_equipe_info').value = equipeNome;
      document.getElementById('edit_guarda_rp_info').value = rpInfo;
      document.getElementById('edit_guarda_rural_info').value = ruralInfo;
      document.getElementById('edit_guarda_romu_info').value = romuInfo;
      document.getElementById('edit_guarda_ronda_info').value = rondaInfo;
      document.getElementById('edit_guarda_coi_info').value = coiInfo;
    }

    // Funções para mostrar detalhes
    function mostrarDetalhesEquipe() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const equipeNome = document.getElementById('edit_guarda_equipe_info').value;
      
      if (equipeNome === 'Individual') {
        alert('Este guarda não está vinculado a nenhuma equipe.');
        return;
      }
      
      const query = `
        SELECT e.nome, 
               GROUP_CONCAT(g2.nome || ' (' || t.nome || ')', ', ') as membros
        FROM guardas g
        JOIN equipes e ON g.equipe_id = e.id
        JOIN equipe_membros em ON e.id = em.equipe_id
        JOIN guardas g2 ON em.guarda_id = g2.id
        JOIN turnos t ON em.turno_id = t.id
        WHERE g.id = ?
        GROUP BY e.id
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const conteudo = document.getElementById('conteudo_detalhes_equipe');
        conteudo.innerHTML = `
          <p><strong>Nome da Equipe:</strong> ${result[0].values[0][0]}</p>
          <p><strong>Membros:</strong> ${result[0].values[0][1]}</p>
        `;
        abrirModal('modalDetalhesEquipe');
      }
    }

    function mostrarDetalhesRP() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const rpInfo = document.getElementById('edit_guarda_rp_info').value;
      
      if (rpInfo === 'Não participa') {
        alert('Este guarda não está vinculado a nenhuma Rádio Patrulha.');
        return;
      }
      
      const query = `
        SELECT rp.numero, rp.zona, t.nome as turno,
               a.nome as apoio, m.nome as motorista, e.nome as encarregado
        FROM guardas g
        JOIN radio_patrulha rp ON g.rp_id = rp.id
        LEFT JOIN turnos t ON rp.turno_id = t.id
        LEFT JOIN guardas a ON rp.apoio_id = a.id
        LEFT JOIN guardas m ON rp.motorista_id = m.id
        LEFT JOIN guardas e ON rp.encarregado_id = e.id
        WHERE g.id = ?
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const row = result[0].values[0];
        const conteudo = document.getElementById('conteudo_detalhes_rp');
        conteudo.innerHTML = `
          <p><strong>Número:</strong> ${row[0]}</p>
          <p><strong>Zona:</strong> ${row[1]}</p>
          <p><strong>Turno:</strong> ${row[2] || '-'}</p>
          <p><strong>Apoio/Sargento:</strong> ${row[3] || '-'}</p>
          <p><strong>Motorista:</strong> ${row[4] || '-'}</p>
          <p><strong>Encarregado:</strong> ${row[5] || '-'}</p>
        `;
        abrirModal('modalDetalhesRP');
      }
    }

    function mostrarDetalhesRural() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const ruralInfo = document.getElementById('edit_guarda_rural_info').value;
      
      if (ruralInfo === 'Não participa') {
        alert('Este guarda não está vinculado a nenhuma Divisão Rural.');
        return;
      }
      
      const query = `
        SELECT dr.viatura, m.nome as motorista, e.nome as encarregado
        FROM guardas g
        JOIN divisao_rural dr ON g.rural_id = dr.id
        LEFT JOIN guardas m ON dr.motorista_id = m.id
        LEFT JOIN guardas e ON dr.encarregado_id = e.id
        WHERE g.id = ?
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const row = result[0].values[0];
        const conteudo = document.getElementById('conteudo_detalhes_rural');
        conteudo.innerHTML = `
          <p><strong>Viatura:</strong> ${row[0]}</p>
          <p><strong>Motorista:</strong> ${row[1] || '-'}</p>
          <p><strong>Encarregado:</strong> ${row[2] || '-'}</p>
        `;
        abrirModal('modalDetalhesRural');
      }
    }

    function mostrarDetalhesROMU() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const romuInfo = document.getElementById('edit_guarda_romu_info').value;
      
      if (romuInfo === 'Não participa') {
        alert('Este guarda não está vinculado a nenhum ROMU.');
        return;
      }
      
      const query = `
        SELECT r.dias, t.nome as turno,
               m.nome as motorista, e.nome as encarregado, g3.nome as terceiro
        FROM guardas g
        JOIN romu r ON g.romu_id = r.id
        LEFT JOIN turnos t ON r.turno_id = t.id
        LEFT JOIN guardas m ON r.motorista_id = m.id
        LEFT JOIN guardas e ON r.encarregado_id = e.id
        LEFT JOIN guardas g3 ON r.terceiro_id = g3.id
        WHERE g.id = ?
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const row = result[0].values[0];
        const conteudo = document.getElementById('conteudo_detalhes_romu');
        conteudo.innerHTML = `
          <p><strong>Dias de Escala:</strong> ${row[0]}</p>
          <p><strong>Turno:</strong> ${row[1] || '-'}</p>
          <p><strong>Motorista:</strong> ${row[2] || '-'}</p>
          <p><strong>Encarregado:</strong> ${row[3] || '-'}</p>
          <p><strong>Terceiro Integrante:</strong> ${row[4] || '-'}</p>
        `;
        abrirModal('modalDetalhesROMU');
      }
    }

    function mostrarDetalhesRonda() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const rondaInfo = document.getElementById('edit_guarda_ronda_info').value;
      
      if (rondaInfo === 'Não participa') {
        alert('Este guarda não está vinculado a nenhuma Ronda Comércio.');
        return;
      }
      
      const query = `
        SELECT rc.dias, t.nome as turno,
               m.nome as motorista, e.nome as encarregado
        FROM guardas g
        JOIN ronda_comercio rc ON g.ronda_id = rc.id
        LEFT JOIN turnos t ON rc.turno_id = t.id
        LEFT JOIN guardas m ON rc.motorista_id = m.id
        LEFT JOIN guardas e ON rc.encarregado_id = e.id
        WHERE g.id = ?
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const row = result[0].values[0];
        const conteudo = document.getElementById('conteudo_detalhes_ronda');
        conteudo.innerHTML = `
          <p><strong>Dias de Escala:</strong> ${row[0]}</p>
          <p><strong>Turno:</strong> ${row[1] || '-'}</p>
          <p><strong>Motorista:</strong> ${row[2] || '-'}</p>
          <p><strong>Encarregado:</strong> ${row[3] || '-'}</p>
        `;
        abrirModal('modalDetalhesRonda');
      }
    }

    function mostrarDetalhesCOI() {
      const guardaId = document.getElementById('edit_guarda_id').value;
      const coiInfo = document.getElementById('edit_guarda_coi_info').value;
      
      if (coiInfo === 'Não participa') {
        alert('Este guarda não está vinculado a nenhum COI.');
        return;
      }
      
      const query = `
        SELECT c.dias, t.nome as turno, h.descricao as horario,
               GROUP_CONCAT(g2.nome, ', ') as guardas
        FROM guardas g
        JOIN coi c ON g.coi_id = c.id
        LEFT JOIN turnos t ON c.turno_id = t.id
        LEFT JOIN horarios h ON c.horario_id = h.id
        LEFT JOIN coi_guardas cg ON c.id = cg.coi_id
        LEFT JOIN guardas g2 ON cg.guarda_id = g2.id
        WHERE g.id = ?
        GROUP BY c.id
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        const row = result[0].values[0];
        const conteudo = document.getElementById('conteudo_detalhes_coi');
        conteudo.innerHTML = `
          <p><strong>Dias de Escala:</strong> ${row[0]}</p>
          <p><strong>Turno:</strong> ${row[1] || '-'}</p>
          <p><strong>Horário:</strong> ${row[2] || '-'}</p>
          <p><strong>Guardas no COI:</strong> ${row[3] || '-'}</p>
        `;
        abrirModal('modalDetalhesCOI');
      }
    }

    function mostrarDetalhesEquipeEscala() {
      const guardaId = document.getElementById('escala_guarda_id').value;
      const equipeNome = document.getElementById('info_guarda_equipe').value;
      
      if (equipeNome === 'Individual') {
        alert('Este guarda não está vinculado a nenhuma equipe.');
        return;
      }
      
      const query = `
        SELECT e.nome, 
               GROUP_CONCAT(g2.nome || ' (' || t.nome || ')', ', ') as membros
        FROM guardas g
        JOIN equipes e ON g.equipe_id = e.id
        JOIN equipe_membros em ON e.id = em.equipe_id
        JOIN guardas g2 ON em.guarda_id = g2.id
        JOIN turnos t ON em.turno_id = t.id
        WHERE g.id = ?
        GROUP BY e.id
      `;
      
      const result = db.exec(query, [guardaId]);
      if (result.length > 0) {
        alert(`Equipe: ${result[0].values[0][0]}\nMembros: ${result[0].values[0][1]}`);
      }
    }

    // EXCLUIR ITEM
    function excluirItem(tabela, id) {
      if (!confirm('Tem certeza que deseja excluir este registro?')) {
        return;
      }

      try {
        // Verificar dependências antes de excluir
        if (tabela === 'guardas') {
          const deps = db.exec('SELECT COUNT(*) FROM escalas WHERE guarda_id = ?', [id]);
          if (deps[0].values[0][0] > 0) {
            mostrarMensagem('Não é possível excluir: guarda possui escalas atribuídas', 'error');
            return;
          }
        }

        if (tabela === 'equipes') {
          db.run('DELETE FROM equipe_membros WHERE equipe_id = ?', [id]);
          db.run('UPDATE guardas SET equipe_id = NULL WHERE equipe_id = ?', [id]);
        }

        if (tabela === 'coi') {
          db.run('DELETE FROM coi_guardas WHERE coi_id = ?', [id]);
          db.run('UPDATE guardas SET coi_id = NULL WHERE coi_id = ?', [id]);
        }

        if (tabela === 'radio_patrulha') {
          db.run('UPDATE guardas SET rp_id = NULL WHERE rp_id = ?', [id]);
        }

        if (tabela === 'divisao_rural') {
          db.run('UPDATE guardas SET rural_id = NULL WHERE rural_id = ?', [id]);
        }

        if (tabela === 'romu') {
          db.run('UPDATE guardas SET romu_id = NULL WHERE romu_id = ?', [id]);
        }

        if (tabela === 'ronda_comercio') {
          db.run('UPDATE guardas SET ronda_id = NULL WHERE ronda_id = ?', [id]);
        }

        if (tabela === 'patrulha_anjos') {
          db.run('UPDATE guardas SET patrulha_anjos_id = NULL WHERE patrulha_anjos_id = ?', [id]);
        }

        if (tabela === 'patrulha_vulnerabilidade') {
          db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = NULL WHERE patrulha_vulnerabilidade_id = ?', [id]);
        }

        if (tabela === 'patrulha_maria') {
          db.run('UPDATE guardas SET patrulha_maria_id = NULL WHERE patrulha_maria_id = ?', [id]);
        }

        db.run(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
        mostrarMensagem('Registro excluído com sucesso!', 'success');
        carregarTabela(tabela);
        atualizarSelects();
      } catch (e) {
        mostrarMensagem('Erro ao excluir: ' + e.message, 'error');
      }
    }

    // FUNÇÕES DE ATUALIZAR SELECTS
    function atualizarSelects() {
      // Divisões
      const divisoes = db.exec('SELECT id, nome FROM divisoes ORDER BY nome');
      const selectsDivisoes = ['setor_divisao_id', 'guarda_divisao_id', 'edit_setor_divisao_id', 'edit_guarda_divisao_id'];
      selectsDivisoes.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione uma divisão</option>';
          if (divisoes.length > 0) {
            divisoes[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Posições
      const posicoes = db.exec('SELECT id, nome FROM posicoes ORDER BY nome');
      const selectsPosicoes = ['guarda_posicao_id', 'edit_guarda_posicao_id'];
      selectsPosicoes.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione uma posição</option>';
          if (posicoes.length > 0) {
            posicoes[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Setores
      const setores = db.exec('SELECT id, nome FROM setores ORDER BY nome');
      const selectsSetores = ['guarda_setor_id', 'edit_guarda_setor_id'];
      selectsSetores.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione um setor</option>';
          if (setores.length > 0) {
            setores[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Turnos
      const turnos = db.exec('SELECT id, nome FROM turnos ORDER BY nome');
      const selectsTurnos = ['guarda_turno_id', 'rp_turno_id', 'romu_turno_id', 'ronda_turno_id', 'coi_turno_id',
        'anjos_turno_id', 'vulnerabilidade_turno_id', 'maria_turno_id', 'escala_turno_id',
        'edit_guarda_turno_id', 'edit_rp_turno_id', 'edit_romu_turno_id', 'edit_ronda_turno_id', 'edit_coi_turno_id',
        'edit_anjos_turno_id', 'edit_vulnerabilidade_turno_id', 'edit_maria_turno_id', 'edit_escala_turno_id'];
      selectsTurnos.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione um turno</option>';
          if (turnos.length > 0) {
            turnos[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Horários
      const horarios = db.exec('SELECT id, descricao FROM horarios ORDER BY descricao');
      const selectsHorarios = ['guarda_horario_id', 'coi_horario_id',
        'anjos_horario_id', 'vulnerabilidade_horario_id', 'maria_horario_id',
        'edit_guarda_horario_id', 'edit_coi_horario_id',
        'edit_anjos_horario_id', 'edit_vulnerabilidade_horario_id', 'edit_maria_horario_id'];
      selectsHorarios.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione um horário</option>';
          if (horarios.length > 0) {
            horarios[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Equipes
      const equipes = db.exec('SELECT id, nome FROM equipes ORDER BY nome');
      const selectsEquipes = ['escala_equipe_id', 'edit_equipe_id'];
      selectsEquipes.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          select.innerHTML = '<option value="">Selecione uma equipe</option>';
          if (equipes.length > 0) {
            equipes[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Guardas (para selects gerais)
      const guardas = db.exec('SELECT id, nome FROM guardas ORDER BY nome');

      // Lista de selects que precisam de guardas
      const selectsGuardas = [
        'rp_apoio_id', 'rp_motorista_id', 'rp_encarregado_id',
        'rural_motorista_id', 'rural_encarregado_id',
        'romu_motorista_id', 'romu_encarregado_id', 'romu_terceiro_id',
        'ronda_motorista_id', 'ronda_encarregado_id',
        'escala_guarda_id', 'ferias_guarda_id', 'ausencia_guarda_id',
        'edit_rp_apoio_id', 'edit_rp_motorista_id', 'edit_rp_encarregado_id',
        'edit_rural_motorista_id', 'edit_rural_encarregado_id',
        'edit_romu_motorista_id', 'edit_romu_encarregado_id', 'edit_romu_terceiro_id',
        'edit_ronda_motorista_id', 'edit_ronda_encarregado_id',
        'anjos_integrante1_id', 'anjos_integrante2_id',
        'vulnerabilidade_integrante1_id', 'vulnerabilidade_integrante2_id',
        'maria_integrante1_id', 'maria_integrante2_id',
        'edit_anjos_integrante1_id', 'edit_anjos_integrante2_id',
        'edit_vulnerabilidade_integrante1_id', 'edit_vulnerabilidade_integrante2_id',
        'edit_maria_integrante1_id', 'edit_maria_integrante2_id',
        'edit_escala_guarda_id', 'edit_ferias_guarda_id', 'edit_ausencia_guarda_id'
      ];

      selectsGuardas.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          if (id.includes('terceiro_id')) {
            select.innerHTML = '<option value="">Não há</option>';
          } else {
            select.innerHTML = '<option value="">Selecione um guarda</option>';
          }
          if (guardas.length > 0) {
            guardas[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });

      // Gerar container de membros para equipes
      gerarContainerEquipeMembros();
      gerarContainerEditEquipeMembros();

      // Gerar checkboxes de guardas para COI
      gerarCheckboxCOIGuardas();
    }

    function gerarContainerEquipeMembros() {
      const container = document.getElementById('equipe_membros_container');
      if (!container) return;

      container.innerHTML = '';

      for (let i = 0; i < 4; i++) {
        container.innerHTML += `
          <div>
            <label>Membro ${i + 1}:</label>
            <select id="membro_guarda_${i}" class="guarda-select">
              <option value="">Selecione um guarda</option>
            </select>
            <select id="membro_turno_${i}" class="turno-select">
              <option value="">Selecione o turno</option>
            </select>
          </div>
        `;
      }

      // Preencher selects
      setTimeout(() => {
        atualizarSelectGuarda();
        atualizarSelectTurno();
      }, 100);
    }

    function gerarContainerEditEquipeMembros() {
      const container = document.getElementById('edit_equipe_membros_container');
      if (!container) return;

      container.innerHTML = '';

      for (let i = 0; i < 4; i++) {
        container.innerHTML += `
          <div>
            <label>Membro ${i + 1}:</label>
            <select id="edit_membro_guarda_${i}" class="guarda-select">
              <option value="">Selecione um guarda</option>
            </select>
            <select id="edit_membro_turno_${i}" class="turno-select">
              <option value="">Selecione o turno</option>
            </select>
          </div>
        `;
      }
    }

    function atualizarSelectGuarda() {
      const guardas = db.exec('SELECT id, nome FROM guardas ORDER BY nome');
      const selects = document.querySelectorAll('.guarda-select');

      selects.forEach(select => {
        if (select.innerHTML === '') {
          select.innerHTML = '<option value="">Selecione um guarda</option>';
          if (guardas.length > 0) {
            guardas[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });
    }

    function atualizarSelectTurno() {
      const turnos = db.exec('SELECT id, nome FROM turnos ORDER BY nome');
      const selects = document.querySelectorAll('.turno-select');

      selects.forEach(select => {
        if (select.innerHTML === '') {
          select.innerHTML = '<option value="">Selecione o turno</option>';
          if (turnos.length > 0) {
            turnos[0].values.forEach(row => {
              select.innerHTML += `<option value="${row[0]}">${row[1]}</option>`;
            });
          }
        }
      });
    }

    function gerarCheckboxCOIGuardas() {
      const containerCadastro = document.getElementById('coi_guardas_container');
      if (!containerCadastro) return;

      const guardas = db.exec('SELECT id, nome FROM guardas ORDER BY nome');
      containerCadastro.innerHTML = '';

      if (guardas.length > 0) {
        guardas[0].values.forEach(guarda => {
          containerCadastro.innerHTML += `
            <div class="checkbox-item">
              <input type="checkbox" id="coi_guarda_${guarda[0]}" value="${guarda[0]}">
              <label for="coi_guarda_${guarda[0]}">${guarda[1]}</label>
            </div>
          `;
        });
      }
    }

    // FUNÇÕES DE SALVAR EDIÇÕES
    function salvarEdicaoDivisao() {
      const id = document.getElementById('edit_divisao_id').value;
      const nome = document.getElementById('edit_divisao_nome').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome da divisão', 'error');
        return;
      }

      db.run('UPDATE divisoes SET nome = ? WHERE id = ?', [nome, id]);
      mostrarMensagem('Divisão atualizada com sucesso!', 'success');
      fecharModal('modalEditarDivisao');
      carregarTabela('divisoes');
      atualizarSelects();
    }

    function salvarEdicaoPosicao() {
      const id = document.getElementById('edit_posicao_id').value;
      const nome = document.getElementById('edit_posicao_nome').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome da posição', 'error');
        return;
      }

      db.run('UPDATE posicoes SET nome = ? WHERE id = ?', [nome, id]);
      mostrarMensagem('Posição atualizada com sucesso!', 'success');
      fecharModal('modalEditarPosicao');
      carregarTabela('posicoes');
      atualizarSelects();
    }

    function salvarEdicaoSetor() {
      const id = document.getElementById('edit_setor_id').value;
      const divisaoId = document.getElementById('edit_setor_divisao_id').value;
      const nome = document.getElementById('edit_setor_nome').value;

      if (!divisaoId || !nome) {
        mostrarMensagem('Preencha todos os campos', 'error');
        return;
      }

      db.run('UPDATE setores SET divisao_id = ?, nome = ? WHERE id = ?', [divisaoId, nome, id]);
      mostrarMensagem('Setor atualizado com sucesso!', 'success');
      fecharModal('modalEditarSetor');
      carregarTabela('setores');
      atualizarSelects();
    }

    function salvarEdicaoTurno() {
      const id = document.getElementById('edit_turno_id').value;
      const nome = document.getElementById('edit_turno_nome').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome do turno', 'error');
        return;
      }

      db.run('UPDATE turnos SET nome = ? WHERE id = ?', [nome, id]);
      mostrarMensagem('Turno atualizado com sucesso!', 'success');
      fecharModal('modalEditarTurno');
      carregarTabela('turnos');
      atualizarSelects();
    }

    function salvarEdicaoHorario() {
      const id = document.getElementById('edit_horario_id').value;
      const descricao = document.getElementById('edit_horario_descricao').value;

      if (!descricao) {
        mostrarMensagem('Preencha a descrição', 'error');
        return;
      }

      db.run('UPDATE horarios SET descricao = ? WHERE id = ?', [descricao, id]);
      mostrarMensagem('Horário atualizado com sucesso!', 'success');
      fecharModal('modalEditarHorario');
      carregarTabela('horarios');
      atualizarSelects();
    }

    function salvarEdicaoGuarda() {
      const id = document.getElementById('edit_guarda_id').value;
      const nome = document.getElementById('edit_guarda_nome').value;
      const telefone = document.getElementById('edit_guarda_telefone').value;
      const divisaoId = document.getElementById('edit_guarda_divisao_id').value;
      const posicaoId = document.getElementById('edit_guarda_posicao_id').value;
      const setorId = document.getElementById('edit_guarda_setor_id').value;
      const horarioId = document.getElementById('edit_guarda_horario_id').value;
      const turnoId = document.getElementById('edit_guarda_turno_id').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome do guarda', 'error');
        return;
      }

      // Validar e formatar telefone
      let telefoneFormatado = telefone;
      if (telefone && telefone.length === 15) {
        telefoneFormatado = telefone;
      }

      db.run('UPDATE guardas SET nome = ?, telefone = ?, divisao_id = ?, posicao_id = ?, setor_id = ?, horario_id = ?, turno_id = ? WHERE id = ?',
        [nome, telefoneFormatado, divisaoId || null, posicaoId || null, setorId || null, horarioId || null, turnoId || null, id]);

      mostrarMensagem('Guarda atualizado com sucesso!', 'success');
      fecharModal('modalEditarGuarda');
      carregarTabela('guardas');
      atualizarSelects();
    }

    function salvarEdicaoEquipe() {
      const id = document.getElementById('edit_equipe_id').value;
      const nome = document.getElementById('edit_equipe_nome').value;

      if (!nome) {
        mostrarMensagem('Preencha o nome da equipe', 'error');
        return;
      }

      // Verificar membros
      const guardasSelecionados = [];
      for (let i = 0; i < 4; i++) {
        const guardaSelect = document.getElementById(`edit_membro_guarda_${i}`);
        const turnoSelect = document.getElementById(`edit_membro_turno_${i}`);

        if (guardaSelect && guardaSelect.value) {
          if (guardasSelecionados.includes(guardaSelect.value)) {
            mostrarMensagem('Não pode selecionar o mesmo guarda mais de uma vez', 'error');
            return;
          }
          guardasSelecionados.push(guardaSelect.value);

          if (!turnoSelect || !turnoSelect.value) {
            mostrarMensagem(`Selecione o turno para o membro ${i + 1}`, 'error');
            return;
          }
        }
      }

      if (guardasSelecionados.length !== 4) {
        mostrarMensagem('Selecione exatamente 4 guardas', 'error');
        return;
      }

      db.run('UPDATE equipes SET nome = ? WHERE id = ?', [nome, id]);
      
      // Remover associações antigas
      const membrosAntigos = db.exec('SELECT guarda_id FROM equipe_membros WHERE equipe_id = ?', [id]);
      if (membrosAntigos.length > 0) {
        membrosAntigos[0].values.forEach(membro => {
          db.run('UPDATE guardas SET equipe_id = NULL WHERE id = ?', [membro[0]]);
        });
      }
      
      db.run('DELETE FROM equipe_membros WHERE equipe_id = ?', [id]);

      for (let i = 0; i < 4; i++) {
        const guardaSelect = document.getElementById(`edit_membro_guarda_${i}`);
        const turnoSelect = document.getElementById(`edit_membro_turno_${i}`);

        if (guardaSelect.value && turnoSelect.value) {
          db.run('INSERT INTO equipe_membros (equipe_id, guarda_id, turno_id) VALUES (?, ?, ?)',
            [id, guardaSelect.value, turnoSelect.value]);
          
          // Atualizar equipe_id do guarda
          db.run('UPDATE guardas SET equipe_id = ? WHERE id = ?', [id, guardaSelect.value]);
        }
      }

      mostrarMensagem('Equipe atualizada com sucesso!', 'success');
      fecharModal('modalEditarEquipe');
      carregarTabela('equipes');
      atualizarSelects();
    }

    function salvarEdicaoRP() {
      const id = document.getElementById('edit_rp_id').value;
      const numero = document.getElementById('edit_rp_numero').value;
      const zona = document.getElementById('edit_rp_zona').value;
      const turnoId = document.getElementById('edit_rp_turno_id').value;
      const apoioId = document.getElementById('edit_rp_apoio_id').value || null;
      const motoristaId = document.getElementById('edit_rp_motorista_id').value || null;
      const encarregadoId = document.getElementById('edit_rp_encarregado_id').value || null;

      if (!numero || !zona || !turnoId) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      // Remover associações antigas
      const rpAntiga = db.exec('SELECT apoio_id, motorista_id, encarregado_id FROM radio_patrulha WHERE id = ?', [id]);
      if (rpAntiga.length > 0) {
        const rpData = rpAntiga[0].values[0];
        if (rpData[0]) db.run('UPDATE guardas SET rp_id = NULL WHERE id = ?', [rpData[0]]);
        if (rpData[1]) db.run('UPDATE guardas SET rp_id = NULL WHERE id = ?', [rpData[1]]);
        if (rpData[2]) db.run('UPDATE guardas SET rp_id = NULL WHERE id = ?', [rpData[2]]);
      }

      db.run('UPDATE radio_patrulha SET numero = ?, zona = ?, turno_id = ?, apoio_id = ?, motorista_id = ?, encarregado_id = ? WHERE id = ?',
        [numero, zona, turnoId, apoioId, motoristaId, encarregadoId, id]);

      // Atualizar novas associações
      if (apoioId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [id, apoioId]);
      if (motoristaId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [id, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET rp_id = ? WHERE id = ?', [id, encarregadoId]);

      mostrarMensagem('Rádio Patrulha atualizada com sucesso!', 'success');
      fecharModal('modalEditarRP');
      carregarTabela('radio_patrulha');
      atualizarSelects();
    }

    function salvarEdicaoRural() {
      const id = document.getElementById('edit_rural_id').value;
      const viatura = document.getElementById('edit_rural_viatura').value;
      const motoristaId = document.getElementById('edit_rural_motorista_id').value || null;
      const encarregadoId = document.getElementById('edit_rural_encarregado_id').value || null;

      if (!viatura) {
        mostrarMensagem('Preencha a identificação da viatura', 'error');
        return;
      }

      // Remover associações antigas
      const ruralAntiga = db.exec('SELECT motorista_id, encarregado_id FROM divisao_rural WHERE id = ?', [id]);
      if (ruralAntiga.length > 0) {
        const ruralData = ruralAntiga[0].values[0];
        if (ruralData[0]) db.run('UPDATE guardas SET rural_id = NULL WHERE id = ?', [ruralData[0]]);
        if (ruralData[1]) db.run('UPDATE guardas SET rural_id = NULL WHERE id = ?', [ruralData[1]]);
      }

      db.run('UPDATE divisao_rural SET viatura = ?, motorista_id = ?, encarregado_id = ? WHERE id = ?',
        [viatura, motoristaId, encarregadoId, id]);

      // Atualizar novas associações
      if (motoristaId) db.run('UPDATE guardas SET rural_id = ? WHERE id = ?', [id, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET rural_id = ? WHERE id = ?', [id, encarregadoId]);

      mostrarMensagem('Divisão Rural atualizada com sucesso!', 'success');
      fecharModal('modalEditarRural');
      carregarTabela('divisao_rural');
    }

    function salvarEdicaoROMU() {
      const id = document.getElementById('edit_romu_id').value;
      const motoristaId = document.getElementById('edit_romu_motorista_id').value;
      const encarregadoId = document.getElementById('edit_romu_encarregado_id').value;
      const terceiroId = document.getElementById('edit_romu_terceiro_id').value || null;
      const turnoId = document.getElementById('edit_romu_turno_id').value;
      const dias = document.getElementById('edit_romu_dias').value;

      if (!motoristaId || !encarregadoId || !turnoId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      // Remover associações antigas
      const romuAntigo = db.exec('SELECT motorista_id, encarregado_id, terceiro_id FROM romu WHERE id = ?', [id]);
      if (romuAntigo.length > 0) {
        const romuData = romuAntigo[0].values[0];
        if (romuData[0]) db.run('UPDATE guardas SET romu_id = NULL WHERE id = ?', [romuData[0]]);
        if (romuData[1]) db.run('UPDATE guardas SET romu_id = NULL WHERE id = ?', [romuData[1]]);
        if (romuData[2]) db.run('UPDATE guardas SET romu_id = NULL WHERE id = ?', [romuData[2]]);
      }

      db.run('UPDATE romu SET motorista_id = ?, encarregado_id = ?, terceiro_id = ?, turno_id = ?, dias = ? WHERE id = ?',
        [motoristaId, encarregadoId, terceiroId, turnoId, dias, id]);

      // Atualizar novas associações
      if (motoristaId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [id, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [id, encarregadoId]);
      if (terceiroId) db.run('UPDATE guardas SET romu_id = ? WHERE id = ?', [id, terceiroId]);

      mostrarMensagem('ROMU atualizado com sucesso!', 'success');
      fecharModal('modalEditarROMU');
      carregarTabela('romu');
    }

    function salvarEdicaoRonda() {
      const id = document.getElementById('edit_ronda_id').value;
      const motoristaId = document.getElementById('edit_ronda_motorista_id').value;
      const encarregadoId = document.getElementById('edit_ronda_encarregado_id').value;
      const turnoId = document.getElementById('edit_ronda_turno_id').value;
      const dias = document.getElementById('edit_ronda_dias').value;

      if (!motoristaId || !encarregadoId || !turnoId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      // Remover associações antigas
      const rondaAntiga = db.exec('SELECT motorista_id, encarregado_id FROM ronda_comercio WHERE id = ?', [id]);
      if (rondaAntiga.length > 0) {
        const rondaData = rondaAntiga[0].values[0];
        if (rondaData[0]) db.run('UPDATE guardas SET ronda_id = NULL WHERE id = ?', [rondaData[0]]);
        if (rondaData[1]) db.run('UPDATE guardas SET ronda_id = NULL WHERE id = ?', [rondaData[1]]);
      }

      db.run('UPDATE ronda_comercio SET motorista_id = ?, encarregado_id = ?, turno_id = ?, dias = ? WHERE id = ?',
        [motoristaId, encarregadoId, turnoId, dias, id]);

      // Atualizar novas associações
      if (motoristaId) db.run('UPDATE guardas SET ronda_id = ? WHERE id = ?', [id, motoristaId]);
      if (encarregadoId) db.run('UPDATE guardas SET ronda_id = ? WHERE id = ?', [id, encarregadoId]);

      mostrarMensagem('Ronda Comércio atualizada com sucesso!', 'success');
      fecharModal('modalEditarRonda');
      carregarTabela('ronda_comercio');
    }

    function salvarEdicaoPatrulhaAnjos() {
      const id = document.getElementById('edit_anjos_id').value;
      const turnoId = document.getElementById('edit_anjos_turno_id').value;
      const horarioId = document.getElementById('edit_anjos_horario_id').value;
      const dias = document.getElementById('edit_anjos_dias').value;
      const integrante1Id = document.getElementById('edit_anjos_integrante1_id').value || null;
      const integrante2Id = document.getElementById('edit_anjos_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      const anjosAntigo = db.exec('SELECT integrante1_id, integrante2_id FROM patrulha_anjos WHERE id = ?', [id]);
      if (anjosAntigo.length > 0) {
        const anjosData = anjosAntigo[0].values[0];
        if (anjosData[0]) db.run('UPDATE guardas SET patrulha_anjos_id = NULL WHERE id = ?', [anjosData[0]]);
        if (anjosData[1]) db.run('UPDATE guardas SET patrulha_anjos_id = NULL WHERE id = ?', [anjosData[1]]);
      }

      db.run('UPDATE patrulha_anjos SET turno_id = ?, horario_id = ?, dias = ?, integrante1_id = ?, integrante2_id = ? WHERE id = ?',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id, id]);

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_anjos_id = ? WHERE id = ?', [id, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_anjos_id = ? WHERE id = ?', [id, integrante2Id]);

      mostrarMensagem('Patrulha Anjos da Guarda atualizada com sucesso!', 'success');
      fecharModal('modalEditarPatrulhaAnjos');
      carregarTabela('patrulha_anjos');
    }

    function salvarEdicaoPatrulhaVulnerabilidade() {
      const id = document.getElementById('edit_vulnerabilidade_id').value;
      const turnoId = document.getElementById('edit_vulnerabilidade_turno_id').value;
      const horarioId = document.getElementById('edit_vulnerabilidade_horario_id').value;
      const dias = document.getElementById('edit_vulnerabilidade_dias').value;
      const integrante1Id = document.getElementById('edit_vulnerabilidade_integrante1_id').value || null;
      const integrante2Id = document.getElementById('edit_vulnerabilidade_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      const vulnerabilidadeAntiga = db.exec('SELECT integrante1_id, integrante2_id FROM patrulha_vulnerabilidade WHERE id = ?', [id]);
      if (vulnerabilidadeAntiga.length > 0) {
        const vulnerabilidadeData = vulnerabilidadeAntiga[0].values[0];
        if (vulnerabilidadeData[0]) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = NULL WHERE id = ?', [vulnerabilidadeData[0]]);
        if (vulnerabilidadeData[1]) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = NULL WHERE id = ?', [vulnerabilidadeData[1]]);
      }

      db.run('UPDATE patrulha_vulnerabilidade SET turno_id = ?, horario_id = ?, dias = ?, integrante1_id = ?, integrante2_id = ? WHERE id = ?',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id, id]);

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = ? WHERE id = ?', [id, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_vulnerabilidade_id = ? WHERE id = ?', [id, integrante2Id]);

      mostrarMensagem('Patrulha Vulnerabilidade Social atualizada com sucesso!', 'success');
      fecharModal('modalEditarPatrulhaVulnerabilidade');
      carregarTabela('patrulha_vulnerabilidade');
    }

    function salvarEdicaoPatrulhaMaria() {
      const id = document.getElementById('edit_maria_id').value;
      const turnoId = document.getElementById('edit_maria_turno_id').value;
      const horarioId = document.getElementById('edit_maria_horario_id').value;
      const dias = document.getElementById('edit_maria_dias').value;
      const integrante1Id = document.getElementById('edit_maria_integrante1_id').value || null;
      const integrante2Id = document.getElementById('edit_maria_integrante2_id').value || null;

      if (!turnoId || !horarioId || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (!integrante1Id && !integrante2Id) {
        mostrarMensagem('Selecione pelo menos um integrante', 'error');
        return;
      }

      if (integrante1Id && integrante2Id && integrante1Id === integrante2Id) {
        mostrarMensagem('Não pode selecionar o mesmo guarda duas vezes', 'error');
        return;
      }

      const mariaAntiga = db.exec('SELECT integrante1_id, integrante2_id FROM patrulha_maria WHERE id = ?', [id]);
      if (mariaAntiga.length > 0) {
        const mariaData = mariaAntiga[0].values[0];
        if (mariaData[0]) db.run('UPDATE guardas SET patrulha_maria_id = NULL WHERE id = ?', [mariaData[0]]);
        if (mariaData[1]) db.run('UPDATE guardas SET patrulha_maria_id = NULL WHERE id = ?', [mariaData[1]]);
      }

      db.run('UPDATE patrulha_maria SET turno_id = ?, horario_id = ?, dias = ?, integrante1_id = ?, integrante2_id = ? WHERE id = ?',
        [turnoId, horarioId, dias, integrante1Id, integrante2Id, id]);

      if (integrante1Id) db.run('UPDATE guardas SET patrulha_maria_id = ? WHERE id = ?', [id, integrante1Id]);
      if (integrante2Id) db.run('UPDATE guardas SET patrulha_maria_id = ? WHERE id = ?', [id, integrante2Id]);

      mostrarMensagem('Patrulha Maria da Penha atualizada com sucesso!', 'success');
      fecharModal('modalEditarPatrulhaMaria');
      carregarTabela('patrulha_maria');
    }

    function salvarEdicaoCOI() {
      const id = document.getElementById('edit_coi_id').value;
      const turnoId = document.getElementById('edit_coi_turno_id').value;
      const horarioId = document.getElementById('edit_coi_horario_id').value;
      const dias = document.getElementById('edit_coi_dias').value;
      const checkboxes = document.querySelectorAll('#edit_coi_guardas_container input:checked');

      if (!turnoId || !horarioId || !dias || checkboxes.length === 0) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('UPDATE coi SET turno_id = ?, horario_id = ?, dias = ? WHERE id = ?',
        [turnoId, horarioId, dias, id]);

      // Remover associações antigas
      const guardasAntigos = db.exec('SELECT guarda_id FROM coi_guardas WHERE coi_id = ?', [id]);
      if (guardasAntigos.length > 0) {
        guardasAntigos[0].values.forEach(guarda => {
          db.run('UPDATE guardas SET coi_id = NULL WHERE id = ?', [guarda[0]]);
        });
      }

      db.run('DELETE FROM coi_guardas WHERE coi_id = ?', [id]);

      checkboxes.forEach(cb => {
        db.run('INSERT INTO coi_guardas (coi_id, guarda_id) VALUES (?, ?)', [id, cb.value]);
        db.run('UPDATE guardas SET coi_id = ? WHERE id = ?', [id, cb.value]);
      });

      mostrarMensagem('COI atualizado com sucesso!', 'success');
      fecharModal('modalEditarCOI');
      carregarTabela('coi');
    }

    function salvarEdicaoEscala() {
      const id = document.getElementById('edit_escala_id').value;
      const guardaId = document.getElementById('edit_escala_guarda_id').value;
      const turnoId = document.getElementById('edit_escala_turno_id').value || null;
      const mes = document.getElementById('edit_escala_mes').value;
      const ano = document.getElementById('edit_escala_ano').value;
      const dias = document.getElementById('edit_escala_dias').value;

      if (!guardaId || !mes || !ano || !dias) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('UPDATE escalas SET guarda_id = ?, turno_id = ?, mes = ?, ano = ?, dias = ? WHERE id = ?',
        [guardaId, turnoId, mes, ano, dias, id]);

      mostrarMensagem('Escala atualizada com sucesso!', 'success');
      fecharModal('modalEditarEscala');
      carregarTabela('escalas');
      carregarHistorico();
    }

    function salvarEdicaoFerias() {
      const id = document.getElementById('edit_ferias_id').value;
      const guardaId = document.getElementById('edit_ferias_guarda_id').value;
      const inicio = document.getElementById('edit_ferias_inicio').value;
      const fim = document.getElementById('edit_ferias_fim').value;

      if (!guardaId || !inicio || !fim) {
        mostrarMensagem('Preencha todos os campos', 'error');
        return;
      }

      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);
      const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24)) + 1;

      if (dias !== 15 && dias !== 30) {
        mostrarMensagem('As férias devem ter 15 ou 30 dias', 'error');
        return;
      }

      db.run('UPDATE ferias SET guarda_id = ?, data_inicio = ?, data_fim = ? WHERE id = ?',
        [guardaId, inicio, fim, id]);

      mostrarMensagem('Férias atualizadas com sucesso!', 'success');
      fecharModal('modalEditarFerias');
      carregarTabela('ferias');
    }

    function salvarEdicaoAusencia() {
      const id = document.getElementById('edit_ausencia_id').value;
      const guardaId = document.getElementById('edit_ausencia_guarda_id').value;
      const data = document.getElementById('edit_ausencia_data').value;
      const motivo = document.getElementById('edit_ausencia_motivo').value;
      const obs = document.getElementById('edit_ausencia_obs').value;

      if (!guardaId || !data || !motivo) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      db.run('UPDATE ausencias SET guarda_id = ?, data = ?, motivo = ?, observacoes = ? WHERE id = ?',
        [guardaId, data, motivo, obs, id]);

      mostrarMensagem('Ausência atualizada com sucesso!', 'success');
      fecharModal('modalEditarAusencia');
      carregarTabela('ausencias');
    }

    function carregarTodasTabelas() {
      const tabelas = ['divisoes', 'posicoes', 'setores', 'turnos', 'horarios', 'guardas', 'equipes',
        'radio_patrulha', 'divisao_rural', 'romu', 'ronda_comercio', 'patrulha_anjos',
        'patrulha_vulnerabilidade', 'patrulha_maria', 'coi', 'escalas', 'ferias', 'ausencias'];
      tabelas.forEach(t => carregarTabela(t));
      carregarHistorico();
    }

    // GERAR RELATÓRIOS PDF
    function gerarPDFQuinzenal() {
      const periodo = document.getElementById('rel_periodo').value;
      const mes = document.getElementById('rel_mes').value;
      const ano = document.getElementById('rel_ano').value;

      if (periodo === 'mensal') {
        mostrarMensagem('Selecione uma quinzena específica', 'error');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      doc.setFontSize(18);
      doc.text(`Escala ${periodo === '1' ? '1ª' : '2ª'} Quinzena - ${meses[mes]}/${ano}`, 14, 20);

      // Determinar dias da quinzena
      const diasNoMes = new Date(ano, mes, 0).getDate();
      const inicio = periodo === '1' ? 1 : 16;
      const fim = periodo === '1' ? 15 : diasNoMes;

      const query = `
        SELECT g.nome, 
               COALESCE(t.nome, '-') as turno,
               e.dias
        FROM escalas e
        JOIN guardas g ON e.guarda_id = g.id
        LEFT JOIN turnos t ON e.turno_id = t.id
        WHERE e.mes = ? AND e.ano = ?
        AND (
          SELECT COUNT(*) FROM (
            SELECT value FROM json_each('[' || replace(e.dias, ',', ',') || ']')
          ) WHERE value BETWEEN ${inicio} AND ${fim}
        ) > 0
        ORDER BY g.nome
      `;

      const result = db.exec(query, [mes, ano]);

      if (result.length === 0) {
        mostrarMensagem('Nenhuma escala encontrada para este período', 'error');
        return;
      }

      const tableData = result[0].values.map(row => {
        const diasEscala = row[2].split(',').map(d => parseInt(d));
        const diasQuinzena = diasEscala.filter(d => d >= inicio && d <= fim);
        return [row[0], row[1], diasQuinzena.join(', ')];
      });

      doc.autoTable({
        head: [['Guarda', 'Turno', `Dias ${periodo === '1' ? '1-15' : '16-' + fim}`]],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [30, 60, 114] }
      });

      doc.save(`Escala_${periodo === '1' ? '1Q' : '2Q'}_${meses[mes]}_${ano}.pdf`);
      mostrarMensagem('PDF gerado com sucesso!', 'success');
    }

    function gerarPDFMensal() {
      const mes = document.getElementById('rel_mes').value;
      const ano = document.getElementById('rel_ano').value;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      doc.setFontSize(18);
      doc.text(`Escala Mensal - ${meses[mes]}/${ano}`, 14, 20);

      const query = `
        SELECT g.nome, 
               COALESCE(t.nome, '-') as turno,
               e.dias 
        FROM escalas e
        JOIN guardas g ON e.guarda_id = g.id
        LEFT JOIN turnos t ON e.turno_id = t.id
        WHERE e.mes = ? AND e.ano = ?
        ORDER BY g.nome
      `;

      const result = db.exec(query, [mes, ano]);

      if (result.length === 0) {
        mostrarMensagem('Nenhuma escala encontrada para este mês', 'error');
        return;
      }

      const tableData = result[0].values.map(row => [row[0], row[1], row[2]]);

      doc.autoTable({
        head: [['Guarda', 'Turno', 'Dias']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [30, 60, 114] }
      });

      doc.save(`Escala_Mensal_${meses[mes]}_${ano}.pdf`);
      mostrarMensagem('PDF mensal gerado com sucesso!', 'success');
    }

    function gerarPDFGuardas() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Relatório de Guardas Cadastrados', 14, 20);

      const query = `
        SELECT g.nome, g.telefone,
               COALESCE(d.nome, '-') as divisao,
               COALESCE(p.nome, '-') as posicao,
               COALESCE(s.nome, '-') as setor,
               COALESCE(t.nome, '-') as turno
        FROM guardas g
        LEFT JOIN divisoes d ON g.divisao_id = d.id
        LEFT JOIN posicoes p ON g.posicao_id = p.id
        LEFT JOIN setores s ON g.setor_id = s.id
        LEFT JOIN turnos t ON g.turno_id = t.id
        ORDER BY g.nome
      `;

      const result = db.exec(query);

      if (result.length === 0) {
        mostrarMensagem('Nenhum guarda cadastrado', 'error');
        return;
      }

      const tableData = result[0].values.map(row => [row[0], row[1] || '-', row[2], row[3], row[4], row[5]]);

      doc.autoTable({
        head: [['Nome', 'Telefone', 'Divisão', 'Posição', 'Setor', 'Turno']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [30, 60, 114] }
      });

      doc.save('Relatorio_Guardas.pdf');
      mostrarMensagem('Relatório de guardas gerado com sucesso!', 'success');
    }

    function gerarPDFFaltas() {
      const mes = document.getElementById('rel_mes').value;
      const ano = document.getElementById('rel_ano').value;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      doc.setFontSize(18);
      doc.text(`Relatório de Ausências - ${meses[mes]}/${ano}`, 14, 20);

      const query = `
        SELECT g.nome, a.data, a.motivo, a.observacoes
        FROM ausencias a
        JOIN guardas g ON a.guarda_id = g.id
        WHERE strftime('%m', a.data) = ? AND strftime('%Y', a.data) = ?
        ORDER BY a.data DESC
      `;

      const mesFormatado = String(mes).padStart(2, '0');
      const result = db.exec(query, [mesFormatado, ano]);

      if (result.length === 0) {
        mostrarMensagem('Nenhuma ausência registrada neste período', 'error');
        return;
      }

      const tableData = result[0].values.map(row => [row[0], row[1], row[2], row[3] || '-']);

      doc.autoTable({
        head: [['Guarda', 'Data', 'Motivo', 'Observações']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [30, 60, 114] }
      });

      doc.save(`Relatorio_Ausencias_${meses[mes]}_${ano}.pdf`);
      mostrarMensagem('Relatório de faltas gerado com sucesso!', 'success');
    }

    // CARREGAR HISTÓRICO
    function carregarHistorico() {
      const query = `
        SELECT DISTINCT
          e.mes || '/' || e.ano as mes_ano,
          COUNT(DISTINCT e.guarda_id) as total_guardas,
          COUNT(*) as total_escalas
        FROM escalas e
        GROUP BY e.ano, e.mes
        ORDER BY e.ano DESC, e.mes DESC
      `;

      const result = db.exec(query);
      const tabelaEl = document.getElementById('tabela_historico');

      if (!tabelaEl) return;

      if (result.length === 0) {
        tabelaEl.innerHTML = '<tr><td colspan="3">Nenhum histórico encontrado</td></tr>';
        return;
      }

      const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      let html = '<thead><tr><th>Mês/Ano</th><th>Guardas Escalados</th><th>Total Escalas</th></tr></thead><tbody>';

      result[0].values.forEach(row => {
        const [mes, ano] = row[0].split('/');
        const nomeMes = meses[parseInt(mes)];
        html += `<tr><td>${nomeMes}/${ano}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`;
      });

      html += '</tbody>';
      tabelaEl.innerHTML = html;
    }

    // Inicializar ao carregar a página
    window.onload = () => {
      initDB();
      gerarDiasCheckbox();
      alterarTipoEscala(); // Definir tipo inicial
    };
