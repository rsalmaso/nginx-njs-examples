import crypto from 'crypto';

async function authorize(r) {
    let signature = r.headersIn.Signature;

    if (!signature) {
        r.return(401, "No signature\n");
        return;
    }

    let h = crypto.createHmac('sha1', process.env.SECRET_KEY);
    h.update(r.uri);

    switch (r.method) {
    case 'GET':
        h.update(r.variables.args || "");
        break;

    case 'POST':
        if (r.headersIn['Content-Type'] != 'application/x-www-form-urlencoded') {
            r.return(401, "Unsupported content type\n");
            return;
        }

        h.update(await r.readRequestText());
        break;

    default:
        r.return(401, "Unsupported method\n");
        return;
    }

    let req_sig = h.digest("base64");

    if (req_sig != signature) {
        r.return(401, `Invalid signature: ${req_sig}\n`);
        return;
    }
}

async function echo_body(r) {
    let body = (r.method === 'POST') ? await r.readRequestText() : '';
    r.return(200, `BACKEND:${r.method}:${r.variables.request_uri}:${body}\n`);
}

export default {authorize, echo_body}
