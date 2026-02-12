# Resumo das Alterações no Sistema de Dívidas Zoefinan

## Introdução

Com base na sua solicitação, realizei uma revisão completa da lógica de gestão de dívidas do projeto Zoefinan. O objetivo foi aprimorar a experiência do usuário, especialmente para aqueles com orçamentos mais restritos, e tornar o plano estratégico de quitação mais inteligente e realista. As mudanças foram implementadas mantendo a identidade visual e a estrutura do projeto.

## Análise do Problema

A lógica anterior apresentava duas lacunas principais:

1.  **Plano de Quitação Irreal:** O sistema sugeria a quitação de dívidas usando um percentual do saldo livre, sem antes garantir que as despesas essenciais de sobrevivência (moradia, alimentação, etc.) estivessem cobertas. Isso tornava o plano inviável para usuários com baixa renda, que poderiam ser aconselhados a usar dinheiro de necessidades básicas para pagar dívidas.
2.  **Falta de Detalhes sobre Dívidas:** Ao lançar uma dívida, o sistema não diferenciava uma dívida de valor total de uma dívida já parcelada. Isso levava a um cálculo de comprometimento mensal incorreto e impedia a criação de estratégias de renegociação.

## Mudanças Implementadas

Para resolver esses problemas, as seguintes alterações foram realizadas nos arquivos `Lancamentos.jsx`, `Dividas.jsx` e `Plano.jsx`.

### 1. Captura Detalhada de Dívidas

Na página de **Lançamentos**, o formulário para adicionar uma dívida foi aprimorado:

-   **Campo "Dívida Parcelada?":** Um novo seletor (toggle) foi adicionado para que o usuário possa indicar se a dívida já possui um acordo de parcelamento.
-   **Campo "Valor da Parcela":** Caso a dívida seja parcelada, um campo é exibido para que o usuário informe o valor da parcela mensal. Se não for parcelada, o sistema considera o valor total como o compromisso daquele mês, mas o identifica como um alvo para renegociação.

| Arquivo Modificado | Local da Mudança | Descrição da Alteração |
| :--- | :--- | :--- |
| `Lancamentos.jsx` | Formulário de "Novo Lançamento" | Adicionados estados `isParcelada` e `valorParcela` e inputs condicionais para capturar os detalhes da dívida. |
| `Dividas.jsx` | Formulário de "Novo Compromisso" | Replicada a mesma lógica de `Lancamentos.jsx` para consistência na gestão global de dívidas. |

### 2. Lógica de Quitação Inteligente e Prioritária

O **Plano Estratégico** foi reestruturado para ser mais empático e realista com a situação financeira do usuário:

-   **Prioridade de Sobrevivência:** O sistema agora identifica despesas essenciais (com base em palavras-chave como "aluguel", "luz", "água", "alimentação"). O valor total dessas despesas é subtraído da renda antes de qualquer outro cálculo. O resultado é o **Saldo Após Sobrevivência**.
-   **Margem de Quitação Realista:** O valor disponível para quitar dívidas ("Saldo para Ataque") é calculado apenas sobre o que sobra *após* pagar as despesas de sobrevivência, outras despesas e as parcelas de dívidas já existentes.
-   **Fluxo de Renegociação:** Se o usuário possui dívidas não parceladas e um orçamento apertado, o plano de ação não sugere mais a quitação total. Em vez disso, ele gera um card de ação específico, instruindo o usuário a **renegociar** aquela dívida para transformá-la em parcelas que caibam no seu bolso.

| Arquivo Modificado | Local da Mudança | Descrição da Alteração |
| :--- | :--- | :--- |
| `Plano.jsx` | Lógica de Cálculo | Implementada a separação de despesas de sobrevivência e a nova fórmula para o saldo livre. |
| `Plano.jsx` | Card "Quitação" | Adicionada a lógica condicional que exibe um card de "Renegociar" para dívidas não parceladas. |

## Conclusão

As alterações implementadas tornam o Zoefinan uma ferramenta financeira mais robusta e consciente. O sistema agora guia o usuário de forma segura, garantindo que suas necessidades básicas sejam priorizadas e oferecendo um plano de ação realista e alcançável para a quitação de dívidas, mesmo em cenários de orçamento baixo.

Os arquivos atualizados com as novas lógicas estão prontos para serem integrados ao seu projeto.
