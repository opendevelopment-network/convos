<script>
import {getContext, tick} from 'svelte';
import {gotoUrl} from '../store/router';
import {l} from '../js/i18n';
import Checkbox from '../components/form/Checkbox.svelte';
import FormActions from '../components/form/FormActions.svelte';
import PasswordField from '../components/form/PasswordField.svelte';
import FormStatus from '../components/FormStatus.svelte';
import SidebarChat from '../components/SidebarChat.svelte';
import TextField from '../components/form/TextField.svelte';

const api = getContext('api');
let res = false, err = false, loading=false;
let showAdvancedSettings = false;
let url = '';

function onChange(e) {
  res = false;
}

async function onSubmit(e) {
  const form = e.target;
  const connectionUrl = new URL('irc://' + form.server.value);

  if (form.nick.value.length) connectionUrl.searchParams.append('nick', form.nick.value);
  connectionUrl.password = form.password.value;
  connectionUrl.username = form.username.value;
  url = connectionUrl.href;
  await tick(); // Wait for url to update in form

  try {
   loading=true;
    res = await api.execute('createConnection', form);
    gotoUrl('/chat/' + res.connection_id);
  } catch (e) { err = e }
}
loading =false;
</script>

<SidebarChat/>

<main class="main-app-pane align-content-middle">
  <h1>{l('Add connection')}</h1>
  <form method="post" on:change={onChange} on:submit|preventDefault="{onSubmit}">
    <input type="hidden" name="url" value="{url}">
    <TextField name="server" placeholder="{l('Ex: chat.freenode.net:6697')}">
      <span slot="label">{l('Server and port')}</span>
    </TextField>
    <TextField name="nick" placeholder="{l('Ex: your-name')}">
      <span slot="label">{l('Nickname')}</span>
    </TextField>
    <Checkbox bind:checked="{showAdvancedSettings}">
      <span slot="label">{l('Show advanced settings')}</span>
    </Checkbox>
    <TextField name="username" className="{showAdvancedSettings ? '' : 'hide'}">
      <span slot="label">{l('Username')}</span>
    </TextField>
    <PasswordField name="password" className="{showAdvancedSettings ? '' : 'hide'}">
      <span slot="label">{l('Password')}</span>
    </PasswordField>
    <FormActions>
      <button class="btn">{l('Add connection')}</button>
    </FormActions>
    <FormStatus res={res} err={err} loading={loading}/>
  </form>
</main>
