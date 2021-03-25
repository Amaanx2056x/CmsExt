const nodemailer = require('nodemailer')
require('dotenv').config()
module.exports = {

  welcomeMail: function(username, email, otp) {
    var welcomeBody =

    `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
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


    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
      }
    });
    var mailOptions = {

      from: process.env.MAIL_USER,
      to: email.toString(),
      subject: 'VERIFY YOUR ACCOUNT',
      html: welcomeBody
    }
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        res.redirect('/')
        console.error(error)
      } else {
        req.flash('success_msg', `An e-mail with otp has been sent to ${email}`)
        res.redirect('/verify')
      }
      transporter.close();
    });

  },
  forgetMail: function (username, email, token) {
    var forgetBody =
    `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
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
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
      }
    });
    var mailOptions = {

      from: process.env.MAIL_USER,
      to: email.toString(),
      subject: 'RESET YOUR PASSWORD ',
      html: forgetBody
    }

    transporter.sendMail(mailOptions,
      function(error, info) {
        if (error) {
          res.redirect('/')
          console.error(error)
        } else {
          req.flash('success_msg', `An e-mail with Password Reset instructions had been sent to ${user.email}`)
          res.redirect('/forgot')
        }
        transporter.close();
      });

  },
  deleteMail: function (username,
    email) {
    var deleteBody =
    `<div style=" border-radius: 5px;color: white; background-color: #7b2cbf;">
    <center><h1>ACCOUNT DELETED</h1><p>
    Hi ${username}, we're sorry to see you go. This mail is sent to you to inform you that your account has been deleted.
    </p>
    </center><p align="right">
    Regards,<br>TeamCMS
    </p>

    </div>`

    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
      }
    });

    var mailOptions = {

      from: process.env.MAIL_USER,
      to: email.toString(),
      subject: 'ACCOUNT DELETED',
      html: deleteBody
    }
    transporter.sendMail(mailOptions,
      function(error, info) {
        if (error) {
          res.redirect('/')
          console.error(error)
        } else {
          req.flash('success_msg',
            `Account was deleted successfully!`)
          res.redirect('/login')
        }
        transporter.close();
      });

  }

}