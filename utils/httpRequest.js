// Lee el body una sola vez para poder:
// - parsear JSON cuando corresponde
// - conservar HTML / texto crudo para previsualizar dumps tipo dd()
const readResponsePayload = async (response) => {
    const rawText = await response.text();
    const trimmedText = rawText.trim();
    const contentType = `${response.headers.get('content-type') || ''}`.toLowerCase();

    if (trimmedText === '') {
        return {
            bodyData: null,
            rawText,
        };
    }

    const looksLikeJson =
        contentType.includes('application/json') ||
        contentType.includes('+json') ||
        /^[\[{]/.test(trimmedText);

    if (!looksLikeJson) {
        return {
            bodyData: null,
            rawText,
        };
    }

    try {
        return {
            bodyData: JSON.parse(rawText),
            rawText,
        };
    } catch (error) {
        return {
            bodyData: null,
            rawText,
        };
    }
};

// Normaliza la estructura mínima del error para que el caller siempre reciba
// un objeto consistente (status + message), incluso si el backend respondió
// con un shape inesperado.
const normalizeErrorPayload = (data, fallbackMessage) => {
    if (!data || typeof data !== 'object') {
        return {
            status: 'error',
            message: fallbackMessage,
        };
    }
    if (!data.status) {
        data.status = 'error';
    }
    if (!data.message) {
        data.message = fallbackMessage;
    }
    return data;
};

// Limpia todos los arrays del objeto de errores reactivo antes de enviar un
// formulario. Se usa splice para mantener la referencia reactiva de Vue.
const clearErrorsState = (errors) => {
    if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
        Object.keys(errors).forEach((key) => {
            errors[key].splice(0, errors[key].length);
        });
    }
};

// Lee valores de meta tags del documento (por ejemplo límites de upload)
// usando fallback para no romper si el meta no existe.
const getMetaContent = (name, fallback = '0') => {
    const node = document.head.querySelector(`meta[name="${name}"]`);
    return node ? node.content : fallback;
};

// Convierte un header del tipo x-app-algo-configurable a camelCase
// (algoConfigurable) para mapearlo automáticamente en globalState.
const toCamelCaseFromXAppHeader = (headerName) => {
    return headerName
        .replace(/^x-app-/, '')
        .split('-')
        .filter(Boolean)
        .map((segment, index) => {
            if (index === 0) {
                return segment;
            }

            return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join('');
};

// Parsea valores de headers x-app-* de forma genérica:
// - "true"/"false" => boolean
// - números enteros/decimales => number
// - resto => string
// Esto permite que cada proyecto publique flags sin tocar este archivo.
const parseXAppHeaderValue = (value) => {
    const trimmedValue = `${value}`.trim();

    if (trimmedValue === '') {
        return '';
    }

    const lowerValue = trimmedValue.toLowerCase();
    if (lowerValue === 'true') {
        return true;
    }
    if (lowerValue === 'false') {
        return false;
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
        return Number(trimmedValue);
    }

    return trimmedValue;
};

const shouldResolveAgainstBackend = (url) => {
    if (typeof url !== 'string') {
        return false;
    }

    if (/^(?:[a-z]+:)?\/\//i.test(url)) {
        return false;
    }

    return /^(?:\/)?(?:api|auth|docs|storage|health)(?:\/|$)/i.test(
        url.trim()
    );
};

const resolveRequestUrl = (url) => {
    if (!shouldResolveAgainstBackend(url)) {
        return url;
    }

    if (typeof window?.apiUrl === 'function') {
        return window.apiUrl(url);
    }

    const backendBaseUrl = (
        window?.public_path || window?.location?.origin || ''
    ).replace(/\/$/, '');

    return new URL(String(url || ''), `${backendBaseUrl}/`).toString();
};

const isLaravelDebugDumpResponse = (response, rawText) => {
    if (!rawText || typeof rawText !== 'string') {
        return false;
    }

    const contentType = `${response.headers.get('content-type') || ''}`.toLowerCase();
    if (!contentType.includes('text/html')) {
        return false;
    }

    const normalizedText = rawText.toLowerCase();

    return (
        normalizedText.includes('sfdump = window.sfdump') ||
        normalizedText.includes('sf-dump') ||
        normalizedText.includes('symfony var dumper')
    );
};

const extractDebugDumpPreviewText = (rawText) => {
    if (!rawText || typeof DOMParser === 'undefined') {
        return rawText;
    }

    try {
        const documentPreview = new DOMParser().parseFromString(
            rawText,
            'text/html'
        );

        const dumpNode =
            documentPreview.querySelector('pre.sf-dump') ||
            documentPreview.body;

        return dumpNode?.textContent?.trim() || rawText;
    } catch (error) {
        return rawText;
    }
};

const openDebugDumpPreview = ({
    modalApi,
    requestUrl,
    response,
    rawText,
}) => {
    const previewText = extractDebugDumpPreviewText(rawText);

    console.groupCollapsed(
        `[httpRequest] Laravel dd() detectado · ${response.status} ${requestUrl}`
    );
    console.log(previewText);
    if (previewText !== rawText) {
        console.debug(rawText);
    }
    console.groupEnd();

    if (typeof modalApi?.debugDump === 'function') {
        modalApi.debugDump({
            title: 'Se detectó un dd() en el backend',
            html: rawText,
            text: rawText,
            requestUrl,
            status: response.status,
        });
        return;
    }

    modalApi.alert(
        'Se detectó un dd() en el backend',
        `<pre style="max-height:65vh;overflow:auto;text-align:left;white-space:pre-wrap;">${rawText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>`
    );
};

// Sincroniza headers x-app-* en globalState de manera totalmente dinámica.
// Además de exponerlos en la raíz (globalState.miFlag), deja un espejo en
// globalState.appHeaders para consumo centralizado y debugging.
const updateAppFlags = (headers, globalState) => {
    if (!globalState) {
        return;
    }

    if (!globalState.appHeaders || typeof globalState.appHeaders !== 'object') {
        globalState.appHeaders = {};
    }

    headers.forEach((headerValue, headerName) => {
        const normalizedHeaderName = `${headerName}`.toLowerCase();

        // Solo procesamos headers del namespace de aplicación.
        if (!normalizedHeaderName.startsWith('x-app-')) {
            return;
        }

        const globalStateKey = toCamelCaseFromXAppHeader(normalizedHeaderName);
        if (!globalStateKey) {
            return;
        }

        const parsedValue = parseXAppHeaderValue(headerValue);

        // Doble escritura intencional:
        // - globalState[clave] para compatibilidad con código existente
        // - globalState.appHeaders[clave] para consumo ordenado por dominio
        globalState[globalStateKey] = parsedValue;
        globalState.appHeaders[globalStateKey] = parsedValue;
    });
};

    // Control de versión de frontend: si el backend informa una versión distinta
    // a la cargada en el cliente, se fuerza reload para evitar estado inconsistente
    // entre assets viejos y API nueva.
const maybeReloadOnVersionMismatch = (headers, globalState) => {
    if (!globalState) {
        return;
    }
    if (globalState.disableVersionMismatchReload === true) {
        return;
    }
    const appVersion = headers.get('x-app-version');
    if (!appVersion || !globalState.real_version) {
        return;
    }
    if (appVersion !== globalState.real_version) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

// Factory del wrapper HTTP global. Se inyecta router/globalState/awesomeModal
// para mantener este módulo desacoplado de implementaciones concretas.
const createHttpRequest = ({ router, globalState, awesomeModal }) => {
    return async ({
        url,
        method = 'GET',
        data,
        errors,
        headers = {},
        skipAuth = false,
        redirectOnUnauthorized = true,
        displayModalErrors = true,
        clearErrors = true,
    }) => {
        const modalApi =
            window.awesomeModal ||
            awesomeModal || {
                error: () => {},
            };
        // Por defecto limpiamos errores previos para evitar confusión visual.
        if (clearErrors) {
            clearErrorsState(errors);
        }

        const accessToken =
            globalState?.auth?.accessToken ||
            globalState?.auth?.access_token ||
            globalState?.auth?.token ||
            null;
        const requestHeaders = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...headers,
        };
        const requestUrl = resolveRequestUrl(url);

        if (!skipAuth && accessToken && !requestHeaders.Authorization) {
            requestHeaders.Authorization = `Bearer ${accessToken}`;
        }

        // Request base:
        // - no forzamos Content-Type para no romper FormData
        // - enviamos X-Requested-With para diferenciar requests AJAX en backend
        const response = await fetch(requestUrl, {
            method: method,
            body: data,
            headers: requestHeaders,
        });

        // 1) Actualizamos flags de app desde headers x-app-*
        // 2) Evaluamos versión para posible hard refresh
        updateAppFlags(response.headers, globalState);
        maybeReloadOnVersionMismatch(response.headers, globalState);

        const { bodyData, rawText } = await readResponsePayload(response);
        const isLoginRequest =
            typeof requestUrl === 'string' &&
            (requestUrl.includes('/api/login') ||
                requestUrl.includes('/api/auth/login'));

        if (isLaravelDebugDumpResponse(response, rawText)) {
            openDebugDumpPreview({
                modalApi,
                requestUrl,
                response,
                rawText,
            });

            throw {
                status: 'debug_dump',
                message: 'Se detectó un dd() en el backend.',
                responseStatus: response.status,
                requestUrl,
                rawText,
            };
        }

        // Camino feliz: delegamos el body parseado al caller.
        if (response.ok) {
            return bodyData ?? rawText;
        }

        // 401: sesión vencida/no autorizada. Si no es login, redirige a login.
        if (response.status === 401) {
            if (typeof globalState?.onUnauthorized === 'function') {
                await globalState.onUnauthorized();
            }

            if (!isLoginRequest && redirectOnUnauthorized) {
                router.push('/login');
            }
            throw normalizeErrorPayload(bodyData, 'Ocurrió un error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.');
        }

        // 405: método no permitido (normalmente mismatch frontend/backend).
        if (response.status === 405) {
            modalApi.error(
                'Error',
                `
                <p>Ha ocurrido un error 405: Metodo no permitido.</p>
                <p>${bodyData?.message || ''}</p>
            `
            );
            throw bodyData;
        }

        // 413: payload demasiado grande (típico de uploads).
        if (response.status === 413) {
            const maxFileSize = getMetaContent('max-file-size');
            modalApi.error(
                'Error',
                `
                <p>Ha ocurrido un error 413: Contenido demasiado grande.</p>
                <p>Su archivo es demasiado grande, el tamaño máximo permitido es de ${maxFileSize}.</p>
            `
            );
            throw null;
        }

        // 422: validaciones de negocio/formulario.
        // Si hay objeto errors reactivo, lo hidratamos para mostrar mensajes
        // por campo en componentes de input.
        if (response.status === 422) {
            const maxFileSize = getMetaContent('max-file-size');
            if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
                Object.assign(errors, bodyData?.errors || {});
            }
            
            // Modal opcional con resumen de errores para feedback rápido.
            if (displayModalErrors) {
                const errorsMarkup = Object.keys(bodyData?.errors || {})
                    .map((key) => {
                        return (bodyData.errors[key] || [])
                            .map((error) => {
                                return `<li class="mb-2" style="text-align: left; color: #F00;">${error}</li>`;
                            })
                            .join('');
                    })
                    .join('');
                // console.log(['aqui', response.status, displayModalErrors, bodyData?.errors, errorsMarkup])
                modalApi.error(
                    'Tiene errores en el formulario',
                    `
                    ${
                        '<ul style="border: 1px solid #F00; padding-top: 15px; padding-bottom: 15px; background-color: #ffb6b61f;">' +
                        errorsMarkup +
                        '</ul>'
                    }
                `
                );
            }

            // Caso puntual histórico: error interno de finfo_file cuando
            // llega un archivo inválido/grande. Mantenemos detección para
            // entregar un mensaje más entendible para el usuario final.
            let hasFileTooLarge = false;
            Object.keys(bodyData?.errors || {}).forEach((key) => {
                if (Array.isArray(bodyData.errors[key])) {
                    bodyData.errors[key].forEach((error) => {
                        if (
                            error.includes(
                                'finfo_file(): Argument #1 ($finfo) cannot be empty'
                            )
                        ) {
                            hasFileTooLarge = true;
                        }
                    });
                }
            });

            if (hasFileTooLarge) {
                modalApi.error(
                    'Error',
                    `
                    <p>El formulario contiene un archivo demasiado grande.</p>
                    <p>El tamaño máximo permitido es de ${maxFileSize}.</p>
                `
                );
            }
            throw bodyData;
        }

        // 500: error inesperado de servidor.
        if (response.status === 500) {
            if (displayModalErrors) {
                modalApi.error(
                    'Error',
                    `
                    <p>Ha ocurrido un error inesperado.</p>
                    <p>${bodyData?.message || ''}</p>
                `
                );
            }
            throw bodyData;
        }

        // Fallback para cualquier otro status no contemplado explícitamente.
        throw bodyData || response;
    };
};

export { createHttpRequest };
