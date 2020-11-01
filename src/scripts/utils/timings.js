const handleMap = new WeakMap();

export function debounce(obj, functionName, timeInMs) {
    const fn = obj[functionName];
    const handle = handleMap.get(fn);
    handle && clearTimeout(handle);
    handleMap.set(fn, setTimeout(() => fn.call(obj), timeInMs));
}
