const utilities = require("../utilities/")
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegisteration(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

  /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }
  
 /* ***********************
* Deliver account management view
************************* */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

// Function to update account 
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  res.render("account/update", {
    title: "Manage Account",
    nav,
    errors: null,

  });
}


// Function to update account
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  parseInt(account_id)
  const accountData = await accountModel.getAccountById(account_id)
  // parseInt(account_id)
  let nav = await utilities.getNav();
  try {
    await accountModel.updateUserAccount(account_firstname, account_lastname, account_email, account_id)
    res.render('account/account-management', {
      nav,
      title: 'Update Account Information',
      accountData,
      errors: null
    })
  } catch (error) {
    console.error("Error updating account:", error)
    res.status(500).send("An error occurred while updating the account.")
  }
}

// function to build change password
async function buildChangePassword(req, res) {
  const { account_id, account_password, confirm_password } = req.body
  let nav = await utilities.getNav();
  if (account_password !== confirm_password) {
    req.flash("notice", "passwords do not match")
    return res.status(400).render("account/update", {
      title: "Change Password",
      nav,
      errors: null
    })
  }
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const updatePassword = await accountModel.updateUserPassword(hashedPassword, account_id)
  if(updatePassword) {
    req.flash("notice", "password change was successful")
    res.redirect('/account/')
  } else{
    req.flash("notice", "could not change password, please try again")
    return res.status(500).render("account/update", {
      title: "Change Password",
      nav,
      errors: null
    })
    }
  }


// build logout
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.");
  res.redirect("/account/login");
}
  
  module.exports = { buildLogin, buildRegisteration, registerAccount, buildAccountManagement, buildUpdateAccount, updateAccount, buildChangePassword, accountLogout };