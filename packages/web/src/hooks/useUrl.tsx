import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  decodeUrlParams,
  encodeUrlParams,
  PARAM_CONFIG,
  type urlParamValue,
} from '@/helpers/url';

export function useValidateUrlParams(allowedParams: string[]) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const allowedShortParams = allowedParams
    .map((param) => PARAM_CONFIG[param].short)
    .filter(Boolean);
  const allowedShortParamsRef = useRef(allowedShortParams);
  allowedShortParamsRef.current = allowedShortParams;

  useEffect(() => {
    const newParams = new URLSearchParams();
    let hasInvalidParam = false;

    searchParams.forEach((value, key) => {
      if (allowedShortParamsRef.current.includes(key)) {
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

export function useUrlParams(localParams: { [name: string]: any } = {}) {
  const [searchParams] = useSearchParams();
  const urlParams = decodeUrlParams(searchParams.toString());
  const mergedParams = { ...urlParams, ...localParams };

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const updateUrlParams = (
    params: Record<string, urlParamValue>,
    isMerge: boolean = true
  ) => {
    const newParams = encodeUrlParams(params, isMerge);
    navigate(`${pathname}?${newParams.toString()}`);
  };

  return [mergedParams, updateUrlParams] as const;
}
