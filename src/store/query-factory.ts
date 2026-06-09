import { queryOptions } from '@tanstack/react-query';
import { type AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { invalidateQuery } from '@/store/query-client';
import { axios } from '@/utils/axios-instance';
import { type ZodType } from 'zod';

// ── Shared option shape ────────────────────────────────────────────────────────
interface QueryHandlerOptions<T> {
    onSuccess?: (data: T) => T | Promise<T>;
    onError?: (error: unknown) => void;
    urlManipulation?: (url: string) => string;
}

// Generic QueryFactory (TModel = response type, TFilters = filters type, TPayload = mutation input)
export function QueryFactory<TModel, TFilters = unknown, TPayload = Partial<TModel>>(
    model: string,
    schemas: {
        single: ZodType<TModel>;
        list: ZodType<TModel[]>;
        filters?: ZodType<TFilters>;
        payload?: ZodType<TPayload>;
    },
    baseUrl = `/api/${model}`,
) {
    // ── URL / key helpers (plain functions, no self-reference) ────────────────
    const qk = () => [model];
    const lists = (filters?: TFilters) => [...qk(), 'list', filters];
    const createUrl = (id?: number | string) => `${baseUrl}${id !== undefined ? `/${id}` : ''}`;

    // ── Axios method dispatcher (avoids indexing the full AxiosInstance) ───────
    const dispatch = (
        method: 'get' | 'post' | 'put' | 'patch' | 'delete',
        url: string,
        body?: unknown,
        config?: AxiosRequestConfig,
    ) => {
        switch (method) {
            case 'get': return axios.get(url, config);
            case 'post': return axios.post(url, body, config);
            case 'put': return axios.put(url, body, config);
            case 'patch': return axios.patch(url, body, config);
            case 'delete': return axios.delete(url, config);
        }
    };

    const qObject = {
        baseUrl,
        schemas,
        qk,
        lists,

        // ── List query ────────────────────────────────────────────────────────
        list(options?: QueryHandlerOptions<TModel[]>) {
            const action: Required<QueryHandlerOptions<TModel[]>> = {
                onSuccess: (data) => data,
                onError: (error) => console.error(error),
                urlManipulation: (url) => url,
                ...options,
            };

            return (filters?: TFilters) => {
                const validatedFilters = schemas.filters?.parse(filters) ?? filters;
                const url = action.urlManipulation(createUrl());

                return queryOptions({
                    queryKey: lists(validatedFilters),
                    queryFn: async () => {
                        try {
                            const res = await axios.get(url, { params: validatedFilters });
                            return action.onSuccess(schemas.list.parse(res.data));
                        } catch (error) {
                            action.onError(error);
                            throw error;
                        }
                    },
                });
            };
        },

        // ── Custom list query (for paginated or non-array list shapes) ─────
        customList<TResponse>(options: {
            responseSchema: ZodType<TResponse>;
            urlSuffix?: string;
            queryKeySuffix?: string;
            filtersSchema?: ZodType<TFilters>;
            requestConfig?: AxiosRequestConfig;
            onSuccess?: (data: TResponse) => TResponse | Promise<TResponse>;
            onError?: (error: unknown) => void;
            urlManipulation?: (url: string) => string;
        }) {
            const {
                responseSchema,
                urlSuffix = '',
                queryKeySuffix = 'custom-list',
                filtersSchema,
                requestConfig,
                onSuccess = (data) => data,
                onError = (error) => console.error(error),
                urlManipulation = (url) => url,
            } = options;

            return (filters?: TFilters) => {
                const validatedFilters = filtersSchema
                    ? filtersSchema.parse(filters)
                    : schemas.filters?.parse(filters) ?? filters;
                const url = urlManipulation(`${createUrl()}${urlSuffix}`);

                return queryOptions({
                    queryKey: [...qk(), queryKeySuffix, validatedFilters],
                    queryFn: async () => {
                        try {
                            const res = await axios.get(url, { params: validatedFilters, ...requestConfig });
                            return onSuccess(responseSchema.parse(res.data));
                        } catch (error) {
                            onError(error);
                            throw error;
                        }
                    },
                });
            };
        },

        // ── Custom parameterized query (dynamic path segment, any response shape) ──
        customQuery<TResponse, TParam = number | string>(options: {
            responseSchema: ZodType<TResponse>;
            urlSuffix: (param: TParam) => string;
            queryKeySuffix: (param: TParam) => unknown[];
            requestConfig?: AxiosRequestConfig;
            onSuccess?: (data: TResponse) => TResponse | Promise<TResponse>;
            onError?: (error: unknown) => void;
        }) {
            const {
                responseSchema,
                urlSuffix,
                queryKeySuffix,
                requestConfig,
                onSuccess = (data) => data,
                onError = (error: unknown) => console.error(error),
            } = options;

            return (param: TParam, config?: { enabled?: boolean }) =>
                queryOptions({
                    queryKey: [...qk(), ...queryKeySuffix(param)],
                    queryFn: async () => {
                        try {
                            const res = await axios.get(`${baseUrl}${urlSuffix(param)}`, requestConfig);
                            return onSuccess(responseSchema.parse(res.data));
                        } catch (error) {
                            onError(error);
                            throw error;
                        }
                    },
                    enabled: config?.enabled ?? true,
                });
        },

        // ── SSE stream helper (returns url builder only — no React Query state) ──
        customStream<TParam = number>(options: {
            urlSuffix: (param: TParam) => string;
        }) {
            return {
                url: (param: TParam) => `${baseUrl}${options.urlSuffix(param)}`,
            };
        },

        // ── Custom mutation (arbitrary URL/method, still uses schema + toast) ──
        customMutation<TInput = TPayload>(options: {
            method?: 'post' | 'get' | 'put' | 'patch' | 'delete';
            urlSuffix: string | ((input: TInput) => string);   // e.g. '/login', '/refresh'
            responseSchema?: ZodType<TModel>;                 // defaults to schemas.single
            inputSchema?: ZodType<TInput>;                    // optional input validation
            requestConfig?: AxiosRequestConfig;
            toastMsg?: string;
            onSuccess?: (data: TModel, input: TInput) => void;
            invalidateKeys?: (data: TModel, input: TInput) => unknown[][];
        }) {
            const {
                method = 'post',
                urlSuffix,
                responseSchema = schemas.single,
                inputSchema,
                requestConfig,
                toastMsg,
                onSuccess = () => { },
                invalidateKeys,
            } = options;

            return {
                mutationFn: async (input: TInput) => {
                    const validatedInput = inputSchema ? inputSchema.parse(input) : input;
                    const resolvedUrlSuffix = typeof urlSuffix === 'function'
                        ? urlSuffix(validatedInput)
                        : urlSuffix;
                    const res = await dispatch(method, `${baseUrl}${resolvedUrlSuffix}`, validatedInput, requestConfig);
                    return responseSchema.parse(res.data);
                },
                onSuccess: (data: TModel, variables: TInput) => {
                    if (toastMsg) toast.success(toastMsg);

                    const keysToInvalidate = invalidateKeys?.(data, variables);
                    if (keysToInvalidate && keysToInvalidate.length > 0) {
                        invalidateQuery(...keysToInvalidate);
                    }

                    onSuccess(data, variables);
                },
            };
        },

    };

    return qObject;
}
