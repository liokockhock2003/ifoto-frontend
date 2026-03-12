// src/store/queryFactory.ts
import { queryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invalidateQuery } from '@/store/queryClient';
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
    const qk    = ()                  => [model];
    const lists  = (filters?: TFilters) => [...qk(), 'list', filters];
    const details = (id: number)        => [...qk(), 'detail', `${id}`];
    const createUrl = (id?: number)    => `${baseUrl}${id !== undefined ? `/${id}` : ''}`;

    // ── Axios method dispatcher (avoids indexing the full AxiosInstance) ───────
    const dispatch = (
        method: 'get' | 'post' | 'patch' | 'delete',
        url: string,
        body?: unknown,
    ) => {
        switch (method) {
            case 'get':    return axios.get(url);
            case 'post':   return axios.post(url, body);
            case 'patch':  return axios.patch(url, body);
            case 'delete': return axios.delete(url);
        }
    };

    const qObject = {
        baseUrl,
        schemas,
        qk,
        lists,
        details,
        createUrl,

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

        // ── Detail query ──────────────────────────────────────────────────────
        detail(id: number, options?: QueryHandlerOptions<TModel>) {
            const action: Required<QueryHandlerOptions<TModel>> = {
                onSuccess: (data) => data,
                onError: (error) => console.error(error),
                urlManipulation: () => createUrl(id),
                ...options,
            };

            return queryOptions({
                queryKey: details(id),
                queryFn: async () => {
                    try {
                        const res = await axios.get(action.urlManipulation(''));
                        return action.onSuccess(schemas.single.parse(res.data));
                    } catch (error) {
                        action.onError(error);
                        throw error;
                    }
                },
            });
        },

        // ── Custom mutation (arbitrary URL/method, still uses schema + toast) ──
        customMutation<TInput = TPayload>(options: {
            method?: 'post' | 'get' | 'patch' | 'delete';
            urlSuffix: string;                                  // e.g. '/login', '/refresh'
            responseSchema?: ZodType<TModel>;                 // defaults to schemas.single
            inputSchema?: ZodType<TInput>;                    // optional input validation
            toastMsg?: string;
            onSuccess?: (data: TModel) => void;
        }) {
            const {
                method = 'post',
                urlSuffix,
                responseSchema = schemas.single,
                inputSchema,
                toastMsg,
                onSuccess = () => {},
            } = options;

            return {
                mutationFn: async (input: TInput) => {
                    const validatedInput = inputSchema ? inputSchema.parse(input) : input;
                    const res = await dispatch(method, `${baseUrl}${urlSuffix}`, validatedInput);
                    return responseSchema.parse(res.data);
                },
                onSuccess: (data: TModel) => {
                    if (toastMsg) toast(toastMsg);
                    onSuccess(data);
                },
            };
        },

        // ── Mutation option ───────────────────────────────────────────────────
        mutationOption(_action: {
            type: 'create' | 'edit' | 'delete' | 'soft-delete';
            onSuccess?: (data: TModel) => void;
            urlManipulation?: (url: string) => string;
            toastMsg?: string | ((prevValue: TPayload) => string);
        }) {
            const {
                type,
                onSuccess = () => {},
                urlManipulation = (u: string) => u,
                toastMsg: description,
            } = _action;

            return {
                mutationFn: async (payload: TPayload) => {
                    const validatedPayload = schemas.payload?.parse(payload) ?? payload;
                    const { id, ...others } = validatedPayload as { id?: number } & Record<string, unknown>;

                    type MutationMethod = 'get' | 'post' | 'patch' | 'delete';
                    const [method, extendedUrl, body] = (
                        {
                            create:          ['post',   '',                         others    ],
                            edit:            ['patch',  `/${id ?? ''}`,             others    ],
                            delete:          ['delete', `/${id ?? ''}`,             undefined ],
                            'soft-delete':   ['patch',  `/${id ?? ''}/soft-delete`, undefined ],
                        } as Record<string, [MutationMethod, string, unknown]>
                    )[type];

                    const url = urlManipulation(`${baseUrl}${extendedUrl}`);
                    const res = await dispatch(method, url, body);
                    return schemas.single.parse(res.data);
                },

                onSuccess: async (data: TModel, variables: TPayload) => {
                    const toastDescription =
                        typeof description === 'string'
                            ? description
                            : typeof description === 'function'
                                ? description(variables)
                                : ({ create: 'Created', edit: 'Updated', delete: 'Deleted', 'soft-delete': 'Archived' })[type];

                    toast(toastDescription);
                    onSuccess(data);
                    invalidateQuery(lists(), details((data as { id?: number }).id ?? 0));
                },
            };
        },
    };

    return qObject;
}
