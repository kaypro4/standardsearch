document.addEventListener('DOMContentLoaded', function () {
   var input = document.getElementById('standard');
   
   if (localStorage['standard']) {
       input.value = localStorage['standard'];
   }
   
   input.onchange = function () {
        localStorage['standard'] = this.value;
    }
    
});