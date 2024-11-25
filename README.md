Spread Sheet To Track Progress: [Click here to view the Google Spreadsheet](https://docs.google.com/spreadsheets/d/1_q3zo1ZCfkuNRDbKUqlCqMfe1cYqfyDMYpqZHDAgC_g/)

**Endpoints**

**Abdelrahman Samir:**

`POST /instructor/assign:`

Assign a specific student using their id and/or email to a course by a specific instructor.
No need to check if a course is by a specific instructor, will be handled by a drop down list
in the frontend and no need to implement GET instructor/courses since it's done down.

Acceptance Criteria:

- course is added to the StudentCourse table
- validation on student id/email
- extra (not required): a request is sent to the user and he accepts the invitation and joins the course

`GET /courses`

Acceptance criteria:

- show all courses with their details (add pagination if possible)

`GET /instructors`

Acceptance criteria:

- show all instructors (add pagination if possible)

`POST courses/id/assign`

A student can assign himself to a course, same service/logic as instructor assign but a student assigns himself

Acceptance criteria:

- course is added to the StudentCourse table

&nbsp;

**Omar Sherif:**

`POST instructor/courses`

Create a new course

Acceptance Criteria:

- need to validate fields for course
- make sure course is not duplicated

`GET instructor/courses`

get all courses by a specific instructor

Acceptance criteria:

- use currently logged in instructor to get his courses

`PUT instructor/courses/id`

Update course info, not modules

Acceptance criteria:

- ability to change description, category, difficulty of the course

&nbsp;

**Mohamad Hossam:**

`GET student/learning-path`

Suggest a learning path for the student

Acceptance Criteria:

- suggest courses based on preferences of students arranged
  according to difficulty of the course in increasing order

`GET student/courses`

get all courses by a specific student

Acceptance criteria:

- use currently logged in student to get his courses

`GET student/courses/id`

get a specific course by a specific student

Acceptance criteria:

- use currently logged in student to get a course by id
- show all modules under this course as part of the returned course content

`GET student/course/id/modules/id`

show content of a specific module

Acceptance criteria:

- list the content + available quiz (show if there is quiz or not)

&nbsp;

**Abdelrahman Elnagar:**

`POST instructor/courses/id/modules`

Create a new module on a specific course

Acceptance Criteria:

- validate that course belongs to instructor (through guards, coordinate with momen)
- add a new entry in modules

`POST instructor/courses/id/modules/id/upload`

Upload content on a specific module

Acceptance Criteria:

- handle upload files like urls, txt, pdf, (mp4).
- Validate uploads and check for possible errors
- update module content array to include location of new conetnt

`POST instructor/courses/id/modules/id/questionbank`

Create a new question on the questionbank

Acceptance Criteria:

- fill all fields, add difficulty

`PUT instructor/courses/id/modules/id/question/id`

Updated a specific question

Acceptance Criteria:

- change a question in the questionbank of the module

`DELTEE instructor/courses/id/modules/id/question/id`

Delete a specific question

Acceptance Criteria:

- delete a question from the questionbank

&nbsp;

**Hussein Mansour:**

`GET student/courses/id/modules/id/quiz`

Create a new quiz using 10 randomized questions from module questionbank

Acceptance Criteria:

- display questions without the answers. only show options

`POST student/courses/id/modules/id/quiz`

Submit quiz solution

Acceptance Criteria:

- for each question id, there's an answer.
- Collect all answers and add them to the response entity
- calculate the score
- update the studentCourse with extra progress since
  module is done (if grade >50) and add a new date in the last_accessed array

`GET student/courses/id/modules/id/quiz/feedback`

Show feedback on quiz

Acceptance Criteria:

- show wrong answered questions and their correct answer
- Display the score

&nbsp;

**Momen Ashraf:**

`guards`

Acceptance Criteria:

- student is registered in the course
- instructor is actually the instructor of a specific course
- authorization in general

`GET /logs
POST /logs
`

Acceptance Criteria:

- handle adding logs for every wrong log in

&nbsp;

**Alaa Ashraf:**

`GET chat/course/id`

display chat on a specific course

Acceptance Criteria:

- currently logged in user is authorized to see chat
- display chat ordered ascendingly by time
- display name of each person sending a chat (add instructor next to name of instructor)

`POST chat/course/id`

student/instructor can send chat on a specific course

Acceptance Criteria:

- currently logged in user is authorized to send chat

&nbsp;

**Sarah Ahmed:**

`GET student/dashboard`

Get the student dashboard

Acceptance Criteria:

- show courses enrolled + progress, average grade, last accessed, accessed in last month

`GET student/dashboard/quiz`

Get all quizzes done by the student

Acceptance Criteria:

- get logged in student
- display all quizzes done and grade in each
- display module + course

`GET instructor/dashboard`

Get the instructor dashboard

Acceptance Criteria:

- get all courses of instructor + nr of students enrolled

`GET instructor/dashboard/course/id`

Get the instructor course id dashboard

Acceptance Criteria:

- get course + average grade + best grade + lowest grade
- do that for each module seperately

`GET instructor/dashboard/course/id/students`

Display all students enrolled in a course + their average grade

Acceptance Criteria:

- show all students in a course (paginated if possible)
- show the avg grade of each student individually

&nbsp;
&nbsp;

**Database Scheme**

```
users {
    user_id: MONGO_ID (PRIMARY_KEY),
    name: STRING,
    email: STRING,
    password: STRING, #Not the actual password, the hash of it
    role: STRING, #admin, instructor, student
    created_at: DATE,
    preferences: STRING[] #array of strings of preferred categories (subjects),
    isEmailVerified: boolean,
    emailVerificationOtp: STRING,
    emailVerificationOtpCreatedAt: DATE,
    emailVerificationOtpExpiresAt: DATE
}

courses {
    course_id: MONGO_ID (PRIMARY_KEY),
    instructor_id: STRING,
    descriptions: STRING,
    category: STRING,
    difficulty_level: INT,
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

 questions: {
    question_id: "MONGO_ID (PRIMARY_KEY)",
    question: "STRING",
    choices: "STRING[4]", # four possible answers
    right_choice: "STRING", # the correct answer
    difficulty: number (min = 1, max = 3)
    created_at: "DATE"
}

questionbank: {
    module_id: "MONGO_ID", # reference to Modules.module_id
    questions: ["MONGO_ID"] # references to Modules.question_id
},

quizResponse {
    response_id: MONGO_ID (PRIMARY_KEY),
    user_id: MONGO_ID,
    questions: ARRAY[] MONGOID # reference the mongoID of the questions in the questionbanck
    answers: STRING[],
    score: NUMBER,
    submitted_at: DATE
}


studentCourses {
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

forum {
  forum_id: MONGO_ID
  course_id: MONGO_ID
}

threads {
  thread_id: MONGO_ID
  created_by: MONGO_ID
  title: String
  forum_id: MONGO_ID # reference it's parent forum
  "reactions": { // Optional 
    "upvotes": 10,
    "downvotes": 2
  }
}

messages {
  message_id: MONGO_ID
  content: String
  created_by: MONGO_ID
  thread_id: MONGO_ID
  created_at: DATE
  "reactions": { // optional
    "upvotes": 5,
    "downvotes": 0
  }
}

replies {
  reply_id: MONGO_ID
  message_id: MONGO_ID
  content: String
  created_by: MONGO_ID
  created_at: DATE
  "reactions": { 
    "upvotes": 5,
    "downvotes": 0
  }
}


notification {
    userId: MONGO_ID,
    title: STRING,
    message: STRING,
    type: STRING
    timestamp: DATE
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

_API ENDPOINT_
`http://localhost:3000/api/v1`

> there is a temporary api endpoint in `http://localhost:3000/api/v1/users`, GET -> get all users, POST create new users, just to test your connection with your mongodb server, we will enhance this endpoint later on.
