import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Esta rota cria usuários de demonstração no Supabase
// Acesse: /api/seed-demo para popular o banco com usuários demo

const DEMO_USERS = [
    { name: 'Cliente Demo', email: 'cliente.demo@teste.com', role: 'CLIENT', city: 'Maceió', state: 'AL' },
    { name: 'Admin Demo', email: 'admin.demo@teste.com', role: 'ADMIN', city: 'Maceió', state: 'AL' },
    { name: 'Maria Silva Santos', email: 'maria.silva@teste.com', role: 'PROVIDER', city: 'Maceió', state: 'AL', neighborhood: 'Pajuçara' },
    { name: 'Ana Paula Oliveira', email: 'ana.oliveira@teste.com', role: 'PROVIDER', city: 'Maceió', state: 'AL', neighborhood: 'Ponta Verde' },
    { name: 'Juliana Costa Ferreira', email: 'juliana.costa@teste.com', role: 'PROVIDER', city: 'Arapiraca', state: 'AL', neighborhood: 'Centro' },
    { name: 'Fernanda Lima Souza', email: 'fernanda.lima@teste.com', role: 'PROVIDER', city: 'Maceió', state: 'AL', neighborhood: 'Jatiúca' },
    { name: 'Camila Rocha Almeida', email: 'camila.rocha@teste.com', role: 'PROVIDER', city: 'Rio Largo', state: 'AL', neighborhood: 'Centro' },
    { name: 'Beatriz Martins Pereira', email: 'beatriz.martins@teste.com', role: 'PROVIDER', city: 'Palmeira dos Índios', state: 'AL', neighborhood: 'Centro' },
    { name: 'Larissa Nascimento Dias', email: 'larissa.nascimento@teste.com', role: 'PROVIDER', city: 'Maceió', state: 'AL', neighborhood: 'Farol' },
    { name: 'Patricia Gomes Ribeiro', email: 'patricia.gomes@teste.com', role: 'PROVIDER', city: 'Penedo', state: 'AL', neighborhood: 'Centro' },
    { name: 'Amanda Carvalho Lima', email: 'amanda.carvalho@teste.com', role: 'PROVIDER', city: 'Maceió', state: 'AL', neighborhood: 'Cruz das Almas' },
    { name: 'Gabriela Mendes Costa', email: 'gabriela.mendes@teste.com', role: 'PROVIDER', city: 'Marechal Deodoro', state: 'AL', neighborhood: 'Centro' },
];

const DEFAULT_PASSWORD = 'Teste123!';

export async function GET(request: NextRequest) {
    // Usar nextUrl para maior compatibilidade no Next.js
    const secret = request.nextUrl.searchParams.get('secret');

    // Apenas permitir com chave secreta para segurança (com trim para evitar espaços)
    if (secret?.trim() !== 'mw-seed-2024') {
        return NextResponse.json(
            {
                error: 'Acesso não autorizado',
                hint: 'Certifique-se de que a URL termina exatamente com ?secret=mw-seed-2024'
            },
            { status: 401 }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
            { error: 'Configurações do Supabase não encontradas' },
            { status: 500 }
        );
    }

    // Usar service role key para criar usuários
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of DEMO_USERS) {
        try {
            // 1. Criar usuário no Auth
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: user.email,
                password: DEFAULT_PASSWORD,
                email_confirm: true, // Confirmar email automaticamente
                user_metadata: {
                    full_name: user.name,
                    role: user.role
                }
            });

            if (authError) {
                // Se usuário já existe, tentar atualizar
                if (authError.message.includes('already') || authError.message.includes('exists')) {
                    results.push({ email: user.email, status: 'já existe' });
                    continue;
                }
                results.push({ email: user.email, status: 'erro', error: authError.message });
                continue;
            }

            // 2. Criar perfil na tabela profiles
            if (authData.user) {
                const profileData: Record<string, unknown> = {
                    id: authData.user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: `+5582${Math.floor(900000000 + Math.random() * 99999999)}`,
                    city: user.city,
                    state: user.state,
                    created_at: new Date().toISOString()
                };

                // Dados adicionais para provedoras
                if (user.role === 'PROVIDER') {
                    profileData.neighborhood = user.neighborhood;
                    profileData.address = `${user.neighborhood}, ${user.city} - ${user.state}`;
                    profileData.bio = `Profissional de limpeza experiente em ${user.city}, Alagoas. Atendo toda a região com dedicação, pontualidade e qualidade.`;
                    profileData.hourly_rate = 12 + Math.floor(Math.random() * 10);
                    profileData.service_radius = 150;
                    profileData.rating = Number((4 + Math.random()).toFixed(1));
                    profileData.review_count = Math.floor(Math.random() * 50) + 10;
                    profileData.verified = true;
                    profileData.available = true;
                }

                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .upsert(profileData);

                if (profileError) {
                    results.push({ email: user.email, status: 'usuário criado, perfil falhou', error: profileError.message });
                    continue;
                }
            }

            results.push({ email: user.email, status: 'criado com sucesso' });

        } catch (error) {
            results.push({
                email: user.email,
                status: 'erro',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    return NextResponse.json({
        message: 'Seed de usuários demo concluído',
        senha_padrao: DEFAULT_PASSWORD,
        resultados: results
    });
}
