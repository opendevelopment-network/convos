(function() {
  var defaultIcon;

  if(window.Notification) {
    try {
      var icon = document.querySelector('link[rel="apple-touch-icon"][sizes="76x76"]');
      defaultIcon = icon.href;
    } catch(e) {
      console.log(e);
    }

    window.Notification.defaultCloseTimeout = 5000;
    window.Notification.simple = function(title, body, icon) {
      if (window.hasFocus) return false;
      if (!icon) icon = defaultIcon;

      if (Notification.permission == 'granted') {
        navigator.serviceWorker.getRegistration().then(function(reg) {
          var args = { icon: icon || '', body: body, onclose: function() { clearTimeout(tid); } };
          reg.showNotification(title,args);
        });
      }

      // TODO: Change favicon or make the icon bare blink by changing document.title

      return true;
    };

    window.Notification.simple.count = 0;
  }
})();
