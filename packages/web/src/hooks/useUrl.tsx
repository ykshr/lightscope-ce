import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { decodeUrlParams, encodeUrlParams, PARAM_CONFIG, type urlParamValue } from '@/helpers/url';

export function useValidateUrlParams(allowedParams: string[]) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Precompute Set to achieve O(1) lookup time inside the iteration loop,
  // and use single-pass reduce to avoid intermediate array allocations from .map().filter()
  const allowedShortParamsSet = allowedParams.reduce((acc, param) => {
    const short = PARAM_CONFIG[param]?.short;
    if (short) acc.add(short);
    return acc;
  }, new Set<string>());

  const allowedShortParamsRef = useRef(allowedShortParamsSet);
  allowedShortParamsRef.current = allowedShortParamsSet;

  useEffect(() => {
    const newParams = new URLSearchParams();
    let hasInvalidParam = false;

    searchParams.forEach((value, key) => {
      // Use Set.has() instead of Array.prototype.includes() for O(1) lookup
      if (allowedShortParamsRef.current.has(key)) {
        newParams.append(key, value);
      } else {
        hasInvalidParam = true;
      }
    });

    if (hasInvalidParam) {
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);
}

export function useUrlParams(localParams: Record<string, unknown> = {}) {
  const [searchParams] = useSearchParams();
  const urlParams = decodeUrlParams(searchParams.toString());
  const mergedParams = { ...urlParams, ...localParams };

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const updateUrlParams = (params: Record<string, urlParamValue>, isMerge: boolean = true) => {
    const newParams = encodeUrlParams(params, isMerge);
    navigate(`${pathname}?${newParams.toString()}`);
  };

  return [mergedParams, updateUrlParams] as const;
}
