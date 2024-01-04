const socket = io();
var scriptID;

function highlight() {
  document.querySelector("#highlight-area").innerHTML = document.querySelector("#script").value.replaceAll("<", "&lt;").replaceAll(" ", "&nbsp;")
  hljs.highlightAll()
}

function execute() {
  const button = document.querySelector("#run-button")
  if (!button.className.includes("disabled")) {
    button.className = "accented-button disabled"
    button.innerHTML = "Stop"
    fetch("/execute", {
      method: "POST",
      body: JSON.stringify({
        script: document.querySelector("#script").value
      })
    })
      .then(response => response.json())
      .then(response => {
        const terminal = document.querySelector("#terminal")
        terminal.innerHTML = ""
        scriptID = response.id
  
        socket.on(`${scriptID}`, (data) => {
          const e = document.createElement("div")
          e.append(document.createTextNode(data))
          terminal.append(e)
          terminal.scrollTop = terminal.scrollHeight;
        })
  
        socket.on(`${scriptID}_finished`, () => {
          button.className = "accented-button"
          button.innerHTML = "Run"
        })
      })
  } else {
    socket.emit("terminate", scriptID)
  }
}

const doubleKeys = ["'", '"', "{", "(", "["]
const oppositeDoubleKeys = ["'", '"', "}", ")",  "]"]
window.onload = function() {
  document.querySelector("#script").value = localStorage.getItem("script")
  highlight()
  document.querySelector("#script").addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;

      this.value = this.value.substring(0, start) +
        "\t" + this.value.substring(end);

      this.selectionStart =
        this.selectionEnd = start + 1;

      highlight()
    } else if (doubleKeys.includes(e.key)) {
      e.preventDefault()
      var start = this.selectionStart
      var end = this.selectionEnd

      this.value = this.value.substring(0, start)+e.key+oppositeDoubleKeys[doubleKeys.indexOf(e.key)]+this.value.substring(end)

      this.selectionStart = start+1
      this.selectionEnd = start+1

      highlight()
    }
    localStorage.setItem("script", this.value)
  });
}
