export function useMobileNavigation() {
    const cleanup = () => {
        // Remove pointer-events style from body...
        document.body.style.removeProperty('pointer-events');
    };

    return cleanup;
}
