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
cd CS4900/webspark-crm

Install Dependencies
yarn install

Database seeding
yarn seed

Start the Development Server
yarn run vue-cli-service serve

Access the Application
Open your browser and go to:
http://localhost:8080


Fast way -- just copy everything and ctrl+v in terminal
npm install -g @vue/cli
git clone https://github.com/LandonHancock10/CS4900.git
cd CS4900/webspark-crm
yarn install
yarn seed
yarn run vue-cli-service serve