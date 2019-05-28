<script>
import {getContext} from 'svelte';
import {gotoUrl} from '../store/router';
import {l} from '../js/i18n';
import FormActions from '../components/form/FormActions.svelte';
import Link from '../components/Link.svelte';
import PasswordField from '../components/form/PasswordField.svelte';
import FormStatus from '../components/FormStatus.svelte';
import SidebarLoggedout from '../components/SidebarLoggedout.svelte';
import TextField from '../components/form/TextField.svelte';

const inviteCodeRequired = true;
const api = getContext('api');

let res = false, err = false, loading = false;
function onChange(e) {
  res = false, err = false;
}

async function onSubmit(e) {
  loading=true
  try {
    res = await api.execute('registerUser', e.target);
  document.cookie = res.headers['Set-Cookie'];
  gotoUrl('/chat');
  } catch (e) { err=e }
  loading=false;
  console.log(err);
}
</script>

<SidebarLoggedout/>

<main class="main-app-pane align-content-middle">
  <h1>{l('Create account')}</h1>
  <form method="post" on:change={onChange} on:submit|preventDefault="{onSubmit}">
    <TextField name="email" placeholder="{l('Ex: john@doe.com')}">
      <span slot="label">{l('E-mail')}</span>
    </TextField>
    <PasswordField name="password">
      <span slot="label">{l('Password')}</span>
    </PasswordField>
  {#if inviteCodeRequired}
    <TextField name="invite_code">
      <span slot="label">{l('Invite code')}</span>
    </TextField>
  {/if}
    <FormActions>
      <button class="btn">{l('Register')}</button>
    </FormActions>
    <FormStatus res={res} error={err} loading={loading}/>
  </form>
  <article>
    <p>{l('By creating an account, you agree to the use of cookies.')}</p>
  </article>
</main>
