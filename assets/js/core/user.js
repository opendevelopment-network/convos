(function(window) {
  Convos.User = function(attrs) {
    if (attrs) this.update(attrs);
    riot.observable(this);
    this._dialogs = {};
    this._connections = {};
    this._api = Convos.api;
    this._listenForEvents();
    this._initLocalDialog();

    var prev = this.email();
    this.on('email', function(value) {
      if (value != prev && value) Convos.ws.open(function() { this.refresh(); }.bind(this));
      prev = value;
    });
  };

  var proto = Convos.User.prototype;

  // Define attributes
  mixin.base(proto, {
    email: function() { return ''; },
    ws: function() { throw 'ws cannot be build'; }
  });

  // Make the next api method fetch fresh data from server
  proto.fresh = function() { this._api.fresh(); return this; };

  // Add, get or update a Convos.Connection object on client side
  // Get:    c = user.connection(id)
  // Create: c = user.connection(attrs)
  proto.connection = function(c) {
    if (typeof c != 'object') return this._connections[c];
    if (!c.DEFLATE) c = new Convos.Connection(c);
    if (this._connections[c.id()]) throw 'Connection already exists.';
    c.user(this);
    this._connections[c.id()] = c;
    this.trigger('connection', c);
    return c;
  };

  proto.connections = function() {
    var c = this._connections;
    return Object.keys(c).map(function(k) { return c[k]; });
  };

  proto.currentDialog = function(obj) {
    if (obj) {
      localStorage.setItem('activeDialog', obj.href());
      return this;
    }
    else {
      var href = localStorage.getItem('activeDialog') || 'chat';
      var current;
      this.dialogs().forEach(function(d) { if (d.href() == href) current = d });
      return current || this._localDialog;
    }
  };

  // Get or create a single Convos.Dialog object on client side
  // Get:    d = user.dialog(id)
  // Create: d = user.dialog(attrs)
  proto.dialog = function(obj) {
    if (typeof obj != 'object') return this._dialogs[obj];
    obj.connection = this._connections[obj.connection_id];
    var d = new Convos.Dialog(obj);
    if (this._dialogs[d.id()]) throw 'Dialog already exists.';
    this._dialogs[d.id()] = d;
    this.trigger('dialog', d);
    return d;
  };

  proto.dialogs = function() {
    var d = this._dialogs;
    return Object.keys(d).map(function(k) { return d[k]; });
  };

  // Get user settings from server
  // Use user.fresh().load(function() { ... }) to get fresh data from server
  proto.load = function(cb) {
    var self = this;
    this._api.getUser({}, function(err, xhr) {
      if (err) return cb.call(self, err);
      self.update(xhr.body);
      cb.call(self, false);
    });
    return this;
  };

  // Log out the user
  proto.logout = function(cb) {
    var self = this;
    this._api.logoutUser({}, function(err, xhr) {
      if (err) return cb.call(self, err);
      self.email('');
      cb.call(self, false);
    });
    return this;
  };

  // Delete a connection on server side and remove it from the user object
  proto.removeConnection = function(connection, cb) {
    var self = this;
    this._api.removeConnection({connection_id: connection.id()}, function(err, xhr) {
      if (err) return cb.call(self, err);
      delete self._connections[connection.id()];
      cb.call(self, '');
    });
    return this;
  };

  // Refresh related data to the user
  proto.refresh = function() {
    var self = this;
    var first;

    this._api.listConnections({}, function(err, xhr) {
      if (err) return self.trigger('error', err);
      xhr.body.connections.forEach(function(c) { self.connection(c); });
      if (!self.connections().length) return self.trigger('refreshed');
      self._api.listDialogs({}, function(err, xhr) {
        if (err) return self.trigger('error', err);
        xhr.body.dialogs.forEach(function(d) { d = self.dialog(d); first = first || d });
        if (!self.currentDialog().hasConnection() && first) self.currentDialog(first)
        self.trigger('refreshed');
      });
    });

    return this;
  };

  // Write user settings to server
  proto.save = function(attrs, cb) {
    var self = this;
    if (!cb) return Object.keys(attrs).forEach(function(k) { if (typeof this[k] == 'function') this[k](attrs[k]); }.bind(this));
    this._api.updateUser({body: attrs}, function(err, xhr) {
      if (err) return cb.call(self, err);
      self.update(attrs);
      cb.call(self, err);
    });
    return this;
  };

  proto._initLocalDialog = function() {
    var d = new Convos.Dialog();

    this._localDialog = d;

    d.addMessage({message: 'Please wait for connections and dialogs to be loaded...', hr: true});

    this.one('refreshed', function() {
      if (!this.connections().length) {
        d.addMessage({message: 'Is this your first time here?', hr: true});
        d.addMessage({message: 'To add a connection, click "Edit connections" in the right side menu.'});
      }
      else if (!this.dialogs().length) {
        d.addMessage({message: 'You are not part of any dialogs.', hr: true});
        d.addMessage({message: 'To join a dialog, click "New dialog" in the right side meny.'});
      }
    });
  };

  proto._listenForEvents = function() {
    this.ws().on('json', function(e) {
      switch (e.type) {
        case 'message':
          var d = this._dialogs[e.object.id];
          if (d) d.addMessage(e.data[0]);
          riot.update();
          break;
      }
    }.bind(this));
  };
})(window);