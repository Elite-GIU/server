Spread Sheet To Track Progress: [Click here to view the Google Spreadsheet](https://docs.google.com/spreadsheets/d/1_q3zo1ZCfkuNRDbKUqlCqMfe1cYqfyDMYpqZHDAgC_g/)

**Folder Structure** 
```
src/
├── config/                  # Configuration files (e.g., database, app settings)
├── database/                # Database-related files
├── modules/                 # Feature modules (e.g., auth, user)
├── main.ts                  # Entry point
.env                         # Environment variables
```
1. Clone the repo to your local machine
2. in terminal run `npm install`
3. make a file in the root directory called `.env`, copy the content of `.env.example`, paste it to `.env`, configure your `.env`
4. run the application `npm run start`, test it and check your mongodb database to test the connction

*API ENDPOINT*
`http://localhost:3000/api/v1` 

> there is a temporary api endpoint in `http://localhost:3000/api/v1/users`, GET -> get all users, POST create new users, just to test your connection with your mongodb server, we will enhance this endpoint later on.


