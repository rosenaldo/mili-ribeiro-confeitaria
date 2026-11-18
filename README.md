# 🍰 Mili Ribeiro — Confeitaria Artesanal

Landing page responsiva para confeitaria artesanal, com catálogo de bolos sob encomenda, montagem interativa de bolo, galeria com lightbox e integração direta com WhatsApp.

![Status](https://img.shields.io/badge/status-ativo-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Funcionalidades

- 🎂 **Monte seu bolo** — seletor interativo com regras por tamanho (pequeno = 1 massa/recheio; grande = 2)
- 🖼️ **Galeria com lightbox** — navegação por teclado, descrições e CTA "Quero algo assim"
- 📱 **Menu mobile** acessível (ARIA + fechamento com ESC)
- 💬 **Integração WhatsApp** — mensagens pré-preenchidas com a seleção do usuário
- 🛵 **Seção de produtos prontos** com link para delivery
- ♿ **Acessibilidade** — ARIA labels, foco visível, `prefers-reduced-motion`
- 📱 **100% responsivo**

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (variáveis, grid, flexbox, animações)
- JavaScript vanilla (ES6+, IntersectionObserver)
- [Google Fonts](https://fonts.google.com/) — Cormorant Garamond, Dancing Script, Montserrat
- [Font Awesome 6](https://fontawesome.com/)

## 📁 Estrutura
├── index.html # Estrutura da página
├── style.css # Estilos e responsividade
├── script.js # Interações (menu, monte-bolo, lightbox)
└── img/ # Imagens (logo, galeria, produtos)


## 🚀 Como rodar localmente

Não há build nem dependências. Basta abrir o `index.html` no navegador:

```bash
git clone https://github.com/SEU-USUARIO/mili-ribeiro-confeitaria.git
cd mili-ribeiro-confeitaria
# abra o index.html ou use uma extensão Live Server