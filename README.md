# Resumidor de PDFs - IA

Site simples e estiloso pra transformar seus PDFs em resumos inteligentes usando inteligência artificial da API do Google Gemini.

---

## O que é?

Uma aplicação web que permite você carregar vários arquivos PDF e gerar resumos customizados usando IA. Você pode inserir uma chave da API do Google Gemini e, se quiser, passar um prompt personalizado pra controlar o tipo de resumo.

---

## Funcionalidades

- Upload múltiplo de arquivos PDF
- Campo para inserir a chave da API do Google Gemini
- Prompt personalizado opcional para guiar o resumo (ex: "Resuma em 3 tópicos principais")
- Feedback visual durante o processamento
- Resultado do resumo exibido na tela

---

## Como usar

1. Obtenha uma chave da API do Google Gemini gratuitamente em:  
   [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. Abra o site no navegador.

3. Insira sua chave da API no campo indicado.

4. (Opcional) Digite um prompt para personalizar o resumo.

5. Selecione um ou mais arquivos PDF (clicando ou arrastando).

6. Clique em **"Resumir PDFs"**.

7. Aguarde o processamento e veja o resumo gerado na tela.

---

## Tecnologias usadas

- HTML5 e CSS3 (com fonte Inter e ícones FontAwesome)
- JavaScript para interação e manipulação do formulário
- Integração com API Google Gemini (backend não incluso nesse código)

---

## Estrutura do projeto

- `index.html`: página principal do resumidor
- `styles.css`: estilos visuais
- `script.js`: lógica do front-end para manipulação dos arquivos e comunicação com a API

---

## Observações

- É necessário ter uma chave válida da API do Google Gemini para funcionar.
- O backend responsável por enviar os PDFs para a API e receber os resumos não está incluído nesse projeto.
- Recomendado usar navegador moderno (Chrome, Firefox, Edge).

---

## Próximos passos / melhorias

- Implementar backend em Python/Flask para processar PDFs e chamar a API.
- Adicionar suporte para salvar resumos em arquivo.
- Melhorar UX com notificações e histórico.

---

## Autor

Kauê - Estudante e programador Python  
GitHub: [seu-github-aqui]  

---

## Licença

MIT License © 2025 Kauê

