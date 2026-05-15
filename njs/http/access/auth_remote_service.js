const IDP_LOGIN_URL = 'https://idp.example.com/login?rd=';

async function auth(r) {
    let token = r.args.token;

    if (!token) {
        r.return(302, IDP_LOGIN_URL + encodeURIComponent(r.variables.request_uri));
        return;
    }

    let reply = await ngx.fetch('http://127.0.0.1:8079/introspect',
                                {body: token});

    if (reply.status == 200) {
        r.variables.user = await reply.text();
        return;
    }

    if (reply.status == 401 || reply.status == 403) {
        r.return(reply.status, "Access denied\n");
        return;
    }

    r.return(502, "Auth service unavailable\n");
}

function introspect(r) {
    let users = { 't-alice': 'alice', 't-bob': 'bob' };
    let user = users[r.requestText];

    if (user) {
        r.return(200, user);
    } else {
        r.return(403);
    }
}

function whoami(r) {
    r.return(200, `Hello ${r.headersIn['X-User'] || 'anon'}\n`);
}

export default {auth, introspect, whoami}
