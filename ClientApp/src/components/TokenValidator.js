const jwt = require('jsonwebtoken');

export function validateToken(userInfo, callback) {
    var signingSecret = 'YourKey-2374-OFFKDI940NG7:56753253-tyuw-5769-0921-kfirox29zoxv';
    jwt.verify(userInfo.token, signingSecret, function (err, decoded) {
        if (err) {
            callback(false);
        }
        else {
            localStorage.setItem('token', userInfo.token)
            localStorage.setItem('decodedToken', decoded)
            if (userInfo.user) {
                localStorage.setItem('currentUser', JSON.stringify(userInfo.user))
            }
            callback(true);
        }
    });
}