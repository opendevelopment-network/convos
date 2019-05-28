<script>
import {l} from '../js/i18n';
export let res;
export let err;
export let loading;

$: document.querySelector('body').classList[loading ? 'add' : 'remove']('is-loading');

function extractError(err) {
  if (Array.isArray(err.errors) && err.errors.length) {
    const first = err.errors[0];
    return (first.path && first.path.match(/\w/) ? first.path.split('/').pop() + ': ' : '') + first.message;
  }
  else {
    return err.statusText || 'Unknown error.';
  }
}

{#if loading}
<div class="loading"><slot name="loading">{l('Loading...')}</slot></div>
</script>
{#if err}
<div class="error"><slot name="error">{l(extractError(err))}</slot></div>
{/if}
