/**
 * Dashboard interactions for admin and user dashboards.
 * Restores packing toggles, delivery skips/pauses, and add-on buttons.
 */
document.addEventListener('DOMContentLoaded', function() {
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');
    const mobileToggle = document.querySelector('.dashboard-mobile-toggle');
    const mobileToggleIcon = mobileToggle?.querySelector('.material-icons');
    const sidebarBackdrop = document.querySelector('.dashboard-sidebar__backdrop');
    const sidebarMedia = window.matchMedia('(max-width: 1100px)');
    const themeControl = document.getElementById('theme-toggle');
    const rtlControl = document.getElementById('rtl-toggle');

    function syncDashboardSidebar() {
        if (!dashboardSidebar || !mobileToggle) return;

        if (!sidebarMedia.matches) {
            document.body.classList.remove('dashboard-sidebar-open');
        }

        const isOpen = sidebarMedia.matches && document.body.classList.contains('dashboard-sidebar-open');
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        mobileToggle.setAttribute('aria-label', isOpen ? 'Close workspace menu' : 'Open workspace menu');
        if (mobileToggleIcon) {
            mobileToggleIcon.textContent = isOpen ? 'close' : 'menu';
        }
    }

    if (dashboardSidebar && mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            if (!sidebarMedia.matches) return;
            document.body.classList.toggle('dashboard-sidebar-open');
            syncDashboardSidebar();
        });

        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', function() {
                document.body.classList.remove('dashboard-sidebar-open');
                syncDashboardSidebar();
            });
        }

        dashboardSidebar.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (!sidebarMedia.matches) return;
                document.body.classList.remove('dashboard-sidebar-open');
                syncDashboardSidebar();
            });
        });

        dashboardSidebar.querySelectorAll('[data-theme-proxy]').forEach(function(button) {
            button.addEventListener('click', function() {
                if (themeControl) {
                    themeControl.click();
                }
            });
        });

        dashboardSidebar.querySelectorAll('[data-rtl-proxy]').forEach(function(button) {
            button.addEventListener('click', function() {
                if (rtlControl) {
                    rtlControl.click();
                }
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Escape') return;
            document.body.classList.remove('dashboard-sidebar-open');
            syncDashboardSidebar();
        });

        if (typeof sidebarMedia.addEventListener === 'function') {
            sidebarMedia.addEventListener('change', syncDashboardSidebar);
        } else if (typeof sidebarMedia.addListener === 'function') {
            sidebarMedia.addListener(syncDashboardSidebar);
        }
        syncDashboardSidebar();
    }

    // Admin: queue status toggles
    document.querySelectorAll('[data-status-toggle]').forEach(function(toggle) {
        toggle.addEventListener('change', function() {
            const pill = this.closest('.queue-row')?.querySelector('.queue-status');
            if (!pill) return;
            const packed = this.checked;
            pill.textContent = packed ? 'Packed' : 'Pending';
            pill.classList.remove('pill-warning', 'pill-info', 'pill-success');
            pill.classList.add(packed ? 'pill-success' : 'pill-warning');
        });
    });

    // User: delivery skip/pause/status
    const statusPill = document.getElementById('delivery-status');
    const skipBtn = document.getElementById('skip-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const subStatus = document.getElementById('subscription-status');
    const togglePause = document.getElementById('toggle-pause');

    function toggleDelivery() {
        if (!statusPill) return;
        const skipped = statusPill.textContent === 'Skipped';
        statusPill.textContent = skipped ? 'Confirmed' : 'Skipped';
        statusPill.classList.toggle('pill-warning', !skipped);
        statusPill.classList.toggle('pill-success', skipped);
    }

    function toggleSubscription() {
        if (!subStatus) return;
        const paused = subStatus.textContent === 'Paused';
        subStatus.textContent = paused ? 'Active' : 'Paused';
        subStatus.classList.toggle('pill-warning', !paused);
        subStatus.classList.toggle('pill-success', paused);
    }

    if (skipBtn) skipBtn.addEventListener('click', toggleDelivery);
    if (pauseBtn) pauseBtn.addEventListener('click', toggleSubscription);
    if (togglePause) togglePause.addEventListener('click', toggleSubscription);

    // User: add-ons
    document.querySelectorAll('[data-add-toggle]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const active = !btn.classList.contains('addon-active');
            btn.classList.toggle('addon-active', active);
            btn.textContent = active ? 'Added' : '+ Add';
        });
    });
});
