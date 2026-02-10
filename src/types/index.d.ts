declare interface Window {
    KTThemeMode: {
        init: () => void;
        getMode: () => 'light' | 'dark';
        setMode: (mode: 'light' | 'dark') => void;
        on: (event: string, callback: (mode: string) => void) => void;
    };
    KTComponents: {
        init: () => void;
        reinitialization: () => void;
    };

    KTMenu: {
        createInstances: (selector: string) => void;
        getInstance: (el: Element) => any;
        dispose: (el: Element) => void;
    };
    KTDrawer: {
        getInstance: (el: Element) => any;
        new(el: Element, options?: any): any;
    };
    KTSelect2: {
        createInstance: (selector: string, options?: any) => any;
    };
    KTComponents: {
        init: () => void;
        reinitialization: () => void;
    };

    switchRtl: (isRtl: boolean) => void;
}