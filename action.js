const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

(async () => {
    try {
        const response = await axios({
            url: 'https://api.cloudflare.com/client/v4/zones/3baa736ecb6024103e63346f0ab3712a/purge_cache', 
            method: 'POST',
            data: { purge_everything: true },
            headers: {
                'Authorization': 'Bearer ' + process.env.CLOUDFLARE_SECRET_KEY,
                'Content-type': 'application/json'
            }
        })
        console.log(`Cache cleared`);
      } catch (error) {
        core.setFailed(error.response.data);
      }
})()