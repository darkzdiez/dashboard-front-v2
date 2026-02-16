const parseJsonSafe = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
};

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

const clearErrorsState = (errors) => {
    if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
        Object.keys(errors).forEach((key) => {
            errors[key].splice(0, errors[key].length);
        });
    }
};

const getMetaContent = (name, fallback = '0') => {
    const node = document.head.querySelector(`meta[name="${name}"]`);
    return node ? node.content : fallback;
};

const updateAppFlags = (headers, globalState) => {
    if (!globalState) {
        return;
    }
    globalState.useOrganizationModule =
        headers.get('x-app-use-organization-module') === '1';

    const organizationModuleName = headers.get(
        'x-app-organization-module-name'
    );
    if (organizationModuleName) {
        globalState.organizationModuleName = organizationModuleName;
    }

    globalState.useSocialLogin = headers.get('x-app-use-social-login') === '1';
    globalState.groupsShowParent =
        headers.get('x-app-groups-show-parent') === '1';
    globalState.groupsAlertAndNotifications =
        headers.get('x-app-groups-alert-and-notifications') === '1';
};

const maybeReloadOnVersionMismatch = (headers, globalState) => {
    if (!globalState) {
        return;
    }
    const appVersion = headers.get('x-app-version');
    if (appVersion !== globalState.real_version) {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

const createHttpRequest = ({ router, globalState, awesomeModal }) => {
    return async ({
        url,
        method = 'GET',
        data,
        errors,
        displayModalErrors = true,
        clearErrors = true,
    }) => {
        if (clearErrors) {
            clearErrorsState(errors);
        }

        const response = await fetch(url, {
            method: method,
            body: data,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        updateAppFlags(response.headers, globalState);
        maybeReloadOnVersionMismatch(response.headers, globalState);

        const bodyData = await parseJsonSafe(response);
        const isLoginRequest =
            typeof url === 'string' && url.includes('/api/login');

        if (response.ok) {
            return bodyData;
        }

        if (response.status === 401) {
            if (!isLoginRequest) {
                router.push('/login');
            }
            throw normalizeErrorPayload(bodyData, 'Ocurrió un error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.');
        }

        if (response.status === 405) {
            awesomeModal.error(
                'Error',
                `
                <p>Ha ocurrido un error 405: Metodo no permitido.</p>
                <p>${bodyData?.message || ''}</p>
            `
            );
            throw bodyData;
        }

        if (response.status === 413) {
            const maxFileSize = getMetaContent('max-file-size');
            awesomeModal.error(
                'Error',
                `
                <p>Ha ocurrido un error 413: Contenido demasiado grande.</p>
                <p>Su archivo es demasiado grande, el tamaño máximo permitido es de ${maxFileSize}.</p>
            `
            );
            throw null;
        }

        if (response.status === 422) {
            const maxFileSize = getMetaContent('max-file-size');
            if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
                Object.assign(errors, bodyData?.errors || {});
            }
            
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
                window.awesomeModal.error(
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
                awesomeModal.error(
                    'Error',
                    `
                    <p>El formulario contiene un archivo demasiado grande.</p>
                    <p>El tamaño máximo permitido es de ${maxFileSize}.</p>
                `
                );
            }
            throw bodyData;
        }

        if (response.status === 500) {
            if (displayModalErrors) {
                awesomeModal.error(
                    'Error',
                    `
                    <p>Ha ocurrido un error inesperado.</p>
                    <p>${bodyData?.message || ''}</p>
                `
                );
            }
            throw bodyData;
        }

        throw bodyData || response;
    };
};

export { createHttpRequest };
