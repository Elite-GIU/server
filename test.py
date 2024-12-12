import pymongo
from faker import Faker
import random
from datetime import datetime, timedelta

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["e-learning"]

faker = Faker()

# Utility to get random document from a collection
def get_random_document(collection_name):
    collection = db[collection_name]
    count = collection.count_documents({})
    if count == 0:
        return None
    random_index = random.randint(0, count - 1)
    return collection.find().limit(1).skip(random_index).next()

# Fill Users
def fill_users(count=10):
    users = []
    for _ in range(count):
        is_verified = True
        otp_created_at = datetime.now() - timedelta(days=random.randint(0, 30))
        otp_expires_at = otp_created_at + timedelta(hours=1)
        users.append({
            "name": faker.name(),
            "email": faker.email(),
            "password": "$2a$10$4Kn3uDxmhW.MEFPtQYcC9eUXTW3sv3z5ebFTPn9vUBpcoEM5br/OK",
            "role": random.choice([ "instructor", "student"]),
            "created_at": faker.date_time_this_year(),
            "preferences": [faker.word() for _ in range(random.randint(1, 5))],
            "isEmailVerified": is_verified,
            "emailVerificationOtp": None if is_verified else faker.uuid4(),
            "emailVerificationOtpCreatedAt": None if is_verified else otp_created_at,
            "emailVerificationOtpExpiresAt": None if is_verified else otp_expires_at,
        })
    result = db.users.insert_many(users)
    print(f"Inserted {count} users.")
    return result.inserted_ids

# Fill Modules
def fill_modules(count=10):
    courses = list(db.courses.find())
    if not courses:
        raise Exception("No courses found. Please insert courses first.")

    # Get all content IDs
    content_ids = list(db.contents.find({}, {"_id": 1}))
    if not content_ids:
        raise Exception("No content found. Please insert content first.")
    content_ids = [content["_id"] for content in content_ids]

    modules = []
    for course in courses:
        # Ensure each course has at least one module, and add more randomly
        number_of_modules = random.randint(1, 3)  # Randomly assign 1 to 3 modules for each course

        for _ in range(number_of_modules):
            module = {
                "course_id": course["_id"],  # Reference course's _id
                "title": faker.sentence(),
                "content": random.sample(content_ids, random.randint(1, 3)),  # Random array of content IDs
                "assessmentType": random.choice(['mcq', 'true_false', 'mix']),
                "numberOfQuestions": random.randint(5, 20),  # Example range of questions
                "created_at": faker.date_time_this_year(),  # optional if timestamps are automatic
            }
            modules.append(module)

    result = db.moduleentities.insert_many(modules)  # Insert into moduleentities collection
    print(f"Inserted {len(modules)} modules.")
    return result.inserted_ids


# Fill Courses
def fill_courses(count=10):
    instructors = list(db.users.find({"role": "instructor"}))
    if not instructors:
        raise Exception("No instructors found. Please insert instructors first.")

    courses = []
    current_time = datetime.now()  # Correct usage of datetime
    for _ in range(count):
        instructor = random.choice(instructors)
        courses.append({
            "instructor_id": instructor["_id"],
            "title": faker.catch_phrase(),
            "description": faker.sentence(),
            "category": faker.word(),
            "difficulty_level": random.randint(1, 3),
            "created_at": current_time,  # Adding timestamp correctly
            "updated_at": current_time  # Consistently using the same timestamp
        })
    result = db.courses.insert_many(courses)
    print(f"Inserted {count} courses.")
    return result.inserted_ids

# Fill Questions
def fill_questions(count=10):
    questions = []
    for _ in range(count):
        # Randomly decide the question type
        question_type = random.choice(['mcq', 'true_false'])
        
        if question_type == 'mcq':
            # Generate 4 choices
            choices = [faker.word() for _ in range(4)]
            # Pick a right choice from the choices
            right_choice = random.choice(choices)
        elif question_type == 'true_false':
            # For true_false, choices are Yes and No
            choices = ["Yes", "No"]
            # Randomly select the correct answer
            right_choice = random.choice(choices)
        
        # Create the question object
        questions.append({
            "question": faker.sentence(),
            "choices": choices,
            "right_choice": right_choice,
            "difficulty": random.randint(1, 3),  # Difficulty between 1 and 3
            "type": question_type,
            "created_at": faker.date_time_this_year(),  # Timestamp for creation
        })
    
    # Insert the questions into the database
    result = db.questions.insert_many(questions)
    print(f"Inserted {count} questions.")
    return result.inserted_ids

# Fill Question Bank
def fill_questionbank():
    # Fetch all modules
    modules = list(db.moduleentities.find())  # Corrected to fetch from moduleentities
    if not modules:
        raise Exception("No modules found. Please insert modules first.")

    # Fetch all questions
    question_ids = list(db.questions.find({}, {"_id": 1}))
    if not question_ids:
        raise Exception("No questions found. Please insert questions first.")
    
    question_ids = [q["_id"] for q in question_ids]  # Extract question IDs

    questionbanks = []
    for module in modules:
        # Select a random number of questions for this module
        selected_questions = random.sample(question_ids, min(40, len(question_ids)))

        questionbanks.append({
            "module_id": module["_id"],  # Reference the module's _id
            "questions": selected_questions,  # Selected question IDs for the module
            "createdAt": datetime.now(),  # Timestamp for creation
            "updatedAt": datetime.now(),  # Timestamp for last update
        })

    result = db.questionbanks.insert_many(questionbanks)  # Insert all question banks
    print(f"Inserted {len(questionbanks)} question banks, one for each module.")
    return result.inserted_ids

# Fill Quiz Responses
def fill_quiz_responses(count=10):
    # Fetch only students who have courses enrolled
    student_courses = list(db.studentcourses.find())
    if not student_courses:
        raise Exception("No students enrolled in any courses. Please insert student courses first.")

    # Extract the user_ids of students who are enrolled in courses
    student_user_ids = [student_course['user_id'] for student_course in student_courses]
    if not student_user_ids:
        raise Exception("No students found. Please insert students first.")

    # Fetch available modules (which are linked to courses)
    modules = list(db.moduleentities.find())
    if not modules:
        raise Exception("No modules found. Please insert modules first.")

    # Fetch all available question banks
    question_banks = list(db.questionbanks.find())
    if not question_banks:
        raise Exception("No question banks found. Please insert question banks first.")

    # Fetch all questions to get correct answers
    questions = list(db.questions.find())
    if not questions:
        raise Exception("No questions found. Please insert questions first.")

    quiz_responses = []
    for _ in range(count):
        # Randomly choose a student who has a course
        student_course = random.choice([sc for sc in student_courses if sc['user_id'] in student_user_ids])
        user_id = student_course['user_id']
        course_id = student_course['course_id']

        # Get the modules associated with the course the student is enrolled in
        student_modules = [module for module in modules if module['course_id'] == course_id]
        if not student_modules:
            continue  # Skip if no modules are found for this course

        # Pick a random module from the student's enrolled course
        module = random.choice(student_modules)

        # Find the corresponding question bank for the selected module
        question_bank = next((qb for qb in question_banks if qb['module_id'] == module['_id']), None)
        if not question_bank:
            continue  # Skip if no question bank is found for this module

        # Select 10 random questions from the question bank's question_ids
        selected_questions = random.sample(question_bank['questions'], min(10, len(question_bank['questions'])))

        correct_answers = 0  # To calculate score

        # Generate answers and check for correctness
        answers = []
        for question_id in selected_questions:
            # Find the question in the questions collection
            question = next((q for q in questions if q['_id'] == question_id), None)
            if question:
                correct_answer = question['right_choice']  # The correct answer for the question
                # Randomly decide if the answer is correct or incorrect
                is_correct = random.choice([True, False])  # Randomly decide if the answer is correct

                if is_correct:
                    answers.append(correct_answer)  # Correct answer
                    correct_answers += 1  # Increment correct answers
                else:
                    # Choose a random incorrect answer from the choices (avoid the correct one)
                    incorrect_answers = [choice for choice in question['choices'] if choice != correct_answer]
                    incorrect_answer = random.choice(incorrect_answers)
                    answers.append(incorrect_answer)  # Incorrect answer

        # Calculate score based on percentage of correct answers
        score = int((correct_answers / len(selected_questions)) * 100)
        final_grade = 'passed' if score >= 50 else 'failed'

        # Create the quiz response
        quiz_responses.append({
            "user_id": user_id,
            "module_id": module["_id"],
            "questions": selected_questions,
            "answers": answers,
            "score": score,
            "finalGrade": final_grade  # Added finalGrade
        })

    # Insert all the quiz responses into the database
    result = db.quizresponses.insert_many(quiz_responses)
    print(f"Inserted {count} quiz responses.")
    return result.inserted_ids

# Fill Student Courses
def fill_student_courses(count=10):
    users = list(db.users.find({"role": "student"}))
    courses = list(db.courses.find())
    if not users or not courses:
        raise Exception("Users or courses missing. Ensure both are populated.")

    student_courses = []
    for _ in range(count):
        user = random.choice(users)
        course = random.choice(courses)
        student_courses.append({
            "user_id": user["_id"],  # Reference user's _id
            "course_id": course["_id"],  # Reference course's _id
            "completion_percentage": round(random.uniform(0, 100), 2),
            "last_accessed": [faker.date_time_this_year() for _ in range(random.randint(1, 5))] if random.choice([True, False]) else [],  # Optional
        })
    result = db.studentcourses.insert_many(student_courses)
    print(f"Inserted {count} student courses.")
    return result.inserted_ids

# Fill Logs
def fill_logs(count=10):
    users = list(db.users.find())
    logs = []
    for _ in range(count):
        user = random.choice(users) if random.choice([True, False]) else None
        logs.append({
            "user_id": user["_id"] if user else None,  # Optional reference to User
            "event": faker.sentence(),  # Event description
            "timestamp": faker.date_time_this_year(),  # Timestamp
            "status": random.choice([200, 400, 500]),  # HTTP-like status
            "type": random.choice(["auth", "general"]),  # Event type
        })
    result = db.logs.insert_many(logs)
    print(f"Inserted {count} logs.")
    return result.inserted_ids

# Fill Content
def fill_content(count=10):
    instructors = list(db.users.find({"role": "instructor"}))
    if not instructors:
        raise Exception("No instructors found. Please insert instructors first.")

    content_types = ['video', 'document', 'website', 'assignment', 'tutorial', 'slides']
    contents = []
    for _ in range(count):
        instructor = random.choice(instructors)
        content_type = random.choice(content_types)

        # Generate content based on the type
        content_value = None
        content_url = None
        if content_type == 'assignment':
            content_value = faker.paragraph()  # Inline content for assignments
        else:
            content_url = faker.url()  # URL for other types

        contents.append({
            "title": faker.sentence(),  # Generate a title
            "description": faker.paragraph(),  # Generate a description
            "type": content_type,  # Randomly choose content type
            "isVisible": random.choice([True, False]),  # Random visibility
            "content": content_value,  # Inline content for assignments
            "upload_date": faker.date_time_this_year(),  # Random datetime for upload_date
            "last_updated": datetime.now(),  # Set the current timestamp for last_updated
        })

    result = db.contents.insert_many(contents)
    print(f"Inserted {count} content items.")
    return result.inserted_ids

# Fill Notification
def fill_notifications(count=10):
    users = list(db.users.find())
    if not users:
        raise Exception("No users found. Please insert users first.")

    notification_types = ['info', 'success', 'warning', 'error']
    notifications = []

    for _ in range(count):
        user = random.choice(users)  # Randomly select a user
        notifications.append({
            "user_id": user["_id"],  # Reference user's _id
            "title": faker.sentence(),  # Generate a random title
            "message": faker.paragraph(),  # Generate a random message
            "type": random.choice(notification_types),  # Randomly select a notification type
            "createdAt": faker.date_time_this_year(),  # Automatically handled by schema, but can be added for clarity
            "updatedAt": faker.date_time_this_year()   # Automatically handled by schema, but can be added for clarity
        })

    result = db.notifications.insert_many(notifications)
    print(f"Inserted {count} notifications.")
    return result.inserted_ids

# Fill Study Rooms
def fill_study_rooms(count=10):
    courses = list(db.courses.find())
    users = list(db.users.find())

    if not courses or not users:
        raise Exception("Courses or users missing. Ensure both are populated.")

    study_rooms = []
    current_time = datetime.now()
    for _ in range(count):
        course = random.choice(courses)  # Randomly select a course
        creator = random.choice(users)  # Randomly select a creator
        # Randomly select members, ensuring the creator is included
        members_list = random.sample(users, random.randint(1, len(users)))
        if creator not in members_list:
            members_list.append(creator)

        study_rooms.append({
            "course_id": course["_id"],  # Reference course's _id
            "creator_id": creator["_id"],  # Reference creator's _id
            "members_list": [user["_id"] for user in members_list],  # List of member _ids
            "title": faker.catch_phrase(),  # Generate a random title
            "description": faker.paragraph(),  # Generate a random description
            "created_at": current_time,  # Set created timestamp
            "updated_at": current_time  # Set updated timestamp
        })

    result = db.studyrooms.insert_many(study_rooms)  # Insert into studyrooms collection
    print(f"Inserted {count} study rooms.")
    return result.inserted_ids

# Fill Room Messages
def fill_room_messages(count=10):
    courses = list(db.courses.find())
    users = list(db.users.find())
    rooms = list(db.studyrooms.find())  # Assuming studyrooms collection exists
    messages = list(db.roommessages.find({}, {"_id": 1}))  # Fetch existing messages for potential replies

    if not courses or not users or not rooms:
        raise Exception("Courses, users, or study rooms missing. Ensure all are populated.")

    room_messages = []
    current_time = datetime.now()
    for _ in range(count):
        course = random.choice(courses)  # Randomly select a course
        room = random.choice(rooms)  # Randomly select a study room
        sender = random.choice(users)  # Randomly select a sender
        is_reply = random.choice([True, False]) and messages  # Randomly decide if it's a reply

        room_messages.append({
            "course_id": course["_id"],  # Reference course's _id
            "room_id": room["_id"],  # Reference room's _id
            "sender_id": sender["_id"],  # Reference sender's _id
            "parent_id": random.choice(messages)["_id"] if is_reply else None,  # Reference an existing message if a reply
            "content": faker.sentence(),  # Generate a random message content
            "created_at": current_time,  # Set created timestamp
            "updated_at": current_time  # Set updated timestamp
        })

    result = db.roommessages.insert_many(room_messages)  # Insert into roommessages collection
    print(f"Inserted {count} room messages.")
    return result.inserted_ids

# Fill Threads
def fill_threads(count=10):
    courses = list(db.courses.find())
    users = list(db.users.find())
    
    if not courses or not users:
        raise Exception("Courses or users missing. Ensure both are populated.")

    threads = []
    for _ in range(count):
        course = random.choice(courses)  # Randomly select a course
        creator = random.choice(users)  # Randomly select a user as the creator

        threads.append({
            "course_id": course["_id"],  # Reference course's _id
            "creator_id": creator["_id"],  # Reference creator's _id
            "title": faker.sentence(),  # Generate a random thread title
            "description": faker.paragraph(),  # Generate a random thread description
            "created_at": faker.date_time_this_year(),  # Automatically handled by schema, but explicitly added for clarity
            "updated_at": faker.date_time_this_year(),  # Automatically handled by schema, but explicitly added for clarity
        })

    result = db.threads.insert_many(threads)
    print(f"Inserted {count} threads.")
    return result.inserted_ids

# Fill Thread Messages
def fill_thread_messages(count=10):
    threads = list(db.threads.find())
    users = list(db.users.find())

    if not threads or not users:
        raise Exception("Threads or users missing. Ensure both are populated.")

    thread_messages = []
    for _ in range(count):
        thread = random.choice(threads)  # Randomly select a thread
        sender = random.choice(users)  # Randomly select a sender

        thread_messages.append({
            "thread_id": thread["_id"],  # Reference thread's _id
            "sender_id": sender["_id"],  # Reference sender's _id
            "content": faker.sentence(),  # Generate random message content
            "created_at": faker.date_time_this_year(),  # Automatically handled by schema, but explicitly added for clarity
            "updated_at": faker.date_time_this_year(),  # Automatically handled by schema, but explicitly added for clarity
        })

    result = db.threadmessages.insert_many(thread_messages)
    print(f"Inserted {count} thread messages.")
    return result.inserted_ids


def fill_thread_message_replies(count=10):
    thread_messages = list(db.threadmessages.find())  # Corrected collection name
    users = list(db.users.find())

    if not thread_messages:
        raise Exception("Thread messages are missing. Ensure thread messages are populated.")
    if not users:
        raise Exception("Users are missing. Ensure users are populated.")

    thread_message_replies = []
    for _ in range(count):
        message = random.choice(thread_messages)  # Randomly select a thread message
        sender = random.choice(users)  # Randomly select a sender

        thread_message_replies.append({
            "message_id": message["_id"],  # Reference thread message's _id
            "sender_id": sender["_id"],  # Reference sender's _id
            "content": faker.sentence(),  # Generate random reply content
            "created_at": faker.date_time_this_year(),  # Automatically handled by schema
            "updated_at": faker.date_time_this_year(),  # Automatically handled by schema
        })

    result = db.threadmessagereplies.insert_many(thread_message_replies)  # Corrected collection name
    print(f"Inserted {count} thread message replies.")
    return result.inserted_ids

def main():
    print("Choose an option to populate:")
    print("1. Users")
    print("2. Courses")
    print("3. Study Rooms")
    print("4. Room Messages")
    print("5. Student Courses")
    print("6. Modules")
    print("7. Content")
    print("8. Questions")
    print("9. Question Bank")
    print("10. Quiz Responses")
    print("11. Notifications")
    print("12. Logs")
    print("13. Threads")
    print("14. Thread Messages")
    print("15. Thread Message Replies")
    print("16. Populate All")
    
    choice = int(input("Enter your choice (1-16): "))
    
    if choice == 1:
        count = int(input("Enter the number of users to insert: "))
        fill_users(count)
    elif choice == 2:
        count = int(input("Enter the number of courses to insert: "))
        fill_courses(count)
    elif choice == 3:
        count = int(input("Enter the number of study rooms to insert: "))
        fill_study_rooms(count)
    elif choice == 4:
        count = int(input("Enter the number of room messages to insert: "))
        fill_room_messages(count)
    elif choice == 5:
        count = int(input("Enter the number of student courses to insert: "))
        fill_student_courses(count)
    elif choice == 6:
        count = int(input("Enter the number of modules to insert: "))
        fill_modules(count)
    elif choice == 7:
        count = int(input("Enter the number of contents to insert: "))
        fill_content(count)
    elif choice == 8:
        count = int(input("Enter the number of questions to insert: "))
        fill_questions(count)
    elif choice == 9:
        fill_questionbank()
    elif choice == 10:
        count = int(input("Enter the number of quiz responses to insert: "))
        fill_quiz_responses(count)
    elif choice == 11:
        count = int(input("Enter the number of notifications to insert: "))
        fill_notifications(count)
    elif choice == 12:
        count = int(input("Enter the number of logs to insert: "))
        fill_logs(count)
    elif choice == 13:
        count = int(input("Enter the number of threads to insert: "))
        fill_threads(count)
    elif choice == 14:
        count = int(input("Enter the number of thread messages to insert: "))
        fill_thread_messages(count)
    elif choice == 15:
        count = int(input("Enter the number of thread message replies to insert: "))
        fill_thread_message_replies(count)
    elif choice == 16:
        print("Populating all with default counts...")
        fill_users(50)                # Populate users first
        fill_courses(50)              # Populate courses
        fill_study_rooms(100)         # Populate study rooms after courses and users
        fill_room_messages(100)       # Populate room messages after study rooms
        fill_student_courses(100)     # Populate student courses
        fill_content(200)             # Populate content
        fill_modules(200)             # Populate modules
        fill_questions(1000)          # Populate questions
        fill_questionbank()           # Populate question banks
        fill_quiz_responses(200)      # Populate quiz responses
        fill_notifications(300)       # Populate notifications
        fill_logs(100)                # Populate logs
        fill_threads(200)             # Populate threads
        fill_thread_messages(400)     # Populate thread messages
        fill_thread_message_replies(300)  # Populate thread message replies
    else:
        print("Invalid choice! Please enter a number between 1 and 16.")

if __name__ == "__main__":
    main()
