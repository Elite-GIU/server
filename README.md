Spread Sheet To Track Progress: [Click here to view the Google Spreadsheet](https://docs.google.com/spreadsheets/d/1_q3zo1ZCfkuNRDbKUqlCqMfe1cYqfyDMYpqZHDAgC_g/)

**Database Scheme**
```
users {
    user_id: MONGO_ID (PRIMARY_KEY),
    name: STRING,
    email: STRING,
    password: STRING, #Not the actual password, the hash of it
    role: STRING, #admin, instructor, student
    created_at: DATE, 
    preferences: STRING[] #array of strings of preferred categories (subjects)
}

courses {
    course_id: MONGO_ID (PRIMARY_KEY),
    instructor_id: STRING,
    descriptions: STRING,
    category: STRING,
    difficulty_level: STRING,
    created_at: DATE
}

modules {
    module_id: MONGO_ID (PRIMARY_KEY),
    course_id: MONGO_ID,
    title: STRING,
    content: STRING[], #path of pdfs
    resources: STRING[] OPTIONAL, #urls 
    created_at: DATE
}

quizzes {
    quiz_id: MONGO_ID (PRIMARY_KEY),
    module_id: MONGO_ID,
    questions: OBJECT[]
    # question {
        question_id: MONGO_ID (PRIMARY_KEY),
        quiz_id: MONGO_ID,
        question: STRING,
        choices: STRING[4],
        right_choice: STRING
    }   
    created_at: DATE,
}   

responses {
    response_id: MONGO_ID (PRIMARY_KEY),
    user_id: MONGO_ID,
    quiz_id: MONGO_ID, 
    answers: STRING[],
    score: INT,
    submitted_at: DATE
}

progress {
    user_id: MONGO_ID,
    course_id: MONGO_ID,
    completion_percentage: FLOAT,
    last_accessed: DATE[]
}   

logs {
    log_id: MONGO_ID (PRIMARY_KEY), 
    user_id: MONGO_ID OPTIONAL,
    event: STRING, 
    timestamp: DATE,
    status: INT,
    type: STRING #auth, general
}

```
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
   
   


