<user-input>
  <form method="post" onsubmit={sendMessage}>
    <div class="actions">
      <!-- a href="#attach" class="tooltipped" title="Attach file"><i class="material-icons">attach_file</i></a -->
      <!-- a href="#webcam" class="tooltipped" title="Take picture"><i class="material-icons">photo_camera</i></a -->
      <a href="#emoji" class="tooltipped" title="Insert emoji"><i class="material-icons">insert_emoticon</i></a>
      <a href="#send" class="tooltipped" title="Send message"><i class="material-icons">send</i></a>
    </div>
    <textarea name="message" class="materialize-textarea" placeholder={placeholder} onkeydown={onChange}></textarea>
  </form>
  <script>

  this.placeholder = '';

  onChange(e) {
    switch (e.keyCode) {
      case 13:
        if (e.shiftKey) return true;
        this.sendMessage(e);
        return false;
      default:
        return true;
    }
  }

  sendMessage(e) {
    opts.dialog.send(this.message.value, function(err) {
      if (err) console.log(err);
    }.bind(this));
    this.message.value = '';
    this.message.focus();
  }

  this.on('mount', function() {
    $('.dropdown-button', this.root).dropdown({constrain_width: false});
    this.message.focus();
  });

  this.on('update', function() {
    try {
      var state = opts.dialog.connection().state();
      if (state == 'connected') {
        this.placeholder = 'What do you want to say to ' + this.opts.dialog.name() + '?';
      }
      else {
        this.placeholder = 'State is "' + state + '".';
      }
    } catch (err) {
      this.placeholder = 'Please enter commands as instructed.';
    };
  });

  </script>
</user-input>