export const initMetronic = (language: 'en' | 'ar') => {
    // 1. KTMenu – all [data-kt-menu="true"]
    document.querySelectorAll('[data-kt-menu="true"]').forEach((el, i) => {
        if (!window.KTMenu) return;
        const id = el.id || `kt_menu_${i}_${Date.now()}`;
        if (!el.id) el.id = id;
        try {
            window.KTMenu.createInstances(`#${id}`);
        } catch (e) {
            console.warn('KTMenu init failed for', id, e);
        }
    });

    // 2. KTDrawer – aside
    const aside = document.getElementById('kt_aside');
    if (aside && window.KTDrawer) {
        try {
            const drawer = window.KTDrawer.getInstance(aside) ||
                new window.KTDrawer(aside, {
                    overlay: true,
                    direction: language === 'ar' ? 'end' : 'start',
                    permanent: false,
                });

            const toggle = document.getElementById('kt_aside_mobile_toggle');
            toggle?.addEventListener('click', () => drawer.toggle());
        } catch (e) {
            console.warn('KTDrawer init failed', e);
        }
    }

    // 3. Header menu drawer
    const headerMenu = document.querySelector('[data-kt-drawer-name="header-menu"]');
    if (headerMenu && window.KTDrawer) {
        try {
            const drawer = window.KTDrawer.getInstance(headerMenu) ||
                new window.KTDrawer(headerMenu);
            const toggle = document.getElementById('kt_header_menu_mobile_toggle');
            toggle?.addEventListener('click', () => drawer.toggle());
        } catch (e) {
            console.warn('Header menu drawer init failed', e);
        }
    }
};