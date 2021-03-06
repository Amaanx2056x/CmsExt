document.querySelector("#noScript").setAttribute("display", "none")
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

function restrict() {
  var token = document.querySelector('[limited]')
  if (token.value.length > 5) {
    token.value = token.value.slice(0, 5)
  }
}

function ShowHide() {
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
}

function deleteUnlock() {
  var userInput = document.querySelector("#userName").value;
  var toMatch = document.querySelector('#userName').getAttribute("hidden-data");
  if (userInput == toMatch) {
    document.querySelector("#deleteAcc").disabled = false;
  } else {
    document.querySelector("#deleteAcc").disabled = true;
  }
}

function deleteCategory(id){
 document.querySelector("#modalForm").action=`/admin/categories/${id}?_method=DELETE`;
}

function deleteComment(id){
 document.querySelector("#modalForm").action=`/admin/comments/${id}?_method=DELETE`;
}
function deletePost(id){
 document.querySelector("#modalForm").action=`/admin/posts/${id}?_method=DELETE`;
}
function deleteUser(id){
   document.querySelector("#modalForm").action=`/admin/profile/${id}?_method=DELETE`;
}
function demoteUser(id){
   document.querySelector("#modalFormUser").action=`/admin/demote/${id}?_method=PUT`;
}
function promoteUser(id){
   document.querySelector("#modalFormUser").action=`/admin/promote/${id}?_method=PUT`;
}