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
- validate: title, nrOfQuestions, assessmentType 

`POST instructor/courses/id/modules/id/upload`

Upload content on a specific module

Acceptance Criteria:

- handle upload files like urls, txt, pdf, (mp4).
- Validate uploads and check for possible errors
- update module content array to include location of new conetnt
- add the id to the content array in module table

`POST instructor/courses/id/modules/id/questionbank`

Create a new question on the questionbank

Acceptance Criteria:

- fill all fields, add difficulty
- add it to questionbank belonging to module

`GET instructor/courses/id/modules/id/questionbank`

- display questionbank with questions, choices and answer
- must add pagination (leave it for later)


`PUT instructor/courses/id/modules/id/question/id`

Updated a specific question

Acceptance Criteria:

- change question: question, choices, solution

`DELETE instructor/courses/id/modules/id/question/id`

Delete a specific question

Acceptance Criteria:

- delete a question from the questionbank
- check how mongo handles cascade in an array of references to another table

&nbsp;

**Hussein Mansour:**

`GET student/courses/id/modules/id/quiz`

Create a new quiz using n randomized questions from module questionbank
based on nr of questions and type of the module
Create it based on student performance

Acceptance Criteria:

- persist the quiz in the quizResponse schema
- display questions of the quiz with the choices without the answers

`POST student/courses/id/modules/id/quiz`

Submit quiz solution

Acceptance Criteria:

- for each question id, there's an answer.
- Collect all answers and add them to the quizResponse table
- calculate the score and update finalGrade
- update the studentCourse with extra progress since
  module is done (if grade >50) and add a new date in the last_accessed array

`GET student/courses/id/modules/id/quiz/feedback`

Show feedback on quiz

Acceptance Criteria:

- show wrong answered questions and their correct answer
- Display the score
- if failed, write a message "please study module nr {} again"

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
    last_accessed: DATE[],
    status: STRING
}

logs {
    log_id: MONGO_ID (PRIMARY_KEY),
    user_id: MONGO_ID OPTIONAL,
    event: STRING,
    timestamp: DATE,
    status: INT,
    type: STRING #auth, general
}

rooms{
  room_id: MONGO_ID (PRIMARY KEY),
  course_id: MONGO_ID,
  instructor_id: MONGO_ID
}

roomMessages{
  message_id: MONGO_ID (PRIMARY KEY),
  room_id: MONGO_ID,
  sender_id: MONGO_ID,
  parent_id: MONGO_ID,
  sent_at: DATE,
  content: STRING
}

forums {
  forum_id: MONGO_ID (PRIMARY KEY),
  course_id: MONGO_ID,
  instructor_id: MONGO_ID
}

threads {
  thread_id: MONGO_ID (PRIMARY KEY),
  forum_id: MONGO_ID, # reference it's parent forum
  creator_id: MONGO_ID,
  created_at: DATE,
  title: String,
  description: STRING,
}

threadMessages {
  message_id: MONGO_ID (PRIMARY KEY),
  thread_id: MONGO_ID,
  sender_id: MONGO_ID,
  created_at: DATE,
  content: String,
}

threadMessageReplies {
  reply_id: MONGO_ID (PRIMARY KEY),
  message_id: MONGO_ID,
  sender_id: MONGO_ID,
  created_at: DATE,
  content: String,
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
