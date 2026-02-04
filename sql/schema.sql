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
