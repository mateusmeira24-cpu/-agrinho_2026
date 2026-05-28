// JavaScript - Inovação, Accordion e Recursos Avançados de Acessibilidade

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. SISTEMA DE SEÇÕES EXPANSÍVEIS (ACCORDION - REQUISITO 2)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            // Fecha todos os outros itens (opcional, cria efeito sanfona limpo)
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    const otherContent = otherHeader.nextElementSibling;
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherContent.style.maxHeight = null;
                    otherContent.setAttribute('aria-hidden', 'true');
                }
            });
            
            // Alterna o estado do item atual
            if (!isExpanded) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
                content.setAttribute('aria-hidden', 'false');
            } else {
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
                content.setAttribute('aria-hidden', 'true');
            }
        });
    });

    /* ==========================================================================
       2. FORMULÁRIOS INTERATIVOS (REQUISITO 5 & 6)
       ========================================================================== */
    // Formulário do Seminário
    const seminarForm = document.getElementById('seminarForm');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    
    if (seminarForm) {
        seminarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulação de envio com sucesso
            formSuccessMessage.style.display = 'block';
            formSuccessMessage.setAttribute('aria-hidden', 'false');
            seminarForm.reset();
            
            // Remove mensagem após 6 segundos
            setTimeout(() => {
                formSuccessMessage.style.display = 'none';
                formSuccessMessage.setAttribute('aria-hidden', 'true');
            }, 6000);
        });
    }

    // Área de Comentários
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');
    
    if (commentForm && commentsList) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentText = document.getElementById('txtComment').value;
            
            // Criar dinamicamente o novo elemento de comentário estruturado e acessível
            const newComment = document.createElement('div');
            newComment.className = 'comment-item';
            newComment.style.opacity = '0';
            newComment.style.transform = 'translateY(10px)';
            newComment.style.transition = 'all 0.4s ease';
            
            newComment.innerHTML = `
                <div class="comment-meta">
                    <strong>Leitor Conectado</strong>
                    <span>• Agora mesmo</span>
                </div>
                <div class="comment-body">${escapeHTML(commentText)}</div>
            `;
            
            commentsList.insertBefore(newComment, commentsList.firstChild);
            commentForm.reset();
            
            // Trigger visual animado suave
            setTimeout(() => {
                newComment.style.opacity = '1';
                newComment.style.transform = 'translateY(0)';
            }, 50);
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    /* ==========================================================================
       3. PAINEL DE ACESSIBILIDADE FLUTUANTE & SPEECHSYNTHESIS (REQUISITO 7)
       ========================================================================== */
    const toggleWidgetBtn = document.getElementById('toggleWidgetBtn');
    const accessibilityWidget = document.getElementById('accessibilityWidget');
    
    // Abrir/Fechar Painel de Acessibilidade
    toggleWidgetBtn.addEventListener('click', () => {
        accessibilityWidget.classList.toggle('open');
        const isOpen = accessibilityWidget.classList.contains('open');
        toggleWidgetBtn.setAttribute('aria-label', isOpen ? 'Fechar opções de acessibilidade' : 'Abrir opções de acessibilidade');
    });

    // Controle de Tamanho de Fonte via CSS Variables
    let currentScale = 1.0;
    const fontStep = 0.1;
    const maxScale = 1.4;
    const minScale = 0.85;
    
    document.getElementById('btnIncreaseFont').addEventListener('click', () => {
        if (currentScale < maxScale) {
            currentScale += fontStep;
            document.documentElement.style.setProperty('--font-scale', currentScale);
        }
    });

    document.getElementById('btnDecreaseFont').addEventListener('click', () => {
        if (currentScale > minScale) {
            currentScale -= fontStep;
            document.documentElement.style.setProperty('--font-scale', currentScale);
        }
    });

    // Alternador de Tema Escuro/Claro
    document.getElementById('btnToggleTheme').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // API de Leitura por Voz (SpeechSynthesis API)
    let speechUtterance = null;
    
    document.getElementById('btnStartVoice').addEventListener('click', () => {
        // Cancela qualquer leitura em andamento para evitar sobreposição
        window.speechSynthesis.cancel();
        
        // Coleta o conteúdo principal ignorando cabeçalhos de controle, botões e formulários
        const speakableElements = document.querySelectorAll('.speakable-content');
        let fullTextToRead = "";
        
        speakableElements.forEach(element => {
            // Pega os textos puros de parágrafos, subtítulos e títulos internos do artigo
            const headers = element.querySelectorAll('h2, h3');
            const paragraphs = element.querySelectorAll('p:not(.accordion-instruction)');
            const listItems = element.querySelectorAll('.accordion-body p');
            
            headers.forEach(h => fullTextToRead += h.innerText + ". ");
            paragraphs.forEach(p => fullTextToRead += p.innerText + " ");
            listItems.forEach(li => fullTextToRead += li.innerText + " ");
        });

        if (fullTextToRead.trim() !== "") {
            speechUtterance = new SpeechSynthesisUtterance(fullTextToRead);
            speechUtterance.lang = 'pt-BR';
            speechUtterance.rate = 1.0; // Velocidade natural
            
            // Feedback visual nos botões
            document.getElementById('btnStartVoice').innerText = "🔊 Lendo...";
            
            speechUtterance.onend = () => {
                document.getElementById('btnStartVoice').innerText = "🔊 Ouvir Conteúdo";
            };
            
            speechUtterance.onerror = () => {
                document.getElementById('btnStartVoice').innerText = "🔊 Ouvir Conteúdo";
            };

            window.speechSynthesis.speak(speechUtterance);
        } else {
            alert("Conteúdo textual não localizado para leitura.");
        }
    });

    // Botão para parar a leitura de voz imediatamente
    document.getElementById('btnStopVoice').addEventListener('click', () => {
        window.speechSynthesis.cancel();
        document.getElementById('btnStartVoice').innerText = "🔊 Ouvir Conteúdo";
    });
});









