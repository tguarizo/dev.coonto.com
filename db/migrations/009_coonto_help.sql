BEGIN;
CREATE TABLE IF NOT EXISTS coonto_answers (
 id TEXT PRIMARY KEY,
 mode TEXT NOT NULL CHECK(mode IN ('operational','teacher','student')),
 question TEXT NOT NULL,
 aliases TEXT[] NOT NULL DEFAULT '{}',
 answer TEXT NOT NULL DEFAULT '',
 work_slug TEXT NOT NULL DEFAULT '',
 scene_id TEXT NOT NULL DEFAULT '',
 min_index INTEGER NOT NULL DEFAULT 0 CHECK(min_index BETWEEN 0 AND 47),
 max_index INTEGER NOT NULL DEFAULT 47 CHECK(max_index BETWEEN 0 AND 47 AND max_index >= min_index),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','archived')),
 origin TEXT NOT NULL DEFAULT 'editorial',
 reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 reviewed_at TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_answers_context ON coonto_answers(mode,status,work_slug,scene_id);
CREATE TABLE IF NOT EXISTS coonto_help_usage (
 id TEXT PRIMARY KEY,
 user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 mode TEXT NOT NULL,
 work_slug TEXT NOT NULL DEFAULT '',
 scene_id TEXT NOT NULL DEFAULT '',
 question TEXT NOT NULL,
 answer_id TEXT REFERENCES coonto_answers(id) ON DELETE SET NULL,
 source TEXT NOT NULL,
 model TEXT,
 input_tokens INTEGER NOT NULL DEFAULT 0,
 output_tokens INTEGER NOT NULL DEFAULT 0,
 estimated_usd NUMERIC(12,8) NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_help_usage_user_time ON coonto_help_usage(user_id,created_at);
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-0','operational','O que é o Coonto?',ARRAY['o que e o coonto','o que e o coonto','como funciona o coonto'],'O Coonto é uma plataforma de leitura e aprendizagem. Você entra numa situação da obra, faz uma escolha, descobre pistas e volta ao texto original para conferir sua interpretação. Use no computador, tablet ou celular.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-1','operational','Como instalar no celular?',ARRAY['como instalar no celular','como instalar','instalar coonto'],'No Android, abra o menu do Chrome e procure Instalar aplicativo ou Adicionar à tela inicial. No iPhone, abra no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início. Você também pode usar pelo navegador.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-2','operational','Como ler sem internet?',ARRAY['como ler sem internet','como usar offline','como ler offline'],'Com internet e sua conta aberta, entre em O Alienista e toque em Salvar neste aparelho. Aguarde a confirmação. Depois você pode reabrir Minha biblioteca nesse aparelho sem conexão. O texto original também é salvo. Login e Ajuda Coonto precisam de internet nesta versão.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-3','operational','Onde estão minhas anotações?',ARRAY['onde estao minhas anotacoes','onde vejo minhas notas','como abrir o caderno'],'Durante a experiência, toque em Minhas anotações. Você verá as notas organizadas por cena e poderá editar sem perder seu ponto de leitura.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-4','operational','Como retomar minha leitura?',ARRAY['como retomar minha leitura','como continuar de onde parei'],'Entre na mesma conta e abra O Alienista em Minha biblioteca. Toque em RETOMAR, se a pergunta aparecer. Suas notas e escolhas ficam guardadas. Após usar offline, reabra a leitura com internet para sincronizar.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-5','operational','Onde fica o espaço do professor?',ARRAY['onde fica o espaco do professor','existe versao professor','como acessar professor'],'Abra Professor no menu ou acesse /professor. Entre na sua conta e adicione a obra gratuita quando solicitado. Ali você escolhe cenas, salva marcações e prepara discussões sem alterar sua leitura pessoal.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-6','teacher','Como usar antes da leitura?',ARRAY['como usar antes da leitura','como preparar antes da leitura'],'Escolha uma situação inicial de O Alienista, peça uma hipótese e registre a justificativa da turma. Depois proponha a leitura do capítulo correspondente para procurar evidências. Evite contar os acontecimentos posteriores.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-7','teacher','Como usar durante a leitura?',ARRAY['como usar durante a leitura','como usar durante'],'Retome uma hipótese da turma e compare com uma passagem do capítulo já lido. Pergunte: que detalhe sustenta sua ideia? Há um detalhe que a complica? Use as marcações do espaço do professor para voltar às cenas.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-8','teacher','Como usar depois da leitura?',ARRAY['como usar depois da leitura','como usar apos leitura'],'Peça que cada aluno explique uma interpretação sem rever suas notas. Depois, ele deve localizar no texto uma passagem que a sustente e revisar o que não conseguiu justificar. Observe a qualidade das evidências, sem tratar a escolha do Coonto como única leitura possível.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-9','student','Como justificar minha interpretação?',ARRAY['como justificar minha interpretacao','como procurar evidencias','como justificar'],'Diga primeiro o que você acha que está acontecendo nesta cena. Depois encontre uma palavra, ação ou fala no capítulo indicado que sustente sua ideia. Explique a ligação entre esse detalhe e sua interpretação. Se algo contradisser sua hipótese, registre e reveja.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-10','student','Não entendi a pergunta. Como começar?',ARRAY['nao entendi a pergunta como comecar','nao entendi','estou em duvida'],'Releia a situação e escreva: quem age, o que acontece e qual é a dúvida? Compare as alternativas com esses fatos. Antes de escolher, formule sua própria hipótese. Depois procure evidências no capítulo indicado.','approved','editorial') ON CONFLICT(id) DO NOTHING;
INSERT INTO coonto_answers(id,mode,question,aliases,answer,status,origin) VALUES('seed-v18-11','student','Como usar minhas anotações para lembrar?',ARRAY['como usar minhas anotacoes para lembrar','como lembrar','como usar caderno'],'Anote sua hipótese e uma pista do texto. Depois de um intervalo, tente explicar a cena sem consultar o caderno. Reabra suas notas para verificar o que lembrou e o que precisa revisar.','approved','editorial') ON CONFLICT(id) DO NOTHING;
COMMIT;
