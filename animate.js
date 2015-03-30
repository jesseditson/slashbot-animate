var debug = require('debug')('slashbot-animate')
/**
 * This method is called by slashbot with the context:
 * this.req - the express request that handled this message
 * this.res - the express res object.
 * this.name - the bot name
 * this.respond - a function for responding to a slack room
 * this.request - a superagent instance for making requests with
 *
 * This method will be called with a payload, which looks like this:
 * token=<token>
 * team_id=T0001
 * team_domain=example
 * channel_id=C2147483705
 * channel_name=test
 * user_id=U2147483697
 * user_name=Steve
 * command=/weather
 * text=94070
 * channel=#test - (this also may be an @username, if coming from a DM.)
 *
 * The last argument is an optional callback, which you can call to send a private message back to the user.
 *
 * To send a public message, use this.respond.
 */

var animate = function(payload,callback){
  if (payload.channel_name === 'privategroup') {
    return callback(null,'Sorry ' + payload.user_name + ", I can't post to private groups.")
  }
  var self = this

  // trim off leading 'me'
  var search = payload.text.trim().replace(/^me\s*/i,'')

  var q = {
    v: '1.0',
    rsz: '8',
    q: search,
    safe: true,
    imgtype: 'animated'
  }
  this.request
    .get('http://ajax.googleapis.com/ajax/services/search/images')
    .query(q)
    .end(function(err,res) {
      if (err) return callback(null,'Failed querying google images: ',err.message)
      var o = res.body
      try {
        o = JSON.parse(res.text)
      } catch(e) {
        debug('invalid response from google: %s',res.text)
        return callback(null,'invalid response from google.')
      }
      if (!o.responseData || !o.responseData.results) {
        debug('invalid response from google: %s',JSON.stringify(o))
        return callback(null,'no images found.')
      } else if (!o.responseData.results.length) {
        return callback(null,'no images found for ' + search)
      } else {
        var i = o.responseData.results
        var idx = Math.floor(Math.random() * i.length)
        // send off our image!
        self.respond(i[idx].unescapedUrl + '#.png',payload.channel)
      }
      callback()
    })
}


/**
 * On command responders, we define a command.
 * This tells slashbot that we want to call this method in response to a slash command.
 *
 * Without this defined, slashbot would load this as a listener, which would cause unexpected behavior.
 */
animate.command = 'animate'

module.exports = animate
