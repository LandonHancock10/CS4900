LINK TO YOUTUBE PRESENTATION: https://youtu.be/EUA2jAdCukw
WEBSITE ACCESS LINK: http://webspark-crm.s3-website-us-west-1.amazonaws.com/

WebSpark CRM - Local Setup Guide
This guide will help you set up WebSpark CRM locally. Since the database and API are already hosted on AWS, you only need to download the frontend and serve it locally.

Prerequisites
Make sure you have the following installed:

Git
Node.js & npm (Latest LTS recommended)
Yarn
Vue CLI (Install globally if missing)

First step
Open a terminal and run:
npm install -g @vue/cli

Clone the Repository
git clone https://github.com/LandonHancock10/CS4900.git

Install Dependencies
cd CS4900/frontend
yarn install

Database seeding
cd ..
cd backend
yarn install
cd scripts
node seedDatabase.js

Start the Development Server
cd ..
cd ..
cd frontend
yarn run vue-cli-service serve

Access the Application
Open your browser and go to:
http://localhost:8080