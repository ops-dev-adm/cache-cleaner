const core = require('@actions/core');
const axios = require('axios');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

(async () => {
    if(process.env.CLOUDFLARE_API_KEY) {
        const request = {
            url: 'https://api.cloudflare.com/client/v4/zones/3baa736ecb6024103e63346f0ab3712a/purge_cache', 
            method: 'POST',
            data: { purge_everything: true },
            headers: {
                'Authorization': 'Bearer ' + process.env.CLOUDFLARE_API_KEY,
                'Content-type': 'application/json'
            }
        };

        try {
            await axios(request)
            core.setOutput('CFlare Cache cleared')
        } catch (error) {
            core.setFailed(error.response.data);
        }
    } else {
        core.setOutput('Missing: CLOUDFLARE_API_KEY')
    }

    if(process.env.AWS_DISTRIBUTION_ID) {

        const cloudfront = new AWS.CloudFront({
            apiVersion: '2020-05-31',
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });

        const params = {
            DistributionId: process.env.AWS_DISTRIBUTION_ID,
            InvalidationBatch: { 
              CallerReference: uuidv4(), 
              Paths: { 
                Quantity: '1', 
                Items: [
                  '/*',
                ]
              }
            }
          };

        cloudfront.createInvalidation(params, function (err, data) {
            if (err) {
                core.setFailed(err);
            }
            core.setOutput('CFront Cache cleared')
        });
    } else {
        core.setOutput('Missing: AWS_DISTRIBUTION_ID')
    }

    if(process.env.SLACK_DEPLOYMENT_HOOK) {
        const request = {
            url: 'https://hooks.slack.com/services/'+process.env.SLACK_DEPLOYMENT_HOOK, 
            method: 'POST',
            data: { text: 'New deployment at ' + new Date().toISOString() + ' on 4fo.app'},
            headers: {
                'Content-type': 'application/json'
            }
        };

        try {
            await axios(request)
            core.setOutput('Slack message sent')
        } catch (error) {
            core.setFailed(error.response.data);
        }
    } else {
        core.setOutput('Missing: SLACK_DEPLOYMENT_HOOK')
    }

})()