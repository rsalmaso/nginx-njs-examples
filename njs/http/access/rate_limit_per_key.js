const LIMIT = 5;
const WINDOW_MS = 10000;

function rate_limit(r) {
    let m = (r.headersIn.Authorization || '').match(/^Bearer (\S+)/);
    if (!m) {
        r.return(401, "missing bearer token\n");
        return;
    }

    let n = ngx.shared.quota.incr(m[1], 1, 0, WINDOW_MS);

    if (n > LIMIT) {
        r.headersOut['Retry-After'] = Math.ceil(WINDOW_MS / 1000);
        r.return(429, `rate limit exceeded (${n}/${LIMIT})\n`);
    }
}

function whoami(r) {
    let token = r.headersIn.Authorization.match(/^Bearer (\S+)/)[1];
    r.return(200, `welcome ${token}\n`);
}

export default {rate_limit, whoami}
