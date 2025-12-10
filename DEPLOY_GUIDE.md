# MotherWorks - Guia de Deploy Vercel

## Pré-requisitos

- ✅ Conta GitHub (grátis)
- ✅ Conta Vercel (grátis): [vercel.com](https://vercel.com)
- ✅ Projeto Supabase configurado

---

## Passo 1: Subir código para GitHub

```bash
# No terminal, dentro da pasta motherworks
cd c:\Users\Duster\Documents\CODIGOS\NOVOS TESTES\motherworks

# Iniciar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit - MotherWorks platform"

# Criar repositório no GitHub e conectar
# Vá em github.com/new e crie um repo chamado "motherworks"
# Depois execute:
git remote add origin https://github.com/SEU_USUARIO/motherworks.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Conectar Vercel ao GitHub

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Conecte sua conta GitHub
4. Selecione o repositório **motherworks**
5. Vercel detectará automaticamente que é Next.js

---

## Passo 3: Configurar Variáveis de Ambiente

Na tela de configuração do projeto na Vercel, adicione as variáveis:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cole a URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cole a anon key do Supabase |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Cole a API key do Google Maps |
| `TWILIO_ACCOUNT_SID` | Cole o Account SID do Twilio |
| `TWILIO_AUTH_TOKEN` | Cole o Auth Token do Twilio |
| `TWILIO_PHONE_NUMBER` | Cole o número do Twilio (ex: +1234567890) |

> ⚠️ **Importante:** Copie os valores exatos do seu `.env.local`

---

## Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde ~2 minutos
3. Vercel irá gerar uma URL como: `motherworks-abc123.vercel.app`

---

## Passo 5: Configurar Supabase para Produção

No Supabase Dashboard:

### 5.1 Adicionar URL de Produção

1. Vá em **Authentication → URL Configuration**
2. Em **Site URL**, coloque: `https://seu-projeto.vercel.app`
3. Em **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app/**`

### 5.2 Verificar tabelas

Execute no SQL Editor:

```sql
-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'CLIENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Criar tabela platform_settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    platform_name TEXT DEFAULT 'MotherWorks',
    tagline TEXT DEFAULT 'Serviços domésticos de confiança',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#14B8A6',
    secondary_color TEXT DEFAULT '#8B5CF6',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração inicial
INSERT INTO platform_settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;
```

---

## Passo 6: Testar

1. Acesse: `https://seu-projeto.vercel.app`
2. Teste o cadastro com seu email
3. Verifique o email de confirmação
4. Faça login

---

## Problemas Comuns

### "Email not confirmed"
- Verifique sua caixa de entrada e spam
- No Supabase: Auth → Users → Confirme manualmente

### SMS não funciona
- Conta Twilio trial só envia para números verificados
- Vá em console.twilio.com → Verified Caller IDs

### Google Maps não aparece
- Verifique se a API Key está configurada na Vercel
- Verifique restrições de domínio no Google Cloud Console

---

## Domínio Personalizado (Opcional)

1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio (ex: `motherworks.com.br`)
3. Configure os DNS conforme instruções
4. Atualize o Site URL no Supabase

---

## Custos (Plano Gratuito)

| Serviço | Limite Gratuito |
|---------|-----------------|
| **Vercel** | 100GB bandwidth/mês, builds ilimitados |
| **Supabase** | 500MB database, 50k auth users |
| **Twilio** | $15.50 créditos iniciais |
| **Google Maps** | $200/mês créditos |

✅ **Suficiente para MVP e testes!**
