
![Logo](https://raw.githubusercontent.com/DiabolikSapien/chatting-app/master/Chat-App-NoAWS/src/assets/Images/logo.ico)


# TAWK - The Chatting App




## OVERVIEW

This is a dynamic chatting app that takes its inspiration form modern day chatting apps and the UI of this app is inspired by the clean interface of telegram and compactness of discord. This is made on MERN stack with socket.io and zegocloud for the interface between two users.

The frontend is designed using ReactJS and and in the backend, we used NodeJS and ExpressJS with the robustness of MongoDB as a NO-SQL database.

The user interface designed for this app is the highlight for the project which has various features and user oriented customizations that can be donw by the user itself to suit their interface. It has dark mode, light mode, both with 6 primary colors, the feature of right or left orientation is also took into consideration and a feature of fullscreen is also implemented.



## DEPLOYMENT

One should first clone the repository in the local machine or download the zip file and unzip it.

There are two folders: one of the backend and one of frontend.

Separately open terminals in both of these4 folders and follow the command:
### FRONTEND
To install all the dependencies:
```bash
  npm i
```
To run the website in port 3000:
```bash
  npm start
```
If the port 3000 is busy then dont run on any other port, kill the port 3000 and then try the npm start again. To kill the port, do this:
```bash
  npx kill-port 3000
```

### BACKEND
Be assured that the npm, node etc are installed in your local repository, if it is installed then proceed to the deployement of the server. 

To install all the dependencies:
```bash
  npm i
```
To run the backend server in port 3001:
```bash
  npm run start
```
If the port 3001 is busy then dont run on any other port, kill the port 3001 and then try the npm start again. To kill the port, do this:
```bash
  npx kill-port 3001
```


## LOGIN IDS

(Well, you can always email me on any of these email ids to send me reviews on my project)
- diabolopainprince@gmail.com -> PASSWORD - 123456

- 21ee01051@iitbbs.ac.in -> PASSWORD - 123456

- ak7032003@gmail.com -> PASSWORD - 123456


## POINTS TO BE NOTED 


- If you login to see the interface betweeen different users, use different browsers for each user login and if there is some error in between, then try clearing the localstorage of the browser and restarting the backend.

- Mailgun API which is send mails only to verified emails that the developer needs to verify there at the mailgun website. I only verified three mail ids mentioned above. So, unfortunely, the tester can't check the register account facility used in the app as it sends an OTP as a mail to the email id entered which can't be sent because I have not verified it in my mailgun API key. 

