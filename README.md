# FIDO Ecommerce

This is a Ecommerce management system demo project for practicing perpose.

## Key Technologies

**Client-Side:** React js, Redux, BootStrap

**Server-Side:** Node JS, Express JS

**Database:** MongoDB (with ODM mongoose)

## Key Roles

- Admin
- Customer
- Seller

## Key Features

- Admin, Customer, Seller can register individualy with full login system verify by JWT token.
- Registration system is verified by OTP. During registration user need to put the OTP code for verify the email.
- Seller can add new product for Shop.
- Customer can select items and those item will go to a cart.
- Customer can confirm the order.

## Run Locally

Clone the project

```bash
  git clone https://github.com/SYShopnil/FIDO_Ecommerce_Server.git
```

Go to the project directory

```bash
  cd FIDO_Ecommerce_Server
```

Install dependencies

```bash
  npm install || npm i
```

Start the server

```bash
  npm run dev
```

## Installation

Install my-project with npm

```bash
  npm install || npm i
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

**`PORT`** //it will be the server side port

**`URL`** //it wil be the mongodb database local or cloud server link.

**`JWT_TOKEN`** // it will be the JSON WEB TOKEN'S security code

**`USER`** // it will be a valid email for nodeMailer host mail. to use this you should have enable low security of you gmail.

**`PASSWORD`** // it will be a valid email password for nodeMailer host mail. to use this you should have enable low security of you gmail.

## Support

For support, info@visionmash.com .
