
// Extrair texto do PDF usando PDF.js
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    try {
        const loadingTask = pdfjsLib.getDocument(uint8Array);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        
        return fullText;
    } catch (error) {
        console.error('Erro ao extrair texto do PDF:', error);
        throw new Error('Falha ao extrair texto do PDF. Certifique-se de que o arquivo é um PDF válido.');
    }
}

// Chamar API do Google Gemini
async function callGeminiAI(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Falha ao gerar resumo');
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Erro ao chamar Gemini AI:', error);
        throw error;
    }
}

// Converter texto em rich text HTML
function convertToRichText(text) {
    // Converter quebras de linha em parágrafos
    let formatted = text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
    
    // Adicionar formatação para títulos (linhas que terminam com :)
    formatted = formatted.replace(/^([^<\n]+:)(<br>|$)/gm, '<h3>$1</h3>');
    
    // Adicionar formatação para listas (linhas que começam com -, *, ou números)
    formatted = formatted.replace(/^[-*•]\s+(.+?)(<br>|$)/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\d+\.\s+(.+?)(<br>|$)/gm, '<li>$1</li>');
    
    // Envolver listas em tags <ul>
    formatted = formatted.replace(/(<li>.*?<\/li>)(?:\s*<br>\s*<li>.*?<\/li>)*/g, function(match) {
        return '<ul>' + match.replace(/<br>\s*/g, '') + '</ul>';
    });
    
    // Formatação para texto em negrito (**texto**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Formatação para texto em itálico (*texto*)
    formatted = formatted.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    
    // Formatação para texto destacado (palavras em MAIÚSCULAS)
    formatted = formatted.replace(/\b[A-ZÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]{3,}\b/g, '<mark>$&</mark>');
    
    // Envolver em parágrafos se não houver tags de parágrafo
    if (!formatted.includes('<p>') && !formatted.includes('<h3>') && !formatted.includes('<ul>')) {
        formatted = '<p>' + formatted + '</p>';
    } else if (formatted.includes('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
}

// Mostrar resultado
function showResult(content, isError = false) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result ${isError ? 'error' : 'success'}`;
    
    if (isError) {
        resultDiv.innerHTML = `<strong><i class="fas fa-exclamation-triangle"></i> Erro:</strong><br><br>${content}`;
    } else {
        const richContent = convertToRichText(content);
        resultDiv.innerHTML = `
            <div class="result-header">
                <strong><i class="fas fa-check-circle"></i> Resumo Gerado:</strong>
            </div>
            <div class="rich-text-content">
                ${richContent}
            </div>
        `;
    }
    
    resultDiv.style.display = 'block';
}

// Mostrar estado de carregamento
function setLoading(isLoading) {
    const loading = document.getElementById('loading');
    const submitBtn = document.getElementById('submitBtn');
    const result = document.getElementById('result');
    
    loading.style.display = isLoading ? 'block' : 'none';
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading ? 
        '<i class="fas fa-spinner fa-spin"></i> Processando...' : 
        '<i class="fas fa-magic"></i> Resumir PDFs';
    
    if (isLoading) {
        result.style.display = 'none';
    }
}

// Atualizar informações do arquivo
function updateFileInfo() {
    const fileInput = document.getElementById('pdfFiles');
    const fileInfo = document.getElementById('fileInfo');
    
    if (fileInput.files.length > 0) {
        const fileNames = Array.from(fileInput.files).map(file => file.name);
        const totalSize = Array.from(fileInput.files).reduce((total, file) => total + file.size, 0);
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        fileInfo.innerHTML = `
            <strong><i class="fas fa-file-pdf"></i> Arquivos selecionados:</strong><br>
            ${fileNames.map(name => `• ${name}`).join('<br>')}
            <br><br><strong>Tamanho total:</strong> ${sizeInMB} MB
        `;
        fileInfo.classList.add('show');
    } else {
        fileInfo.classList.remove('show');
    }
}

// Manipulador principal do formulário
async function handleSubmit(event) {
    event.preventDefault();
    
    const apiKey = document.getElementById('apiKey').value.trim();
    const customPrompt = document.getElementById('prompt').value.trim();
    const files = document.getElementById('pdfFiles').files;
    
    if (!apiKey) {
        showResult('Por favor, forneça uma chave da API do Google Gemini.', true);
        return;
    }
    
    if (files.length === 0) {
        showResult('Por favor, selecione pelo menos um arquivo PDF.', true);
        return;
    }
    
    setLoading(true);
    
    try {
        let allText = '';
        
        // Extrair texto de todos os PDFs
        for (const file of files) {
            const text = await extractTextFromPDF(file);
            allText += text + '\n\n';
        }
        
        if (!allText.trim()) {
            throw new Error('Nenhum texto pôde ser extraído dos arquivos PDF.');
        }
        
        // Preparar prompt
        const basePrompt = customPrompt || 'Por favor, forneça um resumo abrangente do seguinte texto:';
        const finalPrompt = `${basePrompt}\n\nTexto:\n${allText.trim()}`;
        
        // Chamar Gemini AI
        const summary = await callGeminiAI(apiKey, finalPrompt);
        
        showResult(summary);
        
    } catch (error) {
        console.error('Erro ao processar PDFs:', error);
        showResult(error.message, true);
    } finally {
        setLoading(false);
    }
}

// Drag and drop functionality
function setupDragDrop() {
    const fileLabel = document.querySelector('.file-input-label');
    const fileInput = document.getElementById('pdfFiles');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileLabel.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        fileLabel.style.borderColor = '#667eea';
        fileLabel.style.background = '#eef2ff';
        fileLabel.style.color = '#667eea';
    }
    
    function unhighlight(e) {
        fileLabel.style.borderColor = '#cbd5e0';
        fileLabel.style.background = '#f8fafc';
        fileLabel.style.color = '#4a5568';
    }
    
    fileLabel.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        updateFileInfo();
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Carregar biblioteca PDF.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = function() {
        // Configurar worker do PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);
    
    // Adicionar event listeners
    document.getElementById('summarizerForm').addEventListener('submit', handleSubmit);
    document.getElementById('pdfFiles').addEventListener('change', updateFileInfo);
    
    // Configurar drag and drop
    setupDragDrop();
    
    // Efeito de digitação no placeholder
    const apiKeyInput = document.getElementById('apiKey');
    const originalPlaceholder = apiKeyInput.placeholder;
    
    apiKeyInput.addEventListener('focus', function() {
        this.placeholder = '';
    });
    
    apiKeyInput.addEventListener('blur', function() {
        if (!this.value) {
            this.placeholder = originalPlaceholder;
        }
    });
});
