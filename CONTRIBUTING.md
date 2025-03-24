# Guia de Contribuição

Obrigado por considerar contribuir para a Plataforma de Documentos Multicanal! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Fluxo de Trabalho

1. Crie um fork do repositório
2. Clone o fork para sua máquina local
3. Crie uma branch para sua feature/correção: `git checkout -b feature/sua-feature` ou `fix/seu-fix`
4. Faça suas alterações
5. Garanta que o código segue os padrões do projeto
6. Faça commit das alterações com mensagens significativas seguindo as convenções:
   - `Feat(escopo): descrição` - para novas funcionalidades
   - `Fix(escopo): descrição` - para correções de bugs
   - `Docs(escopo): descrição` - para atualizações de documentação
   - `Style(escopo): descrição` - para alterações de estilo
   - `Refactor(escopo): descrição` - para refatorações de código
   - `Test(escopo): descrição` - para adição/modificação de testes
   - `Chore(escopo): descrição` - para alterações em configurações/scripts
7. Envie suas alterações para seu fork: `git push origin feature/sua-feature`
8. Abra um Pull Request para a branch principal do repositório original

## Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/FilippeFariaFrasao/Plataforma-de-Documentos---Multicanal.git
   cd Plataforma-de-Documentos---Multicanal
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Atualize com suas credenciais do Supabase

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Padrões de Código

- Use componentes funcionais com TypeScript
- Siga as convenções de nomenclatura estabelecidas
- Utilize o Prettier e ESLint para formatação e qualidade de código
- Escreva testes para suas alterações sempre que possível
- Documente novas funcionalidades ou alterações importantes

## Revisão de Código

- Todas as contribuições serão revisadas
- Feedback será fornecido, possivelmente solicitando alterações
- Uma vez aprovado, o PR será mesclado à branch principal

## Dúvidas?

Se você tiver dúvidas sobre como contribuir, entre em contato com os mantenedores do projeto. 