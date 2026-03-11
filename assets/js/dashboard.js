/**
 * Dashboard interactions for admin and user dashboards.
 * Restores packing toggles, delivery skips/pauses, and add-on buttons.
 */
document.addEventListener('DOMContentLoaded', function() {
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
