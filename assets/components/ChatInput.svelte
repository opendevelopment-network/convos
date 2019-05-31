<script>
import {l} from '../js/i18n';
import {md} from '../js/md';
import emojione from 'emojione';

let activeAutocompleteIndex = 0;
let autocompleteCategory = 'chat';
let maxNumMatches = 20;
let inputEl;
let pos;

// TODO: Allow user to select tone in settings
const emojis = Object.keys(emojione.emojioneList).filter(i => !i.match(/_tone/)).sort();

function calculateAutocompleteOptions([before, key, afterKey, after]) {
  const opts = [];

  // Emojis
  if (key == ':' && afterKey.length) {
    autocompleteCategory = 'emoji';
    [new RegExp('^:' + afterKey), new RegExp('_' + afterKey)].forEach(re => {
      for (let i = 0; i < emojis.length; i++) {
        if (emojis[i].match(re)) opts.push({val: emojis[i], text: md(emojis[i])});
        if (opts.length >= maxNumMatches) break;
      }
    });
  }
  else {
    autocompleteCategory = 'chat';
  }

  activeAutocompleteIndex = 0;
  if (opts.length) opts.unshift({val: key + afterKey});
  return opts;
}

function calculateInputParts(pos) {
  let key = '';
  let afterKey = '';
  const before = inputEl.value.substring(0, pos).replace(/(\S)(\S*)$/, (a, b, c) => {
    key = b;
    afterKey = c;
    return '';
  });

  return [before, key, afterKey, inputEl.value.substring(pos)];
}

function focusAutocompleteItem(moveBy) {
  activeAutocompleteIndex += moveBy;
  if (activeAutocompleteIndex < 0) activeAutocompleteIndex = autocompleteOptions.length - 1;
  if (activeAutocompleteIndex >= autocompleteOptions.length) activeAutocompleteIndex = 0;

  const autocompleteOpt = autocompleteOptions[activeAutocompleteIndex];
  if (!autocompleteOpt) return;

  inputEl.value = inputParts[0] + autocompleteOpt.val + inputParts[3];
  inputEl.selectionStart = inputEl.selectionEnd = (inputParts[0] + autocompleteOpt.val).length;
}

function sendMessage() {
  console.log('TODO: sendMessage', inputEl.value);
  inputEl.value = '';
}

const keys = {
  ArrowDown(e) {
    if (!autocompleteOptions.length) return;
    e.preventDefault();
    focusAutocompleteItem(e.shiftKey ? 4 : 1);
  },
  ArrowUp(e) {
    if (!autocompleteOptions.length) return;
    e.preventDefault();
    focusAutocompleteItem(e.shiftKey ? -4 : -1);
  },
  Enter(e) {
    if (autocompleteOptions.length) {
      keys.Tab(e);
    }
    else if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  },
  Fallback(e) {
    // console.log('ChatInput', e);
  },
  Release(e) {
    if (['ArrowDown', 'ArrowUp'].indexOf(e.key) == -1) pos = inputEl.selectionStart;
  },
  Tab(e) {
    const autocompleteOpt = autocompleteOptions[activeAutocompleteIndex];
    if (!autocompleteOptions.length || !autocompleteOpt) return;

    e.preventDefault();
    autocompleteOptions = [];
    inputParts[3] = inputParts[3].replace(/^\s+/, ' ');
    inputEl.value = inputParts[0] + autocompleteOpt.val + ' ' + inputParts[3];
    inputEl.selectionStart = inputEl.selectionEnd = (inputParts[0] + autocompleteOpt.val + ' ').length;
  },
};

$: autocompleteOptions = calculateAutocompleteOptions(inputParts) || [];
$: inputParts = pos && calculateInputParts(pos) || ['', '', '', ''];
</script>

<div class="chat-input">
  <textarea
    placeholder="{l('What is on your mind?')}"
    bind:this="{inputEl}"
    on:keydown="{e => (keys[e.key] || keys.Fallback)(e)}"
    on:keyup="{e => keys.Release(e)}"></textarea>

  <div class="chat-input_autocomplete chat-input_autocomplete_{autocompleteCategory}">
    {#each autocompleteOptions as opt, i}
      <a href="#{opt.value}" class:has-focus="{i == activeAutocompleteIndex}" tabindex="-1">{@html opt.text || opt.val}</a>
    {/each}
  </div>
</div>