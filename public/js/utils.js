function restrict() {
  var token = document.querySelector('[limited]')
  if (token.value.length > 5) {
    token.value = token.value.slice(0, 5)
  }
}

var checkbox = document.querySelector('[picker]');
checkbox.addEventListener('change', function(e) {
  var fields = document.querySelectorAll('[toshow]')
  if (this.checked) {
    for (var i = 0; i < fields.length; i++) {
      fields[i].setAttribute("type", "text")
    }
  } else {
    for (var k = 0; k < fields.length; k++) {
      fields[k].setAttribute("type", "password")
    }
  }
})

function deleteUnlock() {
  var userInput = document.querySelector("#userName").value;
  var toMatch = document.querySelector('#userName').getAttribute("hidden-data");
  if (userInput == toMatch) {
    document.querySelector("#deleteAcc").disabled = false;
  } else {
    document.querySelector("#deleteAcc").disabled = true;
  }
}