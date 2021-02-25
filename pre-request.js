// Pre-request Postman script for sending Azure Service Bus REST requests using a SharedAccessKey

// You must set in Postman SharedAccessKey and SharedAccessKeyName variables
const sharedAccessKey = pm.getEnvironmentVariable("SharedAccessKey");
const sharedAccessKeyName = pm.getEnvironmentVariable("SharedAccessKeyName");

let url = request.url;

while(url.indexOf('{{') >= 0) {
    var variableName = url.substring(url.indexOf('{{')+2, url.indexOf('}}'));
    var variableValue = postman.getEnvironmentVariable(variableName);
    url = url.replace('{{'+variableName+'}}', variableValue);
}

const token = createSharedAccessToken(url, sharedAccessKeyName, sharedAccessKey);

pm.request.headers.add({key: 'Authorization', value: token }) 

// from https://gist.github.com/gabrieljoelc/eedf956842966c41d47322f5b9e2a121
function createSharedAccessToken(uri, saName, saKey) {
    if (!uri || !saName || !saKey) {
        throw "Missing required parameter";
    }
  
    var encoded = encodeURIComponent(uri);
    var now = new Date();
    var week = 60*60*24*7;
    var ttl = Math.round(now.getTime() / 1000) + week;
    var signature = encoded + '\n' + ttl;
    // hack to make signature utf8 encoded
    var signatureUTF8 = JSON.parse(JSON.stringify(signature));
    var hash = CryptoJS.HmacSHA256(signatureUTF8, saKey);
    var base64HashValue = CryptoJS.enc.Base64.stringify(hash);
  
    return 'SharedAccessSignature sr=' + encoded + '&sig=' +
        encodeURIComponent(base64HashValue) + '&se=' + ttl + '&skn=' + saName;
}
