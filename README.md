# Plataforma de Documentos Multicanal

Sistema interno para centralização, organização e gerenciamento da documentação da Multicanal.

## Sobre o projeto

A Plataforma de Documentos Multicanal é uma solução interna desenvolvida para centralizar toda a documentação da empresa, facilitando o acesso, busca e manutenção de procedimentos operacionais, manuais técnicos e outros documentos importantes.

### Principais funcionalidades

- Organização por departamentos
- Busca avançada em títulos e conteúdo 
- Histórico de documentos visualizados recentemente
- Sistema de feedback para documentos
- Controle de acesso baseado em perfis
- Interface responsiva e amigável

## Tecnologias utilizadas

- **Frontend**: Next.js 14 com TypeScript e App Router
- **UI/Componentes**: Tailwind CSS, Shadcn UI, Lucide React
- **Backend**: NextJS Server Components, Server Actions
- **Banco de dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Editor de conteúdo**: Editor WYSIWYG

## Estrutura do projeto

O projeto segue a estrutura de pastas do Next.js com App Router:

```
src/
├── app/                     # Rotas da aplicação
│   ├── documents/           # Área de documentos
│   ├── api/                 # Endpoints da API
│   └── ...                  # Outras rotas
├── components/              # Componentes reutilizáveis
├── hooks/                   # Custom hooks
├── lib/                     # Bibliotecas e configurações
├── supabase/                # Cliente e configurações do Supabase
├── types/                   # Definições de tipos TypeScript
└── utils/                   # Funções utilitárias
```

## Instalação e uso

1. Clone o repositório
   ```bash
   git clone https://github.com/FilippeFariaFrasao/Plataforma-de-Documentos---Multicanal.git
   ```
2. Instale as dependências
   ```bash
   npm install
   ```
3. Acesso o arquivo `DEPENDENCIES.md` para instalar os pacotes restantes
   
5. Configure as variáveis de ambiente (veja o arquivo `.env.example`)
   
7. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```
8. Acesse `http://localhost:3000`

## Licença

Este projeto é proprietário e de uso exclusivo da Multicanal.
