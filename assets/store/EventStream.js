export default class EventStream {
  constructor(url) {
    this.msgId = 0;
    this.namespace = 'default';
    this.subscribers = [];
    this.timeout = 10;
    this.waiting = {};
    Object.defineProperty(this, 'url', {get: () => url});
  }

  channel(namespace) {
    const channel = new EventStream(this.url);
    channel.namespace = namespace;
    channel._ensureSocket = () => this._ensureSocket();
    channel.subscribe = (cb) => this.subscribe(data => data.id.indexOf(namespace + ':') || cb(data));
    return channel;
  }

  async send(msg) {
    if (!msg.id) msg.id = [this.namespace, (++this.msgId)].join(':');
    const ws = await this._ensureSocket();
    ws.send(JSON.stringify(msg));
    this.waiting[msg.id] = msg;
    if (!msg.expireAt) msg.expireAt = (this.timeout + new Date().getTime()) / 1000;
    if (!this.tid) this.tid = setInterval(() => this._timeout(), 1000);
  }

  subscribe(cb) {
    this.subscribers.push(cb);
    return () => this.subscribers.filter(i => (i != cb));
  }

  _emit(data) {
    console.log(data, this.subscribers);
    this.subscribers.forEach(cb => cb(data));
  }

  async _ensureSocket() {
    if (this.ws && [0, 1].indexOf(this.ws.readyState) != -1) return this.ws; // [CONNECTING, OPEN, CLOSING, CLOSED]
    if (this._wsReconnectTid) clearTimeout(this._wsReconnectTid);

    const ws = new WebSocket(this.url);
    if (!this.ws) this.ws = ws;

    let handled = false;
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        if (![handled, (handled = true)][0]) resolve((this.ws = ws));
      };

      ws.onclose = (e) => {
        this._wsReconnectTid = setTimeout(() => this._ensureSocket(), 1000);
        this.connections.forEach(conn => { conn.status = 'Unreachable' });
        this.dialogs.forEach(dialog => { dialog.frozen = 'No internet connection?' });
        if (![handled, (handled = true)][0]) reject(e);
      };

      ws.onerror = ws.onclose;

      ws.onmessage = (e) => {
        var data = JSON.parse(e.data);
        delete this.waiting[data.id];

        if (data.connection_id && data.event) {
          this._emit(data);
        }
        else if (data.email) {
          this.parse({body: data});
        }
      };
    });
  }

  _timeout() {
    const now = new Date().getTime() / 1000;
    const waiting = Object.keys(this.waiting).filter(id => {
      const msg = this.waiting[id];
      if (msg.expireAt > now) return true;
      msg.expired = true;
      this._emit(msg);
      delete this.waiting[id];
      return false;
    });

    if (waiting.length) return;
    clearTimeout(this.tid);
  }
}