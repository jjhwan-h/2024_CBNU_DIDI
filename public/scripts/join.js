const signInBtn = $("#signIn");
const signUpBtn = $("#signUp");
const container = $(".container");
const lookAroundBtn = $("#btn_look_around")
signInBtn.on("click", function() {
    container.removeClass("right-panel-active");
})
signUpBtn.on("click", function() {
    container.addClass("right-panel-active");
})
lookAroundBtn.on("click", function() {
    window.location.href = '/info';
})
const validateEmail = function() {
    const emailInput = $("#email").val();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailPattern.test(emailInput)) {
        return true;
    } 
};

const signIn = function(){
    axios.post('/users/login').then((res)=>{
      
    })
}

$(document).ready(()=> {
  const btn= $('<button/>', {
    text: 'email 검증하기',
    id: 'email-validation-btn',
    class: 'join_btn',
    type:"button"
  });
  $('#email').on('input', ()=>{
      const statusEmail = validateEmail();
      if(statusEmail) {
        $('#email-validation-btn').remove()
        const el = $('#email-validation')
        el.append(btn)
      }
  });

  btn.on('click',()=>{
      const email = $('#email').val();
      if(email){
        axios.post('/auth/email',{email})
        .then((res)=>{
          $('#email-validation-btn').remove();
          // console.log(JSON.stringify(res))
          alert(res.data.msg);
        }).catch((err)=>{
          alert(err);
        });
      }
  })

});

