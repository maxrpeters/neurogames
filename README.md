# 🧠 NeuroExercise

Exercícios interativos de reabilitação cognitiva baseados em perfil neuropsicológico individual.

## Exercícios incluídos

| Exercício | Alvo Cognitivo | Referência Clínica |
|-----------|---------------|-------------------|
| 🔄 Flexibilidade Cognitiva | Alternância de regras | WCST, FDT alternância |
| 🛑 Controle Inibitório | Go/No-Go | Impulsividade, erros por intrusão |
| 💭 Memória Operacional | Span de dígitos | WAIS-III dígitos, IFMO |
| 💬 Fluência Verbal | Geração lexical cronometrada | Fluência fonêmica/semântica |
| 📋 Planejamento | Sequenciamento de etapas | Funções executivas - planejamento |
| 🎭 Leitura Social | Interpretação de contexto | Bateria MAC, Teoria da Mente |

## Setup local

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`

## Build para produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`.

## Deploy na Vercel (recomendado)

### Opção 1: Via CLI
```bash
npm install -g vercel
vercel
```

### Opção 2: Via GitHub
1. Suba este projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
3. Clique em "Add New Project"
4. Selecione o repositório
5. Clique em "Deploy"

Pronto! O app estará online em minutos.

## Deploy na Netlify

1. Rode `npm run build`
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
3. Arraste a pasta `dist/` para a área indicada

## Tecnologias

- React 18
- Vite 6
- CSS-in-JS (inline styles)
- Zero dependências externas além do React
