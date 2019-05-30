<script>
import {getContext} from 'svelte';
import {gotoUrl} from '../store/router';
import {getUser} from '../store/user';
import {l} from '../js/i18n';
import FormActions from '../components/form/FormActions.svelte';
import Link from '../components/Link.svelte';
import PasswordField from '../components/form/PasswordField.svelte';
import PromiseStatus from '../components/PromiseStatus.svelte';
import SidebarLoggedout from '../components/SidebarLoggedout.svelte';
import TextField from '../components/form/TextField.svelte';

const inviteCodeRequired = true;
const api = getContext('api');

let promise = false;

async function register(target) {
  const res = await api.execute('registerUser', target)
  document.cookie = res.headers['Set-Cookie'];
  getUser(api);
  gotoUrl('/chat');
}
</script>

<SidebarLoggedout/>

<main class="main-app-pane align-content-middle">
  <h1>{l('Create account')}</h1>
  <form method="post" on:change="{e => promise = false }" on:submit|preventDefault="{e => promise = register(e.target)}">
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
    <PromiseStatus {promise}/>
  </form>
  <article>
    <p>{l('By creating an account, you agree to the use of cookies.')}</p>
  </article>
</main>
