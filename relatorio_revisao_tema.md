# Relatório de Revisão de Tema v2 - ZoeFinan

Realizamos uma segunda rodada de revisões profundas para isolar os componentes e permitir a manipulação independente de cores em cada página.

## 1. Isolamento de Cards e Botões
Anteriormente, muitos componentes compartilhavam as mesmas classes de superfície. Agora, cada contexto possui suas próprias variáveis CSS, permitindo ajustes específicos sem afetar o resto da aplicação.

### Variáveis por Contexto (Exemplos no index.css):
- `--home-card-bg`: Controla exclusivamente os cards da página inicial (definido como `#c4d4a9`).
- `--diag-card-bg` & `--diag-btn-bg`: Controla cards e botões na página de Diagnóstico.
- `--lanc-card-bg` & `--btn-lanc-primary`: Controla elementos na página de Lançamentos.
- `--plan-card-bg`: Controla cards no Plano Estratégico.
- `--art-card-bg`: Controla cards na lista de Artigos.
- `--perf-card-bg`: Controla cards na página de Perfil.

## 2. Página Inicial (Home)
- **Cor dos Cards:** Aplicada a cor específica `#c4d4a9` solicitada para os cards da Home.
- **Diferenciação:** Os cards da Home agora possuem uma identidade visual distinta das demais páginas.

## 3. Padronização e Limpeza
- **Remoção de Estilos Inline:** Limpamos propriedades fixas (hardcoded) nos arquivos JSX e as movemos para o `index.css`.
- **Classes Utilitárias:** Criamos classes como `.card-home`, `.card-diag`, `.btn-diag-primary`, etc., para facilitar a leitura do código.
- **Consistência Light/Dark:** Todas as novas variáveis possuem seus respectivos valores para o modo escuro dentro do bloco `.dark`.

## 4. Como Alterar Cores Futuramente
Para mudar a cor de um card ou botão específico, basta localizar a variável correspondente no `src/index.css`:

```css
:root {
  /* Exemplo: Mudar cor do card de diagnóstico */
  --diag-card-bg: #NOVA_COR; 
  
  /* Exemplo: Mudar cor do botão de lançamentos */
  --lanc-btn-primary: #NOVA_COR;
}
```

---
*Dica: O fundo da aplicação permanece como Branco Absoluto (#FFFFFF) em todas as páginas no modo light.*
