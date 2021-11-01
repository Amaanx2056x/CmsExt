const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const welcomeMail = async (username,email,otp) => {
    sgMail.send({
        to: email,
        from: process.env.MAIL,
        subject: 'Thanks for joining in!',
        html:  `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
        <center><h1>WELCOME TO TeamCMS</h1>
        <p>
        Hi ${username}, <br>We have received a request from ${email} for your CMS account. We are glad to have you here.
        </p>
        <p>
        HERE IS YOUR OTP:<b> ${otp}</b>.
        </p>
        <p>
        Do Not share this email or otp with Anyone.
        </p>
        <p>
        Click on the Link to verify your account:<br> <a style="color: cyan;" href="https://teamcms.herokuapp.com/verify">VERIFY MY ACCOUNT</a>
        </p>
        </center>
        <p align="right">
        Regards,<br>TeamCMS
        </p>
        </div>`
    })
    .then(()=>{
      req.flash('success_msg', `An e-mail with otp has been sent to ${email}`)
        res.redirect('/verify')
    })
    .catch((error=>{
      res.redirect('/')
        console.error(error)
    }))
}

const forgetMail = async (username,email,token) => {
  sgMail.send({
      to: email,
      from: process.env.MAIL,
      subject: 'RESET YOUR PASSWORD ',
      html:  `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
      <center><h1>PASSWORD RESET REQUEST</h1>
      <p>
      Hi ${username}, We have received Password reset request from ${email} for your CMS account. If this wasn't you, check your Account for any suspicious activity and ignore the message.
      </p>
      <p>
      Password reset token:<b> ${token}</b>.
      </p>
      <p>
      Do Not share this email or token with Anyone.
      </p>
      <p>
      Click on the Link to reset Your Password:<br> <a style="color: cyan;" href="https://teamcms.herokuapp.com/https://teamcms.herokuapp.com/reset">RESET PASSWORD</a>
      </p>
      </center>
      <p align="right">
      Regards,<br>TeamCMS
      </p>
      </div>`
  })
  .then(()=>{
    req.flash('success_msg', `An e-mail with Password Reset instructions had been sent to ${user.email}`)
    res.redirect('/forgot')
  })
  .catch((error=>{
    res.redirect('/')
      console.error(error)
  }))
}

const deleteMail = async (username,email) => {
  sgMail.send({
      to: email,
      from: process.env.MAIL,
      subject: 'ACCOUNT DELETED',
      html:    `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
      <center><h1>ACCOUNT DELETED</h1><p>
      Hi ${username}, we're sorry to see you go. This mail is sent to you to inform you that your account has been deleted.
      </p>
      </center><p align="right">
      Regards,<br>TeamCMS
      </p>
  
      </div>`
  })
  .then(()=>{
    req.flash('success_msg',
    `Account was deleted successfully!`)
  res.redirect('/login')
  })
  .catch((error=>{
    res.redirect('/')
      console.error(error)
  }))
}

module.exports = {
    welcomeMail,forgetMail,deleteMail
}
