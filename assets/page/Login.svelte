<script>
import {l} from '../js/i18n';
import {getContext} from 'svelte';
import {getUser} from '../store/user';
import {gotoUrl} from '../store/router';
import FormActions from '../components/form/FormActions.svelte';
import Link from '../components/Link.svelte';
import PromiseStatus from '../components/PromiseStatus.svelte';
import PasswordField from '../components/form/PasswordField.svelte';
import SidebarLoggedout from '../components/SidebarLoggedout.svelte';
import TextField from '../components/form/TextField.svelte';

const api = getContext('api');

let promise = false;

async function login(target) {
  const res = await api.execute('loginUser', target);
  document.cookie = res.headers['Set-Cookie'];
  getUser(api);
  gotoUrl('/chat');
  return res;
}

</script>

<SidebarLoggedout/>

<main class="main-app-pane align-content-middle">
  <h1>{l('Log in')}</h1>
  <form method="post" on:submit|preventDefault="{e => promise = login(e.target)}">
    <TextField name="email" placeholder="{l('Ex: john@doe.com')}">
      <span slot="label">{l('E-mail')}</span>
    </TextField>
    <PasswordField name="password">
      <span slot="label">{l('Password')}</span>
    </PasswordField>
    <FormActions>
      <button class="btn">{l('Log in')}</button>
    </FormActions>
    <PromiseStatus {promise}/>
  </form>
  <article>
    <p>{l('Welcome message. Vivamus congue mauris eu aliquet pharetra. Nulla sit amet dictum.')}</p>
  </article>
</main>
