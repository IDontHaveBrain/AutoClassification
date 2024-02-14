const URLS = {
    AUTH: {
        LOGIN: '/token',
    },
    API: {
        SSE: {
            SUBSCRIBE: '/sse/subscribe',
            HEARTBEAT: '/sse/ok',
        },
        MEMBER: {
            GET: '/member',
            POST: '/member',
            PUT: '/member',
            DELETE: '/member',
        },
    },
}

export default URLS;