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
      SEARCH: '/member/search',
    },
    NOTICE: {
      GET: '/notice',
      POST: '/notice',
      PUT: '/notice',
      DELETE: '/notice',
    },
    FREETEST: {
      GET: '/train/test',
      POST: '/train/test/upload',
    },
    TRAIN: {
      LABEL: '/train/label',
      GET: '/train',
      POST: '/train',
    },
    WORKSPACE: {
      MYLIST: '/workspace/my',
      GET: '/workspace',
      POST: '/workspace',
      PUT: '/workspace',
      DELETE: '/workspace',
    },
  },
};

export default URLS;
