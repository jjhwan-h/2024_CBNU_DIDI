const signInBtn = $("#signIn");
const signUpBtn = $("#signUp");
const container = $(".container");
const lookAroundBtn = $("#btn_look_around")
signInBtn.on("click", () =>{
    container.removeClass("right-panel-active");
})
signUpBtn.on("click", ()=> {
    container.addClass("right-panel-active");
})
lookAroundBtn.on("click", () =>{
    window.location.href = '/info';
})
const validateEmail = () =>{
    const emailInput = $("#email").val();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailPattern.test(emailInput)) {
        return true;
    } 
};
const showConn = (qrDiv,urlDiv,event)=>{
  const newBtn = $('<button></button>', {
    class: 'join_btn',
    type:'button',
    text:'url 클립보드로 복사'
  });
  const newImg = $('<img>', {
    class: 'col-md-9',
    id:'qr-code'
  });
  newBtn.click(()=>{
    navigator.clipboard.writeText(event.url)
      .then(()=> {
          alert('url이 성공적으로 복사되었습니다. 기기에서 url을 입력해주세요');
      })
      .catch((err)=> {
          console.error('url 복사에 실패했습니다:', err);
      });
  })
  newImg.attr('src',event.qr);
  qrDiv.append(newImg);
  urlDiv.append(newBtn);
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

          alert(res.data.msg);
        }).catch((err)=>{
          alert(err);
        });
      }
  })
});
