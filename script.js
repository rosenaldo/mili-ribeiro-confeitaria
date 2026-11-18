(function () {
    'use strict';

    /* ---------- Ano no footer ---------- */
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Menu mobile ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    function closeMenu() {
        if (!menuToggle || !navMenu) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ---------- Scroll suave com offset do header ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const headerEl = document.querySelector('.header');
            const offset = headerEl ? headerEl.offsetHeight + 12 : 90;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ---------- Sombra no header ao rolar ---------- */
    const header = document.getElementById('header');
    if (header) {
        const onScroll = function () {
            if (window.scrollY > 8) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Fade-in com IntersectionObserver ---------- */
    const fadeEls = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window && fadeEls.length) {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        fadeEls.forEach(function (el) { io.observe(el); });
    } else {
        fadeEls.forEach(function (el) { el.classList.add('visible'); });
    }


    /* ---------- MONTE SEU BOLO ---------- */
    const selections = {
        tamanho: '',
        massa: [],       // 1 ou 2
        recheio: [],     // 1 ou 2 (somando tradicionais + gourmet)
        decoracao: ''
    };

    // Regras de negócio:
    //   Pequeno (10–15 pessoas) → 1 massa, 1 recheio
    //   Grande  (acima de 20)   → 2 massas, 2 recheios
    //   A definir               → tratado como pequeno até a confeiteira confirmar
    const rules = {
        small: { massaMax: 1, recheioMax: 1 },
        large: { massaMax: 2, recheioMax: 2 },
        custom: { massaMax: 1, recheioMax: 1 }
    };

    const currentMax = { massa: 1, recheio: 1 };

    const labels = {
        tamanho: 'Tamanho',
        massa: 'Massa',
        recheio: 'Recheio',
        decoracao: 'Decoração'
    };

    const monteResumo = document.getElementById('monte-resumo');
    const monteWhats = document.getElementById('monte-whatsapp');
    const monteHint = document.getElementById('monte-hint');
    const counterMassa = document.getElementById('counter-massa');
    const counterRecheio = document.getElementById('counter-recheio');

    /* ---------- TAMANHO (define as regras) ---------- */
    const tamanhoGroup = document.querySelector('.monte-options[data-group="tamanho"]');

    if (tamanhoGroup) {
        tamanhoGroup.querySelectorAll('.monte-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                tamanhoGroup.querySelectorAll('.monte-chip').forEach(function (c) {
                    c.classList.remove('selected');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('selected');
                chip.setAttribute('aria-pressed', 'true');

                const size = chip.getAttribute('data-size') || 'small';
                selections.tamanho = chip.getAttribute('data-value') || chip.textContent.trim();

                currentMax.massa = rules[size] ? rules[size].massaMax : 1;
                currentMax.recheio = rules[size] ? rules[size].recheioMax : 1;

                // Atualiza atributos data-max nos grupos
                const massaGroup = document.querySelector('.monte-options[data-group="massa"]');
                if (massaGroup) massaGroup.setAttribute('data-max', currentMax.massa);

                document.querySelectorAll('.monte-options[data-shared-group="recheio"]').forEach(function (g) {
                    g.setAttribute('data-max', currentMax.recheio);
                });

                // Corta excesso caso o cliente já tivesse escolhido mais
                if (selections.massa.length > currentMax.massa) {
                    selections.massa = selections.massa.slice(0, currentMax.massa);
                    syncGroupSelection('massa');
                }
                if (selections.recheio.length > currentMax.recheio) {
                    selections.recheio = selections.recheio.slice(0, currentMax.recheio);
                    syncSharedSelection('recheio');
                }

                updateHint(size);
                updateCounters();
                updateLocks();
                atualizarResumo();
            });
        });
    }

    function updateHint(size) {
        if (!monteHint) return;
        monteHint.classList.add('is-active');
        if (size === 'small') {
            monteHint.textContent = 'Tamanho pequeno: você pode escolher 1 opção de massa e 1 de recheio.';
        } else if (size === 'large') {
            monteHint.textContent = 'Tamanho grande: você pode escolher até 2 opções de massa e 2 de recheio (somando tradicionais e gourmet).';
        } else {
            monteHint.textContent = 'A definir: escolha 1 massa e 1 recheio, ou converse com a confeiteira para mais opções.';
        }
    }

    /* ---------- MASSA / RECHEIO / DECORAÇÃO ---------- */
    document.querySelectorAll('.monte-options').forEach(function (group) {
        const groupName = group.getAttribute('data-group');
        if (groupName === 'tamanho') return;

        group.querySelectorAll('.monte-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                if (!selections.tamanho) {
                    if (monteHint) {
                        monteHint.textContent = 'Por favor, escolha primeiro o tamanho do bolo.';
                        monteHint.classList.add('is-active');
                    }
                    return;
                }

                const value = chip.getAttribute('data-value') || chip.textContent.trim();
                const shared = group.getAttribute('data-shared-group');

                if (groupName === 'massa' || shared === 'recheio') {
                    const key = groupName === 'massa' ? 'massa' : 'recheio';
                    const max = currentMax[key];
                    const arr = selections[key];
                    const idx = arr.indexOf(value);

                    if (idx > -1) {
                        arr.splice(idx, 1);
                        chip.classList.remove('selected');
                        chip.setAttribute('aria-pressed', 'false');
                    } else {
                        if (arr.length >= max) {
                            chip.classList.add('flash-warn');
                            setTimeout(function () { chip.classList.remove('flash-warn'); }, 450);
                            return;
                        }
                        arr.push(value);
                        chip.classList.add('selected');
                        chip.setAttribute('aria-pressed', 'true');
                    }
                } else {
                    // Decoração — escolha única
                    group.querySelectorAll('.monte-chip').forEach(function (c) {
                        c.classList.remove('selected');
                        c.setAttribute('aria-pressed', 'false');
                    });
                    chip.classList.add('selected');
                    chip.setAttribute('aria-pressed', 'true');
                    selections[groupName] = value;
                }

                updateCounters();
                updateLocks();
                atualizarResumo();
            });
        });
    });

    /* ---------- Sincronização visual ---------- */
    function syncGroupSelection(groupName) {
        const group = document.querySelector('.monte-options[data-group="' + groupName + '"]');
        if (!group) return;
        const values = selections[groupName] || [];
        group.querySelectorAll('.monte-chip').forEach(function (chip) {
            const v = chip.getAttribute('data-value') || chip.textContent.trim();
            if (values.indexOf(v) > -1) {
                chip.classList.add('selected');
                chip.setAttribute('aria-pressed', 'true');
            } else {
                chip.classList.remove('selected');
                chip.setAttribute('aria-pressed', 'false');
            }
        });
    }

    function syncSharedSelection(sharedKey) {
        const values = selections[sharedKey] || [];
        document.querySelectorAll('.monte-options[data-shared-group="' + sharedKey + '"]').forEach(function (group) {
            group.querySelectorAll('.monte-chip').forEach(function (chip) {
                const v = chip.getAttribute('data-value') || chip.textContent.trim();
                if (values.indexOf(v) > -1) {
                    chip.classList.add('selected');
                    chip.setAttribute('aria-pressed', 'true');
                } else {
                    chip.classList.remove('selected');
                    chip.setAttribute('aria-pressed', 'false');
                }
            });
        });
    }

    /* ---------- Contadores ---------- */
    function updateCounters() {
        if (counterMassa) {
            counterMassa.textContent = selections.tamanho
                ? '(' + selections.massa.length + ' de ' + currentMax.massa + ')'
                : '';
        }
        if (counterRecheio) {
            counterRecheio.textContent = selections.tamanho
                ? '(' + selections.recheio.length + ' de ' + currentMax.recheio + ')'
                : '';
        }
    }

    /* ---------- Bloqueia chips quando o limite foi atingido ---------- */
    function updateLocks() {
        const massaGroup = document.querySelector('.monte-options[data-group="massa"]');
        if (massaGroup) lockGroup(massaGroup, selections.massa, currentMax.massa);

        document.querySelectorAll('.monte-options[data-shared-group="recheio"]').forEach(function (group) {
            lockGroup(group, selections.recheio, currentMax.recheio);
        });
    }

    function lockGroup(group, selectedArr, max) {
        const full = selectedArr.length >= max && selections.tamanho;
        group.querySelectorAll('.monte-chip').forEach(function (chip) {
            const isSelected = chip.classList.contains('selected');
            if (full && !isSelected) {
                chip.classList.add('is-locked');
                chip.setAttribute('aria-disabled', 'true');
            } else {
                chip.classList.remove('is-locked');
                chip.removeAttribute('aria-disabled');
            }
        });
    }

    /* ---------- Resumo + WhatsApp ---------- */
    function atualizarResumo() {
        if (!monteResumo) return;

        const parts = [];
        let filled = 0;

        if (selections.tamanho) {
            filled++;
            parts.push('<span>Tamanho:</span> ' + escapeHtml(selections.tamanho));
        }
        if (selections.massa.length) {
            filled++;
            parts.push('<span>Massa:</span> ' + selections.massa.map(escapeHtml).join(' + '));
        }
        if (selections.recheio.length) {
            filled++;
            parts.push('<span>Recheio:</span> ' + selections.recheio.map(escapeHtml).join(' + '));
        }
        if (selections.decoracao) {
            filled++;
            parts.push('<span>Decoração:</span> ' + escapeHtml(selections.decoracao));
        }

        if (filled === 0) {
            monteResumo.innerHTML = '<span class="placeholder-msg">Selecione as opções acima para montar sua sugestão.</span>';
        } else {
            monteResumo.innerHTML = parts.join('<br>');
        }

        atualizarWhats();
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function atualizarWhats() {
        if (!monteWhats) return;

        const linhas = [];
        if (selections.tamanho) linhas.push('Tamanho: ' + selections.tamanho);
        if (selections.massa.length) linhas.push('Massa: ' + selections.massa.join(' + '));
        if (selections.recheio.length) linhas.push('Recheio: ' + selections.recheio.join(' + '));
        if (selections.decoracao) linhas.push('Decoração: ' + selections.decoracao);

        const base = 'Olá! Gostaria de fazer um orçamento.';

        let msg;
        if (linhas.length === 0) {
            msg = base + '\n\nAinda estou escolhendo as opções e gostaria de ajuda.\n\nGostaria de receber um orçamento.';
        } else {
            msg = base + '\n\n' + linhas.join('\n') + '\n\nGostaria de receber um orçamento.';
        }

        monteWhats.setAttribute('href', 'https://wa.me/5584981655504?text=' + encodeURIComponent(msg));
    }

    /* ---------- Init ---------- */
    updateCounters();
    updateLocks();
    atualizarWhats();

    /* ---------- Sincroniza a seleção visual de um grupo ---------- */
    function syncGroupSelection(groupName) {
        const group = document.querySelector('.monte-options[data-group="' + groupName + '"]');
        if (!group) return;
        const values = selections[groupName] || [];
        group.querySelectorAll('.monte-chip').forEach(function (chip) {
            const v = chip.getAttribute('data-value') || chip.textContent.trim();
            if (values.indexOf(v) > -1) {
                chip.classList.add('selected');
                chip.setAttribute('aria-pressed', 'true');
            } else {
                chip.classList.remove('selected');
                chip.setAttribute('aria-pressed', 'false');
            }
        });
    }

    /* ---------- Contadores "1 de 2" ---------- */
    function updateCounters() {
        if (counterMassa) {
            if (selections.tamanho) {
                counterMassa.textContent = '(' + selections.massa.length + ' de ' + currentMax.massa + ')';
            } else {
                counterMassa.textContent = '';
            }
        }
        if (counterRecheio) {
            if (selections.tamanho) {
                counterRecheio.textContent = '(' + selections.recheio.length + ' de ' + currentMax.recheio + ')';
            } else {
                counterRecheio.textContent = '';
            }
        }
    }

    /* ---------- Bloqueia chips quando o limite foi atingido ---------- */
    function updateLocks() {
        ['massa', 'recheio'].forEach(function (groupName) {
            const group = document.querySelector('.monte-options[data-group="' + groupName + '"]');
            if (!group) return;
            const max = currentMax[groupName];
            const selectedCount = selections[groupName].length;

            group.querySelectorAll('.monte-chip').forEach(function (chip) {
                const isSelected = chip.classList.contains('selected');
                if (!isSelected && selectedCount >= max && selections.tamanho) {
                    chip.classList.add('is-locked');
                    chip.setAttribute('aria-disabled', 'true');
                } else {
                    chip.classList.remove('is-locked');
                    chip.removeAttribute('aria-disabled');
                }
            });
        });
    }

    /* ---------- Resumo + WhatsApp ---------- */
    function atualizarResumo() {
        if (!monteResumo) return;

        const parts = [];
        let filledCount = 0;

        // Tamanho
        if (selections.tamanho) {
            filledCount++;
            parts.push('<span>Tamanho:</span> ' + escapeHtml(selections.tamanho));
        }
        // Massa(s)
        if (selections.massa.length) {
            filledCount++;
            parts.push('<span>Massa:</span> ' + selections.massa.map(escapeHtml).join(' + '));
        }
        // Recheio(s)
        if (selections.recheio.length) {
            filledCount++;
            parts.push('<span>Recheio:</span> ' + selections.recheio.map(escapeHtml).join(' + '));
        }
        // Decoração
        if (selections.decoracao) {
            filledCount++;
            parts.push('<span>Decoração:</span> ' + escapeHtml(selections.decoracao));
        }

        if (filledCount === 0) {
            monteResumo.innerHTML = '<span class="placeholder-msg">Selecione as opções acima para montar sua sugestão.</span>';
        } else {
            monteResumo.innerHTML = parts.join('<br>');
        }

        atualizarWhats();
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function atualizarWhats() {
        if (!monteWhats) return;

        const linhas = [];
        if (selections.tamanho) linhas.push('Tamanho: ' + selections.tamanho);
        if (selections.massa.length) linhas.push('Massa: ' + selections.massa.join(' + '));
        if (selections.recheio.length) linhas.push('Recheio: ' + selections.recheio.join(' + '));
        if (selections.decoracao) linhas.push('Decoração: ' + selections.decoracao);

        const base = 'Olá! Gostaria de fazer um orçamento.';

        let msg;
        if (linhas.length === 0) {
            msg = base + '\n\nAinda estou escolhendo as opções e gostaria de ajuda.\n\nGostaria de receber um orçamento.';
        } else {
            msg = base + '\n\n' + linhas.join('\n') + '\n\nGostaria de receber um orçamento.';
        }

        monteWhats.setAttribute('href', 'https://wa.me/5584981655504?text=' + encodeURIComponent(msg));
    }

    // Inicializa
    updateCounters();
    updateLocks();
    atualizarWhats();

    /* ---------- LIGHTBOX ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxCta = document.getElementById('lightbox-cta');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    const galeriaItems = Array.from(document.querySelectorAll('.galeria-item'));
    let currentIndex = 0;

    function openLightbox(index) {
        if (!lightbox || !galeriaItems.length) return;
        currentIndex = (index + galeriaItems.length) % galeriaItems.length;
        const item = galeriaItems[currentIndex];
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || '';
        const desc = item.getAttribute('data-desc') || '';

        lightboxImg.src = img ? img.src : '';
        lightboxImg.alt = img ? (img.alt || caption) : '';
        lightboxCaption.textContent = caption;
        lightboxDesc.textContent = desc;

        const msg = 'Olá! Gostaria de fazer um orçamento inspirado na seguinte criação:\n\n' +
            (caption ? 'Criação: ' + caption + '\n' : '') +
            (desc ? 'Detalhes: ' + desc + '\n' : '') +
            '\nGostaria de receber um orçamento.';
        if (lightboxCta) {
            lightboxCta.setAttribute('href',
                'https://wa.me/5584981655504?text=' + encodeURIComponent(msg));
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        const item = galeriaItems[currentIndex];
        if (item) item.focus && item.focus();
    }

    function navigateLightbox(direction) {
        openLightbox(currentIndex + direction);
    }

    galeriaItems.forEach(function (item, i) {
        item.setAttribute('tabindex', '0');
        item.addEventListener('click', function () { openLightbox(i); });
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(i);
            }
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { navigateLightbox(1); });

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navigateLightbox(-1);
        else if (e.key === 'ArrowRight') navigateLightbox(1);
    });

})();