<script>
import {l} from '../js/i18n';
export let promise;

function extractError(err) {
 console.log(err);
  if (Array.isArray(err.errors) && err.errors.length) {
    const first = err.errors[0];
    return (first.path && first.path.match(/\w/) ? first.path.split('/').pop() + ': ' : '') + first.message;
  }
  else {
    return err.statusText || 'Unknown error.';
  }
}
</script>

{#await promise}
<div class="loading"><slot name="loading">{l('Loading...')}</slot></div>
{:then res}
<div class="ok">{#if res.message} {l(res.message)}{/if}</div>

{:catch err}
<div class="error"><slot name="error">{l(extractError(err))}</slot></div>
{/await}
