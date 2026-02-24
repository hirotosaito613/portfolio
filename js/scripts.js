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
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 120,
        });
    };

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
