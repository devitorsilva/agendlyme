// Mock para use-latest-callback que está causando problemas no React Native
// Este arquivo substitui a dependência use-latest-callback quando o app roda no React Native

import { useCallback, useRef } from "react";

const useLatestCallback = (callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

export default useLatestCallback;
