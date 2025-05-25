# Range IQ - the solution for range anxiety

![Range IQ logo](pageimages/rangeIQ.png) <br>

## Overview

RangeIQ is a tool built for current and prospective EV owners, through which one can visualise the maximum range of an EV under a variety of travel conditions. The tool currently allows a user to compare four different popular EV models and their ranges depending on their start location, starting battery charge, number of passengers and weather conditions. Range is visualised as an [isodistance](https://www.geographyrealm.com/isodistance-isochrone-maps/) polygon, powered by [Azure Maps](https://azure.microsoft.com/en-us/products/azure-maps), which can be regenerated with the user reprompting the tool with a new starting location (a postcode), a new EV, or different travel conditions.

The app is designed with accessibility in mind, featuring a clean and simple UI that supports dark mode. While in its current condition the tool only supports comparison of four EVs, the underlying technology can support any number of EVs if provided a larger dataset (and with some minor reconfiguration of the select-vehicle.html).

This application was delivered as the final project of Group 1, Murati cohort, of the La Fosse Academy, consisting of:

- [Alex Bittman (PM)](https://github.com/abittmann)
- [Cass Naylor](https://github.com/Perspicacity11)
- [Olena Tabunshchyk](https://github.com/babussia)
- [Pritam Vekaria](https://github.com/Pritzstik)
- [Rafsanzani Ludhi](https://github.com/rafsanzi-ludhi)
- [Rupesh Mall](https://github.com/rmalldt)

## Navigating this repository

The root directory of this application is called 'group1-project'; this is unchanged from our initial deployment on 22-5-25 for the sake of consistency.

This tool is comprised of three microservices: the client, the server and the database. Each microservice has its own subdirectory containing its source code and unit tests, as well as a more granular README for that service. You should read these first, in addition to this document, before you begin working with or on the application - there are a number of environment variables to configure for the server, for example.

The root directory also contains the configuration code for Terraform IaC deployment using AWS infrastructure, as well as the Kubernetes manifests. Finally, the **cypress** subdirectory contains the files for our end-to-end tests, the configuration for which sits in the **cypress.config.js** file; you will see the script to run these tests in the root directory package.json.

The **python** subdirectory can be safely ignored, as it contains market research information presented alongside this app at the La Fosse Academy.

## Technologies

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Nodemon](https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

![cypress](https://img.shields.io/badge/-cypress-%23E5E5E5?style=for-the-badge&logo=cypress&logoColor=058a5e)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)


![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

## Proper working state of the app

If all configuration is done correctly and without errors, the internal pages of the app will look like this:

![Slide one of the frontpage](pageimages/frontpage1.png)
![Slide two of the frontpage](pageimages/frontpage2.png)
![Slide three of the frontpage](pageimages/frontpage3.png)
![Account registration page](pageimages/createaccount.png)
![Sign in page](pageimages/login.png)
![EV selection page without an EV selected](pageimages/selectvehicle.png)
![EV selection page with the Audi e-tron GT selected](pageimages/vehicleselected.png)
![Map page in light mode](pageimages/isorenderedlight.png)
![Map page in dark mode](pageimages/isorendereddark.png)
![Travel variables collapsable menu in light mode](pageimages/travelvariables.png)


## Contributing to the project

**1. Clone the repository:**

- Run `git clone https://github.com/rmalldt/group1-project.git`

**2. Open your `feature` branch based off the `main` branch:**

- Run `git checkout -b <my-feature>` from `main` branch.

- Work on individual branch and once happy with the changes, **add**, **commit** and **push** to your changes to your remote **feature** branch. Run `git push -u origin <my-feature>` to push your **feature** branch to Github.

  - Create a **PR** from your **feature** branch to the **main** branch.

  - One of the repo admins will then assess and (absent any issues) merge the **PR** to `main`.

  - Delete your **feature** branch if you think you do not need this branch in future.

**3. Switch back to `main` branch and always make sure to pull the latest changes:**

- Run `git checkout main` to switch to **development** branch.
- Run `git pull` to get the latest changes.
- To start new feature: Repeat **Step 2**

**4. If you are still working on `feature` branch and need latest changes from `development` branch:**

- Run `git stash save <"message">` to save the current unpushed changes in **feature** branch.
- Run `git checkout main` to switch to **main** branch.
- Run `git pull` to get the latest changes.
- Run `git checkout <my-feature>` to switch back to **feature** branch.
- Run `git merge main` to include the latest changes in your **feature** branch.
- Run `git stash pop stash@{0}` to apply the stash.

**NOTE**: We have defined rules protecting the main branch so it cannot be pushed to directly. It is important that you push changes to a remote branch and then open a pull request into the main branch, as pushing to the remote main branch from the local main branch will be blocked.