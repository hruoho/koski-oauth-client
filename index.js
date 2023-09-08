import { Issuer } from 'openid-client';
import { generators } from 'openid-client';

import express from 'express'
const app = express()

const issuer = await Issuer.discover('http://localhost:3000');

console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);

const client = new issuer.Client({
    client_id: 'zELcpfANLqY7Oqas',
    client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
    redirect_uris: ['http://localhost:3001/cb'],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
});

app.get('/auth', async (req, res) => {
    res.redirect(
        client.authorçizationUrl({
            scope: 'openid email profile',
            code_challenge,
            code_challenge_method: 'S256',
        })
    );
})

app.get('/cb', async (req, res) => {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback('http://localhost:3001/cb', params, { code_verifier });
    console.log('received and validated tokens %j', tokenSet);
    console.log('validated ID Token claims %j', tokenSet.claims());

    const userinfo = await client.userinfo(tokenSet.access_token);
    console.log('userinfo %j', userinfo);

    res.send(`Hello there, ${userinfo.sub}!`)
})

app.listen(3001)
