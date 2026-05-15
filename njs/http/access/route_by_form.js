const backends = {
    us: '127.0.0.1:8081',
    eu: '127.0.0.1:8082',
};

async function route(r) {
    let form = await r.readRequestForm({maxKeys: 16});

    if (form.hasFiles()) {
        r.return(403, "file uploads not allowed\n");
        return;
    }

    let region = form.get('region');
    let upstream = backends[region];

    if (!upstream) {
        r.return(400, `unknown region: ${region}\n`);
        return;
    }

    r.variables.upstream = upstream;
}

function echo(r) {
    r.return(200, `BACKEND ${r.variables.server_port}:${r.uri}\n`);
}

export default {route, echo}
