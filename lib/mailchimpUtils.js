const superagent = require('superagent')
const md5 = require('md5')

const addUserToMailchimp = (email, firstname, lastname) => {
    const mailchimp_server = 'us5'
    const mailchimp_audienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const mailchimp_apiKey = process.env.MAILCHIMP_APIKEY

    superagent
        .post(`https://${mailchimp_server}.api.mailchimp.com/3.0/lists/${mailchimp_audienceId}/members`)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer.from('any:' + mailchimp_apiKey ).toString('base64'))
        .send({
        'email_address': email,
        'status': 'subscribed',
        'merge_fields': {
            'FNAME': firstname,
            'LNAME': lastname
        }
        })
        .end(function(err, response) {
            if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                console.log('MAILCHIMP ADDED')
            } else {
                console.log(err)
                console.log('MAILCHIMP NOT ADDED')
            }
        });
}

const removeUserFromMailchimp = (email) => {

    const mailchimp_server = 'us5'
    const mailchimp_audienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const mailchimp_apiKey = process.env.MAILCHIMP_APIKEY

    superagent
        .put(`https://${mailchimp_server}.api.mailchimp.com/3.0/lists/${mailchimp_audienceId}/members/${md5(email.toLowerCase())}`)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer.from('any:' + mailchimp_apiKey ).toString('base64'))
        .send({
            'status': 'unsubscribed',
            })
        .end(function(err, response) {
            if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                console.log('MAILCHIMP REMOVED')

            } else {
                console.log('MAILCHIMP NOT REMOVED')

            }
        });
}

const resubscribeListMember = (email) => {
    const mailchimp_server = 'us5'
    const mailchimp_audienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const mailchimp_apiKey = process.env.MAILCHIMP_APIKEY

    superagent
        .put(`https://${mailchimp_server}.api.mailchimp.com/3.0/lists/${mailchimp_audienceId}/members/${md5(email.toLowerCase())}`)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer.from('any:' + mailchimp_apiKey ).toString('base64'))
        .send({
            'status': 'subscribed',
            })
        .end(function(err, response) {
            if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                console.log('MAILCHIMP RESUBSCRIBED')

            } else {
                console.log('MAILCHIMP NOT RESUBSCRIBED')

            }
        });
}

module.exports.addUserToMailchimp = addUserToMailchimp
module.exports.removeUserFromMailchimp = removeUserFromMailchimp
module.exports.resubscribeListMember = resubscribeListMember