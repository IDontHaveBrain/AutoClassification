const URLS = {
  AUTH: {
    LOGIN: "/token",
  },
  API: {
    SSE: {
      SUBSCRIBE: "/sse/subscribe",
      HEARTBEAT: "/sse/ok",
    },
    MEMBER: {
      GET: "/member",
      POST: "/member",
      PUT: "/member",
      DELETE: "/member",
      SEARCH: "/member/search",
    },
    NOTICE: {
      GET: "/notice",
      POST: "/notice",
      PUT: "/notice",
      DELETE: "/notice",
    },
    TRAIN: {
      GET: "/train",
      POST: "/train/upload",
      DELETE: "/train",
    },
    WORKSPACE: {
      MYLIST: "/workspace/my",
      GET: "/workspace",
      POST: "/workspace",
      PUT: "/workspace",
      DELETE: "/workspace",
    },
  },
};

export default URLS;
