# Dependências Instaladas Manualmente

Este documento lista os pacotes que precisaram ser instalados manualmente no projeto, que não foram incluídos no `package.json` original ou não foram instalados automaticamente com o comando `npm install`.

## Pacotes Principais

| Pacote | Versão | Descrição | Comando de Instalação |
|--------|--------|-----------|------------------------|
| `@supabase/ssr` | ^0.6.1 | Cliente Supabase para Server-Side Rendering | `npm install @supabase/ssr` |
| `@radix-ui/react-accordion` | ^1.1.2 | Componente Accordion da biblioteca Radix UI | `npm install @radix-ui/react-accordion` |
| `@radix-ui/react-icons` | ^1.3.0 | Biblioteca de ícones da Radix UI | `npm install @radix-ui/react-icons` |
| `lodash` | ^4.17.21 | Biblioteca de utilidades JavaScript | `npm install lodash` |
| `tempo-devtools` | * | Ferramenta de desenvolvimento tempo (comentada no código) | `npm install tempo-devtools` |

## Pacotes de Desenvolvimento

| Pacote | Versão | Descrição | Comando de Instalação |
|--------|--------|-----------|------------------------|
| `@types/lodash` | ^4.14.202 | Definições de tipos TypeScript para Lodash | `npm install --save-dev @types/lodash` |

## Configurações de Ambiente

Além dos pacotes, também foram adicionadas ou modificadas as seguintes variáveis de ambiente no arquivo `.env.local`:

```
# Tempo
NEXT_PUBLIC_TEMPO=
```

## Comandos de Instalação Rápida

Para instalar todas as dependências de uma só vez, você pode executar os seguintes comandos:

```bash
# Instalar dependências principais
npm install @supabase/ssr @radix-ui/react-accordion @radix-ui/react-icons lodash

# Instalar dependências de desenvolvimento
npm install --save-dev @types/lodash
```

## Observações

- O componente `TempoInit` que utiliza `tempo-devtools` foi temporariamente comentado no arquivo `src/app/layout.tsx` para evitar erros, já que não temos uma configuração válida para `NEXT_PUBLIC_TEMPO`.
- Se necessário usar esse componente, além de instalar a dependência, é preciso configurar corretamente a variável de ambiente `NEXT_PUBLIC_TEMPO`. 