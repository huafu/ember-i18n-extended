// define keys here for this context
export default {
  // simple key:
  //hello_world: 'Hello World!'

  // arguments are as follow:
  //hello_$name$_welcome_to_$title$: 'Hello {}, welcome to {}'

  // ...where you can specify their index too
  //welcome_to_$title$_hello_$name$: 'Welcome to {2}! Hello {1}'

  // ... and modifiers
  //welcome_$name$_we_are_$date$: 'Welcome {capitalize:1}, we are {date,MEDIUM_NOYEAR:2}'

  // ... and even link to some other translations
  //welcome_$name$: '{/common.welcome} {}!'

  // sub-contexts are allowed
  //header: {
  //  welcome: 'Welcome {}! {../hello_world}'
  //}

  // functions as well, they then have the translation helpers as context and passed args are the
  // possible variables
  //user_$name$_online_since_$date$: function (name, date) {
  //  if (Date.now() - date < 1000*60) {
  //    return 'User ' + name + ' just came online';
  //  } else {
  //    return 'User ' + name + ' is online since ' + this.date(date, 'MEDIUM');
  // }
  //}
};
