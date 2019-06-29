import Reactive from '../js/Reactive';
import {l} from '../js/i18n';

export default class Dialog extends Reactive {
  constructor(params) {
    super();

    const op = params.dialog_id     ? params.api.operation('dialogMessages')
             : params.connection_id ? params.api.operation('connectionMessages')
             : null;

    const now = new Date().toISOString();
    const path = [];
    if (params.connection_id) path.push(params.connection_id);
    if (params.dialog_id) path.push(params.dialog_id);

    this._readOnlyAttr('api', params.api);
    this._readOnlyAttr('connection_id', params.connection_id || '');
    this._readOnlyAttr('is_private', params.is_private || false);
    this._readOnlyAttr('op', op);
    this._readOnlyAttr('participants', {});
    this._readOnlyAttr('path', path.map(p => encodeURIComponent(p)).join('/'));

    this._updateableAttr('frozen', params.frozen || '');
    this._updateableAttr('last_active', params.last_active || now);
    this._updateableAttr('last_read', params.last_read || now);
    this._updateableAttr('messages', []);
    this._updateableAttr('name', params.name || 'Unknown');
    this._updateableAttr('topic', params.topic || '');
    this._updateableAttr('unread', params.unread || 0);

    if (params.hasOwnProperty('dialog_id')) {
      this._readOnlyAttr('dialog_id', params.dialog_id);
      Object.defineProperty(this, 'state', {get: () => this._reactive.frozen});
    }
  }

  addMessage(msg) {
    if (!msg.ts) msg.ts = new Date().toISOString();
    if (!msg.from) msg.from = this.connection_id || 'Convos';
    if (msg.vars) msg.message = l(msg.message, ...msg.vars);
    this.messages.push(msg);
    this.update({});
  }

  async load() {
    if (!this.op) return;
    await this.op.perform(this);
    this.update({messages: this.op.res.body.messages || []});
  }

  participant(id, params = {}) {
    if (!this.participants[id]) this.participants[id] = {ts: new Date()};
    Object.keys(params).forEach(k => { this.participants[id][k] = params[k] });
    return this.participants[id];
  }
}