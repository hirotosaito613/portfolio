/*!
* Start Bootstrap - Resume v7.0.3 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        const scrollSpyInstance = new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 56,
        });

        // If the user reaches (or almost reaches) the bottom, force Contact to be active
        const navLinks = document.querySelectorAll('#sideNav .nav-link');
        const contactLink = document.querySelector('#sideNav a[href="#contact"]');
        const bottomTolerance = 32; // px
        const contactSection = document.querySelector('#contact');
        let bottomOverrideActive = false;

        // 非Contactリンククリック時は強制状態を解除して即座にScrollSpy再計算
        navLinks.forEach((link) => {
            if (link === contactLink) return;
            link.addEventListener('click', () => {
                bottomOverrideActive = false;
                if (scrollSpyInstance) scrollSpyInstance._activeTarget = null;
                navLinks.forEach((l) => {
                    l.classList.remove('active');
                    l.removeAttribute('aria-current');
                });
                setTimeout(() => {
                    if (scrollSpyInstance && typeof scrollSpyInstance.refresh === 'function') {
                        scrollSpyInstance.refresh();
                    }
                    if (scrollSpyInstance && typeof scrollSpyInstance._process === 'function') {
                        scrollSpyInstance._process();
                    } else {
                        window.dispatchEvent(new Event('scroll'));
                    }
                }, 50);
            });
        });

        const setContactActive = () => {
            if (!contactLink) return;
            navLinks.forEach((link) => link.classList.remove('active'));
            contactLink.classList.add('active');
            contactLink.setAttribute('aria-current', 'true');
        };
        const handleBottomHighlight = () => {
            if (!contactSection) return;
            const rect = contactSection.getBoundingClientRect();
            const nearContactBottom = rect.bottom - window.innerHeight <= bottomTolerance;
            const atPageBottom = window.innerHeight + window.scrollY >= (document.documentElement.scrollHeight - bottomTolerance);
            if (nearContactBottom || atPageBottom) {
                // 少し遅らせて ScrollSpy の処理より後に実行し、上書きする
                bottomOverrideActive = true;
                setTimeout(setContactActive, 0);
            } else if (bottomOverrideActive) {
                // 例外状態から復帰: ScrollSpy に委ねる
                bottomOverrideActive = false;
                // いったん手動でアクティブを外す（強制付与した Contact をクリア）
                if (scrollSpyInstance) scrollSpyInstance._activeTarget = null;
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                });
                // ScrollSpy 再計算・即時処理
                if (scrollSpyInstance && typeof scrollSpyInstance.refresh === 'function') {
                    scrollSpyInstance.refresh();
                }
                if (scrollSpyInstance && typeof scrollSpyInstance._process === 'function') {
                    scrollSpyInstance._process();
                } else {
                    // フォールバック: scroll イベントで再評価
                    window.dispatchEvent(new Event('scroll'));
                }
            }
        };
        window.addEventListener('scroll', handleBottomHighlight, { passive: true });
        window.addEventListener('resize', handleBottomHighlight);
        handleBottomHighlight();
    };

    // Ensure modal content order: media (img/iframe) -> title -> Abstract...
    document.querySelectorAll('.remodal').forEach((modal) => {
        const title = modal.querySelector('h3');
        const firstHeadingAfter = modal.querySelector('h4');
        if (!title || !firstHeadingAfter) return;
        const children = Array.from(modal.children);
        const media = [];
        for (const node of children) {
            if (node === firstHeadingAfter) break;
            if (node.tagName === 'IMG' || node.tagName === 'IFRAME') {
                media.push(node);
            }
        }
        // keep only first media; remove extras to防ぐ cross-modal誤混入
        if (media.length > 1) {
            media.slice(1).forEach((node) => node.remove());
        }
        // if no media and fallback needed, inject default
        if (media.length === 0) {
            const defaults = {
                teaming: { src: 'assets/img/mmt.png', alt: 'machine mediated teaming' },
                kendama: { src: 'assets/img/kendama.png', alt: 'kendama' }
            };
            const id = modal.getAttribute('data-remodal-id');
            if (defaults[id]) {
                const img = document.createElement('img');
                img.src = defaults[id].src;
                img.alt = defaults[id].alt;
                img.className = 'works-modal';
                modal.insertBefore(img, title);
                media.push(img);
            }
        } else {
            // ensure the kept media is before the title
            modal.insertBefore(media[0], title);
        }
    });

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Duplicate works thumbnails for seamless marquee scroll
    const worksTrack = document.getElementById('works-track');
    const worksWrapper = document.getElementById('works-wrapper');
    const showAllBtn = document.getElementById('works-show-all');
    const twitterEmbed = null;

    if (worksTrack) {
        // lazy-load iframe embeds inside modals
        document.querySelectorAll('.remodal iframe').forEach((iframe) => {
            const src = iframe.getAttribute('src');
            if (src) {
                iframe.setAttribute('data-src', src);
                iframe.setAttribute('src', '');
            }
        });
        $(document).on('opening', '.remodal', function () {
            $(this).find('iframe[data-src]').each(function () {
                if (!this.getAttribute('src')) {
                    this.setAttribute('src', this.getAttribute('data-src'));
                }
            });
        });

        // add hover titles to thumbnails from modal headings (only for featured items)
        const thumbAnchors = worksTrack.querySelectorAll('.img-thumbnail > a[data-remodal-target]');
        thumbAnchors.forEach((a) => {
            const id = a.getAttribute('data-remodal-target');
            const modalTitleEl = document.querySelector(`.remodal[data-remodal-id=\"${id}\"] h3`);
            const titleText = modalTitleEl ? modalTitleEl.textContent.trim() : id;
            const img = a.querySelector('img');

            // instant hover label overlay (no native title delay) — only for featured items
            const thumb = a.closest('.img-thumbnail');
            if (thumb) {
                const existing = thumb.querySelector('.works-thumb-title');
                if (existing) existing.remove();
            }
            a.removeAttribute('title');
            if (img) img.removeAttribute('title');

            a.setAttribute('title', titleText);
            if (img) img.setAttribute('title', titleText);
            if (thumb && !thumb.querySelector('.works-thumb-title')) {
                const label = document.createElement('div');
                label.className = 'works-thumb-title';
                label.textContent = titleText;
                thumb.appendChild(label);
            }
        });

        // duplicate children for seamless scroll (mark clones so we can hide in grid mode)
        const originals = [...worksTrack.children];
        originals.forEach((el) => {
            const clone = el.cloneNode(true);
            // remove modal from clone to avoid duplicate iframes/ids
            const modalInClone = clone.querySelector('.remodal');
            if (modalInClone) modalInClone.remove();
            clone.classList.add('clone');
            worksTrack.appendChild(clone);
        });
        const clones = [...worksTrack.querySelectorAll('.clone')];

        const isShowAll = () => worksWrapper && worksWrapper.classList.contains('works-show-all');
        const applyFeaturedVisibility = () => {
            const showAll = isShowAll();
            originals.forEach((el) => {
                const featured = el.dataset.featured === 'true';
                el.style.display = showAll ? '' : (featured ? '' : 'none');
            });
            clones.forEach((el, idx) => {
                // match clone to original by index
                const orig = originals[idx % originals.length];
                const featured = orig.dataset.featured === 'true';
                el.style.display = showAll ? 'none' : (featured ? '' : 'none');
            });
            normalizeScroll();
            setTransform();
        };

        // auto-scroll state
        let scrollX = 0;
        let marqueeActive = true;
        const speedBase = 0.35; // px per frame
        let speed = speedBase;
        let rafId;
        const trackLength = () => worksTrack.scrollWidth / 2;
        const wrapScroll = (val) => {
            const len = trackLength() || 1;
            return ((val % len) + len) % len;
        };
        const normalizeScroll = () => {
            scrollX = wrapScroll(scrollX);
        };
        const setTransform = (withTransition = false, duration = 0.0) => {
            if (withTransition) {
                worksTrack.style.transition = `transform ${duration}s ease`;
            } else {
                worksTrack.style.transition = '';
            }
            worksTrack.style.transform = `translateX(${-scrollX}px)`;
        };
        worksTrack.style.cursor = 'grab';

        const loop = () => {
            if (!marqueeActive) return;
            scrollX = wrapScroll(scrollX + speed);
            setTransform();
            rafId = requestAnimationFrame(loop);
        };

        // start loop
        rafId = requestAnimationFrame(loop);
        applyFeaturedVisibility();

        // drag / mouse wheel manual control
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startScroll = 0;
        let dragMoved = false;
        const dragThreshold = 6;

        const stopMarquee = () => { marqueeActive = false; cancelAnimationFrame(rafId); };
        const startMarquee = () => { if (!marqueeActive) { marqueeActive = true; rafId = requestAnimationFrame(loop); } };

        worksTrack.addEventListener('wheel', (e) => {
            if (isShowAll()) return;
            const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
            // ignore pure vertical scroll to allow normal page scrolling
            if (e.deltaX === 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
            e.preventDefault();
            stopMarquee();
            scrollX = wrapScroll(scrollX + delta);
            setTransform();
            clearTimeout(worksTrack._wheelTimer);
            worksTrack._wheelTimer = setTimeout(startMarquee, 500);
        }, { passive: false });

        worksTrack.addEventListener('mousedown', (e) => {
            if (isShowAll()) return;
            isDragging = true;
            stopMarquee();
            startX = e.clientX;
            startY = e.clientY;
            startScroll = scrollX;
            worksTrack.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                worksTrack.style.cursor = 'grab';
                setTimeout(startMarquee, 400);
                setTimeout(() => { dragMoved = false; }, 50);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            if (!dragMoved && Math.abs(dx) > dragThreshold) dragMoved = true;
            scrollX = wrapScroll(startScroll - dx);
            setTransform();
        });

        // touch support (swipe)
        worksTrack.addEventListener('touchstart', (e) => {
            if (isShowAll()) return;
            const t = e.touches[0];
            isDragging = true;
            stopMarquee();
            startX = t.clientX;
            startY = t.clientY;
            startScroll = scrollX;
            dragMoved = false;
        }, { passive: true });

        worksTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (!dragMoved) {
                if (Math.abs(dy) > Math.abs(dx)) {
                    // let vertical scroll happen
                    isDragging = false;
                    startMarquee();
                    return;
                }
                if (Math.abs(dx) > dragThreshold) dragMoved = true;
            }
            scrollX = wrapScroll(startScroll - dx);
            setTransform();
            e.preventDefault();
        }, { passive: false });

        const touchEndHandler = () => {
            if (isDragging) {
                isDragging = false;
                setTimeout(startMarquee, 400);
                setTimeout(() => { dragMoved = false; }, 50);
            }
        };
        worksTrack.addEventListener('touchend', touchEndHandler);
        worksTrack.addEventListener('touchcancel', touchEndHandler);

        // prevent click on drag
        worksTrack.addEventListener('click', (e) => {
            if (dragMoved) {
                e.preventDefault();
                e.stopPropagation();
                dragMoved = false;
            }
        }, true);

        // Nav buttons (page by ~3 cards)
        const prevBtn = document.getElementById('works-prev');
        const nextBtn = document.getElementById('works-next');
        const stepAmount = () => {
            const first = worksTrack.querySelector('.img-thumbnail');
            if (!first) return 600;
            const rect = first.getBoundingClientRect();
            const gapStr = getComputedStyle(worksTrack).columnGap || getComputedStyle(worksTrack).gap || '0';
            const gap = parseFloat(gapStr) || 0;
            return (rect.width + gap) * 3;
        };
        const pageMove = (dir) => {
            stopMarquee();
            const step = stepAmount();
            scrollX = scrollX + dir * step;
            setTransform(true, 0.4);
            const restart = () => {
                worksTrack.removeEventListener('transitionend', restart);
                normalizeScroll();
                setTransform(false);
                startMarquee();
            };
            worksTrack.addEventListener('transitionend', restart, { once: true });
        };
        if (prevBtn) prevBtn.addEventListener('click', () => { if (!isShowAll()) pageMove(-1); });
        if (nextBtn) nextBtn.addEventListener('click', () => { if (!isShowAll()) pageMove(1); });

        // Show All toggle
        if (showAllBtn && worksWrapper) {
            showAllBtn.addEventListener('click', () => {
                const showAll = worksWrapper.classList.toggle('works-show-all');
                applyFeaturedVisibility();
                if (showAll) {
                    stopMarquee();
                    scrollX = 0;
                    setTransform();
                    showAllBtn.textContent = 'close grid';
                    worksTrack.style.cursor = 'default';
                } else {
                    scrollX = wrapScroll(scrollX);
                    startMarquee();
                    showAllBtn.textContent = 'see more works';
                    worksTrack.style.cursor = 'grab';
                }
            });
        }
    }

    // no X timeline embed (link only in HTML)
});

$(document).on('closing', '.remodal', function (e) {
    var $this = $(this).find('iframe'),
    tempSrc = $this.attr('src');
    $this.attr('src', "");
    $this.attr('src', tempSrc);
    });
