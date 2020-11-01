export function debounce(fn, timeInMs) {
    let handle;
    return () => {
        handle && clearTimeout(handle);
        handle = setTimeout(fn, timeInMs);
    }
}
