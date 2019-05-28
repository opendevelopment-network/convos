<script>
import {l} from '../js/i18n';
import {getContext} from 'svelte';
import {gotoUrl} from '../store/router';
import FormActions from '../components/form/FormActions.svelte';
import Link from '../components/Link.svelte';
import FormStatus from '../components/FormStatus.svelte';
import PasswordField from '../components/form/PasswordField.svelte';
import SidebarLoggedout from '../components/SidebarLoggedout.svelte';
import TextField from '../components/form/TextField.svelte';

const api = getContext('api');

let err = false, res = false, loading = false;
async function onSubmit(e) {
  try {
    let res = await api.execute('loginUser', e.target);
    document.cookie = res.headers['Set-Cookie'];
    gotoUrl('/chat');
  } catch (e) { err = e; }
}
</script>

<SidebarLoggedout/>

<main class="main-app-pane align-content-middle">
  <h1>{l('Log in')}</h1>
  <form method="post" on:submit|preventDefault="{onSubmit}">
    <TextField name="email" placeholder="{l('Ex: john@doe.com')}">
      <span slot="label">{l('E-mail')}</span>
    </TextField>
    <PasswordField name="password">
      <span slot="label">{l('Password')}</span>
    </PasswordField>
    <FormActions>
      <button class="btn">{l('Log in')}</button>
    </FormActions>
    <FormStatus err={err} res={res} loading={loading} />
  </form>
  <article>
    <p>{l('Welcome message. Vivamus congue mauris eu aliquet pharetra. Nulla sit amet dictum.')}</p>
  </article>
</main>
