# 🐾 Paraíso das Patas - Controle de Presença & Check-in

Aplicação web **mobile-first** de controle de presença desenvolvida sob medida para creches caninas, com foco em agilidade máxima e operação direta pelo smartphone da equipe.

![Paraíso das Patas](public/pwa-192x192.png)

---

## 🚀 Principais Funcionalidades

- **⚡ Operação em 1 Toque**:
  - **Check-in instantâneo**: Registra a entrada com a hora atual em tempo real.
  - **Check-out inteligente**: Confirmação rápida com cálculo automático do tempo de permanência (*ex: 4h 20m*), tags pré-definidas (*"Comeu tudo"*, *"Medicamento tomado"*, *"Brincou muito"*) e campo para observações diárias.
- **🔍 Busca Instantânea & Filtros**:
  - Filtro por abas: *Todos*, *No Espaço*, *Concluídos* e *Ausentes* (cães que ainda não chegaram).
  - Pesquisa em tempo real por nome do cão ou tutor.
- **💬 Integração com WhatsApp**:
  - Botão de 1 toque no card de cada cão para abrir conversa direta no WhatsApp do tutor com mensagem contextualizada.
- **📊 Histórico com Gráfico dos Últimos 7 Dias (Recharts)**:
  - Gráfico interativo destacando dias de maior pico e movimento semanal.
  - Navegação entre datas e geração de relatório formatado para compartilhar com a equipe.
- **🐕 Cadastro Completo de Cães**:
  - Registro de nome, tutor, telefone formatado, observações fixas (saúde, alergias, restrições) e status ativo/inativo.
- **📱 PWA (Progressive Web App)**:
  - Instalável diretamente na tela inicial do Android e iPhone (com guia passo a passo para iOS Safari).
  - Suporte e indicador automático para modo offline.
- **☁️ Integração com Supabase (Backend em Tempo Real)**:
  - Conexão nativa com `@supabase/supabase-js` e Supabase Realtime para sincronizar múltiplos smartphones simultaneamente.
  - Modo local com persistência e dados de demonstração caso ainda não tenha configurado as chaves.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Backend / Banco de Dados**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📦 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/paraiso-das-patas.git
   cd paraiso-das-patas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   Preencha suas credenciais do Supabase (opcional para testar localmente):
   ```env
   VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
   VITE_SUPABASE_ANON_KEY="sua-chave-anonima"
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` ou `http://localhost:5173` no seu navegador ou celular na mesma rede Wi-Fi.

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

Execute o script abaixo no **SQL Editor** do seu painel Supabase para criar as tabelas com suporte a RLS (Row Level Security):

```sql
-- 1. Criação da tabela "dogs"
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tutor_nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criação da tabela "checkins"
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME NOT NULL DEFAULT CURRENT_TIME,
  hora_saida TIME,
  observacao_dia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_checkins_data ON public.checkins(data);
CREATE INDEX IF NOT EXISTS idx_checkins_dog_id ON public.checkins(dog_id);
CREATE INDEX IF NOT EXISTS idx_dogs_ativo ON public.dogs(ativo);
CREATE INDEX IF NOT EXISTS idx_dogs_nome ON public.dogs(nome);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso livre via anon_key (uso operacional interno)
CREATE POLICY "Permitir leitura total para anon" ON public.dogs FOR SELECT USING (true);
CREATE POLICY "Permitir inserção total para anon" ON public.dogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização total para anon" ON public.dogs FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão total para anon" ON public.dogs FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de checkins" ON public.checkins FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de checkins" ON public.checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de checkins" ON public.checkins FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de checkins" ON public.checkins FOR DELETE USING (true);

-- 6. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dogs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;
```

---

## 🎨 Paleta de Cores

- **Azul Noturno / Navy**: `#142e53`
- **Amarelo Solar / Highlight**: `#fffe42`
- **Branco Puro**: `#ffffff`

---

## 📄 Licença

Distribuído sob a licença Apache-2.0.
