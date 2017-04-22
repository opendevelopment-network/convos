---
layout: post
title: Improved unread count and acive user tracking
---

Version [0.99_32](https://github.com/Nordaaker/convos/tree/stable) has
improved handling of unread and online/offline tracking
released with a bunch of updates. Run the
[install](/doc/getting-started.html#quick-start-guide) command to get the
fixes!

## Unread count

The unread count logic has been quite rocky, but it is a lot more stable now
and will be in the future as well. I tried to fix it in 0.99_31, but failed
badly because I did not write any unit tests. 0.99_32 now has more
[tests](https://github.com/Nordaaker/convos/blob/master/t/selenium-highlight.t)
and bugfixes:

- Unread count used to be increased if a user in a private dialog joined or
  parted. This is now fixed.
- "notice" messages used to increase unread. I'm thinking about bringing this
  back, but currently only "action" and "private" messages will increase
  unread.

## Active user tracking

Users in a channel has improved active tracking, which means that Convos will
track users who has been active as well as currencly active users. This helps
the autocomplete to order a user by last seen in the dialog. Pressing "tab"
will now autocomplete the last user who said anything in the dialog, which
makes sense since it's probably the person you want to reply to. In addition,
the autocomplete has a better matcher for emojis, so you don't need to
remember the emoji name exacly by name.

---

Update!

[0.99_31](https://github.com/Nordaaker/convos/blob/master/Changes)
introduced a bug on how to track active users in a channel which is fixed
in version 0.99_33: The bug was that users who joined was not tracked as active.

